import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MeData = {
  profile: {
    id: string;
    display_name: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    onboarding_completed: boolean;
    primary_goal: string | null;
    biggest_challenge: string | null;
    target_timeline: string | null;
    linkedin_status: string | null;
    last_promotion: string | null;
    created_at: string | null;
    level: number;
    xp: number;
    coins: number;
    streak_days: number;
    cpi_score: number;
    tier: string;
  };
  scores: {
    clarity: number;
    authority: number;
    reach: number;
    evidence: number;
    energy: number;
    revenue: number;
  };
  missions: Array<{
    id: string;
    title: string;
    description: string | null;
    xp_reward: number;
    coin_reward: number;
    category: string;
    status: string;
    user_mission_id: string;
    completed_at: string | null;
  }>;
  goalCompletionsToday: string[];
  isAdmin: boolean;
};

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MeData> => {
    const { supabase, userId } = context;

    const [profileRes, scoresRes, missionsRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("career_scores").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("user_missions")
        .select("id, status, completed_at, mission:missions(id, title, description, xp_reward, coin_reward, category, active)")
        .eq("user_id", userId),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    const profile = (profileRes.data ?? {
      id: userId,
      display_name: "Operator",
      first_name: null,
      last_name: null,
      avatar_url: null,
      headline: null,
      onboarding_completed: false,
      level: 1,
      xp: 0,
      coins: 0,
      streak_days: 0,
      cpi_score: 0,
      tier: "L1",
    }) as any;
    const scores = scoresRes.data ?? {
      clarity: 0, authority: 0, reach: 0, evidence: 0, energy: 0, revenue: 0,
    };
    const missions = (missionsRes.data ?? [])
      .filter((m: any) => m.mission && m.mission.active)
      .map((m: any) => ({
        id: m.mission.id,
        title: m.mission.title,
        description: m.mission.description,
        xp_reward: m.mission.xp_reward,
        coin_reward: m.mission.coin_reward,
        category: m.mission.category,
        status: m.status,
        user_mission_id: m.id,
        completed_at: m.completed_at,
      }));
    const isAdmin = (rolesRes.data ?? []).some((r: any) => r.role === "admin");

    return {
      profile: {
        id: profile.id,
        display_name: profile.display_name,
        first_name: profile.first_name ?? null,
        last_name: profile.last_name ?? null,
        avatar_url: profile.avatar_url,
        headline: profile.headline,
        onboarding_completed: profile.onboarding_completed ?? false,
        primary_goal: profile.primary_goal ?? null,
        biggest_challenge: profile.biggest_challenge ?? null,
        target_timeline: profile.target_timeline ?? null,
        linkedin_status: profile.linkedin_status ?? null,
        last_promotion: profile.last_promotion ?? null,
        created_at: profile.created_at ?? null,
        level: profile.level,
        xp: profile.xp,
        coins: profile.coins,
        streak_days: profile.streak_days,
        cpi_score: profile.cpi_score,
        tier: profile.tier,
      },
      scores: {
        clarity: scores.clarity,
        authority: scores.authority,
        reach: scores.reach,
        evidence: scores.evidence,
        energy: scores.energy,
        revenue: scores.revenue,
      },
      missions,
      isAdmin,
    };
  });

export const completeMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userMissionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: um, error: umErr } = await supabase
      .from("user_missions")
      .select("id, status, mission:missions(xp_reward, coin_reward, title)")
      .eq("id", data.userMissionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (umErr || !um) throw new Error("Mission not found");
    if (um.status === "completed") return { alreadyDone: true };

    const mission = um.mission as any;
    const { error: updErr } = await supabase
      .from("user_missions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", data.userMissionId)
      .eq("user_id", userId);
    if (updErr) throw new Error(updErr.message);

    // Award XP via service-role RPC (function is locked down)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: rpcErr } = await supabaseAdmin.rpc("award_xp", {
      _user_id: userId,
      _amount: mission.xp_reward,
      _source: `mission:${mission.title}`,
      _coins: mission.coin_reward,
    });
    if (rpcErr) throw new Error(rpcErr.message);

    return { alreadyDone: false, xp: mission.xp_reward, coins: mission.coin_reward };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      display_name: z.string().min(1).max(80).optional(),
      headline: z.string().max(160).optional(),
      avatar_url: z.string().url().max(500).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, xp, level, tier, streak_days, cpi_score")
      .order("xp", { ascending: false })
      .limit(25);
    if (error) throw new Error(error.message);
    return { rows: data ?? [], me: userId };
  });

const onboardingSchema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  job_title: z.string().trim().min(1).max(120),
  industry: z.enum(["Tech", "BFSI", "Consulting", "Manufacturing", "Healthcare", "Other"]),
  primary_goal: z.enum([
    "Get promoted",
    "Find a new job",
    "Get a salary raise",
    "Build external visibility",
    "Grow my consulting income",
  ]),
  biggest_challenge: z.enum([
    "Invisible to leadership",
    "Stuck in same role 3+ years",
    "Job search not converting",
    "No personal brand online",
    "Can't negotiate my worth",
  ]),
  target_timeline: z.enum(["3 months", "6 months", "12 months"]),
  linkedin_status: z.enum(["Active", "Needs work", "Not started"]),
  last_promotion: z.enum(["Within 1 year", "1–3 years", "3+ years", "Never promoted here"]),
});

function computeBaseline(d: z.infer<typeof onboardingSchema>) {
  // Each dim is 0-25 baseline
  let clarity = 5, authority = 5, reach = 5, evidence = 5, energy = 10, revenue = 5;

  // LinkedIn drives Reach
  if (d.linkedin_status === "Active") reach = 20;
  else if (d.linkedin_status === "Needs work") reach = 10;
  else reach = 3;

  // Last promotion drives Clarity + Revenue
  if (d.last_promotion === "Within 1 year") { clarity = 20; revenue = 18; }
  else if (d.last_promotion === "1–3 years") { clarity = 15; revenue = 12; }
  else if (d.last_promotion === "3+ years") { clarity = 10; revenue = 5; }
  else { clarity = 7; revenue = 4; }

  // Primary goal nudges
  switch (d.primary_goal) {
    case "Get promoted": authority += 8; evidence += 6; break;
    case "Find a new job": clarity += 5; reach += 4; break;
    case "Get a salary raise": revenue += 8; evidence += 5; break;
    case "Build external visibility": reach += 8; authority += 6; break;
    case "Grow my consulting income": revenue += 10; authority += 5; break;
  }

  // Challenge subtracts from the weakest area
  switch (d.biggest_challenge) {
    case "Invisible to leadership": authority = Math.max(2, authority - 5); break;
    case "Stuck in same role 3+ years": clarity = Math.max(2, clarity - 4); break;
    case "Job search not converting": evidence = Math.max(2, evidence - 4); break;
    case "No personal brand online": reach = Math.max(2, reach - 5); break;
    case "Can't negotiate my worth": revenue = Math.max(2, revenue - 4); break;
  }

  // Timeline → urgency boosts Energy
  if (d.target_timeline === "3 months") energy = 22;
  else if (d.target_timeline === "6 months") energy = 16;
  else energy = 12;

  const clamp = (n: number) => Math.max(0, Math.min(25, Math.round(n)));
  return {
    clarity: clamp(clarity),
    authority: clamp(authority),
    reach: clamp(reach),
    evidence: clamp(evidence),
    energy: clamp(energy),
    revenue: clamp(revenue),
  };
}

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => onboardingSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const baseline = computeBaseline(data);
    const cpi = Math.round(
      (baseline.clarity + baseline.authority + baseline.reach +
       baseline.evidence + baseline.energy + baseline.revenue) / 6 * 4,
    );

    const display_name = `${data.first_name} ${data.last_name}`.trim();
    const headline = `${data.job_title} · ${data.industry}`;

    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        display_name,
        headline,
        job_title: data.job_title,
        industry: data.industry,
        primary_goal: data.primary_goal,
        biggest_challenge: data.biggest_challenge,
        target_timeline: data.target_timeline,
        linkedin_status: data.linkedin_status,
        last_promotion: data.last_promotion,
        onboarding_completed: true,
        cpi_score: cpi,
      })
      .eq("id", userId);
    if (pErr) throw new Error(pErr.message);

    const { error: sErr } = await supabaseAdmin
      .from("career_scores")
      .upsert({ user_id: userId, ...baseline, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (sErr) throw new Error(sErr.message);

    return { ok: true, baseline, cpi };
  });


