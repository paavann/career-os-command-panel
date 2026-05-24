import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Lock, CheckCircle2 } from "lucide-react";
import { PageHeader } from "./tools/index";
import { COURSES, TIER_LABEL, tierRank, type Course } from "@/lib/courses";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMe } from "@/lib/me.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/courses")({
  head: () => ({ meta: [{ title: "Learning Hub — Bluechip CareerOS™" }] }),
  component: Courses,
});

const cats = [
  "Mindset Mastery","AI Career Growth","Resume Optimization","LinkedIn Branding",
  "Interview Mastery","Leadership Growth","Salary Negotiation","Personal Branding","Multiple Income Streams",
];

function Courses() {
  const navigate = useNavigate();
  const fetchMe = useServerFn(getMe);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const userRank = tierRank(me?.profile.tier);
  const [locked, setLocked] = useState<Course | null>(null);

  // Per-user progress (client-side query so the grid reflects completion state)
  const { data: progressMap } = useQuery({
    queryKey: ["course-progress", me?.profile.id ?? "anon"],
    enabled: !!me?.profile.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_courses")
        .select("course_slug, completed_modules, course_completed_at")
        .eq("user_id", me!.profile.id);
      if (error) throw error;
      const map: Record<string, { completed: number[]; completedAt: string | null }> = {};
      (data ?? []).forEach((r: any) => {
        map[r.course_slug] = {
          completed: r.completed_modules ?? [],
          completedAt: r.course_completed_at ?? null,
        };
      });
      return map;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader eyebrow="Learning Hub" title="Mastery library"
        subtitle="Cinematic, skill-dense playbooks. Optimized for transformation, not seat time." />
      <div className="mt-8 flex flex-wrap gap-2">
        {cats.map((c, i) => (
          <span key={c} className={`text-xs font-medium px-3 py-1.5 rounded-full border ${i===0 ? "bg-electric/15 text-electric border-electric/30" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 cursor-pointer"}`}>
            {c}
          </span>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {COURSES.map((c) => {
          const prog = progressMap?.[c.slug];
          const completedCount = prog?.completed.length ?? 0;
          const pct = Math.round((completedCount / c.modules.length) * 100);
          const isCompleted = !!prog?.completedAt;
          const isLocked = userRank < c.tierRequired;

          const openCourse = () => {
            if (isLocked) setLocked(c);
            else navigate({ to: "/courses/$slug", params: { slug: c.slug } });
          };

          return (
            <button
              key={c.slug}
              onClick={openCourse}
              className="text-left group glass rounded-2xl overflow-hidden border hover:border-electric/40 transition-all"
            >
              <div className={`relative aspect-[16/10] bg-gradient-to-br ${c.color} overflow-hidden p-5 flex flex-col justify-between`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,white_0,transparent_55%)] opacity-15 pointer-events-none" />
                <div className="flex items-start justify-between relative">
                  <div className="text-[10px] font-mono uppercase tracking-widest bg-black/40 backdrop-blur px-2 py-1 rounded text-white">
                    {c.cat}
                  </div>
                  {isCompleted && (
                    <div className="text-[10px] font-mono uppercase tracking-widest bg-emerald-500 text-white px-2 py-1 rounded flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Completed
                    </div>
                  )}
                </div>
                <h3 className="relative font-display font-black text-white text-2xl leading-tight drop-shadow">
                  {c.title}
                </h3>
                {isLocked ? (
                  <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Lock className="size-8 text-gold" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-gold">
                        {TIER_LABEL[c.tierRequired]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute right-4 bottom-4 size-12 rounded-full bg-white/90 text-black grid place-items-center opacity-0 group-hover:opacity-100 transition">
                    <Play className="size-5 ml-0.5" />
                  </div>
                )}
                {pct > 0 && !isLocked && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                    <div className="h-full bg-electric" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <span>{c.mins} min · {c.modules.length} modules</span>
                  <span className="text-gold">+{c.xp} XP</span>
                </div>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {TIER_LABEL[c.tierRequired]} · {pct}% complete
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={!!locked} onOpenChange={(o) => !o && setLocked(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Diamond-only course</DialogTitle>
            <DialogDescription className="pt-2">
              This course is part of BlueChip Diamond. Upgrade your membership to unlock {locked?.mins ?? 320} minutes of executive-grade content.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={() => { setLocked(null); navigate({ to: "/pricing" }); }}>
              Upgrade to Diamond
            </Button>
            <Button variant="outline" onClick={() => setLocked(null)}>Maybe later</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
