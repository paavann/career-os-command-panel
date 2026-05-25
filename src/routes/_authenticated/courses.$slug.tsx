import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Lock, Save, Sparkles, Trophy, Lightbulb, Target, MessageCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCourse, tierRank, TIER_LABEL } from "@/lib/courses";
import { getCourseProgress, toggleModule, saveCourseNotes } from "@/lib/courses.functions";
import { getMe } from "@/lib/me.functions";
import { getModuleContent } from "@/data/courseContent";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/courses/$slug")({
  head: () => ({ meta: [{ title: "Course — Bluechip CareerOS™" }] }),
  component: CourseDetail,
});

/* ---------- Lesson body formatter ---------- */
function LessonBody({ text }: { text: string }) {
  // Split into paragraph blocks by blank lines
  const blocks = text.split(/\n\s*\n/);

  return (
    <div className="space-y-5 text-[15px] leading-7 text-foreground/90">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (!lines.length) return null;

        // Numbered list block: every line starts with "N." or "N)"
        if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
          return (
            <ol key={bi} className="list-decimal pl-6 space-y-2 marker:text-electric marker:font-bold">
              {lines.map((l, i) => (
                <li key={i}>{renderInline(l.replace(/^\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        // Bullet block: every line starts with • or -
        if (lines.every((l) => /^[•\-]\s+/.test(l))) {
          return (
            <ul key={bi} className="list-disc pl-6 space-y-2 marker:text-electric">
              {lines.map((l, i) => (
                <li key={i}>{renderInline(l.replace(/^[•\-]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        // Single ALL-CAPS section header line (>3 chars, no lowercase letters)
        if (lines.length === 1 && isAllCapsHeader(lines[0])) {
          return (
            <h3 key={bi} className="font-display font-black text-xs tracking-[0.18em] text-electric uppercase pt-2">
              {lines[0]}
            </h3>
          );
        }

        // Otherwise: paragraph (may include inline ALL CAPS lines, numbered/bullet lines mixed)
        return (
          <p key={bi} className="whitespace-pre-line">
            {lines.map((l, i) => {
              if (isAllCapsHeader(l)) {
                return (
                  <span key={i} className="block font-display font-black text-xs tracking-[0.18em] text-electric uppercase mt-1 mb-1">
                    {l}
                  </span>
                );
              }
              if (/^\d+[.)]\s+/.test(l)) {
                return (
                  <span key={i} className="block">
                    <span className="font-bold text-electric mr-2">{l.match(/^\d+/)?.[0]}.</span>
                    {renderInline(l.replace(/^\d+[.)]\s+/, ""))}
                  </span>
                );
              }
              if (/^[•\-]\s+/.test(l)) {
                return (
                  <span key={i} className="block pl-4 relative before:absolute before:left-0 before:top-2.5 before:size-1.5 before:rounded-full before:bg-electric">
                    {renderInline(l.replace(/^[•\-]\s+/, ""))}
                  </span>
                );
              }
              return (
                <span key={i} className="block">
                  {renderInline(l)}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

function isAllCapsHeader(s: string): boolean {
  // Strip markdown bold markers and trailing colon
  const t = s.replace(/\*\*/g, "").replace(/:$/, "").trim();
  if (t.length < 4) return false;
  // Must contain at least one letter, no lowercase letters
  if (!/[A-Z]/.test(t)) return false;
  if (/[a-z]/.test(t)) return false;
  return true;
}

function renderInline(text: string): React.ReactNode {
  // Split on **bold** markers, preserving order
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    const m = p.match(/^\*\*(.+)\*\*$/);
    if (m) return <strong key={i} className="font-bold text-foreground">{m[1]}</strong>;
    return <span key={i}>{p}</span>;
  });
}

/* ---------- Main component ---------- */
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

  const [activeIdx, setActiveIdx] = useState(0);
  const [notes, setNotes] = useState("");
  const [justCompleted, setJustCompleted] = useState<number | null>(null);

  useEffect(() => { if (progress) setNotes(progress.notes); }, [progress]);

  const toggle = useMutation({
    mutationFn: (moduleIndex: number) => callToggle({ data: { slug, moduleIndex } }),
    onSuccess: (res, moduleIndex) => {
      qc.invalidateQueries({ queryKey: ["course-progress-detail", slug] });
      qc.invalidateQueries({ queryKey: ["course-progress"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      if (res.justCompleted) {
        toast.success("🏆 Course completed! CPI score boosted.");
      } else if (res.xpDelta > 0) {
        toast.success(`+${res.xpDelta} XP earned`);
        setJustCompleted(moduleIndex);
        setTimeout(() => setJustCompleted(null), 1400);
      }
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

  void tierRank; void TIER_LABEL; void Lock;

  const completed = progress?.completed ?? [];
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const pct = Math.round((completed.length / course.modules.length) * 100);
  const perModuleXp = Math.round(course.xp / course.modules.length);
  const isCompleted = !!progress?.completedAt;

  const activeModule = course.modules[activeIdx];
  const activeContent = getModuleContent(slug, activeIdx);
  const activeDone = completedSet.has(activeIdx);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <button onClick={() => navigate({ to: "/courses" })}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="size-4" /> Back to Learning Hub
      </button>

      {/* Hero banner */}
      <div className={`mt-5 sm:mt-6 rounded-2xl overflow-hidden bg-gradient-to-br ${course.color} p-5 sm:p-8 relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_55%)] opacity-15 pointer-events-none" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/80">{course.cat} · 💎 Diamond</div>
            <h1 className="font-display font-black text-white text-2xl sm:text-3xl md:text-4xl mt-2 max-w-2xl leading-tight drop-shadow">{course.title}</h1>
            <div className="mt-4 flex flex-wrap gap-6 text-white/90 text-xs font-mono uppercase tracking-widest">
              <span>{course.mins} min total</span>
              <span>{course.modules.length} modules</span>
              <span className="text-gold">+{course.xp} XP</span>
            </div>
          </div>
          {isCompleted && (
            <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest flex items-center gap-2 shadow-lg">
              <Trophy className="size-4" /> Completed
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative mt-6">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/80 mb-2">
            <span>Progress</span>
            <span>{completed.length}/{course.modules.length} modules · {pct}%</span>
          </div>
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Layout: module sidebar + lesson viewer */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 sm:gap-6">
        {/* Module sidebar — horizontal scroll on mobile, vertical sticky on desktop */}
        <aside className="glass rounded-2xl border p-3 h-fit lg:sticky lg:top-6">
          <div className="px-1 lg:px-3 py-1 lg:py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Modules
          </div>
          <div className="flex lg:block gap-2 lg:gap-0 lg:space-y-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none scrollbar-thin">
            {course.modules.map((m, i) => {
              const done = completedSet.has(i);
              const active = i === activeIdx;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`shrink-0 lg:w-full w-[78%] sm:w-[60%] snap-start text-left px-3 py-2.5 rounded-lg transition flex items-start gap-3 ${
                    active ? "bg-electric/10 border border-electric/40" : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <div className="mt-0.5">
                    {done ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <Circle className={`size-4 ${active ? "text-electric" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[10px] font-mono uppercase tracking-widest ${active ? "text-electric" : "text-muted-foreground"}`}>
                      Module {i + 1} · {m.mins} min
                    </div>
                    <div className={`text-sm font-display font-bold leading-tight mt-0.5 ${active ? "text-foreground" : "text-foreground/80"}`}>
                      {m.title}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gold mt-0.5">
                      +{perModuleXp} XP
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Lesson viewer */}
        <main className="min-w-0">
          <article
            key={activeIdx}
            className={`glass rounded-2xl border p-5 sm:p-8 transition-all ${
              justCompleted === activeIdx ? "ring-2 ring-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.25)]" : ""
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Module {activeIdx + 1} of {course.modules.length} · {activeModule.mins} min
                </div>
                <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl mt-1 leading-tight">
                  {activeModule.title}
                </h2>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-gold flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> +{perModuleXp} XP
              </div>
            </div>

            {activeContent ? (
              <>
                {/* Lesson body */}
                <div className="mt-6">
                  <LessonBody text={activeContent.lesson} />
                </div>

                {/* Insight callout */}
                <div className="mt-8 rounded-xl border border-electric/40 bg-electric/5 p-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-electric">
                    <Lightbulb className="size-4" /> Insight
                  </div>
                  <p className="mt-2 font-display font-bold text-[17px] leading-relaxed text-foreground">
                    {activeContent.insight}
                  </p>
                </div>

                {/* Exercise box */}
                <div className="mt-5 rounded-xl border border-gold/40 bg-gradient-to-br from-gold/10 to-amber-500/5 p-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-gold">
                    <Target className="size-4" /> Action exercise
                  </div>
                  <p className="mt-2 text-[15px] leading-7 text-foreground/90">
                    {activeContent.exercise}
                  </p>
                </div>

                {/* Reflection */}
                <div className="mt-5 rounded-xl border border-border bg-muted/30 p-5">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <MessageCircle className="size-4" /> Reflection
                  </div>
                  <p className="mt-2 italic text-[15px] leading-7 text-foreground/80">
                    {activeContent.reflection}
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-6 text-muted-foreground italic">Lesson content coming soon.</p>
            )}

            {/* Mark complete CTA */}
            <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {activeDone ? "You've completed this module." : "Mark this module complete when you're done."}
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {activeIdx > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setActiveIdx(activeIdx - 1)}>
                    ← Prev
                  </Button>
                )}
                <Button
                  size="lg"
                  variant={activeDone ? "outline" : "default"}
                  disabled={toggle.isPending}
                  onClick={() => toggle.mutate(activeIdx)}
                  className={`flex-1 sm:flex-none ${activeDone ? "" : "bg-electric hover:bg-electric/90 text-white"}`}
                >
                  {activeDone ? (
                    <><CheckCircle2 className="size-4 mr-2" /> Completed</>
                  ) : (
                    <><Sparkles className="size-4 mr-2" /> <span className="sm:hidden">Complete · +{perModuleXp} XP</span><span className="hidden sm:inline">Mark Complete · Earn {perModuleXp} XP</span></>
                  )}
                </Button>
                {activeIdx < course.modules.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveIdx(activeIdx + 1)}
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </article>

          {/* Notes */}
          <div className="mt-6 glass rounded-2xl p-5 border">
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
        </main>
      </div>
    </div>
  );
}
