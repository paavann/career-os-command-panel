import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CalendarDays, Check, CheckCircle2, Circle, ClipboardCheck, FileText, Flag, Gem, Loader2, Pencil, Plus, Sparkles, Target, Trash2, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  completeFoundationAction,
  deleteCareerProof,
  getCommandCenter,
  saveCareerProof,
  saveDiamondGoal,
  saveWeeklyReview,
  toggleGoalMilestone,
  type CareerProof,
  type DiamondGoal,
} from "@/lib/command-center.functions";
import { completeGoalMission, type MeData } from "@/lib/me.functions";
import { trackForGoal } from "@/lib/goal-tracks";
import type { PillarKey } from "@/lib/engines";

type Props = { data: MeData; openEngine: (pillar: PillarKey) => void };
type DraftMilestone = { id?: string; title: string; description: string; targetDate: string; sortOrder: number };
type GoalDraft = { title: string; targetRole: string; targetDate: string; milestones: DraftMilestone[] };
type ProofDraft = { id?: string; title: string; proofType: string; description: string; impact: string; metric: string; proofDate: string };

const PILLARS: Array<{ key: PillarKey; label: string; letter: string }> = [
  { key: "clarity", label: "Clarity", letter: "C" }, { key: "authority", label: "Authority", letter: "A" },
  { key: "reach", label: "Reach", letter: "R" }, { key: "evidence", label: "Evidence", letter: "E" },
  { key: "energy", label: "Energy", letter: "E" }, { key: "revenue", label: "Revenue", letter: "R" },
];

const RECOMMENDATIONS: Record<PillarKey, string> = {
  clarity: "Define the role and measurable outcome you are pursuing in one sentence.",
  authority: "Publish one clear point of view that demonstrates your expertise.",
  reach: "Start three intentional conversations in your target market.",
  evidence: "Turn one career win into quantified proof of impact.",
  energy: "Practice one concise executive update before your next key meeting.",
  revenue: "Benchmark your target role and document three negotiation levers.",
};

const PHASES = [
  { month: "Month 1", phase: "BUILD", description: "Build the assets and proof your next move requires." },
  { month: "Month 2", phase: "AMPLIFY", description: "Increase visibility and activate the right relationships." },
  { month: "Month 3", phase: "CONVERT", description: "Turn momentum into interviews, influence, or revenue." },
] as const;

const emptyProof: ProofDraft = { title: "", proofType: "Achievement", description: "", impact: "", metric: "", proofDate: "" };

export function CareerExecutionEngine({ data, openEngine }: Props) {
  const qc = useQueryClient();
  const getCenter = useServerFn(getCommandCenter);
  const completeGoal = useServerFn(completeGoalMission);
  const toggleMilestone = useServerFn(toggleGoalMilestone);
  const saveProof = useServerFn(saveCareerProof);
  const removeProof = useServerFn(deleteCareerProof);
  const saveReview = useServerFn(saveWeeklyReview);
  const [goalOpen, setGoalOpen] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);
  const [proofDraft, setProofDraft] = useState<ProofDraft>(emptyProof);
  const [reviewOpen, setReviewOpen] = useState(false);
  const center = useQuery({ queryKey: ["command-center"], queryFn: () => getCenter() });

  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["command-center"] }), qc.invalidateQueries({ queryKey: ["me"] }), qc.invalidateQueries({ queryKey: ["leaderboard"] })]);
  const actionMut = useMutation({
    mutationFn: (slug: string) => completeGoal({ data: { slug } }),
    onSuccess: async (result) => { toast.success(result.alreadyDone ? "Already complete this week" : `Action complete · +${result.xp} XP`); await refresh(); },
    onError: (error: Error) => toast.error(error.message),
  });
  const milestoneMut = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => toggleMilestone({ data: { id, completed } }),
    onSuccess: refresh,
    onError: (error: Error) => toast.error(error.message),
  });
  const proofMut = useMutation({
    mutationFn: () => saveProof({ data: { ...proofDraft, proofDate: proofDraft.proofDate || null } }),
    onSuccess: async () => { toast.success(proofDraft.id ? "Career proof updated" : "Career proof added"); setProofOpen(false); setProofDraft(emptyProof); await refresh(); },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => removeProof({ data: { id } }),
    onSuccess: async () => { toast.success("Career proof removed"); await refresh(); },
    onError: (error: Error) => toast.error(error.message),
  });

  const weakest = useMemo(() => PILLARS.reduce((lowest, item) => data.scores[item.key] < data.scores[lowest.key] ? item : lowest, PILLARS[0]), [data.scores]);
  const assessmentComplete = PILLARS.every((pillar) => data.scores[pillar.key] > 0);
  const track = trackForGoal(data.profile.primary_goal);
  const goal = center.data?.goal ?? null;
  const proofs = center.data?.proofs ?? [];
  const weeklyDone = new Set(center.data?.weeklyProgress.completedSlugs ?? []);
  const completedMilestones = goal?.milestones.filter((milestone) => milestone.completed).length ?? 0;

  const editProof = (proof: CareerProof) => {
    setProofDraft({ id: proof.id, title: proof.title, proofType: proof.proof_type, description: proof.description, impact: proof.impact, metric: proof.metric, proofDate: proof.proof_date ?? "" });
    setProofOpen(true);
  };

  if (center.isLoading) return <div className="border-y border-border py-16 grid place-items-center"><Loader2 className="size-5 animate-spin text-gold" /></div>;
  if (center.isError) return <div className="border-y border-border py-10 text-center"><p className="text-sm text-destructive">Your Career Execution Engine could not load.</p><Button variant="outline" className="mt-4" onClick={() => center.refetch()}>Try again</Button></div>;

  return (
    <div className="space-y-12">
      <NorthStar goal={goal} data={data} setGoalOpen={setGoalOpen} completedMilestones={completedMilestones} />

      <section aria-labelledby="checkup-title">
        <SectionHeading eyebrow="Career Checkup 2.0" title="Your biggest gap" aside={<div className="text-right"><div className="font-display text-4xl font-black text-gold">{data.profile.cpi_score}</div><div className="text-[10px] uppercase text-muted-foreground">Career Power Index</div></div>} />
        <div className="grid lg:grid-cols-[1fr_0.45fr] gap-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PILLARS.map((item) => <button key={item.key} onClick={() => openEngine(item.key)} className={`border rounded-lg p-4 text-left transition-colors hover:border-electric/50 ${item.key === weakest.key ? "border-gold/40 bg-gold/5" : "border-border bg-card/50"}`}><div className="flex justify-between text-sm"><span>{item.letter} · {item.label}</span><b>{data.scores[item.key]}</b></div><Progress value={data.scores[item.key]} className="mt-3 h-1.5" /></button>)}
          </div>
          <div className="border-l-2 border-gold pl-5 py-2">
            <p className="text-xs uppercase text-gold">Priority · {weakest.label}</p>
            <p className="mt-2 text-sm text-muted-foreground">{assessmentComplete ? RECOMMENDATIONS[weakest.key] : "Complete all six C.A.R.E.E.R. assessments to establish a reliable baseline and recommendation."}</p>
            <Button variant="link" className="px-0 mt-2" onClick={() => openEngine(weakest.key)}>{assessmentComplete ? `Strengthen ${weakest.label}` : "Continue checkup"} <ArrowRight className="size-4" /></Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="plan-title">
        <SectionHeading eyebrow="Personalized 90-Day Plan" title="Build. Amplify. Convert." />
        {goal ? <div className="grid md:grid-cols-3 gap-4">{PHASES.map((phase, index) => {
          const milestone = goal.milestones[index];
          const fallback = index === 0 ? RECOMMENDATIONS[weakest.key] : index === 1 ? track.missions[1]?.title : track.missions[2]?.title;
          return <article key={phase.phase} className="border border-border bg-card/50 rounded-lg p-5"><p className="text-[10px] font-mono uppercase text-muted-foreground">{phase.month}</p><h3 className="mt-2 font-display text-xl font-bold text-electric">{phase.phase}</h3><p className="mt-2 text-sm text-muted-foreground">{phase.description}</p><div className="mt-5 border-t border-border pt-4"><p className="text-xs uppercase text-gold">Primary action</p><p className="mt-2 text-sm font-medium">{milestone?.title || fallback}</p></div></article>;
        })}</div> : <EmptyState title="Set your North Star first" body="Your three-month execution plan will be built from your goal, biggest gap, and existing CareerOS actions." action="Set 90-Day Goal" onClick={() => setGoalOpen(true)} />}
      </section>

      <section aria-labelledby="sprint-title">
        <SectionHeading eyebrow="This Week" title="Your 3 priority actions" aside={<span className="text-sm text-muted-foreground">{track.missions.filter((item) => weeklyDone.has(item.slug)).length}/3 complete</span>} />
        <div className="grid md:grid-cols-3 gap-4">{track.missions.slice(0, 3).map((action) => {
          const done = weeklyDone.has(action.slug);
          return <article key={action.slug} className={`border rounded-lg p-5 flex flex-col min-h-56 ${done ? "border-electric/30 bg-electric/5" : "border-border bg-card/60"}`}><div className="flex justify-between"><span className="text-xs uppercase text-muted-foreground">{action.pillar}</span><span className="text-xs font-semibold text-gold">+{action.xp} XP</span></div><div className="mt-5 flex items-start gap-3">{done ? <CheckCircle2 className="size-5 text-electric shrink-0" /> : <Circle className="size-5 text-muted-foreground shrink-0" />}<h3 className="font-semibold leading-tight">{action.title}</h3></div><p className="mt-3 text-sm text-muted-foreground flex-1">This moves your {track.goal.toLowerCase()} goal forward while strengthening {action.pillar}.</p><Button variant={done ? "ghost" : "outline"} disabled={done || actionMut.isPending} onClick={() => actionMut.mutate(action.slug)} className="mt-5 justify-between">{done ? "Completed" : "Complete action"}{done ? <Check className="size-4" /> : <ArrowRight className="size-4" />}</Button></article>;
        })}</div>
      </section>

      <section aria-labelledby="proof-title">
        <SectionHeading eyebrow="Career Proof Bank" title="Evidence that compounds" aside={<Button size="sm" onClick={() => { setProofDraft(emptyProof); setProofOpen(true); }}><Plus className="size-4" /> Add proof</Button>} />
        {proofs.length ? <div className="grid md:grid-cols-2 gap-4">{proofs.map((proof) => <article key={proof.id} className="border border-border bg-card/50 rounded-lg p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-mono uppercase text-electric">{proof.proof_type}</p><h3 className="mt-2 font-semibold">{proof.title}</h3></div><div className="flex"><Button variant="ghost" size="icon" aria-label={`Edit ${proof.title}`} onClick={() => editProof(proof)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${proof.title}`} disabled={deleteMut.isPending} onClick={() => deleteMut.mutate(proof.id)}><Trash2 className="size-4 text-destructive" /></Button></div></div>{proof.description && <p className="mt-3 text-sm text-muted-foreground">{proof.description}</p>}<div className="mt-4 flex flex-wrap gap-2 text-xs">{proof.metric && <span className="border border-gold/30 bg-gold/5 rounded px-2 py-1 text-gold">{proof.metric}</span>}{proof.impact && <span className="border border-border rounded px-2 py-1">{proof.impact}</span>}</div></article>)}</div> : <EmptyState title="Your proof bank is ready" body="Add a result, recognition, project, or leadership moment you can reuse in interviews, reviews, and negotiations." action="Add first proof" onClick={() => { setProofDraft(emptyProof); setProofOpen(true); }} />}
      </section>

      <section aria-labelledby="progress-title">
        <SectionHeading eyebrow="Progress" title="Visible movement" aside={<Button variant="outline" size="sm" onClick={() => setReviewOpen(true)}><ClipboardCheck className="size-4" /> Weekly review</Button>} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3"><Stat label="Goal" value={`${goal?.progress ?? 0}%`} icon={<Target />} /><Stat label="Milestones" value={`${completedMilestones}/${goal?.milestones.length ?? 0}`} icon={<Flag />} /><Stat label="Actions this week" value={`${center.data?.weeklyProgress.completedActions ?? 0}`} icon={<CheckCircle2 />} /><Stat label="XP this week" value={`${center.data?.weeklyProgress.xp ?? 0}`} icon={<Zap />} /><Stat label="Career proofs" value={`${proofs.length}`} icon={<FileText />} /></div>
        {goal && <div className="mt-6 border-y border-border divide-y divide-border">{goal.milestones.map((milestone, index) => <button key={milestone.id} disabled={milestoneMut.isPending} onClick={() => milestoneMut.mutate({ id: milestone.id, completed: !milestone.completed })} className="w-full py-4 flex items-start gap-4 text-left hover:bg-accent/20 transition-colors"><span className={`mt-0.5 size-7 rounded-full border grid place-items-center shrink-0 ${milestone.completed ? "border-electric bg-electric text-primary-foreground" : "border-border"}`}>{milestone.completed ? <Check className="size-4" /> : index + 1}</span><span className="min-w-0 flex-1"><span className={`block font-semibold ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>{milestone.title}</span>{milestone.description && <span className="block text-sm text-muted-foreground mt-1">{milestone.description}</span>}</span><span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">{milestone.target_date ? formatDate(milestone.target_date) : "No date"}</span></button>)}</div>}
      </section>

      <GoalDialog open={goalOpen} setOpen={setGoalOpen} goal={goal} profileGoal={data.profile.primary_goal} profileRole={data.profile.target_role} />
      <ProofDialog open={proofOpen} setOpen={setProofOpen} form={proofDraft} setForm={setProofDraft} pending={proofMut.isPending} save={() => proofMut.mutate()} />
      <ReviewDialog open={reviewOpen} setOpen={setReviewOpen} review={center.data?.weeklyReview ?? null} summary={{ actions: center.data?.weeklyProgress.completedActions ?? 0, xp: center.data?.weeklyProgress.xp ?? 0, proofs: proofs.length, milestones: completedMilestones, goal: goal?.progress ?? 0 }} saveReview={saveReview} refresh={refresh} />
    </div>
  );
}

function NorthStar({ goal, data, setGoalOpen, completedMilestones }: { goal: DiamondGoal | null; data: MeData; setGoalOpen: (open: boolean) => void; completedMilestones: number }) {
  return <section aria-labelledby="north-star-title" className="border-y border-gold/30 bg-card/40"><div className="py-7 md:py-9 grid lg:grid-cols-[1.35fr_0.65fr] gap-8"><div><div className="flex items-center gap-2 text-[11px] font-mono uppercase text-gold"><Gem className="size-4" /> My Goal · Diamond North Star</div>{goal ? <><div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"><div><h2 id="north-star-title" className="font-display text-3xl md:text-4xl font-black">{goal.title}</h2><p className="mt-2 text-muted-foreground">{goal.target_role || data.profile.target_role || "Target outcome not specified"} · {formatDate(goal.target_date)}</p></div><Button variant="outline" size="sm" onClick={() => setGoalOpen(true)}><Pencil className="size-4" /> Edit goal</Button></div><div className="mt-7 flex items-center gap-4"><Progress value={goal.progress} className="h-2.5 bg-gold/15 [&>div]:bg-gold" /><span className="font-display text-2xl font-black text-gold tabular-nums">{goal.progress}%</span></div><div className="mt-2 text-xs text-muted-foreground">{completedMilestones} of {goal.milestones.length} milestones complete · {daysRemaining(goal.target_date)} days remaining</div></> : <div className="mt-5"><h2 id="north-star-title" className="font-display text-3xl md:text-4xl font-black">Set one outcome for the next 90 days.</h2><p className="mt-2 text-muted-foreground max-w-xl">Create one clear North Star and three to five measurable milestones.</p><Button className="mt-6 bg-gold text-background hover:bg-gold/90" onClick={() => setGoalOpen(true)}>Set My Goal <ArrowRight className="size-4" /></Button></div>}</div><div className="lg:border-l lg:border-border lg:pl-8"><p className="text-[11px] font-mono uppercase text-muted-foreground">Primary focus</p><p className="mt-3 font-display text-2xl font-bold">{data.profile.primary_goal || goal?.target_role || "Choose your career goal"}</p><p className="mt-2 text-sm text-muted-foreground">{data.profile.biggest_challenge || "Complete your Diamond Profile to sharpen your execution plan."}</p>{!data.profile.primary_goal && <Button asChild variant="link" className="mt-3 px-0 text-gold"><Link to="/profile">Complete your profile <ArrowRight className="size-4" /></Link></Button>}</div></div></section>;
}

function GoalDialog({ open, setOpen, goal, profileGoal, profileRole }: { open: boolean; setOpen: (open: boolean) => void; goal: DiamondGoal | null; profileGoal: string | null; profileRole: string | null }) {
  const save = useServerFn(saveDiamondGoal); const completeAction = useServerFn(completeFoundationAction); const qc = useQueryClient();
  const defaultDate = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
  const initial = (): GoalDraft => ({ title: goal?.title ?? profileGoal ?? "", targetRole: goal?.target_role ?? profileRole ?? "", targetDate: goal?.target_date ?? defaultDate, milestones: goal?.milestones.map((m) => ({ id: m.id, title: m.title, description: m.description, targetDate: m.target_date ?? "", sortOrder: m.sort_order })) ?? Array.from({ length: 3 }, (_, i) => ({ title: "", description: "", targetDate: "", sortOrder: i })) });
  const [form, setForm] = useState(initial);
  useEffect(() => { if (open) setForm(initial()); }, [open, goal]);
  const mut = useMutation({ mutationFn: async () => { await save({ data: { id: goal?.id, title: form.title, targetRole: form.targetRole, targetDate: form.targetDate, timeline: "90 days", milestones: form.milestones.map((m, i) => ({ ...m, targetDate: m.targetDate || null, sortOrder: i })) } }); return completeAction({ data: { slug: "ninety-day-goal" } }); }, onSuccess: async () => { toast.success("Your 90-day North Star is saved"); setOpen(false); await Promise.all([qc.invalidateQueries({ queryKey: ["command-center"] }), qc.invalidateQueries({ queryKey: ["me"] })]); }, onError: (error: Error) => toast.error(error.message) });
  const updateMilestone = (index: number, patch: Partial<DraftMilestone>) => setForm((old) => ({ ...old, milestones: old.milestones.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="font-display text-2xl">Set your Diamond North Star</DialogTitle><DialogDescription>Choose one measurable 90-day outcome and three to five milestones.</DialogDescription></DialogHeader><div className="space-y-5"><div><Label htmlFor="goal-title">90-day goal</Label><Textarea id="goal-title" className="mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div className="grid sm:grid-cols-2 gap-4"><div><Label htmlFor="target-role">Target role or outcome</Label><Input id="target-role" className="mt-2" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} /></div><div><Label htmlFor="target-date">Target date</Label><Input id="target-date" type="date" className="mt-2" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} /></div></div><div><div className="flex items-center justify-between"><Label>Milestones · 3–5 required</Label>{form.milestones.length < 5 && <Button type="button" variant="ghost" size="sm" onClick={() => setForm((old) => ({ ...old, milestones: [...old.milestones, { title: "", description: "", targetDate: "", sortOrder: old.milestones.length }] }))}><Plus className="size-4" /> Add</Button>}</div><div className="mt-3 space-y-3">{form.milestones.map((milestone, index) => <div key={milestone.id ?? index} className="border border-border rounded-lg p-4"><div className="flex gap-3"><span className="size-7 rounded-full bg-secondary grid place-items-center text-xs shrink-0">{index + 1}</span><div className="flex-1 space-y-3"><Input value={milestone.title} onChange={(e) => updateMilestone(index, { title: e.target.value })} placeholder="Milestone title" /><Textarea rows={2} value={milestone.description} onChange={(e) => updateMilestone(index, { description: e.target.value })} placeholder="What does done look like?" /><Input type="date" value={milestone.targetDate} onChange={(e) => updateMilestone(index, { targetDate: e.target.value })} /></div>{form.milestones.length > 3 && <Button type="button" variant="ghost" size="icon" aria-label="Remove milestone" onClick={() => setForm((old) => ({ ...old, milestones: old.milestones.filter((_, i) => i !== index) }))}><Trash2 className="size-4 text-destructive" /></Button>}</div></div>)}</div></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={mut.isPending || !form.title.trim() || !form.targetDate || form.milestones.some((m) => !m.title.trim())} onClick={() => mut.mutate()} className="bg-gold text-background hover:bg-gold/90">{mut.isPending && <Loader2 className="size-4 animate-spin" />} Save North Star</Button></DialogFooter></DialogContent></Dialog>;
}

function ProofDialog({ open, setOpen, form, setForm, pending, save }: { open: boolean; setOpen: (open: boolean) => void; form: ProofDraft; setForm: (form: ProofDraft) => void; pending: boolean; save: () => void }) {
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{form.id ? "Edit career proof" : "Add career proof"}</DialogTitle><DialogDescription>Capture evidence you can use in interviews, reviews, and negotiations.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="proof-title">Title</Label><Input id="proof-title" className="mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Launched a new enterprise product" /></div><div className="grid sm:grid-cols-2 gap-4"><div><Label>Type</Label><Select value={form.proofType} onValueChange={(value) => setForm({ ...form, proofType: value })}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{["Achievement", "Project", "Recognition", "Leadership", "Client result"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="proof-date">Date</Label><Input id="proof-date" type="date" className="mt-2" value={form.proofDate} onChange={(e) => setForm({ ...form, proofDate: e.target.value })} /></div></div><div><Label htmlFor="proof-description">What happened?</Label><Textarea id="proof-description" className="mt-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><div><Label htmlFor="proof-impact">Business impact</Label><Textarea id="proof-impact" className="mt-2" rows={2} value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} /></div><div><Label htmlFor="proof-metric">Metric</Label><Input id="proof-metric" className="mt-2" value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} placeholder="Example: ₹2.4Cr revenue, 28% faster" /></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={pending || !form.title.trim() || !form.proofType} onClick={save}>{pending && <Loader2 className="size-4 animate-spin" />} Save proof</Button></DialogFooter></DialogContent></Dialog>;
}

function ReviewDialog({ open, setOpen, review, summary, saveReview, refresh }: { open: boolean; setOpen: (open: boolean) => void; review: { moved_forward: string; blockers: string; next_priority: string } | null; summary: { actions: number; xp: number; proofs: number; milestones: number; goal: number }; saveReview: ReturnType<typeof useServerFn<typeof saveWeeklyReview>>; refresh: () => Promise<unknown> }) {
  const [form, setForm] = useState({ movedForward: "", blockers: "", nextPriority: "" });
  useEffect(() => { if (open) setForm({ movedForward: review?.moved_forward ?? "", blockers: review?.blockers ?? "", nextPriority: review?.next_priority ?? "" }); }, [open, review]);
  const mut = useMutation({ mutationFn: () => saveReview({ data: form }), onSuccess: async () => { toast.success("Weekly review saved"); setOpen(false); await refresh(); }, onError: (error: Error) => toast.error(error.message) });
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="font-display text-2xl">Weekly review</DialogTitle><DialogDescription>Reflect on movement, friction, and the next highest-leverage action.</DialogDescription></DialogHeader><div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{Object.entries(summary).map(([label, value]) => <div key={label} className="border border-border rounded-md p-3 text-center"><div className="font-display text-xl font-bold">{label === "goal" ? `${value}%` : value}</div><div className="text-[10px] uppercase text-muted-foreground">{label}</div></div>)}</div><div className="space-y-4"><div><Label htmlFor="moved">What moved you forward?</Label><Textarea id="moved" className="mt-2" value={form.movedForward} onChange={(e) => setForm({ ...form, movedForward: e.target.value })} /></div><div><Label htmlFor="blocked">What blocked you?</Label><Textarea id="blocked" className="mt-2" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} /></div><div><Label htmlFor="priority">What is your #1 priority next week?</Label><Textarea id="priority" className="mt-2" value={form.nextPriority} onChange={(e) => setForm({ ...form, nextPriority: e.target.value })} /></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={mut.isPending} onClick={() => mut.mutate()}>{mut.isPending && <Loader2 className="size-4 animate-spin" />} Save review</Button></DialogFooter></DialogContent></Dialog>;
}

function SectionHeading({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: React.ReactNode }) { return <div className="flex items-end justify-between gap-4 mb-5"><div><p className="text-[11px] font-mono uppercase text-electric">{eyebrow}</p><h2 className="mt-2 font-display text-2xl font-bold" id={title.toLowerCase().replaceAll(" ", "-")}>{title}</h2></div>{aside}</div>; }
function EmptyState({ title, body, action, onClick }: { title: string; body: string; action: string; onClick: () => void }) { return <div className="border-y border-border py-10 text-center"><h3 className="font-display text-xl font-bold">{title}</h3><p className="mt-2 mx-auto max-w-xl text-sm text-muted-foreground">{body}</p><Button className="mt-5" onClick={onClick}>{action} <ArrowRight className="size-4" /></Button></div>; }
function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="border border-border bg-card/50 rounded-lg p-4"><div className="text-electric [&_svg]:size-4">{icon}</div><div className="mt-3 font-display text-2xl font-bold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>; }
function formatDate(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
function daysRemaining(value: string) { return Math.max(0, Math.ceil((new Date(`${value}T23:59:59`).getTime() - Date.now()) / 86_400_000)); }