import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getCourseProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("user_courses")
      .select("completed_modules, notes, course_completed_at")
      .eq("user_id", userId)
      .eq("course_slug", data.slug)
      .maybeSingle();
    return {
      completed: (row?.completed_modules ?? []) as number[],
      notes: (row?.notes ?? "") as string,
      completedAt: (row?.course_completed_at ?? null) as string | null,
    };
  });

export const toggleModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      slug: z.string().min(1).max(80),
      moduleIndex: z.number().int().min(0).max(20),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { getCourse } = await import("@/lib/courses");
    const course = getCourse(data.slug);
    if (!course) throw new Error("Unknown course");
    if (data.moduleIndex >= course.modules.length) throw new Error("Invalid module");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("user_courses")
      .select("completed_modules, course_completed_at")
      .eq("user_id", userId)
      .eq("course_slug", data.slug)
      .maybeSingle();

    const prev = new Set<number>((existing?.completed_modules ?? []) as number[]);
    const wasDone = prev.has(data.moduleIndex);
    if (wasDone) prev.delete(data.moduleIndex);
    else prev.add(data.moduleIndex);
    const next = Array.from(prev).sort((a, b) => a - b);

    const totalModules = course.modules.length;
    const perModuleXp = Math.round(course.xp / totalModules);
    const wasFullyDone = !!existing?.course_completed_at;
    const isNowFullyDone = next.length === totalModules;
    const course_completed_at =
      isNowFullyDone ? (existing?.course_completed_at ?? new Date().toISOString()) : null;

    const { error: upErr } = await supabaseAdmin
      .from("user_courses")
      .upsert(
        {
          user_id: userId,
          course_slug: data.slug,
          completed_modules: next,
          course_completed_at,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_slug" },
      );
    if (upErr) throw new Error(upErr.message);

    // Award XP per module toggled (positive when checked, negative when unchecked).
    const delta = wasDone ? -perModuleXp : perModuleXp;
    if (delta !== 0) {
      await supabaseAdmin.rpc("award_xp", {
        _user_id: userId,
        _amount: delta,
        _source: `course:${data.slug}:m${data.moduleIndex}`,
        _coins: 0,
      });
    }

    // Course-completion bonus to CPI score (one-time)
    if (isNowFullyDone && !wasFullyDone) {
      const { data: p } = await supabaseAdmin
        .from("profiles")
        .select("cpi_score")
        .eq("id", userId)
        .maybeSingle();
      const current = p?.cpi_score ?? 0;
      const bump = Math.min(100 - current, Math.max(1, Math.round(course.xp / 100)));
      if (bump > 0) {
        await supabaseAdmin
          .from("profiles")
          .update({ cpi_score: current + bump })
          .eq("id", userId);
      }
    }

    return {
      completed: next,
      completedAt: course_completed_at,
      xpDelta: delta,
      justCompleted: isNowFullyDone && !wasFullyDone,
    };
  });

export const saveCourseNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      slug: z.string().min(1).max(80),
      notes: z.string().max(8000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_courses")
      .upsert(
        { user_id: userId, course_slug: data.slug, notes: data.notes, updated_at: new Date().toISOString() },
        { onConflict: "user_id,course_slug" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
