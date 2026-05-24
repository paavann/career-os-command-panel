import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Lock, Star } from "lucide-react";
import { PageHeader } from "./tools/index";

export const Route = createFileRoute("/journey")({
  head: () => ({ meta: [{ title: "Career Journey — Bluechip CareerOS™" }] }),
  component: JourneyPage,
});

const levels = [
  { name: "Challenger",          tier: "L1", desc: "Lay the foundation. Audit your current career posture.", xp: "0–1,000",   state: "done"   },
  { name: "Brand Architect",     tier: "L2", desc: "Engineer a distinct positioning and signature voice.",   xp: "1,000–3k",  state: "active" },
  { name: "Opportunity Magnet",  tier: "L3", desc: "Build inbound visibility and recruiter pull.",           xp: "3k–6k",     state: "locked" },
  { name: "Career Closer",       tier: "L4", desc: "Win senior roles with elite interviewing and proof.",   xp: "6k–10k",    state: "locked" },
  { name: "Leadership Catalyst", tier: "L5", desc: "Operate at executive altitude. Lead with presence.",     xp: "10k–18k",   state: "locked" },
  { name: "Freedom Creator",     tier: "L6", desc: "Build leverage. Diversify income. Own your time.",       xp: "18k+",       state: "locked" },
] as const;

function JourneyPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader eyebrow="Career Evolution" title="Your transformation roadmap"
        subtitle="Six tiers. One outcome: become impossible to ignore." />
      <div className="mt-10 space-y-4">
        {levels.map((l, i) => {
          const active = l.state === "active";
          const done = l.state === "done";
          const locked = l.state === "locked";
          return (
            <div key={l.name} className={`relative rounded-2xl p-6 border transition-all flex items-center gap-6
              ${active ? "bg-gradient-to-r from-gold/15 to-transparent border-gold/40 ring-glow-gold"
              : done ? "glass" : "glass opacity-70"}`}>
              <div className={`size-14 rounded-xl grid place-items-center font-mono font-bold shrink-0
                ${active ? "bg-gold text-navy animate-pulse-gold" :
                  done ? "bg-electric text-white" : "bg-secondary text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="size-6" /> : locked ? <Lock className="size-5" /> : l.tier}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-xl">{l.name}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{l.tier}</span>
                  {active && <span className="ml-2 text-[10px] font-mono uppercase bg-gold/20 text-gold px-2 py-0.5 rounded flex items-center gap-1"><Star className="size-3" />current</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>
              </div>
              <div className="text-right text-xs font-mono text-muted-foreground hidden md:block">
                <div className="uppercase tracking-widest text-[10px]">xp range</div>
                <div className="text-foreground">{l.xp}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
