import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import {
  Plus, Briefcase, X, AlertTriangle, Sparkles, Mail, FileSearch,
  Download, Trash2, ExternalLink, CalendarClock, ChevronRight, PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import {
  listJobs, createJob, updateJob, moveJobStage, addJobNote, deleteJob,
  aiPrepStage, aiAnalyzeJd, aiFollowUp, STAGES, STAGE_LABELS, type Job, type Stage,
} from "@/lib/jobs.functions";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({ meta: [{ title: "Job Tracker — Bluechip CareerOS™" }] }),
  component: JobsPage,
});

const daysBetween = (iso: string) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

const fmtCTC = (min: number | null, max: number | null) => {
  if (!min && !max) return "—";
  if (min && max) return `₹${min}–${max} LPA`;
  return `₹${min ?? max} LPA`;
};

function stageColor(days: number) {
  if (days >= 14) return "bg-red-500";
  if (days >= 7) return "bg-amber-400";
  return "bg-emerald-500";
}

function JobsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listJobs);
  const moveFn = useServerFn(moveJobStage);
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => listFn(),
  });

  const [openNew, setOpenNew] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const moveMut = useMutation({
    mutationFn: (v: { id: string; stage: Stage }) => moveFn({ data: v }),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      if (res.xp) toast.success(`+${res.xp} XP — ${STAGE_LABELS[vars.stage]}`);
      if (vars.stage === "offer") {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 4000);
      }
    },
    onError: (e: any) => toast.error(e?.message || "Failed"),
  });

  const byStage = useMemo(() => {
    const m = Object.fromEntries(STAGES.map((s) => [s, [] as Job[]])) as Record<Stage, Job[]>;
    for (const j of jobs) m[j.stage]?.push(j);
    return m;
  }, [jobs]);

  const active = jobs.filter((j) => j.stage !== "closed");
  const applied = jobs.filter((j) =>
    ["applied", "phone_screen", "interview", "final_round", "offer"].includes(j.stage),
  );
  const interviewed = jobs.filter((j) =>
    ["interview", "final_round", "offer"].includes(j.stage),
  );
  const offers = jobs.filter((j) => j.stage === "offer");
  const interviewRate = applied.length
    ? Math.round((interviewed.length / applied.length) * 100)
    : 0;
  const offerRate = applied.length
    ? Math.round((offers.length / applied.length) * 100)
    : 0;
  const avgDays = (() => {
    if (!jobs.length) return 0;
    const total = jobs.reduce((s, j) => s + daysBetween(j.stage_entered_at), 0);
    return Math.round(total / jobs.length);
  })();

  const weekAgo = Date.now() - 7 * 86400000;
  const addedThisWeek = jobs.filter((j) => new Date(j.created_at).getTime() >= weekAgo).length;
  const movedThisWeek = jobs.filter(
    (j) => new Date(j.stage_entered_at).getTime() >= weekAgo,
  ).length;
  const today = new Date().toISOString().slice(0, 10);
  const followUpsDue = jobs.filter((j) => j.follow_up_date && j.follow_up_date <= today && j.stage !== "closed");
  const nextInterview = jobs
    .filter((j) => j.follow_up_date && ["interview", "final_round", "phone_screen"].includes(j.stage))
    .sort((a, b) => (a.follow_up_date! < b.follow_up_date! ? -1 : 1))[0];

  // 8-week chart
  const weeks = useMemo(() => {
    const out: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i * 7 - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const count = jobs.filter((j) => {
        const t = new Date(j.created_at).getTime();
        return t >= start.getTime() && t < end.getTime();
      }).length;
      out.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, count });
    }
    return out;
  }, [jobs]);
  const maxCount = Math.max(1, ...weeks.map((w) => w.count));

  const exportCsv = () => {
    const headers = [
      "company", "role", "stage", "ctc_min", "ctc_max", "source",
      "recruiter_name", "priority", "follow_up_date", "created_at", "stage_entered_at", "notes",
    ];
    const rows = jobs.map((j) =>
      headers.map((h) => {
        const v = (j as any)[h];
        if (v === null || v === undefined) return "";
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobs-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-6 py-8 max-w-[1600px] mx-auto">
      {celebrate && <Celebrate />}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-electric flex items-center gap-2">
            <Briefcase className="size-3" /> Pipeline
          </div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-1">Job Tracker</h1>
          <p className="text-muted-foreground mt-1 text-sm">Run your search like an operator. Track every conversation, drive every stage.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium inline-flex items-center gap-2 hover:bg-accent/50">
            <Download className="size-4" /> Export CSV
          </button>
          <button onClick={() => setOpenNew(true)} className="px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-bold inline-flex items-center gap-2">
            <Plus className="size-4" /> Add Job
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi label="Active applications" value={active.length} />
        <Kpi label="Interview rate" value={`${interviewRate}%`} />
        <Kpi label="Offer rate" value={`${offerRate}%`} />
        <Kpi label="Avg days / stage" value={avgDays} />
      </div>

      {/* This week */}
      <div className="glass rounded-2xl p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Mini label="Added this week" value={addedThisWeek} />
        <Mini label="Stages moved" value={movedThisWeek} />
        <Mini label="Follow-ups due" value={followUpsDue.length} tone={followUpsDue.length ? "amber" : "neutral"} />
        <Mini
          label="Next interview"
          value={nextInterview ? `${nextInterview.company} · ${nextInterview.follow_up_date}` : "—"}
          small
        />
      </div>

      {/* Kanban */}
      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading pipeline…</div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {STAGES.map((s) => (
              <Column
                key={s}
                stage={s}
                jobs={byStage[s]}
                onOpen={(id) => setOpenId(id)}
                onMove={(id, stage) => moveMut.mutate({ id, stage })}
              />
            ))}
          </div>
        </div>
      )}

      {/* 8-week chart */}
      <div className="glass rounded-2xl p-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold">Applications · last 8 weeks</h3>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Trend</div>
        </div>
        <div className="flex items-end gap-3 h-32">
          {weeks.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-electric/60 to-electric"
                style={{ height: `${(w.count / maxCount) * 100}%`, minHeight: 2 }}
                title={`${w.count} applications`}
              />
              <div className="text-[10px] font-mono text-muted-foreground">{w.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panels */}
      {openNew && <NewJobPanel onClose={() => setOpenNew(false)} />}
      {openId && (
        <JobDetailPanel
          jobId={openId}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

/* ───────── components ───────── */

function Kpi({ label, value }: { label: string; value: any }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display font-black text-3xl text-gradient-brand mt-1">{value}</div>
    </div>
  );
}

function Mini({ label, value, tone, small }: { label: string; value: any; tone?: "amber" | "neutral"; small?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display font-bold mt-1 ${small ? "text-base" : "text-2xl"} ${tone === "amber" ? "text-amber-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Column({
  stage, jobs, onOpen, onMove,
}: {
  stage: Stage;
  jobs: Job[];
  onOpen: (id: string) => void;
  onMove: (id: string, stage: Stage) => void;
}) {
  return (
    <div className="w-72 shrink-0 bg-card/40 border border-border rounded-2xl flex flex-col max-h-[70vh]">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{STAGE_LABELS[stage]}</div>
          <div className="font-display font-bold text-lg">{jobs.length}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {jobs.length === 0 && (
          <div className="text-xs text-muted-foreground italic px-2 py-4 text-center">No cards</div>
        )}
        {jobs.map((j) => {
          const days = daysBetween(j.stage_entered_at);
          const stale = days >= 10 && stage !== "offer" && stage !== "closed";
          const stageIdx = STAGES.indexOf(stage);
          return (
            <div
              key={j.id}
              onClick={() => onOpen(j.id)}
              className="bg-background/60 border border-border rounded-xl p-3 cursor-pointer hover:border-electric/50 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-display font-bold text-base leading-tight">{j.company}</div>
                <span className={`size-2 rounded-full mt-1.5 shrink-0 ${stageColor(days)}`} />
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{j.role}</div>
              <div className="text-[11px] mt-2 text-electric font-mono">{fmtCTC(j.ctc_min, j.ctc_max)}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {days}d in stage · added {new Date(j.created_at).toLocaleDateString()}
              </div>
              {j.notes && (
                <div className="text-[11px] text-muted-foreground mt-2 line-clamp-1 italic">"{j.notes}"</div>
              )}
              {stale && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400">
                  <AlertTriangle className="size-3" /> No movement {days}d
                </div>
              )}
              <div className="mt-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                {stageIdx > 0 && (
                  <button
                    onClick={() => onMove(j.id, STAGES[stageIdx - 1])}
                    className="text-[10px] px-2 py-1 rounded-md border border-border hover:bg-accent/50"
                    title={`Move to ${STAGE_LABELS[STAGES[stageIdx - 1]]}`}
                  >
                    ←
                  </button>
                )}
                {stageIdx < STAGES.length - 1 && (
                  <button
                    onClick={() => onMove(j.id, STAGES[stageIdx + 1])}
                    className="text-[10px] px-2 py-1 rounded-md border border-border hover:bg-accent/50 ml-auto"
                    title={`Move to ${STAGE_LABELS[STAGES[stageIdx + 1]]}`}
                  >
                    {STAGE_LABELS[STAGES[stageIdx + 1]]} <ChevronRight className="inline size-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── New Job panel ───────── */

function NewJobPanel({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const createFn = useServerFn(createJob);
  const mut = useMutation({
    mutationFn: (v: any) => createFn({ data: v }),
    onSuccess: () => {
      toast.success("Job added");
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.message || "Failed"),
  });

  const [form, setForm] = useState({
    company: "", role: "", job_url: "", jd_text: "",
    ctc_min: "", ctc_max: "", source: "LinkedIn",
    recruiter_name: "", recruiter_contact: "",
    target_start_date: "", priority: "medium" as "high" | "medium" | "low",
    notes: "", stage: "wishlist" as Stage, follow_up_date: "",
  });

  const submit = () => {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    mut.mutate({
      ...form,
      ctc_min: form.ctc_min ? Number(form.ctc_min) : null,
      ctc_max: form.ctc_max ? Number(form.ctc_max) : null,
      target_start_date: form.target_start_date || null,
      follow_up_date: form.follow_up_date || null,
      job_url: form.job_url || null,
      jd_text: form.jd_text || null,
      source: form.source || null,
      recruiter_name: form.recruiter_name || null,
      recruiter_contact: form.recruiter_contact || null,
    });
  };

  return (
    <SlideOver title="Add Job" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Company *"><input className="inp" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
        <Field label="Role / Title *"><input className="inp" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
        <Field label="Job URL"><input className="inp" placeholder="https://…" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTC min (₹ LPA)"><input type="number" className="inp" value={form.ctc_min} onChange={(e) => setForm({ ...form, ctc_min: e.target.value })} /></Field>
          <Field label="CTC max (₹ LPA)"><input type="number" className="inp" value={form.ctc_max} onChange={(e) => setForm({ ...form, ctc_max: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source">
            <select className="inp" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {["LinkedIn", "Naukri", "Referral", "Company website", "Recruiter", "Other"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select className="inp" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </Field>
        </div>
        <Field label="Recruiter name"><input className="inp" value={form.recruiter_name} onChange={(e) => setForm({ ...form, recruiter_name: e.target.value })} /></Field>
        <Field label="Recruiter LinkedIn / Email"><input className="inp" value={form.recruiter_contact} onChange={(e) => setForm({ ...form, recruiter_contact: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Target start date"><input type="date" className="inp" value={form.target_start_date} onChange={(e) => setForm({ ...form, target_start_date: e.target.value })} /></Field>
          <Field label="Follow-up date"><input type="date" className="inp" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} /></Field>
        </div>
        <Field label="Current stage">
          <select className="inp" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}>
            {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
          </select>
        </Field>
        <Field label="JD text (paste for AI analysis)"><textarea className="inp h-24" value={form.jd_text} onChange={(e) => setForm({ ...form, jd_text: e.target.value })} /></Field>
        <Field label="Initial notes"><textarea className="inp h-20" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>

        <button onClick={submit} disabled={mut.isPending} className="w-full py-3 rounded-xl bg-gradient-brand text-white font-bold mt-4 disabled:opacity-50">
          {mut.isPending ? "Saving…" : "Save job"}
        </button>
      </div>
    </SlideOver>
  );
}

/* ───────── Detail panel ───────── */

function JobDetailPanel({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listJobs);
  const updFn = useServerFn(updateJob);
  const noteFn = useServerFn(addJobNote);
  const delFn = useServerFn(deleteJob);
  const prepFn = useServerFn(aiPrepStage);
  const jdFn = useServerFn(aiAnalyzeJd);
  const followFn = useServerFn(aiFollowUp);

  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: () => listFn() });
  const job = jobs.find((j) => j.id === jobId);
  const [noteText, setNoteText] = useState("");
  const [aiOut, setAiOut] = useState<{ kind: string; content: string } | null>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null);

  const [patch, setPatch] = useState<Partial<Job>>({});
  useEffect(() => setPatch({}), [jobId]);

  if (!job) return null;
  const merged = { ...job, ...patch };

  const save = async () => {
    if (!Object.keys(patch).length) return onClose();
    try {
      await updFn({ data: { id: job.id, ...patch } as any });
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["jobs"] });
    } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    await noteFn({ data: { id: job.id, text: noteText.trim() } });
    setNoteText("");
    qc.invalidateQueries({ queryKey: ["jobs"] });
  };

  const runAI = async (kind: "prep" | "jd" | "follow") => {
    setAiBusy(kind);
    setAiOut(null);
    try {
      const fn = kind === "prep" ? prepFn : kind === "jd" ? jdFn : followFn;
      const { content } = await fn({ data: { id: job.id } });
      setAiOut({ kind, content });
    } catch (e: any) {
      toast.error(e?.message || "AI failed");
    } finally {
      setAiBusy(null);
    }
  };

  const del = async () => {
    if (!confirm(`Delete ${job.company} – ${job.role}?`)) return;
    await delFn({ data: { id: job.id } });
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["jobs"] });
    onClose();
  };

  const stale = daysBetween(job.stage_entered_at) >= 10 && job.stage !== "closed" && job.stage !== "offer";

  return (
    <SlideOver title={merged.company} subtitle={merged.role} onClose={save} wide>
      <div className="flex justify-end -mt-3 mb-3">
        <button onClick={del} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
          <Trash2 className="size-3" /> Delete
        </button>
      </div>

      {stale && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 mb-4">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <AlertTriangle className="size-4" /> No movement in {daysBetween(job.stage_entered_at)} days
          </div>
          <p className="text-xs text-muted-foreground mt-1">Draft a warm follow-up to keep this alive.</p>
          <button onClick={() => runAI("follow")} className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-amber-400/20 border border-amber-400/40 hover:bg-amber-400/30 inline-flex items-center gap-1">
            <Mail className="size-3" /> Draft follow-up
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Company"><input className="inp" value={merged.company} onChange={(e) => setPatch({ ...patch, company: e.target.value })} /></Field>
        <Field label="Role"><input className="inp" value={merged.role} onChange={(e) => setPatch({ ...patch, role: e.target.value })} /></Field>
        <Field label="CTC min"><input type="number" className="inp" value={merged.ctc_min ?? ""} onChange={(e) => setPatch({ ...patch, ctc_min: e.target.value ? Number(e.target.value) : null })} /></Field>
        <Field label="CTC max"><input type="number" className="inp" value={merged.ctc_max ?? ""} onChange={(e) => setPatch({ ...patch, ctc_max: e.target.value ? Number(e.target.value) : null })} /></Field>
        <Field label="Recruiter"><input className="inp" value={merged.recruiter_name ?? ""} onChange={(e) => setPatch({ ...patch, recruiter_name: e.target.value })} /></Field>
        <Field label="Contact"><input className="inp" value={merged.recruiter_contact ?? ""} onChange={(e) => setPatch({ ...patch, recruiter_contact: e.target.value })} /></Field>
        <Field label="Priority">
          <select className="inp" value={merged.priority} onChange={(e) => setPatch({ ...patch, priority: e.target.value as any })}>
            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
        </Field>
        <Field label="Follow-up">
          <input type="date" className="inp" value={merged.follow_up_date ?? ""} onChange={(e) => setPatch({ ...patch, follow_up_date: e.target.value || null })} />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Job URL">
          <div className="flex gap-2">
            <input className="inp flex-1" value={merged.job_url ?? ""} onChange={(e) => setPatch({ ...patch, job_url: e.target.value })} />
            {merged.job_url && (
              <a href={merged.job_url} target="_blank" rel="noreferrer" className="px-3 rounded-lg border border-border inline-flex items-center"><ExternalLink className="size-4" /></a>
            )}
          </div>
        </Field>
      </div>
      <div className="mt-3">
        <Field label="JD text"><textarea className="inp h-28" value={merged.jd_text ?? ""} onChange={(e) => setPatch({ ...patch, jd_text: e.target.value })} /></Field>
      </div>
      <div className="mt-3">
        <Field label="Notes"><textarea className="inp h-20" value={merged.notes ?? ""} onChange={(e) => setPatch({ ...patch, notes: e.target.value })} /></Field>
      </div>

      {/* AI actions */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <AIBtn busy={aiBusy === "prep"} onClick={() => runAI("prep")} icon={<Sparkles className="size-4" />} label="Prepare for Next Stage" />
        <AIBtn busy={aiBusy === "jd"} onClick={() => runAI("jd")} icon={<FileSearch className="size-4" />} label="Analyze This JD" />
        <AIBtn busy={aiBusy === "follow"} onClick={() => runAI("follow")} icon={<Mail className="size-4" />} label="Draft Follow-up" />
      </div>

      {aiOut && (
        <div className="mt-4 glass rounded-xl p-4 border border-electric/30">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-electric">AI · {aiOut.kind}</div>
            <button onClick={() => setAiOut(null)} className="text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
          </div>
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{aiOut.content}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Stage history */}
      <div className="mt-6">
        <h4 className="font-display font-bold text-sm mb-2 flex items-center gap-2"><CalendarClock className="size-4 text-electric" /> Stage history</h4>
        <div className="space-y-1.5 text-xs">
          {[...(job.stage_history ?? [])].reverse().map((h, i) => (
            <div key={i} className="flex items-center justify-between border-l-2 border-electric/40 pl-3 py-1">
              <span className="font-medium">{STAGE_LABELS[h.stage]}</span>
              <span className="text-muted-foreground">{new Date(h.at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes log */}
      <div className="mt-6">
        <h4 className="font-display font-bold text-sm mb-2">Notes log</h4>
        <div className="flex gap-2">
          <input
            className="inp flex-1"
            placeholder='e.g. "Phone screen with Priya, discussed P&L scope"'
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />
          <button onClick={addNote} className="px-3 rounded-lg bg-electric/20 border border-electric/40 text-sm">Add</button>
        </div>
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {(job.notes_log ?? []).map((n, i) => (
            <div key={i} className="text-xs bg-card/40 border border-border rounded-lg p-2">
              <div className="text-[10px] font-mono text-muted-foreground">{new Date(n.at).toLocaleString()}</div>
              <div>{n.text}</div>
            </div>
          ))}
          {!(job.notes_log ?? []).length && <div className="text-xs italic text-muted-foreground">No notes yet.</div>}
        </div>
      </div>
    </SlideOver>
  );
}

function AIBtn({ busy, onClick, icon, label }: { busy: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="px-3 py-2.5 rounded-xl border border-border bg-card/40 hover:bg-accent/40 text-xs font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
    >
      {icon} {busy ? "Working…" : label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SlideOver({
  title, subtitle, onClose, children, wide,
}: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60" onClick={onClose} />
      <div className={`${wide ? "w-full max-w-2xl" : "w-full max-w-lg"} h-full bg-background border-l border-border overflow-y-auto p-6`}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display font-extrabold text-2xl">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>
        {children}
        <style>{`.inp{width:100%;background:hsl(var(--background)/0.5);border:1px solid hsl(var(--border));border-radius:0.625rem;padding:0.55rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:rgb(34,211,238)}`}</style>
      </div>
    </div>
  );
}

function Celebrate() {
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none grid place-items-center">
      <div className="bg-gradient-brand text-white px-8 py-6 rounded-3xl shadow-2xl flex items-center gap-3 animate-in zoom-in-50">
        <PartyPopper className="size-8" />
        <div>
          <div className="font-display font-black text-2xl">Offer logged!</div>
          <div className="text-sm opacity-90">+100 XP · Your hard work just paid off.</div>
        </div>
      </div>
    </div>
  );
}
