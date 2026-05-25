import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import {
  Trophy, Flame, MessageCircle, TrendingUp, Loader2, Sparkles, Zap, Rocket,
  Crown, Gem, ArrowRight, Users, Lock, CheckCircle2, Target,
} from "lucide-react";
import { PageHeader } from "./tools/index";
import { getLeaderboard, getMe } from "@/lib/me.functions";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({ meta: [{ title: "Community — Bluechip CareerOS™" }] }),
  component: Community,
});

type Stage = {
  key: string;
  label: string;
  range: string;
  minDay: number;
  maxDay: number;
  icon: typeof Sparkles;
  accent: string;
  mantra: string;
  outcome: string;
  rooms: string[];
  unlocks: string;
  wins: { user: string; text: string; time: string }[];
};

const STAGES: Stage[] = [
  {
    key: "awaken",
    label: "Awaken",
    range: "Day 1–30",
    minDay: 1, maxDay: 30,
    icon: Sparkles,
    accent: "text-electric",
    mantra: "Get clear. Set the baseline. Ship one signal per day.",
    outcome: "A calibrated CPI, an honest narrative, and your first 7-day streak.",
    rooms: ["Onboarding circle", "Clarity sprints", "First-30 accountability"],
    unlocks: "Activate stage unlocks at Day 31 OR CPI ≥ 40",
    wins: [
      { user: "Anika R.", text: "Finished the C.A.R.E.E.R. audit. Lowest pillar was Authority — fixed my LinkedIn headline same day.", time: "3h" },
      { user: "Vikram S.", text: "Hit a 7-day streak. First time I've shown up daily for myself in 4 years.", time: "1d" },
    ],
  },
  {
    key: "activate",
    label: "Activate",
    range: "Day 31–90",
    minDay: 31, maxDay: 90,
    icon: Zap,
    accent: "text-gold",
    mantra: "Build authority. Fix the surface area recruiters see.",
    outcome: "LinkedIn rebuilt, 10+ POV posts shipped, 3 weak ties re-activated.",
    rooms: ["LinkedIn authority lab", "POV writing room", "Weak-tie outreach"],
    unlocks: "Amplify unlocks at Day 91 OR CPI ≥ 60",
    wins: [
      { user: "Yara H.", text: "Posted 8 times in 4 weeks. Impressions 11× and 3 recruiter DMs a day.", time: "5h" },
      { user: "Rohan M.", text: "Coffee with 3 senior PMs from my old company. 1 became a referral.", time: "2d" },
    ],
  },
  {
    key: "amplify",
    label: "Amplify",
    range: "Day 91–180",
    minDay: 91, maxDay: 180,
    icon: Rocket,
    accent: "text-purple",
    mantra: "Reach + Evidence. Open the funnel. Run real loops.",
    outcome: "5+ qualified roles in pipeline, 2 interview loops live, comp data sourced.",
    rooms: ["Interview loop war room", "FAANG / Tier-1 prep", "Salary intel exchange"],
    unlocks: "Ascend unlocks at Day 181 OR first interview booked",
    wins: [
      { user: "Tom B.", text: "3 interview loops running. Used the simulator twice this week.", time: "6h" },
      { user: "Meera P.", text: "Got pinged by a Director at the company I was cold-applying to. Inbound > outbound.", time: "1d" },
    ],
  },
  {
    key: "ascend",
    label: "Ascend",
    range: "Day 181–365",
    minDay: 181, maxDay: 365,
    icon: Crown,
    accent: "text-electric",
    mantra: "Convert. Negotiate. Land the title and the comp.",
    outcome: "Offer or promotion in hand. Comp negotiated up. Transition planned.",
    rooms: ["Offer negotiation lab", "Promotion case workshop", "Counter-offer playbook"],
    unlocks: "Anchor unlocks at Year 2 OR offer accepted",
    wins: [
      { user: "Priya S.", text: "Closed a Director role at a global SaaS. 38% jump on base.", time: "2h" },
      { user: "Arjun K.", text: "Got promoted to VP using the case template. Took it to my skip-level cold.", time: "4d" },
    ],
  },
  {
    key: "anchor",
    label: "Anchor",
    range: "Year 2+",
    minDay: 366, maxDay: 99_999,
    icon: Gem,
    accent: "text-gold",
    mantra: "Compound. Mentor. Productize. Become the operator others reference.",
    outcome: "Mentoring 2+ operators, consulting income live, brand operator status.",
    rooms: ["Mentor circle", "Consulting income lab", "Board / advisor track"],
    unlocks: "You are the unlock. Help the next cohort rise.",
    wins: [
      { user: "Deepa R.", text: "Onboarded my 3rd mentee this month. Two of them just hit Amplify.", time: "1d" },
      { user: "Karan V.", text: "First ₹6L consulting retainer signed. Productized the negotiation playbook.", time: "3d" },
    ],
  },
];

function daysSince(iso: string | null | undefined) {
  if (!iso) return 1;
  return Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) + 1);
}

function stageForDay(day: number) {
  const idx = STAGES.findIndex((s) => day >= s.minDay && day <= s.maxDay);
  return idx === -1 ? STAGES.length - 1 : idx;
}

function Community() {
  const fetchLb = useServerFn(getLeaderboard);
  const fetchMe = useServerFn(getMe);
  const { data: lbData, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchLb(),
    staleTime: 30_000,
  });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => fetchMe(), staleTime: 30_000 });

  const rows = lbData?.rows ?? [];
  const meId = lbData?.me;

  const day = daysSince(me?.profile.created_at);
  const myStageIdx = stageForDay(day);
  const myStage = STAGES[myStageIdx];
  const nextStage = STAGES[myStageIdx + 1];

  const progressInStage = useMemo(() => {
    const span = myStage.maxDay - myStage.minDay + 1;
    const into = Math.min(span, Math.max(0, day - myStage.minDay + 1));
    return Math.round((into / span) * 100);
  }, [day, myStage]);

  // Pseudo-distribute the leaderboard across stages so each cohort feels populated.
  const cohorts = useMemo(() => {
    const buckets: Record<string, typeof rows> = Object.fromEntries(STAGES.map((s) => [s.key, [] as typeof rows]));
    rows.forEach((r, i) => {
      const target = STAGES[i % STAGES.length].key;
      buckets[target].push(r);
    });
    return buckets;
  }, [rows]);

  const myCohort = cohorts[myStage.key] ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader eyebrow="The Inner Circle" title="Community"
        subtitle="Five stages. One trajectory. Every operator you see here is on the same arc — find your tribe by stage." />

      {/* === Momentum bar === */}
      <div className="mt-10 glass rounded-3xl p-6 border">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-electric">Your trajectory</div>
            <div className="font-display font-bold text-2xl mt-1">
              Day {day} · <span className={myStage.accent}>{myStage.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">{myStage.mantra}</p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Stage progress</div>
            <div className="font-display font-black text-3xl text-gradient-brand">{progressInStage}%</div>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-5 gap-2">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const reached = i <= myStageIdx;
              const current = i === myStageIdx;
              return (
                <a key={s.key} href={`#stage-${s.key}`}
                  className={`group relative rounded-xl border p-3 transition-all ${
                    current ? "bg-electric/10 border-electric/60 ring-1 ring-electric/40"
                    : reached ? "bg-card border-border hover:border-electric/40"
                    : "bg-card/40 border-border opacity-60"
                  }`}>
                  <div className="flex items-center justify-between">
                    <Icon className={`size-4 ${current ? s.accent : reached ? "text-foreground" : "text-muted-foreground"}`} />
                    {reached && !current && <CheckCircle2 className="size-3 text-electric" />}
                    {!reached && <Lock className="size-3 text-muted-foreground" />}
                  </div>
                  <div className={`mt-2 text-xs font-display font-bold ${current ? s.accent : ""}`}>
                    {String(i + 1).padStart(2, "0")} · {s.label}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">{s.range}</div>
                </a>
              );
            })}
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-electric via-gold to-purple transition-all"
              style={{ width: `${((myStageIdx + progressInStage / 100) / STAGES.length) * 100}%` }} />
          </div>
        </div>

        {nextStage && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="size-3 text-gold" />
            <span>Next: <strong className="text-foreground">{nextStage.label}</strong> — {myStage.unlocks}</span>
          </div>
        )}
      </div>

      {/* === Your stage spotlight === */}
      <section id={`stage-${myStage.key}`} className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-electric">You are here</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-3xl p-6 border">
            <div className="flex items-start justify-between">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border ${myStage.accent}`}>
                  <myStage.icon className="size-3.5" />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Stage {myStageIdx + 1} · {myStage.label}</span>
                </div>
                <h3 className="font-display font-black text-2xl mt-3">{myStage.mantra}</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                  <strong className="text-foreground">Stage outcome:</strong> {myStage.outcome}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
              {myStage.rooms.map((r) => (
                <div key={r} className="rounded-xl border border-border bg-card/40 p-3 hover:border-electric/40 transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <MessageCircle className="size-3.5 text-electric" />
                    <span className="text-[10px] font-mono text-muted-foreground inline-flex items-center gap-1">
                      <TrendingUp className="size-3" /> live
                    </span>
                  </div>
                  <div className="text-sm font-medium mt-2">{r}</div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mt-1">Stage room</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <Link to="/missions" className="rounded-xl border border-border p-3 hover:border-electric/40 transition group">
                <div className="text-[10px] font-mono uppercase tracking-widest text-electric">Today's lever</div>
                <div className="font-medium mt-1 flex items-center gap-1">Run a Mission <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition" /></div>
              </Link>
              <Link to="/tools" className="rounded-xl border border-border p-3 hover:border-electric/40 transition group">
                <div className="text-[10px] font-mono uppercase tracking-widest text-gold">Diagnose</div>
                <div className="font-medium mt-1 flex items-center gap-1">Open C.A.R.E.E.R. <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition" /></div>
              </Link>
              <Link to="/jobs" className="rounded-xl border border-border p-3 hover:border-electric/40 transition group">
                <div className="text-[10px] font-mono uppercase tracking-widest text-purple">Convert</div>
                <div className="font-medium mt-1 flex items-center gap-1">Open Job Tracker <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 transition" /></div>
              </Link>
            </div>
          </div>

          {/* Your tribe */}
          <div className="glass rounded-3xl p-6 border">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Users className={`size-4 ${myStage.accent}`} /> Your tribe · {myStage.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {myCohort.length || 0} operator{myCohort.length === 1 ? "" : "s"} on the same stage.
            </p>
            <div className="mt-4 space-y-2">
              {myCohort.slice(0, 5).map((u) => (
                <div key={u.id} className={`flex items-center gap-3 rounded-lg p-2 ${u.id === meId ? "bg-electric/10 ring-1 ring-electric/40" : "bg-card/40"}`}>
                  <div className="size-8 rounded-full bg-gradient-to-tr from-purple to-electric grid place-items-center text-[10px] font-bold uppercase">
                    {u.display_name?.slice(0, 1) ?? "O"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {u.display_name}
                      {u.id === meId && <span className="text-electric ml-2 text-[10px] font-mono">YOU</span>}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">L{u.level} · {u.streak_days}🔥</div>
                  </div>
                  <div className="text-[10px] font-mono text-gold">{u.xp.toLocaleString()}</div>
                </div>
              ))}
              {myCohort.length === 0 && <div className="text-xs text-muted-foreground italic py-3">You're early. Be the first signal in this stage.</div>}
            </div>
          </div>
        </div>

        {/* Wins from your stage */}
        <div className="glass rounded-3xl p-6 border mt-6">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Flame className="size-4 text-orange-400" /> Wins from {myStage.label} operators this week
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myStage.wins.map((w) => (
              <div key={w.text} className="border-l-2 border-electric pl-3">
                <div className="text-sm">{w.text}</div>
                <div className="text-[10px] font-mono uppercase text-muted-foreground mt-1">{w.user} · {w.time} ago</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === All stages directory === */}
      <section className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Explore every stage</span>
          <span className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const count = (cohorts[s.key] ?? []).length;
            const isMine = i === myStageIdx;
            return (
              <a key={s.key} href={`#stage-${s.key}`}
                className={`rounded-2xl border p-4 transition ${isMine ? "border-electric/60 bg-electric/5" : "border-border hover:border-electric/40"}`}>
                <Icon className={`size-4 ${s.accent}`} />
                <div className="font-display font-bold mt-2">{s.label}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.range}</div>
                <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.outcome}</div>
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">{count} operator{count === 1 ? "" : "s"}</span>
                  {isMine && <span className="text-electric">YOU</span>}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* === Live leaderboard (full) === */}
      <section className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold">Cross-stage power ranking</span>
          <span className="flex-1 h-px bg-border" />
        </div>
        <div className="glass rounded-3xl p-6 border">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-5">
            <Trophy className="size-4 text-gold" /> Live Leaderboard
          </h3>
          {isLoading && <Loader2 className="size-5 animate-spin text-muted-foreground mx-auto my-8" />}
          {!isLoading && rows.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">No operators yet — be the first.</div>
          )}
          <div className="space-y-1">
            {rows.map((u, i) => {
              const isMe = u.id === meId;
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
      </section>
    </div>
  );
}
