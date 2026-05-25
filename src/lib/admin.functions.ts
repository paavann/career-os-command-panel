import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin only");
}

async function getAdmin() {
  const mod = await import("@/integrations/supabase/client.server");
  return mod.supabaseAdmin;
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const admin = await getAdmin();

    const [users, today, xpAgg, top] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id", { count: "exact", head: true }).eq("last_active_date", new Date().toISOString().slice(0, 10)),
      admin.from("xp_events").select("amount"),
      admin.from("profiles").select("id, display_name, xp, level, tier").order("xp", { ascending: false }).limit(10),
    ]);

    const totalXp = (xpAgg.data ?? []).reduce((s: number, r: any) => s + (r.amount || 0), 0);

    return {
      totalUsers: users.count ?? 0,
      activeToday: today.count ?? 0,
      totalXp,
      topUsers: top.data ?? [],
    };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ search: z.string().max(120).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    let q = admin.from("profiles").select("id, display_name, headline, xp, level, coins, streak_days, tier, created_at").order("created_at", { ascending: false }).limit(100);
    if (data.search) q = q.ilike("display_name", `%${data.search}%`);
    const { data: profiles, error } = await q;
    if (error) throw new Error(error.message);

    const ids = (profiles ?? []).map((p: any) => p.id);
    const { data: roles } = ids.length
      ? await admin.from("user_roles").select("user_id, role").in("user_id", ids)
      : { data: [] as any[] };
    const byUser: Record<string, string[]> = {};
    (roles ?? []).forEach((r: any) => {
      byUser[r.user_id] = [...(byUser[r.user_id] ?? []), r.role];
    });
    return (profiles ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? [] }));
  });

export const adminAdjustUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      userId: z.string().uuid(),
      xp: z.number().int().min(0).max(1_000_000).optional(),
      coins: z.number().int().min(0).max(1_000_000).optional(),
      tier: z.enum(["L1", "L2", "L3"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const patch: any = {};
    if (data.xp !== undefined) {
      patch.xp = data.xp;
      patch.level = Math.max(1, 1 + Math.floor(data.xp / 500));
    }
    if (data.coins !== undefined) patch.coins = data.coins;
    if (data.tier !== undefined) patch.tier = data.tier;
    const { error } = await admin.from("profiles").update(patch).eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGrantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      userId: z.string().uuid(),
      role: z.enum(["admin", "member"]),
      action: z.enum(["grant", "revoke"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    if (data.action === "grant") {
      const { error } = await admin.from("user_roles").upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminListMissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { data, error } = await admin.from("missions").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpsertMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      title: z.string().min(1).max(160),
      description: z.string().max(800).optional().nullable(),
      xp_reward: z.number().int().min(0).max(10000),
      coin_reward: z.number().int().min(0).max(10000),
      category: z.string().min(1).max(40),
      active: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    if (data.id) {
      const { error } = await admin.from("missions").update({
        title: data.title, description: data.description ?? null, xp_reward: data.xp_reward,
        coin_reward: data.coin_reward, category: data.category, active: data.active,
      }).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    } else {
      const { data: row, error } = await admin.from("missions").insert({
        title: data.title, description: data.description ?? null, xp_reward: data.xp_reward,
        coin_reward: data.coin_reward, category: data.category, active: data.active,
      }).select("id").single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
  });

export const adminDeleteMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const admin = await getAdmin();
    const { error } = await admin.from("missions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAiUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const admin = await getAdmin();

    const [convRes, msgRes] = await Promise.all([
      admin.from("ai_conversations").select("copilot_slug, user_id"),
      admin.from("ai_messages").select("id", { count: "exact", head: true }),
    ]);

    const byCopilot: Record<string, number> = {};
    const uniqueUsers = new Set<string>();
    (convRes.data ?? []).forEach((c: any) => {
      byCopilot[c.copilot_slug] = (byCopilot[c.copilot_slug] ?? 0) + 1;
      uniqueUsers.add(c.user_id);
    });

    return {
      totalMessages: msgRes.count ?? 0,
      totalConversations: convRes.data?.length ?? 0,
      uniqueUsers: uniqueUsers.size,
      byCopilot: Object.entries(byCopilot).map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count),
    };
  });

export type CoachClient = {
  id: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  job_title: string | null;
  industry: string | null;
  current_company: string | null;
  city: string | null;
  years_experience: number | null;
  linkedin_url: string | null;
  linkedin_status: string | null;
  primary_goal: string | null;
  biggest_challenge: string | null;
  target_role: string | null;
  target_timeline: string | null;
  last_promotion: string | null;
  onboarding_completed: boolean;
  created_at: string | null;
  last_active_date: string | null;
  xp: number;
  level: number;
  coins: number;
  streak_days: number;
  cpi_score: number;
  scores: { clarity: number; authority: number; reach: number; evidence: number; energy: number; revenue: number };
  missions_completed: number;
  jobs_total: number;
  jobs_active: number;
  jobs_interview: number;
  jobs_offer: number;
  courses_in_progress: number;
  courses_completed: number;
  ai_conversations: number;
  is_admin: boolean;
};

export const adminListClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      search: z.string().max(120).optional(),
      goal: z.string().max(80).optional(),
      industry: z.string().max(80).optional(),
      status: z.enum(["all", "active_7d", "stalled_14d", "onboarding_incomplete"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }): Promise<CoachClient[]> => {
    await assertAdmin(context.supabase, context.userId);
    const admin = await getAdmin();

    let q = admin.from("profiles").select("*").order("last_active_date", { ascending: false, nullsFirst: false }).limit(500);
    if (data.search) q = q.ilike("display_name", `%${data.search}%`);
    if (data.goal) q = q.eq("primary_goal", data.goal);
    if (data.industry) q = q.eq("industry", data.industry);
    const { data: profiles, error } = await q;
    if (error) throw new Error(error.message);

    const ids = (profiles ?? []).map((p: any) => p.id);
    if (!ids.length) return [];

    const [scoresR, missionsR, jobsR, coursesR, convR, rolesR] = await Promise.all([
      admin.from("career_scores").select("*").in("user_id", ids),
      admin.from("user_missions").select("user_id, status").in("user_id", ids).eq("status", "completed"),
      admin.from("jobs").select("user_id, stage").in("user_id", ids),
      admin.from("user_courses").select("user_id, course_completed_at").in("user_id", ids),
      admin.from("ai_conversations").select("user_id").in("user_id", ids),
      admin.from("user_roles").select("user_id, role").in("user_id", ids).eq("role", "admin"),
    ]);

    const scoreBy: Record<string, any> = {};
    (scoresR.data ?? []).forEach((s: any) => { scoreBy[s.user_id] = s; });
    const missionBy: Record<string, number> = {};
    (missionsR.data ?? []).forEach((m: any) => { missionBy[m.user_id] = (missionBy[m.user_id] ?? 0) + 1; });
    const jobBy: Record<string, { total: number; active: number; interview: number; offer: number }> = {};
    (jobsR.data ?? []).forEach((j: any) => {
      const b = jobBy[j.user_id] ?? (jobBy[j.user_id] = { total: 0, active: 0, interview: 0, offer: 0 });
      b.total++;
      if (!["closed", "offer"].includes(j.stage)) b.active++;
      if (["interview", "final_round"].includes(j.stage)) b.interview++;
      if (j.stage === "offer") b.offer++;
    });
    const courseBy: Record<string, { inProgress: number; done: number }> = {};
    (coursesR.data ?? []).forEach((c: any) => {
      const b = courseBy[c.user_id] ?? (courseBy[c.user_id] = { inProgress: 0, done: 0 });
      if (c.course_completed_at) b.done++; else b.inProgress++;
    });
    const convBy: Record<string, number> = {};
    (convR.data ?? []).forEach((c: any) => { convBy[c.user_id] = (convBy[c.user_id] ?? 0) + 1; });
    const adminSet = new Set((rolesR.data ?? []).map((r: any) => r.user_id));

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const enriched: CoachClient[] = (profiles ?? []).map((p: any) => {
      const s = scoreBy[p.id] ?? { clarity: 0, authority: 0, reach: 0, evidence: 0, energy: 0, revenue: 0 };
      const j = jobBy[p.id] ?? { total: 0, active: 0, interview: 0, offer: 0 };
      const c = courseBy[p.id] ?? { inProgress: 0, done: 0 };
      return {
        id: p.id, display_name: p.display_name, first_name: p.first_name, last_name: p.last_name,
        headline: p.headline, job_title: p.job_title, industry: p.industry, current_company: p.current_company,
        city: p.city, years_experience: p.years_experience, linkedin_url: p.linkedin_url, linkedin_status: p.linkedin_status,
        primary_goal: p.primary_goal, biggest_challenge: p.biggest_challenge, target_role: p.target_role,
        target_timeline: p.target_timeline, last_promotion: p.last_promotion, onboarding_completed: p.onboarding_completed,
        created_at: p.created_at, last_active_date: p.last_active_date,
        xp: p.xp, level: p.level, coins: p.coins, streak_days: p.streak_days, cpi_score: p.cpi_score,
        scores: { clarity: s.clarity, authority: s.authority, reach: s.reach, evidence: s.evidence, energy: s.energy, revenue: s.revenue },
        missions_completed: missionBy[p.id] ?? 0,
        jobs_total: j.total, jobs_active: j.active, jobs_interview: j.interview, jobs_offer: j.offer,
        courses_in_progress: c.inProgress, courses_completed: c.done,
        ai_conversations: convBy[p.id] ?? 0,
        is_admin: adminSet.has(p.id),
      };
    });

    if (data.status && data.status !== "all") {
      return enriched.filter((c) => {
        if (data.status === "onboarding_incomplete") return !c.onboarding_completed;
        const last = c.last_active_date ? new Date(c.last_active_date) : null;
        const days = last ? Math.floor((today.getTime() - last.getTime()) / 86_400_000) : 9999;
        if (data.status === "active_7d") return days <= 7;
        if (data.status === "stalled_14d") return days >= 14;
        return true;
      });
    }
    return enriched;
  });
