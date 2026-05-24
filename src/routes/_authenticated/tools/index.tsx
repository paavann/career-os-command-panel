import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Sparkles, Radio, Award, Activity, Banknote, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tools/")({
  head: () => ({ meta: [{ title: "C.A.R.E.E.R.™ Ecosystem — Bluechip CareerOS™" }] }),
  component: ToolsIndex,
});

export const TOOLS = [
  { slug: "clarity",   letter: "C", domain: "Clarity",   name: "Career Identity Scanner™", score: 92, icon: Target,    desc: "AI personality + role-fit analysis. Surface your strongest career direction and unique value proposition.", outputs: ["Career Identity Type", "Career Clarity Score", "Growth Roadmap", "Unique Strengths"] },
  { slug: "authority", letter: "A", domain: "Authority", name: "Authority Builder Engine™", score: 74, icon: Sparkles,  desc: "LinkedIn authority scoring, thought-leadership analysis, signature framework builder.", outputs: ["Authority Score™", "Brand Positioning", "Content Themes", "Gap Analysis"] },
  { slug: "reach",     letter: "R", domain: "Reach",     name: "Visibility Amplifier™",     score: 48, icon: Radio,     desc: "SSI optimization, recruiter discoverability, AI networking scripts, network growth strategy.", outputs: ["Opportunity Magnet Score™", "Visibility Tracker", "Network Strength", "Reach Potential"] },
  { slug: "evidence",  letter: "E", domain: "Evidence",  name: "Proof-of-Impact Builder™",  score: 88, icon: Award,     desc: "STAR story generator, achievement vault, executive resume builder, impact quantifier.", outputs: ["Impact Score™", "Achievement Library", "Resume Suggestions", "Executive Statements"] },
  { slug: "energy",    letter: "E", domain: "Energy",    name: "Executive Presence Analyzer™", score: 95, icon: Activity, desc: "Communication analysis, confidence tracking, meeting presence coaching.", outputs: ["Executive Aura Score™", "Confidence Insights", "Leadership Readiness", "Presence Plan"] },
  { slug: "revenue",   letter: "R", domain: "Revenue",   name: "Salary Intelligence Engine™", score: 61, icon: Banknote, desc: "Benchmark analyzer, offer comparison, negotiation simulator, promotion readiness.", outputs: ["Revenue Leverage Score™", "Growth Potential", "Negotiation Readiness", "Comp Strategy"] },
];

function ToolsIndex() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader eyebrow="The Six Engines" title="C.A.R.E.E.R.™ Tool Ecosystem"
        subtitle="Each engine targets a different lever of career market power. Together they form your transformation OS." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.slug} to="/tools/$slug" params={{ slug: t.slug }}
              className="group glass rounded-2xl p-6 border hover:border-electric/40 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="size-10 rounded-lg bg-electric/10 grid place-items-center">
                  <Icon className="size-5 text-electric" />
                </div>
                <div className="text-right">
                  <div className="font-display font-black text-3xl text-electric">{t.score}</div>
                  <div className="text-[9px] font-mono uppercase text-muted-foreground">score</div>
                </div>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{t.letter} · {t.domain}</div>
              <h3 className="font-display font-bold text-lg mt-1 leading-tight">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-3 flex-1">{t.desc}</p>
              <div className="mt-5 text-xs font-mono uppercase tracking-widest flex items-center gap-1 text-foreground/70 group-hover:text-foreground">
                Open engine <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <header className="animate-slide-up">
      <p className="text-xs font-mono uppercase tracking-[0.25em] text-electric mb-3">{eyebrow}</p>
      <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl">{subtitle}</p>}
    </header>
  );
}
