import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader } from "./tools/index";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title: "Membership Tiers — Bluechip CareerOS™" }] }),
  component: Pricing,
});

const tiers = [
  { name: "Challenger", code: "L1", price: "₹6,999", desc: "Foundations. Build clarity and core skills.",
    features: ["Career Identity Scanner™","Mindset Mastery library","Daily missions + XP engine","Community access","Monthly group coaching"] },
  { name: "Champion", code: "L2", price: "₹19,999", featured: true, desc: "The transformation engine. Most members start here.",
    features: ["Everything in Challenger","Full C.A.R.E.E.R.™ Ecosystem","AI Hub (all 9 copilots)","Weekly live masterclasses","Resume + LinkedIn audits","Private accountability pods"] },
  { name: "Legend",   code: "L3", price: "₹79,999", desc: "Executive-level acceleration with 1:1 strategists.",
    features: ["Everything in Champion","1:1 career strategist (bi-weekly)","Executive Presence intensive","Personal brand build-out","Salary negotiation done-with-you","VIP inner circle"] },
];

function Pricing() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader eyebrow="Membership" title="Choose your altitude"
        subtitle="Every tier compounds. Upgrade any time without losing momentum." />
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <div key={t.name} className={`relative rounded-3xl p-8 border flex flex-col ${t.featured ? "bg-gradient-to-br from-purple/20 to-electric/15 border-electric/40 ring-glow-electric md:scale-[1.02]" : "glass"}`}>
            {t.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full">Most chosen</div>}
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-electric">{t.code}</div>
            <h3 className="font-display font-extrabold text-2xl mt-1">{t.name}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t.desc}</p>
            <div className="mt-6">
              <span className="font-display font-black text-4xl">{t.price}</span>
              <span className="text-sm text-muted-foreground ml-1">/ year</span>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <Check className="size-4 text-electric shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <button className={`mt-8 py-3 rounded-xl font-bold text-sm ${t.featured ? "bg-gradient-brand text-white" : "bg-foreground text-background"}`}>
              Activate {t.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
