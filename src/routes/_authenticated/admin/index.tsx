import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminOverview } from "@/lib/admin.functions";
import { Users, Zap, Activity, Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview — Bluechip CareerOS™" }] }),
  component: Overview,
});

function Overview() {
  const fn = useServerFn(adminOverview);
  const { data, isLoading } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fn() });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data) return null;

  const stats = [
    { label: "Total operators", value: data.totalUsers, icon: Users },
    { label: "Active today", value: data.activeToday, icon: Activity },
    { label: "XP distributed", value: data.totalXp.toLocaleString(), icon: Zap },
    { label: "Top performer XP", value: data.topUsers[0]?.xp?.toLocaleString() ?? "—", icon: Trophy },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass rounded-2xl p-5 border">
              <div className="flex items-center justify-between">
                <Icon className="size-4 text-electric" />
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.label}</div>
              </div>
              <div className="font-display font-black text-3xl mt-3">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-lg">Leaderboard</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3">Operator</th>
              <th className="text-left px-6 py-3">Tier</th>
              <th className="text-right px-6 py-3">Level</th>
              <th className="text-right px-6 py-3">XP</th>
            </tr>
          </thead>
          <tbody>
            {data.topUsers.map((u: any) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-6 py-3 font-medium">{u.display_name}</td>
                <td className="px-6 py-3 text-muted-foreground">{u.tier}</td>
                <td className="px-6 py-3 text-right">{u.level}</td>
                <td className="px-6 py-3 text-right font-mono text-electric">{u.xp.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
