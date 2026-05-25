import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const STAGES = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "final_round",
  "offer",
  "closed",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  phone_screen: "Phone Screen",
  interview: "Interview",
  final_round: "Final Round",
  offer: "Offer",
  closed: "Closed",
};

const STAGE_XP: Partial<Record<Stage, number>> = {
  applied: 30,
  interview: 50,
  offer: 100,
};

export type Job = {
  id: string;
  company: string;
  role: string;
  job_url: string | null;
  jd_text: string | null;
  ctc_min: number | null;
  ctc_max: number | null;
  source: string | null;
  recruiter_name: string | null;
  recruiter_contact: string | null;
  target_start_date: string | null;
  priority: "high" | "medium" | "low";
  notes: string;
  stage: Stage;
  stage_entered_at: string;
  stage_history: Array<{ stage: Stage; at: string }>;
  notes_log: Array<{ at: string; text: string }>;
  follow_up_date: string | null;
  outcome: string | null;
  created_at: string;
  updated_at: string;
};

const jobInput = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(160),
  job_url: z.string().trim().max(500).optional().nullable(),
  jd_text: z.string().trim().max(20000).optional().nullable(),
  ctc_min: z.number().nullable().optional(),
  ctc_max: z.number().nullable().optional(),
  source: z.string().trim().max(60).optional().nullable(),
  recruiter_name: z.string().trim().max(120).optional().nullable(),
  recruiter_contact: z.string().trim().max(200).optional().nullable(),
  target_start_date: z.string().nullable().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  notes: z.string().trim().max(4000).default(""),
  stage: z.enum(STAGES).default("wishlist"),
  follow_up_date: z.string().nullable().optional(),
});

export const listJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Job[];
  });

export const createJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => jobInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const now = new Date().toISOString();
    const { data: row, error } = await supabase
      .from("jobs")
      .insert({
        ...data,
        user_id: userId,
        stage_entered_at: now,
        stage_history: [{ stage: data.stage, at: now }],
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const xp = STAGE_XP[data.stage as Stage];
    if (xp) {
      await supabase.rpc("award_xp", {
        _user_id: userId,
        _amount: xp,
        _source: `job_stage:${data.stage}`,
        _coins: 0,
      });
    }
    return row as unknown as Job;
  });

export const updateJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    jobInput.partial().extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...patch } = data;
    const { data: row, error } = await supabase
      .from("jobs")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as Job;
  });

export const moveJobStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), stage: z.enum(STAGES) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing, error: e1 } = await supabase
      .from("jobs")
      .select("stage, stage_history")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (e1 || !existing) throw new Error(e1?.message || "Not found");
    if (existing.stage === data.stage) return { ok: true, xp: 0 };

    const now = new Date().toISOString();
    const history = Array.isArray(existing.stage_history)
      ? (existing.stage_history as any[])
      : [];
    history.push({ stage: data.stage, at: now });

    const { error: e2 } = await supabase
      .from("jobs")
      .update({
        stage: data.stage,
        stage_entered_at: now,
        stage_history: history,
      })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (e2) throw new Error(e2.message);

    const xp = STAGE_XP[data.stage as Stage] ?? 0;
    if (xp) {
      await supabase.rpc("award_xp", {
        _user_id: userId,
        _amount: xp,
        _source: `job_stage:${data.stage}`,
        _coins: 0,
      });
    }
    return { ok: true, xp };
  });

export const addJobNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), text: z.string().trim().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing, error: e1 } = await supabase
      .from("jobs")
      .select("notes_log")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (e1 || !existing) throw new Error(e1?.message || "Not found");
    const log = Array.isArray(existing.notes_log) ? (existing.notes_log as any[]) : [];
    log.unshift({ at: new Date().toISOString(), text: data.text });
    const { error } = await supabase
      .from("jobs")
      .update({ notes_log: log })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function callAI(systemPrompt: string, userPrompt: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add funds in Workspace settings.");
    throw new Error(`AI error ${res.status}`);
  }
  const json: any = await res.json();
  return String(json?.choices?.[0]?.message?.content ?? "");
}

export const aiPrepStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: job } = await supabase
      .from("jobs")
      .select("company, role, stage, jd_text, ctc_min, ctc_max")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (!job) throw new Error("Job not found");
    const { data: profile } = await supabase
      .from("profiles")
      .select("job_title, industry, years_experience, target_role, city")
      .eq("id", userId)
      .single();

    const content = await callAI(
      "You are Bluechip CareerOS's executive interview coach for senior Indian professionals. Be concrete, India-context aware (₹ LPA, fitment, notice period). Output clean markdown.",
      `Prepare me for the **${STAGE_LABELS[job.stage as Stage]}** stage at **${job.company}** for the role of **${job.role}**.

My profile: ${profile?.job_title ?? "—"} in ${profile?.industry ?? "—"}, ${profile?.years_experience ?? "?"} yrs, based in ${profile?.city ?? "India"}. Target role: ${profile?.target_role ?? job.role}.

${job.jd_text ? `JD context:\n${job.jd_text.slice(0, 3000)}` : ""}

Give me:
1. 7 most likely questions for this stage at this company
2. STAR-format model answer for the toughest one
3. 3 questions I should ask them
4. Red flags to watch for
5. A 24-hour prep checklist`,
    );
    return { content };
  });

export const aiAnalyzeJd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: job } = await supabase
      .from("jobs")
      .select("company, role, jd_text, job_url")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (!job) throw new Error("Job not found");
    if (!job.jd_text || job.jd_text.trim().length < 40) {
      throw new Error("Paste the JD text into the job card first.");
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("job_title, industry, years_experience, target_role")
      .eq("id", userId)
      .single();

    const content = await callAI(
      "You are an elite JD analyst for the Indian senior-talent market. Salary bands in ₹ LPA. Be specific, no fluff. Markdown output.",
      `Analyze this JD for **${job.role}** at **${job.company}**.

My profile: ${profile?.job_title ?? "—"}, ${profile?.years_experience ?? "?"} yrs in ${profile?.industry ?? "—"}, targeting ${profile?.target_role ?? job.role}.

JD:
${(job.jd_text ?? "").slice(0, 6000)}

Tell me:
1. Top 5 skills they're prioritizing (ranked)
2. Key experience signal they want
3. Likely salary band in ₹ LPA for this role in India
4. 3 red flags or risks in this JD
5. % match score vs my profile and the 3 specific gaps to close`,
    );
    return { content };
  });

export const aiFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: job } = await supabase
      .from("jobs")
      .select("company, role, stage, recruiter_name, stage_entered_at")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (!job) throw new Error("Job not found");
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, job_title")
      .eq("id", userId)
      .single();
    const days = Math.floor(
      (Date.now() - new Date(job.stage_entered_at).getTime()) / 86400000,
    );

    const content = await callAI(
      "You are a senior recruiter-relationship strategist. Write follow-up emails that are warm, brief, and move the process forward without sounding desperate.",
      `Draft a follow-up email.
Company: ${job.company}
Role: ${job.role}
Current stage: ${STAGE_LABELS[job.stage as Stage]}
Days since last movement: ${days}
Recruiter name: ${job.recruiter_name ?? "Hiring team"}
Sender: ${profile?.display_name ?? "Candidate"} (${profile?.job_title ?? ""})

Output:
**Subject:** ...
**Body:** (max 110 words, friendly-professional, clear ask, soft deadline)`,
    );
    return { content };
  });
