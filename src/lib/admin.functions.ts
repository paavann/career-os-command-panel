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
