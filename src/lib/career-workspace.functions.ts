import { createServerFn } from "@tanstack/react-start";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { PILLARS, type Assessment, type JsonValue, type Pillar } from "./career-workspace";

const idSchema = z.string().uuid();
const tokenInput = z.object({ memberId: idSchema, token: z.string().min(20) });
const pillarSchema = z.enum(PILLARS);

function signMember(memberId: string) {
  const secret = process.env['CAREER_SESSION_SECRET'];
  if (!secret) throw new Error("Career workspace session is not configured.");
  return createHmac("sha256", secret).update(memberId).digest("hex");
}

function assertMember(memberId: string, token: string) {
  const expected = Buffer.from(signMember(memberId));
  const actual = Buffer.from(token);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("Your Diamond session has expired. Unlock the workspace again.");
}

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function cleanJson(text: string): Record<string, JsonValue> {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text;
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("The analysis returned an incomplete result. Please try again.");
  return JSON.parse(fenced.slice(start, end + 1)) as Record<string, JsonValue>;
}

async function callAi(system: string, input: Record<string, JsonValue>) {
  const key = process.env['LOVABLE_API_KEY'];
  if (!key) throw new Error("Lovable AI is not configured.");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({ model: "google/gemini-3.8-flash", messages: [{ role: "system", content: system }, { role: "user", content: `Return JSON only. Member context:\n${JSON.stringify(input)}` }] }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string; error?: { message?: string } };
    throw new Error(body.message ?? body.error?.message ?? "BlueChip AI could not complete this analysis.");
  }
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return cleanJson(body.choices?.[0]?.message?.content ?? "");
}

export const unlockCareerWorkspace = createServerFn({ method: "POST" })
  .inputValidator((value) => z.object({ memberId: idSchema, accessCode: z.string().min(1) }).parse(value))
  .handler(async ({ data }) => {
    const configured = process.env['CAREER_ACCESS_CODE'];
    if (!configured) throw new Error("Diamond access is not configured.");
    const a = Buffer.from(data.accessCode); const b = Buffer.from(configured);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("That access code is not valid.");
    const db = await admin();
    const now = new Date().toISOString();
    const { error } = await db.from("members").upsert({ id: data.memberId, access_code_hash: createHash("sha256").update(configured).digest("hex"), last_seen: now }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { token: signMember(data.memberId) };
  });

export const touchCareerMember = createServerFn({ method: "POST" }).inputValidator((v) => tokenInput.parse(v)).handler(async ({ data }) => {
  assertMember(data.memberId, data.token);
  const db = await admin();
  await db.from("members").update({ last_seen: new Date().toISOString() }).eq("id", data.memberId);
  return { ok: true };
});

function assessmentFrom(row: Record<string, JsonValue>, pillar: Pillar): Assessment {
  const content = row;
  const score = Number(row[`${pillar}_score`] ?? row["total_score"] ?? 0);
  const breakdown = Object.entries(row)
    .filter(([key, value]) => key.endsWith("_score") && key !== `${pillar}_score` && key !== "total_score" && typeof value === "number")
    .map(([key, value]) => ({ label: key.replace(/_score$/, "").replaceAll("_", " "), score: Number(value), reasoning: String(row["score_reasoning"] ?? "") }));
  return { id: String(row.id), pillar, score, createdAt: String(row.created_at), verdict: String(row["verdict"] ?? row["score_reasoning"] ?? "Your next move is now clear."), reasoning: String(row["score_reasoning"] ?? ""), breakdown, content };
}

const tableFor: Record<Exclude<Pillar, "evidence">, string> = { clarity: "clarity_sessions", authority: "authority_sessions", reach: "reach_sessions", energy: "energy_sessions", revenue: "revenue_sessions" };

export const getCareerWorkspace = createServerFn({ method: "POST" }).inputValidator((v) => tokenInput.parse(v)).handler(async ({ data }) => {
  assertMember(data.memberId, data.token);
  const db = await admin();
  const [{ data: member }, { data: evidence }, { data: rewrites }] = await Promise.all([
    db.from("members").select("id, role_title, industry, career_goal, target_timeline").eq("id", data.memberId).single(),
    db.from("evidence_entries").select("*").eq("member_id", data.memberId).order("created_at", { ascending: false }),
    db.from("energy_rewrites").select("*").eq("member_id", data.memberId).order("created_at", { ascending: false }).limit(20),
  ]);
  if (!member) throw new Error("Member workspace was not found.");
  const latest: Partial<Record<Pillar, Assessment>> = {};
  for (const pillar of ["clarity", "authority", "reach", "energy", "revenue"] as const) {
    const { data: rows } = await db.from(tableFor[pillar] as "clarity_sessions").select("*").eq("member_id", data.memberId).order("created_at", { ascending: false }).limit(1);
    const row = (rows?.[0] ?? null) as unknown as Record<string, JsonValue> | null;
    if (row) latest[pillar] = assessmentFrom(row, pillar);
  }
  const entries = (evidence ?? []) as unknown as Array<Record<string, JsonValue>>;
  if (entries.length) {
    const avg = entries.reduce((sum, row) => sum + Number(row.quality_score), 0) / entries.length;
    const quantity = Math.min(40, entries.length * 5); const quality = Math.round(avg * 0.4); const diversity = Math.min(20, new Set(entries.map((row) => row.category)).size * 4);
    latest.evidence = { id: "vault", pillar: "evidence", score: quantity + quality + diversity, createdAt: String(entries[0].created_at), verdict: `${entries.length} proof points are now working for you.`, reasoning: "Evidence is scored from vault quantity, average quality and category diversity.", breakdown: [{ label: "Quantity", score: quantity, reasoning: `${entries.length} saved achievements` }, { label: "Quality", score: quality, reasoning: `${Math.round(avg)} average bullet quality` }, { label: "Diversity", score: diversity, reasoning: `${new Set(entries.map((row) => row.category)).size} evidence categories` }], content: { entries } };
  }
  const scores = Object.fromEntries(Object.entries(latest).map(([pillar, result]) => [pillar, result?.score]));
  return { member, latest, scores, evidence: entries, rewrites: rewrites ?? [] };
});

const analysisInput = tokenInput.extend({ pillar: pillarSchema.exclude(["evidence"]), formData: z.record(z.string(), z.unknown()), followupTranscript: z.array(z.object({ role: z.string(), content: z.string() })).max(4).default([]) });

export const askCareerFollowup = createServerFn({ method: "POST" }).inputValidator((v) => analysisInput.parse(v)).handler(async ({ data }) => {
  assertMember(data.memberId, data.token);
  const output = await callAi(`You are a direct, warm BlueChip ${data.pillar} expert. Ask exactly one short question that will materially sharpen this assessment. Do not repeat a form question. This is follow-up ${Math.floor(data.followupTranscript.length / 2) + 1} of 2. Return JSON with one key: question.`, { form_data: data.formData, transcript: data.followupTranscript });
  return { question: String(output.question ?? "What outcome would make this analysis most valuable right now?") };
});

export const generateCareerAssessment = createServerFn({ method: "POST" }).inputValidator((v) => analysisInput.parse(v)).handler(async ({ data }) => {
  assertMember(data.memberId, data.token);
  const db = await admin();
  const context = JSON.parse(JSON.stringify(data.formData)) as Record<string, JsonValue>;
  const { data: member } = await db.from("members").select("*").eq("id", data.memberId).single();
  if (data.pillar !== "clarity") {
    const { data: clarity } = await db.from("clarity_sessions").select("persona_statement,north_star_role").eq("member_id", data.memberId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    Object.assign(context, { base_profile: member, clarity_context: clarity });
  }
  if (["reach", "energy"].includes(data.pillar)) {
    const { data: authority } = await db.from("authority_sessions").select("framework_name").eq("member_id", data.memberId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    context.authority_context = authority;
  }
  const prompts: Record<string, string> = {
    clarity: "You are BlueChip CareerOS's Career Clarity Strategist. Score specificity, market gap and velocity 0-100 and calculate clarity_score. Return JSON keys: clarity_score, specificity_score, market_gap_score, velocity_score, score_reasoning, verdict, persona_statement, positioning_headlines (3), north_star_role, power_signals (3), market_gap_analysis, upskill_plan (4-5 timeline-bound actions). Be direct, warm and specific to an Indian senior professional.",
    authority: "You are BlueChip CareerOS's Authority Strategist. Framework strength matters most. Return JSON keys: authority_score, thought_leadership_score, consistency_score, recognition_score, framework_strength_score, score_reasoning, verdict, framework_name, framework_structure (3-5 elements), framework_illustration, authority_audit, this_weeks_action. Scores are 0-100.",
    reach: "You are BlueChip CareerOS's Visibility Strategist. Score four SSI-aligned pillars 0-25. Return JSON keys: reach_score, brand_score, find_people_score, engage_insights_score, build_relationships_score, score_reasoning, verdict, visibility_audit, seven_day_sprint (7 exact actions), thirty_day_trajectory (4 weekly milestones). The reach_score is the sum.",
    energy: "You are BlueChip CareerOS's Executive Presence Coach. Score five elements 0-20. Return JSON keys: energy_score, clarity_thought_score, command_score, composure_score, conviction_score, consideration_score, score_reasoning, verdict, presence_audit, five_fixes (5), weekly_practice (Monday-Friday actions). The energy_score is the sum.",
    revenue: "You are BlueChip CareerOS's India Compensation Strategist. Ground estimates in current Indian market conventions and clearly label estimates when live verification is unavailable. Return JSON keys: revenue_score, market_alignment_score, negotiation_readiness_score, score_reasoning, verdict, range_low, range_median, range_high (numbers in INR Lakhs), current_ctc, gap_analysis, leverage_points (3-5), sources (array of source names/URLs or labeled estimate basis), transparency_line.",
  };
  let output: Record<string, JsonValue>;
  try { output = await callAi(prompts[data.pillar], { ...context, followup_transcript: data.followupTranscript }); }
  catch (error) { throw error instanceof Error ? error : new Error("BlueChip AI could not complete this analysis."); }
  const row: Record<string, JsonValue> = { member_id: data.memberId, form_data: JSON.parse(JSON.stringify(data.formData)) as JsonValue, followup_transcript: data.followupTranscript, ...output };
  if (data.pillar === "energy") row.practice_checks = {};
  if (data.pillar === "clarity") {
    await db.from("members").update({ role_title: String(data.formData.role_title ?? ""), industry: String(data.formData.industry ?? ""), years_experience: Number(data.formData.years_experience ?? 0), career_goal: String(data.formData.career_goal ?? ""), target_timeline: String(data.formData.target_timeline ?? "") }).eq("id", data.memberId);
  }
  const { data: saved, error } = await db.from(tableFor[data.pillar] as "clarity_sessions").insert(row as never).select("*").single();
  if (error || !saved) throw new Error(error?.message ?? "The assessment could not be saved.");
  return assessmentFrom(saved as unknown as Record<string, JsonValue>, data.pillar);
});

export const polishEvidence = createServerFn({ method: "POST" }).inputValidator((v) => tokenInput.extend({ rawInput: z.string().min(10), numbers: z.string().optional(), category: z.string().min(1) }).parse(v)).handler(async ({ data }) => {
  assertMember(data.memberId, data.token);
  const output = await callAi("You are an executive resume writer. Turn the achievement into one concise Q-STAR bullet. Never invent numbers; use [ADD NUMBER: e.g. X%] where proof is missing. Return JSON keys polished_bullet, quality_score (0-100), quality_note.", JSON.parse(JSON.stringify(data)) as Record<string, JsonValue>);
  return output;
});

export const saveEvidence = createServerFn({ method: "POST" }).inputValidator((v) => tokenInput.extend({ id: z.string().uuid().optional(), rawInput: z.string().min(1), polishedBullet: z.string().min(1), qualityScore: z.number().min(0).max(100), qualityNote: z.string(), category: z.string() }).parse(v)).handler(async ({ data }) => {
  assertMember(data.memberId, data.token); const db = await admin();
  const row = { member_id: data.memberId, raw_input: data.rawInput, polished_bullet: data.polishedBullet, quality_score: data.qualityScore, quality_note: data.qualityNote, category: data.category, edited_at: new Date().toISOString() };
  const result = data.id ? await db.from("evidence_entries").update(row).eq("id", data.id).eq("member_id", data.memberId) : await db.from("evidence_entries").insert(row);
  if (result.error) throw new Error(result.error.message); return { ok: true };
});

export const deleteEvidence = createServerFn({ method: "POST" }).inputValidator((v) => tokenInput.extend({ id: z.string().uuid() }).parse(v)).handler(async ({ data }) => {
  assertMember(data.memberId, data.token); const db = await admin(); const { error } = await db.from("evidence_entries").delete().eq("id", data.id).eq("member_id", data.memberId); if (error) throw new Error(error.message); return { ok: true };
});

export const rewriteExecutiveMessage = createServerFn({ method: "POST" }).inputValidator((v) => tokenInput.extend({ text: z.string().min(10), contextType: z.string().min(1) }).parse(v)).handler(async ({ data }) => {
  assertMember(data.memberId, data.token);
  const output = await callAi("You are an Indian corporate executive communication coach. Preserve meaning, remove hedging, increase clarity and authority. Return JSON keys rewritten_text and what_changed (array of specific changes).", JSON.parse(JSON.stringify(data)) as Record<string, JsonValue>);
  const db = await admin(); const { data: saved, error } = await db.from("energy_rewrites").insert({ member_id: data.memberId, original_text: data.text, context_type: data.contextType, rewritten_text: String(output.rewritten_text ?? ""), what_changed: asArray(output.what_changed) }).select("*").single();
  if (error) throw new Error(error.message); return saved;
});