import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowUpRight, Target, Radio, Award, BarChart3, Banknote,
  CheckCircle2, Circle, Trophy, Radar, Activity,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Command Center — Bluechip CareerOS™" },
      { name: "description", content: "Your Career Freedom Command Center. Track your Career Power Index, missions, and growth opportunities." },
    ],
  }),
  component: Dashboard,
});

const scores = [
  { letter: "C", name: "Clarity",   value: 92, tone: "electric" },
  { letter: "A", name: "Authority", value: 74, tone: "electric" },
  { letter: "R", name: "Reach",     value: 48, tone: "purple"   },
  { letter: "E", name: "Evidence",  value: 88, tone: "electric" },
  { letter: "E", name: "Energy",    value: 95, tone: "electric" },
  { letter: "R", name: "Revenue",   value: 61, tone: "purple"   },
] as const;

const tools = [
  { slug: "clarity",   letter: "C", domain: "Clarity",   name: "Career Identity Scanner™", score: 92, icon: Target,    desc: "Map your career DNA and surface your highest-value roles." },
  { slug: "authority", letter: "A", domain: "Authority", name: "Authority Builder Engine™", score: 74, icon: Sparkles,  desc: "Position yourself as a pre-eminent expert in your field." },
  { slug: "reach",     letter: "R", domain: "Reach",     name: "Visibility Amplifier™",     score: 48, icon: Radio,     desc: "Become magnetically discoverable to elite recruiters.", featured: true },
  { slug: "evidence",  letter: "E", domain: "Evidence",  name: "Proof-of-Impact Builder™",  score: 88, icon: Award,     desc: "Quantify business impact for senior roles." },
  { slug: "energy",    letter: "E", domain: "Energy",    name: "Executive Presence Analyzer™", score: 95, icon: Activity, desc: "Refine your executive aura and leadership communication." },
  { slug: "revenue",   letter: "R", domain: "Revenue",   name: "Salary Intelligence Engine™",  score: 61, icon: Banknote, desc: "Benchmark comp and master high-stakes negotiation." },
];

const journey = [
  { name: "Challenger",         state: "done" },
  { name: "Brand Architect",    state: "active" },
  { name: "Opportunity Magnet", state: "locked" },
  { name: "Career Closer",      state: "locked" },
  { name: "Leadership Catalyst",state: "locked" },
  { name: "Freedom Creator",    state: "locked" },
] as const;

const missions = [
  { title: "Refine Authority thesis",  xp: 150, done: true  },
  { title: "Engage 3 Reach targets",   xp: 200, done: false },
  { title: "Publish a Proof artifact", xp: 120, done: false },
];

function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Hero */}
      <section className="animate-slide-up">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-electric mb-3">Intelligence Briefing · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight">Welcome back, Aarav.</h1>
        <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl">
          Your Career Freedom Command Center is online. Current trajectory: top <span className="text-foreground font-semibold">4%</span> of market competitors.
        </p>
      </section>

      {/* CPI + Mission */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up [animation-delay:100ms]">
        <div className="lg:col-span-8 glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-electric/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-purple/15 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                Career Power Index™
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-electric/15 text-electric text-[10px]">
                  <span className="size-1.5 rounded-full bg-electric animate-pulse" /> LIVE
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-display font-black text-7xl md:text-8xl tracking-tighter text-gradient-brand">842</span>
                <span className="text-electric font-semibold text-sm">+24 this week</span>
              </div>
            </div>
            <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-gold">Tier</div>
              <div className="font-display font-bold text-lg">Brand Architect</div>
            </div>
          </div>

          <div className="relative mt-10 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            {scores.map((s) => (
              <div key={s.name} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest">
                  <span className="text-muted-foreground">{s.letter} · {s.name}</span>
                  <span className="text-foreground font-semibold">{s.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.tone === "purple" ? "bg-purple" : "bg-electric"}`}
                    style={{ width: `${s.value}%`, boxShadow: s.tone === "purple" ? "0 0 12px var(--purple)" : "0 0 12px var(--electric)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl p-6 bg-gradient-brand relative overflow-hidden">
            <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/20 blur-2xl" />
            <div className="relative">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/80 font-bold">AI Strategist</div>
              <p className="text-lg font-display font-semibold leading-snug mt-3 text-white">
                "Your biggest growth lever this week is <span className="underline decoration-gold underline-offset-4">Reach</span>. Run the LinkedIn Visibility Sprint to convert your Authority into inbound."
              </p>
              <button className="mt-6 w-full py-2.5 rounded-xl bg-white text-navy font-bold text-sm hover:scale-[1.02] transition-transform">
                Launch Sprint →
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Daily Missions</h3>
              <span className="text-[10px] font-mono text-muted-foreground">1 / 3</span>
            </div>
            <div className="space-y-2">
              {missions.map((m) => (
                <div key={m.title} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/40 transition-colors cursor-pointer">
                  {m.done
                    ? <CheckCircle2 className="size-5 text-electric shrink-0" />
                    : <Circle className="size-5 text-muted-foreground shrink-0" />}
                  <span className={`text-sm flex-1 ${m.done ? "line-through text-muted-foreground" : ""}`}>{m.title}</span>
                  <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">+{m.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="animate-slide-up [animation-delay:200ms]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">Career Evolution Roadmap</h2>
          <Link to="/journey" className="text-xs font-medium text-electric flex items-center gap-1 hover:gap-2 transition-all">
            View full journey <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <div className="glass rounded-3xl px-6 py-10">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-5 h-px bg-border" />
            <div className="absolute left-0 top-5 h-px bg-gradient-to-r from-electric to-gold" style={{ width: "30%" }} />
            {journey.map((lvl, i) => {
              const active = lvl.state === "active";
              const done = lvl.state === "done";
              return (
                <div key={lvl.name} className="relative z-10 flex flex-col items-center gap-3 flex-1">
                  <div className={`size-10 rounded-full grid place-items-center text-xs font-bold font-mono transition-all
                    ${active ? "bg-gold text-navy ring-4 ring-background animate-pulse-gold" :
                      done ? "bg-electric text-white ring-4 ring-background" :
                      "bg-secondary text-muted-foreground ring-4 ring-background opacity-60"}`}>
                    {done ? <CheckCircle2 className="size-5" /> : `L${i+1}`}
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-semibold ${active ? "text-gold" : done ? "text-foreground" : "text-muted-foreground"}`}>
                      {lvl.name}
                    </div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 mt-0.5">
                      {active ? "current" : done ? "complete" : "locked"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tool Ecosystem */}
      <section className="animate-slide-up [animation-delay:300ms]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold tracking-tight">C.A.R.E.E.R.™ Tool Ecosystem</h2>
            <p className="text-sm text-muted-foreground mt-1">Six engines powering your transformation.</p>
          </div>
          <Link to="/tools" className="text-xs font-medium text-electric flex items-center gap-1 hover:gap-2 transition-all">
            All modules <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className={`group rounded-2xl p-6 border transition-all flex flex-col h-full
                  ${t.featured
                    ? "bg-gradient-to-br from-purple/25 to-electric/15 border-purple/40 hover:border-purple"
                    : "glass hover:border-electric/40"}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <div className={`size-9 rounded-lg grid place-items-center ${t.featured ? "bg-purple/30" : "bg-electric/10"}`}>
                      <Icon className={`size-4 ${t.featured ? "text-purple" : "text-electric"}`} />
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {t.letter} · {t.domain}
                    </div>
                  </div>
                  <div className={`font-display font-black text-2xl group-hover:scale-110 transition-transform ${t.featured ? "text-purple" : "text-electric"}`}>
                    {t.score}
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg leading-tight">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 flex-1">{t.desc}</p>
                <div className="mt-5 text-xs font-mono uppercase tracking-widest flex items-center gap-1 text-foreground/70 group-hover:text-foreground">
                  {t.featured ? "Action required" : "Open module"} <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom row: Leaderboard + Live event */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12 animate-slide-up [animation-delay:400ms]">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Trophy className="size-4 text-gold" /> Community Leaderboard</h3>
            <Link to="/community" className="text-[10px] font-mono uppercase text-electric">view all</Link>
          </div>
          <div className="space-y-1">
            {[
              { rank: 1, name: "Sarah Jenkins",    xp: "14,200", tier: "Legend" },
              { rank: 2, name: "Michael Chen",     xp: "12,850", tier: "Catalyst" },
              { rank: 3, name: "Elena Rodriguez",  xp: "11,900", tier: "Closer" },
              { rank: 4, name: "Aarav (you)",      xp: "10,420", tier: "Architect", you: true },
            ].map((u) => (
              <div key={u.rank} className={`flex items-center gap-4 p-3 rounded-lg ${u.you ? "bg-electric/10 border border-electric/30" : "hover:bg-accent/30"}`}>
                <span className={`font-mono text-xs w-5 ${u.rank === 1 ? "text-gold" : "text-muted-foreground"}`}>#{u.rank}</span>
                <div className="size-8 rounded-full bg-gradient-to-tr from-purple to-electric" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">{u.tier}</div>
                </div>
                <span className="text-xs font-mono text-gold">{u.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl p-6 bg-gradient-to-br from-gold/20 to-purple/20 border border-gold/30 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-gold/30 blur-3xl" />
          <div className="relative">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold font-bold flex items-center gap-2">
              <Radar className="size-3 animate-pulse" /> Live in 42 min
            </div>
            <h3 className="font-display font-bold text-2xl mt-3 leading-tight">Executive Presence Boot Camp</h3>
            <p className="text-sm text-muted-foreground mt-2">with Dr. Aris Thorne · L2+ required · 90 min</p>
            <div className="flex items-center gap-3 mt-6">
              <button className="flex-1 py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity">
                RSVP Now
              </button>
              <button className="px-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-accent/40 transition-colors">
                Add to calendar
              </button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground">
              <BarChart3 className="size-3" /> 1,284 members attending
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
