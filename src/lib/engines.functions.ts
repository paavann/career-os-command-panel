import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PILLARS = ["clarity", "authority", "reach", "evidence", "energy", "revenue"] as const;

const inputSchema = z.object({
  pillar: z.enum(PILLARS),
  inputs: z.record(z.string().min(1).max(120), z.string().max(4000)),
});

function extractScore(text: string): number | null {
  // Look for the last 1-100 integer that appears after "SCORE" header or on its own line
  const scoreHeader = text.toUpperCase().lastIndexOf("SCORE");
  const tail = scoreHeader >= 0 ? text.slice(scoreHeader) : text;
  const matches = tail.match(/\b(\d{1,3})\b/g);
  if (!matches) return null;
  for (let i = matches.length - 1; i >= 0; i--) {
    const n = parseInt(matches[i], 10);
    if (n >= 1 && n <= 100) return n;
  }
  return null;
}

export const runEngineAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { ENGINES } = await import("@/lib/engines");
    const engine = ENGINES[data.pillar];
    if (!engine) throw new Error("Unknown engine");

    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("AI Gateway not configured");

    const userBlock = Object.entries(data.inputs)
      .map(([k, v]) => `**${k}**: ${v}`)
      .join("\n");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: engine.systemPrompt },
          { role: "user", content: `Engine: ${engine.name}\n\nUser inputs:\n${userBlock}` },
        ],
      }),
    });

    if (aiRes.status === 429) throw new Error("Rate limit reached. Try again shortly.");
    if (aiRes.status === 402) throw new Error("AI credits exhausted. Add credits in Lovable settings.");
    if (!aiRes.ok) {
      const t = await aiRes.text().catch(() => "");
      throw new Error(`AI error: ${t.slice(0, 200)}`);
    }
    const json = (await aiRes.json()) as any;
    const content: string = json.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("Empty AI response");

    const score = extractScore(content);

    // Update career_scores + recompute CPI when we got a valid score
    let updatedScores: Record<string, number> | null = null;
    let newCpi: number | null = null;
    if (score !== null) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: existing } = await supabaseAdmin
        .from("career_scores")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const next = {
        clarity: existing?.clarity ?? 0,
        authority: existing?.authority ?? 0,
        reach: existing?.reach ?? 0,
        evidence: existing?.evidence ?? 0,
        energy: existing?.energy ?? 0,
        revenue: existing?.revenue ?? 0,
      };
      next[data.pillar] = score;

      const { error: upErr } = await supabaseAdmin
        .from("career_scores")
        .upsert({ user_id: userId, ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (upErr) throw new Error(upErr.message);

      const cpi = Math.round(
        (next.clarity + next.authority + next.reach + next.evidence + next.energy + next.revenue) / 6,
      );
      const { error: pErr } = await supabaseAdmin
        .from("profiles")
        .update({ cpi_score: cpi })
        .eq("id", userId);
      if (pErr) throw new Error(pErr.message);

      updatedScores = next;
      newCpi = cpi;
    }

    return {
      analysis: content,
      score,
      pillar: data.pillar,
      updatedScores,
      cpi: newCpi,
    };
  });
