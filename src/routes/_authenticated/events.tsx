import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, Users } from "lucide-react";
import { PageHeader } from "./tools/index";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({ meta: [{ title: "Live Events — Bluechip CareerOS™" }] }),
  component: Events,
});

const events = [
  { title: "Executive Presence Boot Camp", host: "Dr. Aris Thorne", when: "Today · 7:30 PM",  countdown: "42m", attending: 1284, featured: true },
  { title: "Salary Negotiation War Room",  host: "Maya Patel",       when: "Wed · 8:00 PM",   countdown: "1d 4h", attending: 612 },
  { title: "LinkedIn Authority Workshop",  host: "Jordan Reyes",     when: "Fri · 6:00 PM",   countdown: "3d 2h", attending: 489 },
  { title: "Career Bootcamp · L3+",        host: "Sarah Jenkins",    when: "Next Mon · 7:00 PM", countdown: "6d", attending: 920 },
];

function Events() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <PageHeader eyebrow="Live Cohort" title="Mastery sessions"
        subtitle="Coaching, masterclasses, and bootcamps with operators who've done it." />
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((e) => (
          <div key={e.title} className={`rounded-3xl p-6 border relative overflow-hidden ${e.featured ? "bg-gradient-to-br from-gold/20 to-purple/20 border-gold/30" : "glass"}`}>
            {e.featured && <div className="absolute -right-10 -top-10 size-40 rounded-full bg-gold/30 blur-3xl" />}
            <div className="relative">
              <div className={`text-[10px] font-mono uppercase tracking-[0.25em] font-bold ${e.featured ? "text-gold" : "text-electric"}`}>
                Live in {e.countdown}
              </div>
              <h3 className="font-display font-bold text-2xl mt-3 leading-tight">{e.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">with {e.host}</p>
              <div className="flex items-center gap-5 mt-4 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="size-3" /> {e.when}</span>
                <span className="flex items-center gap-1.5"><Users className="size-3" /> {e.attending.toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><Clock className="size-3" /> 90 min</span>
              </div>
              <div className="flex gap-3 mt-6">
                <button className={`flex-1 py-3 rounded-xl font-bold text-sm ${e.featured ? "bg-foreground text-background" : "bg-gradient-brand text-white"}`}>
                  RSVP
                </button>
                <button className="px-4 py-3 rounded-xl border border-border text-sm">Calendar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
