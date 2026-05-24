import { createFileRoute } from "@tanstack/react-router";
import { Brain, FileText, Linkedin, MessageSquare, Banknote, Search, Megaphone, Compass, Crown } from "lucide-react";
import { PageHeader } from "./tools/index";

export const Route = createFileRoute("/ai")({
  head: () => ({ meta: [{ title: "AI Hub — Bluechip CareerOS™" }] }),
  component: AIHub,
});

const tools = [
  { name: "AI Resume Reviewer",      icon: FileText,      desc: "Surgical critique with executive-grade rewrites." },
  { name: "AI LinkedIn Optimizer",   icon: Linkedin,      desc: "Headline, About, and feed strategy refactor." },
  { name: "AI Mock Interview",       icon: MessageSquare, desc: "Real-time simulation with scoring and tells." },
  { name: "AI Salary Negotiator",    icon: Banknote,      desc: "Counter-offer scripts tuned to your market." },
  { name: "AI Career Strategist",    icon: Compass,       desc: "Personal roadmap based on your CPI signals." },
  { name: "AI Networking Assistant", icon: Megaphone,     desc: "Cold message frameworks that get replies." },
  { name: "AI Branding Coach",       icon: Crown,         desc: "Build a signature voice and thought-leadership engine." },
  { name: "AI Leadership Coach",     icon: Brain,         desc: "Practice high-stakes conversations and decisions." },
  { name: "AI Opportunity Scanner",  icon: Search,        desc: "Surface hidden roles matched to your market value." },
];

function AIHub() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader eyebrow="Intelligence Layer" title="AI Hub"
        subtitle="Enterprise-grade copilots, tuned to the C.A.R.E.E.R.™ Framework." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.name}
              className="group text-left glass rounded-2xl p-6 border hover:border-electric/40 transition-all relative overflow-hidden">
              <div className="absolute -top-10 -right-10 size-32 rounded-full bg-electric/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="size-10 rounded-lg bg-gradient-brand grid place-items-center mb-5">
                  <Icon className="size-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{t.desc}</p>
                <div className="mt-5 text-[10px] font-mono uppercase tracking-widest text-electric">Launch →</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
