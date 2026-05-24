import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminAiUsage } from "@/lib/admin.functions";
import { Brain, MessageSquare, Users } from "lucide-react";
import { COPILOTS } from "@/lib/copilots";

export const Route = createFileRoute("/_authenticated/admin/ai-usage")({
  head: () => ({ meta: [{ title: "Admin · AI Usage — Bluechip CareerOS™" }] }),
  component: AiUsage,
});

function AiUsage() {
  const fn = useServerFn(adminAiUsage);
  const { data, isLoading } = useQuery({ queryKey: ["admin-ai-usage"], queryFn: () => fn() });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data) return null;

  const stats = [
    { label: "Messages", value: data.totalMessages.toLocaleString(), icon: MessageSquare },
    { label: "Conversations", value: data.totalConversations.toLocaleString(), icon: Brain },
    { label: "Unique users", value: data.uniqueUsers.toLocaleString(), icon: Users },
  ];

  const max = Math.max(1, ...data.byCopilot.map((b: any) => b.count));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
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

      <div className="glass rounded-2xl border p-6">
        <h2 className="font-display font-bold text-lg mb-4">Top copilots</h2>
        <div className="space-y-3">
          {data.byCopilot.length === 0 && (
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
          )}
          {data.byCopilot.map((b: any) => {
            const meta = COPILOTS.find((c) => c.slug === b.slug);
            return (
              <div key={b.slug}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{meta?.name ?? b.slug}</span>
                  <span className="font-mono text-electric">{b.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-brand" style={{ width: `${(b.count / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
