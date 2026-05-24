import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "@/lib/me.functions";

type FormState = {
  first_name: string;
  last_name: string;
  job_title: string;
  industry: string;
  primary_goal: string;
  biggest_challenge: string;
  target_timeline: string;
  linkedin_status: string;
  last_promotion: string;
};

const INDUSTRIES = ["Tech", "BFSI", "Consulting", "Manufacturing", "Healthcare", "Other"] as const;
const GOALS = [
  "Get promoted",
  "Find a new job",
  "Get a salary raise",
  "Build external visibility",
  "Grow my consulting income",
] as const;
const CHALLENGES = [
  "Invisible to leadership",
  "Stuck in same role 3+ years",
  "Job search not converting",
  "No personal brand online",
  "Can't negotiate my worth",
] as const;
const TIMELINES = ["3 months", "6 months", "12 months"] as const;
const LINKEDIN = ["Active", "Needs work", "Not started"] as const;
const PROMO = ["Within 1 year", "1–3 years", "3+ years", "Never promoted here"] as const;

const STEP_TITLES = [
  "What's your name?",
  "What's your current role?",
  "What's your primary goal right now?",
  "What's your biggest challenge?",
  "What's your target timeline?",
  "Where are you right now?",
];

export function OnboardingModal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    first_name: "", last_name: "", job_title: "", industry: "",
    primary_goal: "", biggest_challenge: "", target_timeline: "",
    linkedin_status: "", last_promotion: "",
  });
  const qc = useQueryClient();
  const submit = useServerFn(completeOnboarding);
  const mut = useMutation({
    mutationFn: () => submit({ data: form as any }),
    onSuccess: () => {
      toast.success("Welcome aboard. Your baseline is calibrated.");
      qc.invalidateQueries({ queryKey: ["me"] });
      onDone();
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const canAdvance = (() => {
    switch (step) {
      case 0: return form.first_name.trim() && form.last_name.trim();
      case 1: return form.job_title.trim() && form.industry;
      case 2: return form.primary_goal;
      case 3: return form.biggest_challenge;
      case 4: return form.target_timeline;
      case 5: return form.linkedin_status && form.last_promotion;
      default: return false;
    }
  })();

  const isLast = step === 5;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center font-display font-black text-sm">C</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Bluechip CareerOS™ · Onboarding
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-10">
            {STEP_TITLES.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i < step ? "bg-electric" : i === step ? "bg-gradient-to-r from-electric to-purple" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          <div className="text-xs font-mono uppercase tracking-[0.25em] text-electric mb-3">
            Step {step + 1} of 6
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight mb-8">
            {STEP_TITLES[step]}
          </h1>

          <div className="space-y-4 animate-slide-up">
            {step === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First name">
                  <Input autoFocus value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="Priya" maxLength={80} />
                </Field>
                <Field label="Last name">
                  <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Sharma" maxLength={80} />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Job title">
                  <Input autoFocus value={form.job_title} onChange={(e) => set("job_title", e.target.value)} placeholder="Senior Product Manager" maxLength={120} />
                </Field>
                <Field label="Industry / Sector">
                  <select
                    value={form.industry}
                    onChange={(e) => set("industry", e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select…</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {step === 2 && <Choices value={form.primary_goal} options={GOALS} onSelect={(v) => set("primary_goal", v)} />}
            {step === 3 && <Choices value={form.biggest_challenge} options={CHALLENGES} onSelect={(v) => set("biggest_challenge", v)} />}
            {step === 4 && <Choices value={form.target_timeline} options={TIMELINES} onSelect={(v) => set("target_timeline", v)} />}

            {step === 5 && (
              <div className="space-y-6">
                <Field label="LinkedIn profile">
                  <Choices value={form.linkedin_status} options={LINKEDIN} onSelect={(v) => set("linkedin_status", v)} compact />
                </Field>
                <Field label="Last promotion">
                  <Choices value={form.last_promotion} options={PROMO} onSelect={(v) => set("last_promotion", v)} compact />
                </Field>
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between mt-10">
            <button
              type="button"
              disabled={step === 0 || mut.isPending}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <button
              type="button"
              disabled={!canAdvance || mut.isPending}
              onClick={() => {
                if (isLast) mut.mutate();
                else setStep((s) => s + 1);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand font-bold text-sm text-white shadow-glow-electric disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.02] transition-transform"
            >
              {mut.isPending ? <Loader2 className="size-4 animate-spin" /> : isLast ? <Sparkles className="size-4" /> : null}
              {isLast ? "Calibrate my CareerOS" : "Continue"}
              {!isLast && !mut.isPending && <ArrowRight className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Choices<T extends string>({
  value, options, onSelect, compact,
}: { value: string; options: readonly T[]; onSelect: (v: T) => void; compact?: boolean }) {
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-2 sm:grid-cols-2" : "grid-cols-1"}`}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onSelect(opt)}
            className={`group flex items-center justify-between gap-3 text-left px-4 py-3.5 rounded-xl border transition-all ${
              active
                ? "border-electric bg-electric/10 ring-1 ring-electric/40"
                : "border-border bg-card/40 hover:border-electric/40 hover:bg-accent/30"
            }`}
          >
            <span className="text-sm font-medium">{opt}</span>
            {active ? (
              <Check className="size-4 text-electric" />
            ) : (
              <span className="size-4 rounded-full border border-muted-foreground/40" />
            )}
          </button>
        );
      })}
    </div>
  );
}
