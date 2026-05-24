import { createFileRoute } from "@tanstack/react-router";
import { Award, Star } from "lucide-react";
import { PageHeader } from "./tools/index";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — CareerOS™" }] }),
  component: Profile,
});

const scores = [
  { name: "Clarity", value: 92 }, { name: "Authority", value: 74 }, { name: "Reach", value: 48 },
  { name: "Evidence", value: 88 }, { name: "Energy", value: 95 }, { name: "Revenue", value: 61 },
];

const badges = ["First Sprint","7-Day Streak","Authority Breakthrough","Top 5% CPI","Interview Closer","Recruiter Magnet"];

function Profile() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-purple/20 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="size-24 rounded-2xl bg-gradient-to-tr from-purple to-electric ring-2 ring-gold ring-glow-gold" />
          <div className="flex-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold">Brand Architect · L2</div>
            <h1 className="font-display font-extrabold text-3xl tracking-tight mt-1">Aarav Mehta</h1>
            <p className="text-muted-foreground text-sm mt-1">Senior Product Manager · India · 10y</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div><div className="font-display font-black text-2xl text-gradient-brand">842</div><div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">CPI</div></div>
            <div><div className="font-display font-black text-2xl">4,280</div><div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">XP</div></div>
            <div><div className="font-display font-black text-2xl text-gold">7</div><div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">streak</div></div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6">
          <PageHeader eyebrow="Telemetry" title="C.A.R.E.E.R. Radar" />
          <div className="mt-6 space-y-4">
            {scores.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-1.5">
                  <span className="text-muted-foreground">{s.name}</span><span>{s.value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-brand" style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <PageHeader eyebrow="Achievements" title="Badge vault" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {badges.map((b, i) => (
              <div key={b} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-border bg-accent/20">
                <div className={`size-12 rounded-full grid place-items-center ${i < 4 ? "bg-gradient-brand" : "bg-secondary opacity-60"}`}>
                  {i < 4 ? <Star className="size-5 text-white" /> : <Award className="size-5 text-muted-foreground" />}
                </div>
                <div className="text-[11px] font-semibold leading-tight">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
