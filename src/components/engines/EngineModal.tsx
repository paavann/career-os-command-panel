import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Copy, Loader2, Sparkles, TrendingUp, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ENGINES, type PillarKey } from "@/lib/engines";
import { runEngineAnalysis } from "@/lib/engines.functions";

type Props = {
  pillar: PillarKey | null;
  currentScore: number;
  onClose: () => void;
};

export function EngineModal({ pillar, currentScore, onClose }: Props) {
  const qc = useQueryClient();
  const run = useServerFn(runEngineAnalysis);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ analysis: string; score: number | null; cpi: number | null } | null>(null);

  const engine = pillar ? ENGINES[pillar] : null;

  const mut = useMutation({
    mutationFn: () => {
      if (!engine) throw new Error("No engine");
      const cleaned: Record<string, string> = {};
      for (const f of engine.fields) {
        const v = (values[f.name] ?? "").trim();
        if (v) cleaned[f.label] = v;
        else if (f.required) throw new Error(`${f.label} is required`);
      }
      return run({ data: { pillar: engine.pillar, inputs: cleaned } });
    },
    onSuccess: (res) => {
      setResult({ analysis: res.analysis, score: res.score, cpi: res.cpi });
      if (res.score !== null) {
        toast.success(`${engine!.domain} score updated to ${res.score}`);
        qc.invalidateQueries({ queryKey: ["me"] });
      } else {
        toast.success("Analysis ready");
      }
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const handleClose = () => {
    setValues({});
    setResult(null);
    mut.reset();
    onClose();
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.analysis);
    toast.success("Copied to clipboard");
  };

  return (
    <Dialog open={!!pillar} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-3xl max-h-[92vh] overflow-hidden p-0 gap-0 bg-background border-border"
        // suppress default close button — we render our own back button
      >
        {engine && (
          <>
            <header className="sticky top-0 z-10 px-6 py-4 border-b border-border bg-background/95 backdrop-blur flex items-center gap-4">
              <button
                onClick={handleClose}
                className="size-8 rounded-lg grid place-items-center hover:bg-accent transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-electric">
                  {engine.letter} · {engine.domain} Engine
                </div>
                <h2 className="font-display font-bold text-lg truncate">{engine.name}</h2>
              </div>
              <ScoreMeter current={currentScore} next={result?.score ?? null} />
              <button
                onClick={handleClose}
                className="size-8 rounded-lg grid place-items-center hover:bg-accent transition-colors"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="overflow-y-auto max-h-[calc(92vh-72px)]">
              {!result && (
                <div className="px-6 py-6 space-y-5">
                  <p className="text-sm text-muted-foreground">{engine.tagline}</p>

                  <div className="space-y-4">
                    {engine.fields.map((f) => (
                      <div key={f.name} className="space-y-1.5">
                        <Label htmlFor={f.name} className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                          {f.label}{f.required && <span className="text-electric ml-1">*</span>}
                        </Label>
                        {f.kind === "text" && (
                          <Input
                            id={f.name}
                            placeholder={f.placeholder}
                            value={values[f.name] ?? ""}
                            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                          />
                        )}
                        {f.kind === "number" && (
                          <Input
                            id={f.name}
                            type="number"
                            min={f.min}
                            max={f.max}
                            placeholder={f.placeholder}
                            value={values[f.name] ?? ""}
                            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                          />
                        )}
                        {f.kind === "textarea" && (
                          <Textarea
                            id={f.name}
                            rows={f.rows ?? 3}
                            placeholder={f.placeholder}
                            value={values[f.name] ?? ""}
                            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                          />
                        )}
                        {f.kind === "select" && (
                          <Select
                            value={values[f.name] ?? ""}
                            onValueChange={(val) => setValues((v) => ({ ...v, [f.name]: val }))}
                          >
                            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                            <SelectContent>
                              {f.options.map((o) => (
                                <SelectItem key={o} value={o}>{o}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => mut.mutate()}
                    disabled={mut.isPending}
                    className="w-full bg-gradient-brand text-white font-bold hover:opacity-90"
                  >
                    {mut.isPending ? (
                      <><Loader2 className="size-4 mr-2 animate-spin" /> BlueChip AI is analyzing…</>
                    ) : (
                      <><Sparkles className="size-4 mr-2" /> {engine.cta}</>
                    )}
                  </Button>
                </div>
              )}

              {result && (
                <div className="px-6 py-6 space-y-5">
                  {result.score !== null && (
                    <div className="rounded-2xl bg-gradient-to-r from-electric/15 via-transparent to-purple/15 border border-electric/30 px-5 py-4 flex items-center gap-4">
                      <TrendingUp className="size-5 text-electric shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-electric">
                          {engine.domain} score updated
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground line-through mr-2">{currentScore}</span>
                          <span className="font-display font-bold text-xl text-foreground">{result.score}</span>
                          {result.cpi !== null && (
                            <span className="ml-3 text-xs text-muted-foreground">
                              · CPI is now <span className="text-gold font-bold">{result.cpi}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <article className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-base prose-h2:mt-5 prose-h2:mb-2 prose-h2:uppercase prose-h2:tracking-widest prose-h2:text-electric prose-strong:text-foreground prose-li:my-0.5">
                    <ReactMarkdown>{result.analysis}</ReactMarkdown>
                  </article>

                  <div className="flex gap-2 sticky bottom-0 bg-background pt-3 pb-1">
                    <Button variant="outline" onClick={copy} className="flex-1">
                      <Copy className="size-4 mr-2" /> Copy output
                    </Button>
                    <Button
                      onClick={() => { setResult(null); mut.reset(); }}
                      className="flex-1 bg-gradient-brand text-white"
                    >
                      Run again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ScoreMeter({ current, next }: { current: number; next: number | null }) {
  const display = next ?? current;
  return (
    <div className="hidden sm:flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-1.5">
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Score</div>
      <div className="font-display font-black text-lg text-electric leading-none">{display}</div>
      <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-electric" style={{ width: `${display}%` }} />
      </div>
    </div>
  );
}
