import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Award, Star, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "./tools/index";
import { useMe } from "@/components/layout/AppShell";
import { updateProfile } from "@/lib/me.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Bluechip CareerOS™" }] }),
  component: Profile,
});

const SCORE_KEYS = [
  ["Clarity", "clarity"], ["Authority", "authority"], ["Reach", "reach"],
  ["Evidence", "evidence"], ["Energy", "energy"], ["Revenue", "revenue"],
] as const;

const ALL_BADGES = [
  { label: "First Sign-In",       unlock: (p: any) => p.xp >= 0 },
  { label: "7-Day Streak",        unlock: (p: any) => p.streak_days >= 7 },
  { label: "30-Day Streak",       unlock: (p: any) => p.streak_days >= 30 },
  { label: "500 XP Club",         unlock: (p: any) => p.xp >= 500 },
  { label: "Authority Breakthrough", unlock: (p: any) => p.xp >= 2000 },
  { label: "Top Operator",        unlock: (p: any) => p.level >= 5 },
];

function Profile() {
  const { data, isLoading } = useMe();
  const qc = useQueryClient();
  const update = useServerFn(updateProfile);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");

  useEffect(() => {
    if (data) {
      setName(data.profile.display_name);
      setHeadline(data.profile.headline ?? "");
    }
  }, [data]);

  const mut = useMutation({
    mutationFn: () => update({ data: { display_name: name, headline } }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (isLoading || !data) {
    return <div className="max-w-6xl mx-auto px-6 py-20 grid place-items-center"><Loader2 className="size-5 animate-spin" /></div>;
  }

  const p = data.profile;
  const s = data.scores;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-purple/20 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="size-24 rounded-2xl bg-gradient-to-tr from-purple to-electric ring-2 ring-gold grid place-items-center text-3xl font-display font-black uppercase">
            {p.display_name?.slice(0, 1)}
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold">{p.tier} · L{p.level}</div>
            <h1 className="font-display font-extrabold text-3xl tracking-tight mt-1">{p.display_name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{p.headline || "Add a headline to attract recruiters."}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <Stat label="CPI" value={p.cpi_score} accent />
            <Stat label="XP" value={p.xp.toLocaleString()} />
            <Stat label="streak" value={`${p.streak_days}`} gold />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6">
          <PageHeader eyebrow="Telemetry" title="C.A.R.E.E.R. Radar" />
          <div className="mt-6 space-y-4">
            {SCORE_KEYS.map(([label, key]) => (
              <div key={key}>
                <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-1.5">
                  <span className="text-muted-foreground">{label}</span><span>{s[key]}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-brand" style={{ width: `${s[key]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <PageHeader eyebrow="Achievements" title="Badge vault" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {ALL_BADGES.map((b) => {
              const earned = b.unlock(p);
              return (
                <div key={b.label} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-border bg-accent/20">
                  <div className={`size-12 rounded-full grid place-items-center ${earned ? "bg-gradient-brand" : "bg-secondary opacity-50"}`}>
                    {earned ? <Star className="size-5 text-white" /> : <Award className="size-5 text-muted-foreground" />}
                  </div>
                  <div className="text-[11px] font-semibold leading-tight">{b.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <PageHeader eyebrow="Identity" title="Edit profile" />
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <label className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Display name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
          </label>
          <label className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Headline</div>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={160}
              placeholder="Senior PM · India · 10y"
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
          </label>
        </div>
        <button
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-brand text-white text-sm font-bold disabled:opacity-50"
        >
          {mut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, gold }: { label: string; value: string | number; accent?: boolean; gold?: boolean }) {
  return (
    <div>
      <div className={`font-display font-black text-2xl ${accent ? "text-gradient-brand" : gold ? "text-gold" : ""}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">{label}</div>
    </div>
  );
}
