import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { TOOLS } from "./index";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = TOOLS.find((t) => t.slug === params.slug);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.tool.name ?? "Tool"} — Bluechip CareerOS™` }],
  }),
  component: ToolDetail,
  notFoundComponent: () => (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h1 className="text-2xl font-display font-bold">Tool not found</h1>
      <Link to="/tools" className="text-electric mt-4 inline-block">← Back to ecosystem</Link>
    </div>
  ),
});

function ToolDetail() {
  const { tool } = Route.useLoaderData();
  const Icon = tool.icon;
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <Link to="/tools" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="size-3" /> Ecosystem
      </Link>

      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-72 rounded-full bg-electric/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="size-14 rounded-xl bg-electric/15 grid place-items-center ring-1 ring-electric/30">
              <Icon className="size-7 text-electric" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-electric">{tool.letter} · {tool.domain}</div>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mt-1">{tool.name}</h1>
              <p className="text-muted-foreground mt-2 max-w-xl">{tool.desc}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-black text-6xl text-gradient-brand">{tool.score}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">your score</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 glass rounded-2xl p-6">
          <h2 className="font-semibold flex items-center gap-2"><Sparkles className="size-4 text-electric" /> Engine outputs</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-5">
            {tool.outputs.map((o: string) => (
              <div key={o} className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border">
                <CheckCircle2 className="size-4 text-electric shrink-0" />
                <span className="text-sm">{o}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6 flex flex-col">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Recruiter lens</div>
          <p className="font-display font-semibold text-lg mt-2 leading-snug">"Would I shortlist this person first?"</p>
          <button className="mt-auto pt-6">
            <span className="block w-full py-3 rounded-xl bg-gradient-brand font-bold text-sm text-white">
              Run engine →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
