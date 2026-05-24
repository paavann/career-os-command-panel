import { createFileRoute, Link } from "@tanstack/react-router";
import { COPILOTS } from "@/lib/copilots";
import { Brain } from "lucide-react";
import { PageHeader } from "./tools/index";

export const Route = createFileRoute("/_authenticated/ai/")({
  head: () => ({ meta: [{ title: "AI Hub — Bluechip CareerOS™" }] }),
  component: AIHub,
});

function AIHub() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader
        eyebrow="Intelligence Layer"
        title="AI Hub"
        subtitle="Enterprise-grade copilots, tuned to the C.A.R.E.E.R.™ Framework."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {COPILOTS.map((c) => (
          <Link
            key={c.slug}
            to="/ai/$slug"
            params={{ slug: c.slug }}
            className="group text-left glass rounded-2xl p-6 border hover:border-electric/40 transition-all relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 size-32 rounded-full bg-electric/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="size-10 rounded-lg bg-gradient-brand grid place-items-center mb-5">
                <Brain className="size-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg">{c.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{c.tagline}</p>
              <div className="mt-5 text-[10px] font-mono uppercase tracking-widest text-electric">
                Launch →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
