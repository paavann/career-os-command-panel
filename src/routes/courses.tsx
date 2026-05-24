import { createFileRoute } from "@tanstack/react-router";
import { Play, Lock } from "lucide-react";
import { PageHeader } from "./tools/index";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [{ title: "Learning Hub — Bluechip Bluechip CareerOS™" }] }),
  component: Courses,
});

const cats = ["Mindset Mastery","AI Career Growth","Resume Optimization","LinkedIn Branding","Interview Mastery","Leadership Growth","Salary Negotiation","Personal Branding","Multiple Income Streams"];

const courses = [
  { title: "The Authority Operating System",   cat: "Personal Branding",     pct: 64, xp: 800, mins: 240, level: 2, locked: false },
  { title: "Negotiate Like a Director",        cat: "Salary Negotiation",    pct: 0,  xp: 600, mins: 180, level: 2, locked: false },
  { title: "Executive Presence Bootcamp",      cat: "Leadership Growth",     pct: 20, xp: 900, mins: 320, level: 3, locked: false },
  { title: "Resume → Recruiter Magnet",        cat: "Resume Optimization",   pct: 100,xp: 500, mins: 140, level: 1, locked: false },
  { title: "LinkedIn Visibility Sprint",       cat: "LinkedIn Branding",     pct: 12, xp: 700, mins: 200, level: 2, locked: false },
  { title: "AI-First Career Operator",         cat: "AI Career Growth",      pct: 0,  xp: 1200,mins: 360, level: 3, locked: false },
  { title: "Income Architecture for Operators",cat: "Multiple Income Streams", pct: 0, xp: 1500, mins: 420, level: 5, locked: true },
];

function Courses() {
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
        {courses.map((c) => (
          <div key={c.title} className="group glass rounded-2xl overflow-hidden border hover:border-electric/40 transition-all">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-purple/40 to-electric/30 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,white_0,transparent_50%)] opacity-10" />
              <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-widest bg-black/40 backdrop-blur px-2 py-1 rounded">
                {c.cat}
              </div>
              {c.locked ? (
                <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
                  <Lock className="size-8 text-gold" />
                </div>
              ) : (
                <button className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40">
                  <div className="size-14 rounded-full bg-foreground text-background grid place-items-center">
                    <Play className="size-5 ml-0.5" />
                  </div>
                </button>
              )}
              {c.pct > 0 && !c.locked && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                  <div className="h-full bg-electric" style={{ width: `${c.pct}%` }} />
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-display font-bold text-base leading-tight">{c.title}</h3>
              <div className="flex items-center justify-between mt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <span>{c.mins} min</span>
                <span className="text-gold">+{c.xp} XP</span>
                <span>L{c.level}{c.locked ? " · locked" : ""}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
