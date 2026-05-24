import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Circle, Lock, Save, Trophy } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCourse, tierRank, TIER_LABEL } from "@/lib/courses";
import { getCourseProgress, toggleModule, saveCourseNotes } from "@/lib/courses.functions";
import { getMe } from "@/lib/me.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/courses/$slug")({
  head: () => ({ meta: [{ title: "Course — Bluechip CareerOS™" }] }),
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const course = getCourse(slug);

  const fetchMe = useServerFn(getMe);
  const fetchProgress = useServerFn(getCourseProgress);
  const callToggle = useServerFn(toggleModule);
  const callSaveNotes = useServerFn(saveCourseNotes);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const { data: progress } = useQuery({
    queryKey: ["course-progress-detail", slug],
    queryFn: () => fetchProgress({ data: { slug } }),
    enabled: !!course,
  });

  const [notes, setNotes] = useState("");
  useEffect(() => { if (progress) setNotes(progress.notes); }, [progress]);

  const toggle = useMutation({
    mutationFn: (moduleIndex: number) => callToggle({ data: { slug, moduleIndex } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["course-progress-detail", slug] });
      qc.invalidateQueries({ queryKey: ["course-progress"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      if (res.justCompleted) toast.success("Course completed! CPI score boosted.");
      else if (res.xpDelta > 0) toast.success(`+${res.xpDelta} XP awarded`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const saveNotes = useMutation({
    mutationFn: () => callSaveNotes({ data: { slug, notes } }),
    onSuccess: () => toast.success("Notes saved"),
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display text-2xl">Course not found</h1>
        <Link to="/courses" className="text-electric mt-4 inline-block">← Back to Learning Hub</Link>
      </div>
    );
  }

  const userRank = tierRank(me?.profile.tier);
  const locked = userRank < course.tierRequired;

  if (locked) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <Lock className="size-10 text-gold mx-auto" />
        <h1 className="font-display text-2xl mt-4">Diamond-only course</h1>
        <p className="text-muted-foreground mt-2">
          This course is part of BlueChip Diamond. Upgrade your membership to unlock {course.mins} minutes of executive-grade content.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Button onClick={() => navigate({ to: "/pricing" })}>Upgrade to Diamond</Button>
          <Button variant="outline" onClick={() => navigate({ to: "/courses" })}>Back</Button>
        </div>
      </div>
    );
  }

  const completed = progress?.completed ?? [];
  const pct = Math.round((completed.length / course.modules.length) * 100);
  const xpEarned = Math.round((course.xp / course.modules.length) * completed.length);
  const isCompleted = !!progress?.completedAt;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button onClick={() => navigate({ to: "/courses" })}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="size-4" /> Back to Learning Hub
      </button>

      <div className={`mt-6 rounded-2xl overflow-hidden bg-gradient-to-br ${course.color} p-8 relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_55%)] opacity-15 pointer-events-none" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/80">{course.cat} · {TIER_LABEL[course.tierRequired]}</div>
            <h1 className="font-display font-black text-white text-3xl md:text-4xl mt-2 max-w-2xl leading-tight drop-shadow">{course.title}</h1>
            <div className="mt-4 flex gap-6 text-white/90 text-xs font-mono uppercase tracking-widest">
              <span>{course.mins} min total</span>
              <span>{course.modules.length} modules</span>
              <span className="text-gold">+{course.xp} XP</span>
            </div>
          </div>
          {isCompleted && (
            <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest flex items-center gap-2">
              <Trophy className="size-4" /> Completed
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 glass rounded-2xl p-5 border">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <span>Progress</span>
          <span><span className="text-foreground">{pct}%</span> · {completed.length}/{course.modules.length} · <span className="text-gold">+{xpEarned} XP earned</span></span>
        </div>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-electric transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Modules */}
      <div className="mt-6 space-y-3">
        {course.modules.map((m, i) => {
          const done = completed.includes(i);
          return (
            <div key={i} className={`glass rounded-xl p-5 border flex items-center justify-between gap-4 ${done ? "border-emerald-500/40" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-electric/10 grid place-items-center text-electric font-mono text-sm">{i + 1}</div>
                <div>
                  <div className="font-display font-bold leading-tight">{m.title}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                    Module {i + 1} · {m.mins} min · +{Math.round(course.xp / course.modules.length)} XP
                  </div>
                </div>
              </div>
              <Button
                variant={done ? "outline" : "default"}
                size="sm"
                disabled={toggle.isPending}
                onClick={() => toggle.mutate(i)}
              >
                {done ? <><CheckCircle2 className="size-4 mr-1.5" /> Completed</> : <><Circle className="size-4 mr-1.5" /> Mark complete</>}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="mt-8 glass rounded-2xl p-5 border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold">Personal notes</h2>
          <Button size="sm" onClick={() => saveNotes.mutate()} disabled={saveNotes.isPending}>
            <Save className="size-4 mr-1.5" /> Save notes
          </Button>
        </div>
        <Textarea
          rows={6}
          placeholder="Capture insights, frameworks, or action items from this course…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
