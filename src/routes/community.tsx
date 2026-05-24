import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Flame, MessageCircle, TrendingUp } from "lucide-react";
import { PageHeader } from "./tools/index";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — Bluechip CareerOS™" }] }),
  component: Community,
});

const leaders = Array.from({ length: 10 }).map((_, i) => ({
  rank: i + 1,
  name: ["Sarah Jenkins","Michael Chen","Elena Rodriguez","Aarav Mehta","Priya Shah","David Park","Yara Haddad","Lina Vargas","Tom Becker","Aiko Tanaka"][i],
  xp: (15000 - i * 980),
  tier: ["Legend","Catalyst","Catalyst","Architect","Architect","Closer","Closer","Magnet","Magnet","Architect"][i],
  delta: ["+420","+312","+288","+241","+199","+170","+155","+121","+98","+88"][i],
}));

const wins = [
  { user: "Priya S.", text: "Closed a Director role at a global SaaS. 38% jump.", time: "2h" },
  { user: "Tom B.",   text: "Negotiated +₹14L on counter-offer using the simulator.", time: "5h" },
  { user: "Yara H.",  text: "LinkedIn impressions 11x in 6 weeks. 3 recruiter DMs/day.", time: "1d" },
];

function Community() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader eyebrow="The Inner Circle" title="Community"
        subtitle="Private, ambitious, accountable. Operators who lift each other up." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-5"><Trophy className="size-4 text-gold" /> Weekly Leaderboard</h3>
          <div className="space-y-1">
            {leaders.map((u) => (
              <div key={u.rank} className={`flex items-center gap-4 p-3 rounded-lg ${u.rank <= 3 ? "bg-accent/30" : "hover:bg-accent/20"}`}>
                <span className={`font-mono text-xs w-6 ${u.rank === 1 ? "text-gold" : u.rank <= 3 ? "text-foreground" : "text-muted-foreground"}`}>#{u.rank}</span>
                <div className="size-9 rounded-full bg-gradient-to-tr from-purple to-electric" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">{u.tier}</div>
                </div>
                <div className="text-xs font-mono text-electric">{u.delta}</div>
                <div className="text-xs font-mono text-gold w-20 text-right">{u.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><Flame className="size-4 text-orange-400" /> Weekly Wins</h3>
            <div className="space-y-4">
              {wins.map((w) => (
                <div key={w.text} className="border-l-2 border-electric pl-3">
                  <div className="text-sm">{w.text}</div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mt-1">{w.user} · {w.time} ago</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4"><MessageCircle className="size-4 text-electric" /> Active Rooms</h3>
            <div className="space-y-3 text-sm">
              {["Salary negotiation tactics","FAANG interview prep","Returning to work","Building authority on LinkedIn"].map((r) => (
                <div key={r} className="flex items-center justify-between">
                  <span>{r}</span>
                  <span className="text-[10px] font-mono text-muted-foreground"><TrendingUp className="size-3 inline" /> 24 live</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
