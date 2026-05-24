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
        avatar_url: profile.avatar_url,
        headline: profile.headline,
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

