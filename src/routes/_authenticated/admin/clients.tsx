import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  Gem, Search, Briefcase, Flame, Trophy, GraduationCap, Linkedin, MapPin,
  Building2, Target, AlertTriangle, X, ExternalLink, MessageSquare, TrendingUp, Calendar,
} from "lucide-react";
import { adminListClients, type CoachClient } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  head: () => ({ meta: [{ title: "Admin · Diamond Clients — Bluechip CareerOS™" }] }),
  component: ClientsAdmin,
});

const GOALS = ["Get promoted", "Find a new job", "Get a salary raise", "Build external visibility", "Grow my consulting income"];
const INDUSTRIES = ["Tech", "BFSI", "Consulting", "Manufacturing", "Healthcare", "Other"];
const STATUSES = [
  { v: "all", label: "All clients" },
  { v: "active_7d", label: "Active · 7d" },
  { v: "stalled_14d", label: "Stalled · 14d+" },
  { v: "onboarding_incomplete", label: "Onboarding incomplete" },
] as const;

function daysSince(iso: string | null) {
  if (!iso) return null;
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return d < 0 ? 0 : d;
}

function cpiFromScores(s: CoachClient["scores"]) {
  return Math.round((s.clarity + s.authority + s.reach + s.evidence + s.energy + s.revenue) / 6);
}

function ClientsAdmin() {
  const [search, setSearch] = useState("");
  const [goal, setGoal] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]["v"]>("all");
  const [selected, setSelected] = useState<CoachClient | null>(null);

  const fn = useServerFn(adminListClients);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-clients", search, goal, industry, status],
    queryFn: () => fn({ data: { search: search || undefined, goal: goal || undefined, industry: industry || undefined, status } }),
  });

  const rows = data ?? [];
  const kpis = useMemo(() => {
    const total = rows.length;
    const active7 = rows.filter((c) => (daysSince(c.last_active_date) ?? 9999) <= 7).length;
    const stalled = rows.filter((c) => (daysSince(c.last_active_date) ?? 9999) >= 14).length;
    const incomplete = rows.filter((c) => !c.onboarding_completed).length;
    const inInterview = rows.reduce((s, c) => s + c.jobs_interview, 0);
    const offers = rows.reduce((s, c) => s + c.jobs_offer, 0);
    const avgCpi = total ? Math.round(rows.reduce((s, c) => s + cpiFromScores(c.scores), 0) / total) : 0;
    return { total, active7, stalled, incomplete, inInterview, offers, avgCpi };
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Kpi label="Diamond clients" value={kpis.total} icon={Gem} accent="text-gold" />
        <Kpi label="Active · 7d" value={kpis.active7} icon={Flame} accent="text-electric" />
        <Kpi label="Stalled · 14d+" value={kpis.stalled} icon={AlertTriangle} accent="text-destructive" />
        <Kpi label="Onboarding gap" value={kpis.incomplete} icon={Target} accent="text-purple" />
        <Kpi label="In interview" value={kpis.inInterview} icon={Briefcase} accent="text-electric" />
        <Kpi label="Offers" value={kpis.offers} icon={Trophy} accent="text-gold" />
        <Kpi label="Avg CPI" value={kpis.avgCpi} icon={TrendingUp} accent="text-foreground" />
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl border p-3 flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-background/60 border border-border rounded-lg px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name…"
            className="flex-1 bg-transparent text-sm focus:outline-none" />
        </div>
        <Select value={goal} onChange={setGoal} placeholder="All goals" options={GOALS} />
        <Select value={industry} onChange={setIndustry} placeholder="All industries" options={INDUSTRIES} />
        <div className="flex gap-1 bg-background/60 border border-border rounded-lg p-1">
          {STATUSES.map((s) => (
            <button key={s.v} onClick={() => setStatus(s.v)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                status === s.v ? "bg-electric text-background" : "text-muted-foreground hover:text-foreground"
              }`}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-background/40">
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Goal · Timeline</th>
                <th className="text-left px-4 py-3">Challenge</th>
                <th className="text-right px-3 py-3">CPI</th>
                <th className="text-right px-3 py-3">Streak</th>
                <th className="text-right px-3 py-3">Missions</th>
                <th className="text-right px-3 py-3">Jobs</th>
                <th className="text-right px-3 py-3">Courses</th>
                <th className="text-right px-3 py-3">AI</th>
                <th className="text-right px-4 py-3">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">Loading clients…</td></tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">No clients match.</td></tr>
              )}
              {rows.map((c) => {
                const cpi = cpiFromScores(c.scores);
                const days = daysSince(c.last_active_date);
                const stale = days === null || days >= 14;
                return (
                  <tr key={c.id} onClick={() => setSelected(c)}
                    className="border-b border-border last:border-0 hover:bg-electric/5 cursor-pointer transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-gradient-to-br from-electric/40 to-purple/40 grid place-items-center text-xs font-bold">
                          {(c.first_name?.[0] ?? c.display_name?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-1.5">
                            {c.display_name}
                            {c.is_admin && <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-gold/20 text-gold">admin</span>}
                            {!c.onboarding_completed && <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple/20 text-purple">new</span>}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {c.job_title || "—"}{c.current_company ? ` · ${c.current_company}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{c.primary_goal || <span className="text-muted-foreground">—</span>}</div>
                      <div className="text-muted-foreground">{c.target_timeline || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{c.biggest_challenge || "—"}</td>
                    <td className="px-3 py-3 text-right font-mono text-electric">{cpi}</td>
                    <td className="px-3 py-3 text-right font-mono">
                      <span className="inline-flex items-center gap-1"><Flame className="size-3 text-gold" />{c.streak_days}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono">{c.missions_completed}</td>
                    <td className="px-3 py-3 text-right font-mono">
                      {c.jobs_active}<span className="text-muted-foreground">/{c.jobs_total}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono">
                      {c.courses_completed}<span className="text-muted-foreground">/{c.courses_completed + c.courses_in_progress}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-muted-foreground">{c.ai_conversations}</td>
                    <td className={`px-4 py-3 text-right text-xs font-mono ${stale ? "text-destructive" : "text-muted-foreground"}`}>
                      {days === null ? "never" : `${days}d`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <ClientDrawer client={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function Kpi({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: any; accent: string }) {
  return (
    <div className="glass rounded-xl p-3 border">
      <div className="flex items-center justify-between">
        <Icon className={`size-3.5 ${accent}`} />
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="font-display font-black text-2xl mt-1.5">{value}</div>
    </div>
  );
}

function Select({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-background/60 border border-border rounded-lg px-3 py-2 text-sm">
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ClientDrawer({ client: c, onClose }: { client: CoachClient; onClose: () => void }) {
  const cpi = cpiFromScores(c.scores);
  const days = daysSince(c.last_active_date);
  const pillars = [
    { k: "Clarity", v: c.scores.clarity }, { k: "Authority", v: c.scores.authority },
    { k: "Reach", v: c.scores.reach }, { k: "Evidence", v: c.scores.evidence },
    { k: "Energy", v: c.scores.energy }, { k: "Revenue", v: c.scores.revenue },
  ];
  const weakest = pillars.reduce((a, b) => (b.v < a.v ? b : a), pillars[0]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-full bg-gradient-to-br from-electric/40 to-purple/40 grid place-items-center font-bold">
                {(c.first_name?.[0] ?? c.display_name?.[0] ?? "?").toUpperCase()}
              </div>
              <div>
                <h2 className="font-display font-bold text-xl flex items-center gap-2">
                  {c.display_name}
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold/20 text-gold flex items-center gap-1"><Gem className="size-3" />Diamond</span>
                </h2>
                <p className="text-xs text-muted-foreground">{c.headline || c.job_title || "—"}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="size-8 grid place-items-center rounded-lg hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Identity */}
          <Section title="Identity">
            <Grid>
              <Item icon={Building2} label="Company">{c.current_company || "—"}</Item>
              <Item icon={Briefcase} label="Role">{c.job_title || "—"}</Item>
              <Item icon={MapPin} label="City">{c.city || "—"}</Item>
              <Item icon={Calendar} label="Experience">{c.years_experience ? `${c.years_experience} yrs` : "—"}</Item>
              <Item icon={Target} label="Industry">{c.industry || "—"}</Item>
              <Item icon={Linkedin} label="LinkedIn">
                {c.linkedin_url ? (
                  <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-electric inline-flex items-center gap-1">
                    Open <ExternalLink className="size-3" />
                  </a>
                ) : c.linkedin_status || "—"}
              </Item>
            </Grid>
          </Section>

          {/* Goal & challenge */}
          <Section title="Career Intent">
            <div className="grid gap-2 text-sm">
              <Row label="Primary goal">{c.primary_goal || "—"}</Row>
              <Row label="Target role">{c.target_role || "—"}</Row>
              <Row label="Timeline">{c.target_timeline || "—"}</Row>
              <Row label="Last promotion">{c.last_promotion || "—"}</Row>
              <Row label="Biggest challenge">
                <span className="text-destructive">{c.biggest_challenge || "—"}</span>
              </Row>
            </div>
          </Section>

          {/* CPI pillars */}
          <Section title={`Career Power Index · ${cpi}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {pillars.map((p) => (
                <div key={p.k} className={`rounded-lg border p-3 ${p.k === weakest.k ? "border-destructive/60 bg-destructive/5" : "border-border"}`}>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{p.k}</div>
                  <div className="font-display font-black text-2xl mt-1">{p.v}</div>
                  <div className="h-1 mt-2 rounded bg-muted overflow-hidden">
                    <div className="h-full bg-electric" style={{ width: `${Math.min(100, p.v)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Weakest pillar: <strong className="text-destructive">{weakest.k}</strong> — this is the leverage point for the next 7-day push.
            </p>
          </Section>

          {/* Activity */}
          <Section title="Engagement">
            <Grid>
              <Item icon={Flame} label="Streak">{c.streak_days}d</Item>
              <Item icon={Trophy} label="Missions done">{c.missions_completed}</Item>
              <Item icon={Briefcase} label="Jobs in pipeline">{c.jobs_active}/{c.jobs_total}</Item>
              <Item icon={GraduationCap} label="Courses">{c.courses_completed}/{c.courses_completed + c.courses_in_progress}</Item>
              <Item icon={MessageSquare} label="AI sessions">{c.ai_conversations}</Item>
              <Item icon={Calendar} label="Last active">{days === null ? "Never" : `${days}d ago`}</Item>
              <Item icon={TrendingUp} label="XP · Level">{c.xp.toLocaleString()} · L{c.level}</Item>
              <Item icon={Target} label="Onboarding">{c.onboarding_completed ? "Complete" : "Incomplete"}</Item>
            </Grid>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-electric mb-2">{title}</div>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}
function Item({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3 bg-background/40">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3" /> {label}
      </div>
      <div className="text-sm font-medium mt-1">{children}</div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-border/50 pb-2 last:border-0">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground w-32 shrink-0">{label}</span>
      <span className="text-sm flex-1">{children}</span>
    </div>
  );
}
