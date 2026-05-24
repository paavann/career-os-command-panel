import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Flame } from "lucide-react";
import { PageHeader } from "./tools/index";

export const Route = createFileRoute("/missions")({
  head: () => ({ meta: [{ title: "Missions — CareerOS™" }] }),
  component: Missions,
});

const daily = [
  { title: "Refine your Authority thesis (200 words)", xp: 150, done: true,  domain: "A" },
  { title: "Engage 3 strategic Reach targets",        xp: 200, done: false, domain: "R" },
  { title: "Publish a Proof-of-Impact artifact",      xp: 120, done: false, domain: "E" },
];
const weekly = [
  { title: "Complete LinkedIn Visibility Sprint", xp: 800, progress: 35, domain: "R" },
  { title: "Run 2 mock interviews",                xp: 500, progress: 50, domain: "E" },
  { title: "Add 5 quantified achievements",        xp: 400, progress: 80, domain: "E" },
];

function Missions() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <PageHeader eyebrow="Quest Log" title="Missions & challenges"
        subtitle="Compound habits. Track XP. Climb the journey." />

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Daily</h2>
          <span className="text-xs font-mono text-gold flex items-center gap-1"><Flame className="size-3" /> 7-day streak</span>
        </div>
        <div className="space-y-2">
          {daily.map((m) => (
            <div key={m.title} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors">
              {m.done ? <CheckCircle2 className="size-5 text-electric" /> : <Circle className="size-5 text-muted-foreground" />}
              <div className="size-7 rounded bg-secondary grid place-items-center text-[10px] font-mono font-bold">{m.domain}</div>
              <span className={`text-sm flex-1 ${m.done ? "line-through text-muted-foreground" : ""}`}>{m.title}</span>
              <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">+{m.xp} XP</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-semibold mb-4">Weekly Challenges</h2>
        <div className="space-y-5">
          {weekly.map((m) => (
            <div key={m.title}>
              <div className="flex items-center gap-3">
                <div className="size-7 rounded bg-secondary grid place-items-center text-[10px] font-mono font-bold">{m.domain}</div>
                <span className="text-sm flex-1">{m.title}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{m.progress}%</span>
                <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">+{m.xp} XP</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-brand" style={{ width: `${m.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
