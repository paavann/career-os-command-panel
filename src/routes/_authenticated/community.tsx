import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Flame, MessageCircle, TrendingUp, Loader2 } from "lucide-react";
import { PageHeader } from "./tools/index";
import { getLeaderboard } from "@/lib/me.functions";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({ meta: [{ title: "Community — Bluechip CareerOS™" }] }),
  component: Community,
});

const wins = [
  { user: "Priya S.", text: "Closed a Director role at a global SaaS. 38% jump.", time: "2h" },
  { user: "Tom B.",   text: "Negotiated +₹14L on counter-offer using the simulator.", time: "5h" },
  { user: "Yara H.",  text: "LinkedIn impressions 11x in 6 weeks. 3 recruiter DMs/day.", time: "1d" },
];

function Community() {
  const fetchLb = useServerFn(getLeaderboard);
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchLb(),
    staleTime: 30_000,
  });
  const rows = data?.rows ?? [];
  const me = data?.me;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader eyebrow="The Inner Circle" title="Community"
        subtitle="Private, ambitious, accountable. Operators who lift each other up." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-5">
            <Trophy className="size-4 text-gold" /> Live Leaderboard
          </h3>
          {isLoading && <Loader2 className="size-5 animate-spin text-muted-foreground mx-auto my-8" />}
          {!isLoading && rows.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">No operators yet — be the first.</div>
          )}
          <div className="space-y-1">
            {rows.map((u, i) => {
              const isMe = u.id === me;
              return (
                <div key={u.id} className={`flex items-center gap-4 p-3 rounded-lg ${
                  isMe ? "bg-electric/10 ring-1 ring-electric/40" :
                  i < 3 ? "bg-accent/30" : "hover:bg-accent/20"
                }`}>
                  <span className={`font-mono text-xs w-6 ${i === 0 ? "text-gold" : i < 3 ? "text-foreground" : "text-muted-foreground"}`}>#{i + 1}</span>
                  <div className="size-9 rounded-full bg-gradient-to-tr from-purple to-electric grid place-items-center text-[10px] font-bold uppercase">
                    {u.display_name?.slice(0, 1) ?? "O"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.display_name}{isMe && <span className="text-electric ml-2 text-[10px] font-mono">YOU</span>}</div>
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">L{u.level} · 💎 Diamond</div>
                  </div>
                  <div className="text-xs font-mono text-orange-400 hidden sm:block">{u.streak_days}🔥</div>
                  <div className="text-xs font-mono text-gold w-24 text-right">{u.xp.toLocaleString()} XP</div>
                </div>
              );
            })}
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
