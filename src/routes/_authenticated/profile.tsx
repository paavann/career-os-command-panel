import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2, Save, Flame, Gem, Calendar, Sparkles, Trophy,
  GraduationCap, Bot, Zap, Lock, Award, Target, TrendingUp,
  FileText, Linkedin, Briefcase, ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { useMe } from "@/components/layout/AppShell";
import { getProfileStats, updateProfile } from "@/lib/me.functions";
import { COURSES } from "@/lib/courses";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Bluechip CareerOS™" }] }),
  component: Profile,
});

const SCORE_KEYS = [
  ["C·Clarity", "clarity"],
  ["A·Authority", "authority"],
  ["R·Reach", "reach"],
  ["E·Evidence", "evidence"],
  ["E·Energy", "energy"],
  ["R·Revenue", "revenue"],
] as const;

const GOAL_OPTIONS = [
  "Get promoted", "Find a new job", "Get a salary raise",
  "Build external visibility", "Grow my consulting income",
];
const TIMELINE_OPTIONS = ["3 months", "6 months", "12 months"];
const INDUSTRY_OPTIONS = ["Tech", "BFSI", "Consulting", "Manufacturing", "Healthcare", "Other"];

function Profile() {
  const { data, isLoading } = useMe();
  const fetchStats = useServerFn(getProfileStats);
  const { data: stats } = useQuery({
    queryKey: ["profile-stats"],
    queryFn: () => fetchStats(),
    staleTime: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 grid place-items-center">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <IdentityCard p={data.profile} />
      <CpiBreakdown cpi={data.profile.cpi_score} scores={data.scores} />
      <ProgressTracker
        profile={data.profile}
        missionsCount={data.missions.length}
        stats={stats}
      />
      <AchievementsGrid profile={data.profile} scores={data.scores} stats={stats} />
      <EditableProfile profile={data.profile} />
      <QuickLinks linkedinUrl={data.profile.linkedin_url} />
    </div>
  );
}

/* ---------- 1. Identity Card ---------- */
function IdentityCard({ p }: { p: any }) {
  const joinDate = p.created_at
    ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";
  return (
    <div className="glass rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-purple/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="size-28 rounded-3xl bg-gradient-to-tr from-purple via-electric to-gold ring-2 ring-gold grid place-items-center text-4xl font-display font-black uppercase">
          {p.display_name?.slice(0, 1) ?? "O"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-[10px] font-mono uppercase tracking-[0.25em] text-gold mb-3">
            <Gem className="size-3" /> Diamond Member
          </div>
          <h1 className="font-display font-extrabold text-4xl tracking-tight">{p.display_name}</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {p.job_title ? `${p.job_title}` : "Add your current role"}{p.industry ? ` · ${p.industry}` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs">
            {p.primary_goal && (
              <span className="inline-flex items-center gap-1.5">
                <Target className="size-3.5 text-electric" />
                <span className="text-muted-foreground">Goal:</span>
                <span className="font-semibold">{p.primary_goal}</span>
              </span>
            )}
            {p.target_timeline && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-purple" />
                <span className="text-muted-foreground">Target:</span>
                <span className="font-semibold">{p.target_timeline}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Gem className="size-3.5 text-gold" />
              BlueChip Diamond since <span className="text-foreground font-semibold">{joinDate}</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <StreakBox label="Current" value={p.streak_days} />
          <StreakBox label="Longest" value={p.streak_days /* best we have */} muted />
        </div>
      </div>
    </div>
  );
}

function StreakBox({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border px-5 py-4 text-center ${muted ? "bg-card/30" : "bg-gradient-to-br from-orange-500/15 to-red-500/10"}`}>
      <div className="flex items-center justify-center gap-1 font-display font-black text-2xl">
        <Flame className={`size-4 ${muted ? "text-muted-foreground" : "text-orange-400"}`} />
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono mt-1">
        {label} streak
      </div>
    </div>
  );
}

/* ---------- 2. CPI Breakdown ---------- */
function CpiBreakdown({ cpi, scores }: { cpi: number; scores: any }) {
  const entries = SCORE_KEYS.map(([label, key]) => ({ label, key, value: scores[key] as number }));
  const strongest = [...entries].sort((a, b) => b.value - a.value)[0];
  const weakest = [...entries].sort((a, b) => a.value - b.value)[0];

  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <SectionHeader eyebrow="Telemetry" title="Career Power Index" />
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 mt-6 items-center">
        <div className="flex flex-col items-center">
          <RadarChart entries={entries} />
          <div className="mt-4 text-center">
            <div className="font-display font-black text-5xl text-gradient-brand">{cpi}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
              Overall CPI Score
            </div>
          </div>
        </div>
        <div className="space-y-3.5">
          {entries.map((e) => (
            <div key={e.key}>
              <div className="flex justify-between text-xs font-mono uppercase tracking-widest mb-1.5">
                <span className="text-muted-foreground">{e.label}</span>
                <span className="font-bold text-foreground">{e.value}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-brand transition-all"
                  style={{ width: `${Math.min(100, (e.value / 25) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-mono uppercase tracking-widest text-emerald-300">
              <TrendingUp className="size-3" /> Strongest · {strongest.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/40 text-[10px] font-mono uppercase tracking-widest text-orange-300">
              <Target className="size-3" /> Focus · {weakest.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarChart({ entries }: { entries: { label: string; value: number }[] }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 90;
  const n = entries.length;
  const point = (i: number, v: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const ratio = Math.min(1, v / 25);
    return [cx + Math.cos(angle) * r * ratio, cy + Math.sin(angle) * r * ratio];
  };
  const axis = (i: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };
  const poly = entries.map((e, i) => point(i, e.value).join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon
          key={s}
          points={entries.map((_, i) => {
            const [x, y] = axis(i);
            return `${cx + (x - cx) * s},${cy + (y - cy) * s}`;
          }).join(" ")}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={1}
          opacity={0.3}
        />
      ))}
      {entries.map((_, i) => {
        const [x, y] = axis(i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={1} opacity={0.3} />;
      })}
      <polygon points={poly} fill="url(#radarGrad)" fillOpacity={0.6} stroke="var(--electric)" strokeWidth={1.5} />
      <defs>
        <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--purple)" />
          <stop offset="100%" stopColor="var(--electric)" />
        </linearGradient>
      </defs>
      {entries.map((e, i) => {
        const [x, y] = axis(i);
        const lx = cx + (x - cx) * 1.18;
        const ly = cy + (y - cy) * 1.18;
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            className="fill-muted-foreground" fontSize={9} fontFamily="ui-monospace, monospace">
            {e.label.split("·")[0]}
          </text>
        );
      })}
    </svg>
  );
}

/* ---------- 3. Progress Tracker ---------- */
function ProgressTracker({
  profile, missionsCount, stats,
}: { profile: any; missionsCount: number; stats: any }) {
  const xpThis = stats?.xpThisMonth ?? 0;
  const xpLast = stats?.xpLastMonth ?? 0;
  const diff = xpThis - xpLast;
  const inProgress = (stats?.coursesProgress ?? []).filter((c: any) => !c.done && c.completed > 0);

  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <SectionHeader eyebrow="Momentum" title="This month's progress" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        <StatTile
          icon={<Zap className="size-4 text-gold" />} label="XP this month"
          value={xpThis.toLocaleString()}
          sub={diff >= 0 ? `+${diff} vs last month` : `${diff} vs last month`}
          good={diff >= 0}
        />
        <StatTile
          icon={<Trophy className="size-4 text-electric" />} label="Missions this month"
          value={`${stats?.missionsThisMonth ?? 0}`}
          sub={`${stats?.missionsCompleted ?? 0} of ${missionsCount} total`}
        />
        <StatTile
          icon={<GraduationCap className="size-4 text-purple" />} label="Courses completed"
          value={`${stats?.coursesCompleted ?? 0} / ${COURSES.length}`}
          sub={inProgress.length ? `${inProgress.length} in progress` : "Pick a course to start"}
        />
        <StatTile
          icon={<Calendar className="size-4 text-emerald-400" />} label="Live sessions"
          value={`${stats?.liveSessionsAttended ?? 0}`} sub="Attended"
        />
        <StatTile
          icon={<Bot className="size-4 text-fuchsia-400" />} label="AI tools used"
          value={`${stats?.aiToolsUsed ?? 0}`} sub="Unique copilots"
        />
        <StatTile
          icon={<Sparkles className="size-4 text-amber-400" />} label="C.A.R.E.E.R. engines"
          value={`${stats?.enginesOpened ?? 0}`} sub="Opened"
        />
      </div>

      {inProgress.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            In-progress courses
          </div>
          {inProgress.map((c: any) => {
            const course = COURSES.find((x) => x.slug === c.slug);
            if (!course) return null;
            const pct = Math.round((c.completed / course.modules.length) * 100);
            return (
              <Link
                key={c.slug}
                to="/courses/$slug"
                params={{ slug: c.slug }}
                className="block group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium group-hover:text-electric">{course.title}</span>
                  <span className="font-mono text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-brand" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatTile({ icon, label, value, sub, good }:
  { icon: React.ReactNode; label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-4">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {icon}{label}
      </div>
      <div className="font-display font-black text-2xl mt-2">{value}</div>
      {sub && (
        <div className={`text-[11px] mt-0.5 ${good === undefined ? "text-muted-foreground" : good ? "text-emerald-400" : "text-orange-400"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}

/* ---------- 4. Achievements ---------- */
function AchievementsGrid({ profile, scores, stats }:
  { profile: any; scores: any; stats: any }) {
  const courseSlugsDone = new Set(
    (stats?.coursesProgress ?? []).filter((c: any) => c.done).map((c: any) => c.slug),
  );
  const BADGES = [
    { key: "day1", label: "Day 1", desc: "Joined BlueChip Diamond", earned: !!profile.created_at,
      date: profile.created_at },
    { key: "first-mission", label: "First Mission", desc: "Completed first daily mission",
      earned: (stats?.missionsCompleted ?? 0) >= 1 },
    { key: "7-streak", label: "7-Day Streak", desc: "7 day streak maintained",
      earned: (profile.streak_days ?? 0) >= 7 },
    { key: "course-grad", label: "Course Graduate", desc: "Finished a full course",
      earned: (stats?.coursesCompleted ?? 0) >= 1 },
    { key: "authority", label: "Authority Builder", desc: "Authority score > 50",
      earned: (scores.authority ?? 0) > 50 },
    { key: "negotiator", label: "Negotiator", desc: "Finished Negotiate Like a Director",
      earned: courseSlugsDone.has("negotiate-director") },
    { key: "ai-op", label: "AI Operator", desc: "Finished AI-First Career Operator",
      earned: courseSlugsDone.has("ai-first-operator") },
    { key: "sweep", label: "Daily Sweep", desc: "All 3 daily missions in one day",
      earned: (stats?.missionsThisMonth ?? 0) >= 3 },
    { key: "power", label: "Power Player", desc: "CPI score > 75",
      earned: (profile.cpi_score ?? 0) > 75 },
  ];

  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <SectionHeader eyebrow="Achievements" title="Badge vault" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 mt-6">
        {BADGES.map((b) => (
          <div key={b.key}
            className={`rounded-2xl border p-4 flex items-start gap-3 transition-all ${
              b.earned
                ? "border-gold/40 bg-gradient-to-br from-gold/10 to-purple/10"
                : "border-border bg-card/30 opacity-60"
            }`}
          >
            <div className={`size-10 shrink-0 rounded-xl grid place-items-center ${
              b.earned ? "bg-gradient-brand text-white" : "bg-secondary text-muted-foreground"
            }`}>
              {b.earned ? <Award className="size-5" /> : <Lock className="size-4" />}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold leading-tight">{b.label}</div>
              <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{b.desc}</div>
              {b.earned && b.date && (
                <div className="text-[10px] font-mono text-gold mt-1.5">
                  {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 5. Editable Profile ---------- */
function EditableProfile({ profile }: { profile: any }) {
  const qc = useQueryClient();
  const update = useServerFn(updateProfile);
  const [f, setF] = useState({
    display_name: profile.display_name ?? "",
    job_title: profile.job_title ?? "",
    industry: profile.industry ?? "",
    current_company: profile.current_company ?? "",
    city: profile.city ?? "",
    years_experience: profile.years_experience ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    target_role: profile.target_role ?? "",
    primary_goal: profile.primary_goal ?? "",
    target_timeline: profile.target_timeline ?? "",
  });
  useEffect(() => {
    setF({
      display_name: profile.display_name ?? "",
      job_title: profile.job_title ?? "",
      industry: profile.industry ?? "",
      current_company: profile.current_company ?? "",
      city: profile.city ?? "",
      years_experience: profile.years_experience ?? "",
      linkedin_url: profile.linkedin_url ?? "",
      target_role: profile.target_role ?? "",
      primary_goal: profile.primary_goal ?? "",
      target_timeline: profile.target_timeline ?? "",
    });
  }, [profile.id]);

  const set = (k: keyof typeof f, v: any) => setF((s) => ({ ...s, [k]: v }));

  const mut = useMutation({
    mutationFn: () => update({
      data: {
        display_name: f.display_name.trim() || undefined,
        job_title: f.job_title.trim() || undefined,
        industry: f.industry || undefined,
        current_company: f.current_company.trim() || undefined,
        city: f.city.trim() || undefined,
        years_experience: f.years_experience === "" ? null : Number(f.years_experience),
        linkedin_url: f.linkedin_url.trim() || "",
        target_role: f.target_role.trim() || undefined,
        primary_goal: f.primary_goal || undefined,
        target_timeline: f.target_timeline || undefined,
      } as any,
    }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <SectionHeader eyebrow="Identity" title="My career profile" />
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <TextField label="Full name" value={f.display_name} onChange={(v) => set("display_name", v)} />
        <TextField label="Current role / title" value={f.job_title} onChange={(v) => set("job_title", v)} />
        <SelectField label="Industry / sector" value={f.industry} onChange={(v) => set("industry", v)} options={INDUSTRY_OPTIONS} />
        <TextField label="Current company" value={f.current_company} onChange={(v) => set("current_company", v)} placeholder="Optional" />
        <TextField label="City" value={f.city} onChange={(v) => set("city", v)} placeholder="Bengaluru" />
        <TextField label="Years of experience" type="number" value={String(f.years_experience)} onChange={(v) => set("years_experience", v)} />
        <TextField label="LinkedIn URL" value={f.linkedin_url} onChange={(v) => set("linkedin_url", v)} placeholder="https://linkedin.com/in/…" />
        <TextField label="Target role" value={f.target_role} onChange={(v) => set("target_role", v)} placeholder="What you're aiming for" />
        <SelectField label="Career goal" value={f.primary_goal} onChange={(v) => set("primary_goal", v)} options={GOAL_OPTIONS} />
        <SelectField label="Target timeline" value={f.target_timeline} onChange={(v) => set("target_timeline", v)} options={TIMELINE_OPTIONS} />
      </div>
      <button
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-brand text-white text-sm font-bold disabled:opacity-50"
      >
        {mut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Save changes
      </button>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, type }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="space-y-1.5 block">
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:border-electric outline-none"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }:
  { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="space-y-1.5 block">
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm focus:border-electric outline-none"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

/* ---------- 6. Quick Links ---------- */
function QuickLinks({ linkedinUrl }: { linkedinUrl: string | null }) {
  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <SectionHeader eyebrow="Shortcuts" title="Quick links" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <QuickBtn
          icon={<FileText className="size-4" />}
          label="My Resume"
          sub="Upload PDF"
          onClick={() => toast.info("Resume vault coming soon")}
        />
        <QuickBtn
          icon={<Linkedin className="size-4" />}
          label="My LinkedIn"
          sub={linkedinUrl ? "View profile" : "Add URL above"}
          href={linkedinUrl || undefined}
          onClick={!linkedinUrl ? () => toast.info("Add your LinkedIn URL in My career profile") : undefined}
        />
        <QuickBtn
          icon={<GraduationCap className="size-4" />}
          label="My Courses"
          sub="Track progress"
          to="/courses"
        />
        <QuickBtn
          icon={<Briefcase className="size-4" />}
          label="Job Tracker"
          sub="Pipeline & offers"
          to="/jobs"
        />
      </div>
    </div>
  );
}

function QuickBtn({ icon, label, sub, to, href, onClick }:
  { icon: React.ReactNode; label: string; sub: string; to?: string; href?: string; onClick?: () => void }) {
  const body = (
    <div className="group rounded-2xl border border-border bg-card/40 p-4 hover:border-electric/50 hover:bg-accent/30 transition-all h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="size-9 rounded-xl bg-gradient-brand grid place-items-center text-white">{icon}</div>
        <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-electric transition-colors" />
      </div>
      <div className="mt-3 text-sm font-bold">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
  if (href) {
    return <a href={href} target="_blank" rel="noreferrer noopener" className="block">{body}</a>;
  }
  if (to) {
    return <Link to={to as any} className="block">{body}</Link>;
  }
  return <button type="button" onClick={onClick} className="text-left block">{body}</button>;
}

/* ---------- shared ---------- */
function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-electric">{eyebrow}</div>
      <h2 className="font-display font-extrabold text-2xl tracking-tight mt-1">{title}</h2>
    </div>
  );
}
