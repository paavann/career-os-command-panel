import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, Flame, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "./tools/index";
import { useMe } from "@/components/layout/AppShell";
import { completeMission } from "@/lib/me.functions";

export const Route = createFileRoute("/_authenticated/missions")({
  head: () => ({ meta: [{ title: "Missions — Bluechip CareerOS™" }] }),
  component: Missions,
});

const DOMAIN_LETTER: Record<string, string> = {
  daily: "D", weekly: "W", clarity: "C", authority: "A", reach: "R",
  evidence: "E", energy: "E", revenue: "R",
};

function Missions() {
  const { data, isLoading } = useMe();
  const qc = useQueryClient();
  const complete = useServerFn(completeMission);
  const mut = useMutation({
    mutationFn: (userMissionId: string) => complete({ data: { userMissionId } }),
    onSuccess: (res) => {
      if (res.alreadyDone) toast.info("Already completed today");
      else toast.success(`+${res.xp} XP · +${res.coins} coins`);
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const missions = data?.missions ?? [];
  const daily = missions.filter((m) => m.category === "daily");
  const weekly = missions.filter((m) => m.category === "weekly");
  const others = missions.filter((m) => m.category !== "daily" && m.category !== "weekly");
  const doneCount = daily.filter((m) => m.status === "completed").length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <PageHeader eyebrow="Quest Log" title="Missions & challenges"
        subtitle="Compound habits. Complete missions to earn XP, coins, and climb the leaderboard." />

      {isLoading && (
        <div className="glass rounded-3xl p-12 grid place-items-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}

      {!isLoading && (
        <>
          <Section
            title="Daily"
            right={
              <span className="text-xs font-mono text-gold flex items-center gap-1">
                <Flame className="size-3" /> {data?.profile.streak_days ?? 0}-day streak · {doneCount}/{daily.length}
              </span>
            }
          >
            {daily.length === 0 && <Empty label="No daily missions assigned yet." />}
            {daily.map((m) => (
              <MissionRow key={m.user_mission_id} m={m} pending={mut.isPending} onComplete={() => mut.mutate(m.user_mission_id)} />
            ))}
          </Section>

          {weekly.length > 0 && (
            <Section title="Weekly Challenges">
              {weekly.map((m) => (
                <MissionRow key={m.user_mission_id} m={m} pending={mut.isPending} onComplete={() => mut.mutate(m.user_mission_id)} />
              ))}
            </Section>
          )}

          {others.length > 0 && (
            <Section title="Sprints">
              {others.map((m) => (
                <MissionRow key={m.user_mission_id} m={m} pending={mut.isPending} onComplete={() => mut.mutate(m.user_mission_id)} />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">{title}</h2>
        {right}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="text-sm text-muted-foreground p-4 text-center">{label}</div>;
}

function MissionRow({ m, onComplete, pending }: { m: any; onComplete: () => void; pending: boolean }) {
  const done = m.status === "completed";
  return (
    <button
      disabled={done || pending}
      onClick={onComplete}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${
        done ? "opacity-60" : "hover:bg-accent/40 cursor-pointer"
      }`}
    >
      {done ? <CheckCircle2 className="size-5 text-electric" /> : <Circle className="size-5 text-muted-foreground" />}
      <div className="size-7 rounded bg-secondary grid place-items-center text-[10px] font-mono font-bold">
        {DOMAIN_LETTER[m.category] ?? "•"}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{m.title}</div>
        {m.description && <div className="text-xs text-muted-foreground mt-0.5 truncate">{m.description}</div>}
      </div>
      <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">+{m.xp_reward} XP</span>
      <span className="text-[10px] font-mono font-bold text-electric bg-electric/10 px-2 py-0.5 rounded">+{m.coin_reward}c</span>
    </button>
  );
}
