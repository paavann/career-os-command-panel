import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CalendarDays, Check, CheckCircle2, Circle, Flag, Gem, Loader2, Pencil, Plus, Sparkles, Target, Trash2, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { completeFoundationAction, getCommandCenter, saveDiamondGoal, toggleGoalMilestone, type DiamondGoal, type FoundationAction } from "@/lib/command-center.functions";
import type { MeData } from "@/lib/me.functions";
import type { PillarKey } from "@/lib/engines";

type Props = { data: MeData; openEngine: (pillar: PillarKey) => void };
type DraftMilestone = { id?: string; title: string; description: string; targetDate: string; sortOrder: number };
type GoalDraft = { title: string; targetRole: string; targetDate: string; milestones: DraftMilestone[] };

const PILLARS: Array<{ key: PillarKey; label: string; letter: string }> = [
  { key: "clarity", label: "Clarity", letter: "C" }, { key: "authority", label: "Authority", letter: "A" },
  { key: "reach", label: "Reach", letter: "R" }, { key: "evidence", label: "Evidence", letter: "E" },
  { key: "energy", label: "Energy", letter: "E" }, { key: "revenue", label: "Revenue", letter: "R" },
];

const RECOMMENDATIONS: Record<PillarKey, string> = {
  clarity: "Define the next role and outcome you can explain in one sentence.",
  authority: "Publish one clear point of view that demonstrates your expertise.",
  reach: "Start three intentional conversations with people in your target market.",
  evidence: "Turn one career win into a quantified proof-of-impact story.",
  energy: "Practice a concise executive update before your next important meeting.",
  revenue: "Benchmark your target role and document three negotiation levers.",
};

export function DiamondCommandFoundation({ data, openEngine }: Props) {
  const qc = useQueryClient();
  const getCenter = useServerFn(getCommandCenter);
  const toggleMilestone = useServerFn(toggleGoalMilestone);
  const completeAction = useServerFn(completeFoundationAction);
  const [goalOpen, setGoalOpen] = useState(false);
  const center = useQuery({ queryKey: ["command-center"], queryFn: () => getCenter() });
  const milestoneMut = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => toggleMilestone({ data: { id, completed } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["command-center"] }),
    onError: (error: Error) => toast.error(error.message),
  });
  const actionMut = useMutation({
    mutationFn: (slug: FoundationAction["slug"]) => completeAction({ data: { slug } }),
    onSuccess: async (result) => {
      toast.success(result.alreadyDone ? "Action already complete" : `Foundation action complete · +${result.xp} XP`);
      await Promise.all([qc.invalidateQueries({ queryKey: ["command-center"] }), qc.invalidateQueries({ queryKey: ["me"] }), qc.invalidateQueries({ queryKey: ["leaderboard"] })]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const weakest = useMemo(() => PILLARS.reduce((lowest, item) => data.scores[item.key] < data.scores[lowest.key] ? item : lowest, PILLARS[0]), [data.scores]);
  const goal = center.data?.goal ?? null;
  const actions = center.data?.actions ?? [];
  const completedActions = actions.filter((action) => action.completed).length;
  const completedMilestones = goal?.milestones.filter((milestone) => milestone.completed).length ?? 0;
  const profileComplete = Boolean(data.profile.first_name && data.profile.job_title && data.profile.industry && data.profile.primary_goal && data.profile.target_timeline && data.profile.target_role);
  const checkupReady = PILLARS.every((pillar) => data.scores[pillar.key] > 0);
  const evidenceReady = data.scores.evidence > 0;

  const performAction = (action: FoundationAction) => {
    if (action.completed) return;
    if (action.cta === "goal") {
      if (!goal) setGoalOpen(true);
      else actionMut.mutate(action.slug);
    } else if (action.cta === "checkup") {
      if (checkupReady) actionMut.mutate(action.slug);
      else openEngine(weakest.key);
    } else if (evidenceReady) actionMut.mutate(action.slug);
    else openEngine("evidence");
  };

  if (center.isLoading) return <div className="border-y border-border py-16 grid place-items-center"><Loader2 className="size-5 animate-spin text-gold" /></div>;
  if (center.isError) return <div className="border-y border-border py-10 text-center"><p className="text-sm text-destructive">Your Command Center could not load.</p><Button variant="outline" className="mt-4" onClick={() => center.refetch()}>Try again</Button></div>;

  return (
    <div className="space-y-10">
      <section aria-labelledby="north-star-title" className="border-y border-gold/30 bg-card/40">
        <div className="py-7 md:py-9 grid lg:grid-cols-[1.35fr_0.65fr] gap-8">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-gold"><Gem className="size-4" /> Diamond North Star</div>
            {goal ? <>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div><h2 id="north-star-title" className="font-display text-3xl md:text-4xl font-black">{goal.title}</h2><p className="mt-2 text-muted-foreground">{goal.target_role || data.profile.target_role || "Target outcome not specified"} · {formatDate(goal.target_date)}</p></div>
                <Button variant="outline" size="sm" onClick={() => setGoalOpen(true)}><Pencil className="size-4" /> Edit goal</Button>
              </div>
              <div className="mt-7 flex items-center gap-4"><Progress value={goal.progress} className="h-2.5 bg-gold/15 [&>div]:bg-gold" /><span className="font-display text-2xl font-black text-gold tabular-nums">{goal.progress}%</span></div>
              <div className="mt-2 text-xs text-muted-foreground">{completedMilestones} of {goal.milestones.length} milestones complete · {daysRemaining(goal.target_date)} days remaining</div>
            </> : <div className="mt-5"><h2 id="north-star-title" className="font-display text-3xl md:text-4xl font-black">Your career goal is not set yet.</h2><p className="mt-2 text-muted-foreground max-w-xl">Give the next 90 days one clear outcome and a small set of milestones.</p><Button className="mt-6 bg-gold text-background hover:bg-gold/90" onClick={() => setGoalOpen(true)}>Set My Goal <ArrowRight className="size-4" /></Button></div>}
          </div>
          <div className="lg:border-l lg:border-border lg:pl-8">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Diamond Profile</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
              <Info label="Current role" value={data.profile.job_title} /><Info label="Industry" value={data.profile.industry} />
              <Info label="Career goal" value={data.profile.primary_goal} /><Info label="Timeline" value={data.profile.target_timeline} />
            </dl>
            {!profileComplete && <Button asChild variant="link" className="mt-4 px-0 text-gold"><Link to="/profile">Complete your Diamond Profile <ArrowRight className="size-4" /></Link></Button>}
          </div>
        </div>
      </section>

      <section aria-labelledby="actions-title">
        <div className="flex items-end justify-between gap-4 mb-5"><div><p className="text-[11px] font-mono uppercase tracking-[0.2em] text-electric">Today's actions</p><h2 id="actions-title" className="mt-2 font-display text-2xl font-bold">Your Next 3 Actions</h2></div><span className="text-sm text-muted-foreground">{completedActions}/3 complete</span></div>
        <div className="grid md:grid-cols-3 gap-4">{actions.map((action, index) => <article key={action.slug} className={`border p-5 rounded-lg flex flex-col min-h-52 ${action.completed ? "border-electric/30 bg-electric/5" : "border-border bg-card/60"}`}><div className="flex items-start justify-between"><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><span className="text-xs font-semibold text-gold">+{action.xp} XP</span></div><div className="mt-5 flex items-center gap-3">{action.completed ? <CheckCircle2 className="size-5 text-electric" /> : <Circle className="size-5 text-muted-foreground" />}<h3 className="font-semibold leading-tight">{action.title}</h3></div><p className="mt-3 text-sm text-muted-foreground flex-1">{action.description}</p><Button variant={action.completed ? "ghost" : "outline"} disabled={action.completed || actionMut.isPending} onClick={() => performAction(action)} className="mt-5 justify-between">{action.completed ? "Completed" : action.cta === "goal" && !goal ? "Set goal" : "Start action"}{action.completed ? <Check className="size-4" /> : <ArrowRight className="size-4" />}</Button></article>)}</div>
      </section>

      <section className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
        <div>
          <div className="flex items-end justify-between gap-4 mb-5"><div><p className="text-[11px] font-mono uppercase tracking-[0.2em] text-electric">Career checkup</p><h2 className="mt-2 font-display text-2xl font-bold">Where you stand now</h2></div><div className="text-right"><div className="font-display text-4xl font-black text-gold">{data.profile.cpi_score}</div><div className="text-[10px] uppercase text-muted-foreground">Career Power Index</div></div></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{PILLARS.map((item) => <button key={item.key} onClick={() => openEngine(item.key)} className={`border rounded-lg p-4 text-left transition-colors hover:border-electric/50 ${item.key === weakest.key ? "border-gold/40 bg-gold/5" : "border-border bg-card/50"}`}><div className="flex justify-between text-sm"><span>{item.letter} · {item.label}</span><b>{data.scores[item.key]}</b></div><Progress value={data.scores[item.key]} className="mt-3 h-1.5" /></button>)}</div>
          <div className="mt-4 border-l-2 border-gold pl-4 py-1"><p className="text-xs uppercase tracking-[0.15em] text-gold">Focus now · {weakest.label}</p><p className="mt-1 text-sm text-muted-foreground">{RECOMMENDATIONS[weakest.key]}</p><Button variant="link" className="px-0 mt-1" onClick={() => openEngine(weakest.key)}>Open {weakest.label} Engine <ArrowRight className="size-4" /></Button></div>
        </div>
        <div className="border border-border bg-card/50 rounded-lg p-5"><p className="text-[11px] font-mono uppercase tracking-[0.2em] text-electric">Progress</p><h2 className="mt-2 font-display text-2xl font-bold">Visible movement</h2><div className="mt-6 space-y-5"><Metric label="Goal progress" value={`${goal?.progress ?? 0}%`} progress={goal?.progress ?? 0} icon={<Target />} /><Metric label="Milestones" value={`${completedMilestones}/${goal?.milestones.length ?? 0}`} progress={goal?.milestones.length ? completedMilestones / goal.milestones.length * 100 : 0} icon={<Flag />} /><Metric label="Foundation actions" value={`${completedActions}/3`} progress={completedActions / 3 * 100} icon={<CheckCircle2 />} /></div><div className="mt-7 pt-5 border-t border-border grid grid-cols-3 gap-3 text-center"><MiniStat label="Level" value={String(data.profile.level)} icon={<Trophy />} /><MiniStat label="XP" value={data.profile.xp.toLocaleString()} icon={<Zap />} /><MiniStat label="CPI" value={String(data.profile.cpi_score)} icon={<Sparkles />} /></div></div>
      </section>

      {goal && <section aria-labelledby="milestones-title"><div className="flex items-end justify-between mb-5"><div><p className="text-[11px] font-mono uppercase tracking-[0.2em] text-electric">90-day plan</p><h2 id="milestones-title" className="mt-2 font-display text-2xl font-bold">Milestone timeline</h2></div><Button variant="outline" size="sm" onClick={() => setGoalOpen(true)}><Pencil className="size-4" /> Edit plan</Button></div><div className="border-y border-border divide-y divide-border">{goal.milestones.map((milestone, index) => <button key={milestone.id} disabled={milestoneMut.isPending} onClick={() => milestoneMut.mutate({ id: milestone.id, completed: !milestone.completed })} className="w-full py-4 flex items-start gap-4 text-left hover:bg-accent/20 transition-colors"><span className={`mt-0.5 size-7 rounded-full border grid place-items-center shrink-0 ${milestone.completed ? "border-electric bg-electric text-primary-foreground" : "border-border"}`}>{milestone.completed ? <Check className="size-4" /> : index + 1}</span><span className="min-w-0 flex-1"><span className={`block font-semibold ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>{milestone.title}</span>{milestone.description && <span className="block text-sm text-muted-foreground mt-1">{milestone.description}</span>}</span><span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">{milestone.target_date ? formatDate(milestone.target_date) : "No date"}</span></button>)}</div></section>}

      <GoalDialog open={goalOpen} setOpen={setGoalOpen} goal={goal} profileGoal={data.profile.primary_goal} profileRole={data.profile.target_role} />
    </div>
  );
}

function GoalDialog({ open, setOpen, goal, profileGoal, profileRole }: { open: boolean; setOpen: (open: boolean) => void; goal: DiamondGoal | null; profileGoal: string | null; profileRole: string | null }) {
  const save = useServerFn(saveDiamondGoal); const completeAction = useServerFn(completeFoundationAction); const qc = useQueryClient();
  const defaultDate = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
  const initial = (): GoalDraft => ({ title: goal?.title ?? profileGoal ?? "", targetRole: goal?.target_role ?? profileRole ?? "", targetDate: goal?.target_date ?? defaultDate, milestones: goal?.milestones.map((m) => ({ id: m.id, title: m.title, description: m.description, targetDate: m.target_date ?? "", sortOrder: m.sort_order })) ?? Array.from({ length: 3 }, (_, i) => ({ title: "", description: "", targetDate: "", sortOrder: i })) });
  const [form, setForm] = useState(initial);
  useEffect(() => { if (open) setForm(initial()); }, [open, goal]);
  const mut = useMutation({ mutationFn: async () => { await save({ data: { id: goal?.id, title: form.title, targetRole: form.targetRole, targetDate: form.targetDate, timeline: "90 days", milestones: form.milestones.map((m, i) => ({ ...m, targetDate: m.targetDate || null, sortOrder: i })) } }); return completeAction({ data: { slug: "ninety-day-goal" } }); }, onSuccess: async (result) => { toast.success(result.alreadyDone ? "Your 90-day North Star is updated" : `Your 90-day North Star is set · +${result.xp} XP`); setOpen(false); await Promise.all([qc.invalidateQueries({ queryKey: ["command-center"] }), qc.invalidateQueries({ queryKey: ["me"] }), qc.invalidateQueries({ queryKey: ["leaderboard"] })]); }, onError: (error: Error) => toast.error(error.message) });
  const updateMilestone = (index: number, patch: Partial<DraftMilestone>) => setForm((old) => ({ ...old, milestones: old.milestones.map((item, i) => i === index ? { ...item, ...patch } : item) }));
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="font-display text-2xl">Set your Diamond North Star</DialogTitle><DialogDescription>Choose one measurable 90-day outcome and the milestones that prove movement.</DialogDescription></DialogHeader><div className="space-y-5"><div><Label htmlFor="goal-title">90-day goal</Label><Textarea id="goal-title" className="mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Example: Secure a Director role in a growth-stage technology company" /></div><div className="grid sm:grid-cols-2 gap-4"><div><Label htmlFor="target-role">Target role or outcome</Label><Input id="target-role" className="mt-2" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} /></div><div><Label htmlFor="target-date">Target date</Label><Input id="target-date" type="date" className="mt-2" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} /></div></div><div><div className="flex items-center justify-between"><Label>Milestones · 3–5 required</Label>{form.milestones.length < 5 && <Button type="button" variant="ghost" size="sm" onClick={() => setForm((old) => ({ ...old, milestones: [...old.milestones, { title: "", description: "", targetDate: "", sortOrder: old.milestones.length }] }))}><Plus className="size-4" /> Add milestone</Button>}</div><div className="mt-3 space-y-3">{form.milestones.map((milestone, index) => <div key={milestone.id ?? index} className="border border-border rounded-lg p-4"><div className="flex gap-3"><span className="size-7 rounded-full bg-secondary grid place-items-center text-xs shrink-0">{index + 1}</span><div className="flex-1 space-y-3"><Input value={milestone.title} onChange={(e) => updateMilestone(index, { title: e.target.value })} placeholder="Milestone title" /><Textarea rows={2} value={milestone.description} onChange={(e) => updateMilestone(index, { description: e.target.value })} placeholder="What does done look like?" /><Input type="date" value={milestone.targetDate} onChange={(e) => updateMilestone(index, { targetDate: e.target.value })} /></div>{form.milestones.length > 3 && <Button type="button" variant="ghost" size="icon" aria-label="Remove milestone" onClick={() => setForm((old) => ({ ...old, milestones: old.milestones.filter((_, i) => i !== index) }))}><Trash2 className="size-4 text-destructive" /></Button>}</div></div>)}</div></div></div><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={mut.isPending || !form.title.trim() || !form.targetDate || form.milestones.some((m) => !m.title.trim())} onClick={() => mut.mutate()} className="bg-gold text-background hover:bg-gold/90">{mut.isPending && <Loader2 className="size-4 animate-spin" />} Save North Star</Button></DialogFooter></DialogContent></Dialog>;
}

function Info({ label, value }: { label: string; value: string | null }) { return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value || "Not set"}</dd></div>; }
function Metric({ label, value, progress, icon }: { label: string; value: string; progress: number; icon: React.ReactNode }) { return <div><div className="flex items-center gap-2 text-sm [&_svg]:size-4 [&_svg]:text-electric"><span>{icon}</span><span className="flex-1">{label}</span><b>{value}</b></div><Progress value={progress} className="mt-2" /></div>; }
function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div><div className="mx-auto size-7 text-gold [&_svg]:size-4 grid place-items-center">{icon}</div><div className="font-display font-bold text-lg truncate">{value}</div><div className="text-[10px] uppercase text-muted-foreground">{label}</div></div>; }
function formatDate(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
function daysRemaining(value: string) { return Math.max(0, Math.ceil((new Date(`${value}T23:59:59`).getTime() - Date.now()) / 86_400_000)); }