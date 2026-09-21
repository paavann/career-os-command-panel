import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const milestoneSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(600).default(""),
  targetDate: z.string().date().nullable().optional(),
  sortOrder: z.number().int().min(0).max(20),
});

const goalSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(180),
  targetRole: z.string().trim().max(160).default(""),
  targetDate: z.string().date(),
  timeline: z.string().trim().max(40).default("90 days"),
  milestones: z.array(milestoneSchema).min(3).max(5),
});

export type DiamondGoal = {
  id: string;
  title: string;
  target_role: string | null;
  target_date: string;
  timeline: string | null;
  progress: number;
  status: string;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    target_date: string | null;
    completed: boolean;
    completed_at: string | null;
    sort_order: number;
  }>;
};

export type FoundationAction = {
  slug: "career-checkup" | "ninety-day-goal" | "achievement-stack";
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  cta: "checkup" | "goal" | "evidence";
};

export type CareerProof = {
  id: string;
  title: string;
  proof_type: string;
  description: string;
  impact: string;
  metric: string;
  proof_date: string | null;
  created_at: string;
};

export type WeeklyReview = {
  id: string;
  week_start: string;
  moved_forward: string;
  blockers: string;
  next_priority: string;
};

const proofSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(160),
  proofType: z.string().trim().min(1).max(60),
  description: z.string().trim().max(1200).default(""),
  impact: z.string().trim().max(600).default(""),
  metric: z.string().trim().max(160).default(""),
  proofDate: z.string().date().nullable().optional(),
});

const weeklyReviewSchema = z.object({
  movedForward: z.string().trim().max(1200).default(""),
  blockers: z.string().trim().max(1200).default(""),
  nextPriority: z.string().trim().max(600).default(""),
});

function startOfWeekIso() {
  const date = new Date();
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1));
  return date.toISOString().slice(0, 10);
}

const FOUNDATION_ACTIONS = [
  {
    slug: "career-checkup" as const,
    title: "Complete Career Checkup",
    description: "Run every C.A.R.E.E.R. pillar to establish your current baseline.",
    xp: 100,
    cta: "checkup" as const,
  },
  {
    slug: "ninety-day-goal" as const,
    title: "Define your 90-Day Goal",
    description: "Set your North Star and map three to five measurable milestones.",
    xp: 100,
    cta: "goal" as const,
  },
  {
    slug: "achievement-stack" as const,
    title: "Add your first 3 career achievements",
    description: "Build an evidence stack of three quantified career wins.",
    xp: 150,
    cta: "evidence" as const,
  },
] as const;

export const getCommandCenter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const weekStart = startOfWeekIso();
    const [goalRes, completionRes, xpRes, proofRes, reviewRes, weeklyCompletionRes] = await Promise.all([
      supabase
        .from("diamond_goals")
        .select("id, title, target_role, target_date, timeline, progress, status, goal_milestones(id, title, description, target_date, completed, completed_at, sort_order)")
        .eq("member_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("goal_mission_completions")
        .select("mission_slug")
        .eq("user_id", userId)
        .like("mission_slug", "diamond-foundation:%"),
      supabase
        .from("xp_events")
        .select("id, amount, source, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("career_proofs")
        .select("id, title, proof_type, description, impact, metric, proof_date, created_at")
        .eq("user_id", userId)
        .order("proof_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("weekly_reviews")
        .select("id, week_start, moved_forward, blockers, next_priority")
        .eq("user_id", userId)
        .eq("week_start", weekStart)
        .maybeSingle(),
      supabase
        .from("goal_mission_completions")
        .select("mission_slug, xp_awarded, completed_on")
        .eq("user_id", userId)
        .gte("completed_on", weekStart),
    ]);

    if (goalRes.error) throw new Error(goalRes.error.message);
    if (completionRes.error) throw new Error(completionRes.error.message);
    if (xpRes.error) throw new Error(xpRes.error.message);
    if (proofRes.error) throw new Error(proofRes.error.message);
    if (reviewRes.error) throw new Error(reviewRes.error.message);
    if (weeklyCompletionRes.error) throw new Error(weeklyCompletionRes.error.message);

    const row = goalRes.data as any;
    const goal: DiamondGoal | null = row
      ? {
          id: row.id,
          title: row.title,
          target_role: row.target_role,
          target_date: row.target_date,
          timeline: row.timeline,
          progress: row.progress,
          status: row.status,
          milestones: [...(row.goal_milestones ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order),
        }
      : null;
    const completed = new Set((completionRes.data ?? []).map((item: any) => item.mission_slug));

    return {
      goal,
      actions: FOUNDATION_ACTIONS.map((action) => ({
        ...action,
        completed: completed.has(`diamond-foundation:${action.slug}`),
      })) satisfies FoundationAction[],
      recentXp: xpRes.data ?? [],
      proofs: (proofRes.data ?? []) satisfies CareerProof[],
      weeklyReview: (reviewRes.data ?? null) as WeeklyReview | null,
      weeklyProgress: {
        weekStart,
        completedActions: (weeklyCompletionRes.data ?? []).length,
        completedSlugs: (weeklyCompletionRes.data ?? []).map((item) => item.mission_slug),
        xp: (xpRes.data ?? [])
          .filter((event) => event.created_at.slice(0, 10) >= weekStart)
          .reduce((sum, event) => sum + event.amount, 0),
      },
    };
  });

export const saveCareerProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => proofSchema.parse(input))
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      title: data.title,
      proof_type: data.proofType,
      description: data.description,
      impact: data.impact,
      metric: data.metric,
      proof_date: data.proofDate ?? null,
    };
    const query = data.id
      ? context.supabase.from("career_proofs").update(row).eq("id", data.id).eq("user_id", context.userId)
      : context.supabase.from("career_proofs").insert(row);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCareerProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("career_proofs").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveWeeklyReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => weeklyReviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("weekly_reviews").upsert({
      user_id: context.userId,
      week_start: startOfWeekIso(),
      moved_forward: data.movedForward,
      blockers: data.blockers,
      next_priority: data.nextPriority,
    }, { onConflict: "user_id,week_start" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveDiamondGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => goalSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let goalId = data.id;

    if (goalId) {
      const { data: updated, error } = await supabase
        .from("diamond_goals")
        .update({
          title: data.title,
          target_role: data.targetRole || null,
          target_date: data.targetDate,
          timeline: data.timeline || "90 days",
        })
        .eq("id", goalId)
        .eq("member_id", userId)
        .select("id")
        .single();
      if (error || !updated) throw new Error(error?.message ?? "Goal not found");
    } else {
      const { data: created, error } = await supabase
        .from("diamond_goals")
        .insert({
          member_id: userId,
          title: data.title,
          target_role: data.targetRole || null,
          target_date: data.targetDate,
          timeline: data.timeline || "90 days",
        })
        .select("id")
        .single();
      if (error || !created) throw new Error(error?.message ?? "Could not create goal");
      goalId = created.id;
    }

    if (!goalId) throw new Error("Goal could not be saved");

    const incomingIds = data.milestones.flatMap((milestone) => milestone.id ? [milestone.id] : []);
    let deleteQuery = supabase.from("goal_milestones").delete().eq("goal_id", goalId);
    if (incomingIds.length) deleteQuery = deleteQuery.not("id", "in", `(${incomingIds.join(",")})`);
    const { error: deleteError } = await deleteQuery;
    if (deleteError) throw new Error(deleteError.message);

    const rows = data.milestones.map((milestone) => ({
      ...(milestone.id ? { id: milestone.id } : {}),
      goal_id: goalId,
      title: milestone.title,
      description: milestone.description,
      target_date: milestone.targetDate ?? null,
      sort_order: milestone.sortOrder,
    }));
    const { error: milestoneError } = await supabase.from("goal_milestones").upsert(rows, { onConflict: "id" });
    if (milestoneError) throw new Error(milestoneError.message);

    const { data: profile, error: profileReadError } = await supabase
      .from("profiles")
      .select("primary_goal, target_role")
      .eq("id", userId)
      .single();
    if (profileReadError) throw new Error(profileReadError.message);
    if (!profile.primary_goal || !profile.target_role) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({
          primary_goal: profile.primary_goal || data.title,
          target_role: profile.target_role || data.targetRole || null,
        })
        .eq("id", userId);
      if (profileError) throw new Error(profileError.message);
    }

    return { id: goalId };
  });

export const toggleGoalMilestone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), completed: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: milestone, error } = await supabase
      .from("goal_milestones")
      .update({ completed: data.completed, completed_at: data.completed ? new Date().toISOString() : null })
      .eq("id", data.id)
      .select("id, goal_id, diamond_goals!inner(member_id)")
      .single();
    if (error || !milestone || (milestone as any).diamond_goals?.member_id !== userId) {
      throw new Error(error?.message ?? "Milestone not found");
    }
    return { ok: true };
  });

export const completeFoundationAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ slug: z.enum(["career-checkup", "ninety-day-goal", "achievement-stack"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const action = FOUNDATION_ACTIONS.find((item) => item.slug === data.slug);
    if (!action) throw new Error("Unknown action");

    if (data.slug === "ninety-day-goal") {
      const { count } = await supabaseAdmin.from("diamond_goals").select("id", { count: "exact", head: true }).eq("member_id", userId);
      if (!count) throw new Error("Set your 90-day goal first");
    }
    if (data.slug === "career-checkup") {
      const { data: scores } = await supabaseAdmin.from("career_scores").select("clarity, authority, reach, evidence, energy, revenue").eq("user_id", userId).single();
      if (!scores || Object.values(scores).some((score) => Number(score) <= 0)) throw new Error("Complete all six C.A.R.E.E.R. engines first");
    }
    if (data.slug === "achievement-stack") {
      const { data: evidence } = await supabaseAdmin.from("career_scores").select("evidence").eq("user_id", userId).single();
      if (!evidence || evidence.evidence <= 0) throw new Error("Run the Evidence engine with at least three achievements first");
    }

    const missionSlug = `diamond-foundation:${action.slug}`;
    const { error: insertError } = await supabaseAdmin.from("goal_mission_completions").insert({
      user_id: userId,
      mission_slug: missionSlug,
      completed_on: new Date().toISOString().slice(0, 10),
      xp_awarded: action.xp,
    });
    if (insertError) {
      if ((insertError as any).code === "23505") return { alreadyDone: true, xp: 0 };
      throw new Error(insertError.message);
    }

    const { error: xpError } = await supabaseAdmin.rpc("award_xp", {
      _user_id: userId,
      _amount: action.xp,
      _source: missionSlug,
      _coins: 0,
    });
    if (xpError) throw new Error(xpError.message);
    return { alreadyDone: false, xp: action.xp };
  });