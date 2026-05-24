import { Target, Compass, Lightbulb } from "lucide-react";
import type { MeData } from "@/lib/me.functions";

const PILLARS = [
  { key: "clarity",   label: "Clarity",   prompt: "rewrite one line of your career narrative today." },
  { key: "authority", label: "Authority", prompt: "ship one recruiter-signal post or pov." },
  { key: "reach",     label: "Reach",     prompt: "engage with three target-company decision-makers." },
  { key: "evidence",  label: "Evidence",  prompt: "quantify one win from this quarter with a hard metric." },
  { key: "energy",    label: "Energy",    prompt: "block 25 minutes for deep, undistracted execution." },
  { key: "revenue",   label: "Revenue",   prompt: "benchmark your comp against one role on the market." },
] as const;

const TIMELINE_WEEKS: Record<string, number> = {
  "3 months": 13,
  "6 months": 26,
  "12 months": 52,
};

const EDGE_MAP: Record<string, Record<string, string>> = {
  "Get promoted": {
    "Invisible to leadership": "Your biggest lever right now is internal visibility. Book one stakeholder coffee this week.",
    "Stuck in same role 3+ years": "You need a forcing function. Draft a one-page promotion case and share it with your manager this week.",
    "Job search not converting": "Promotion is your fastest path. Audit your last 3 wins and turn each into a leadership story.",
    "No personal brand online": "Decision-makers Google you before they sponsor you. Publish one POV post about your domain this week.",
    "Can't negotiate my worth": "Document one revenue or cost win each day for 7 days. That's your promotion case.",
  },
  "Find a new job": {
    "Invisible to leadership": "Cold-apply is the slow path. Activate 5 weak ties on LinkedIn for warm intros this week.",
    "Stuck in same role 3+ years": "Reframe stuck as depth. Translate your tenure into 3 outcomes recruiters care about.",
    "Job search not converting": "Stop applying. Spend the week rewriting your resume around outcomes, not duties.",
    "No personal brand online": "Recruiters Google your name. Refresh your LinkedIn headline and About this week.",
    "Can't negotiate my worth": "Get 3 comp data points from peers before your next interview round.",
  },
  "Get a salary raise": {
    "Invisible to leadership": "Raises follow visibility. Send a weekly win-update email to your manager this week.",
    "Stuck in same role 3+ years": "Raises require new scope. Pitch one stretch project to your manager this week.",
    "Job search not converting": "A competing offer is your strongest lever. Run two interview loops in the next 14 days.",
    "No personal brand online": "External pull raises your internal price. Get one external recruiter ping this week.",
    "Can't negotiate my worth": "Map 5 comparable roles + comp. Bring data, not feelings, to the conversation.",
  },
  "Build external visibility": {
    "Invisible to leadership": "Start where the friction is lowest — external. Post 3 short POVs this week.",
    "Stuck in same role 3+ years": "Pick one niche and own it publicly. One post a day for 7 days.",
    "Job search not converting": "Inbound beats outbound. Optimize your LinkedIn for search this week.",
    "No personal brand online": "Pick one platform, one topic, one cadence. Ship for 7 days straight.",
    "Can't negotiate my worth": "Public proof raises your floor. Get one testimonial from a senior colleague this week.",
  },
  "Grow my consulting income": {
    "Invisible to leadership": "Visibility is your distribution channel. Share one client outcome this week (anonymized).",
    "Stuck in same role 3+ years": "You have the depth. Package one expertise into a productized offer this week.",
    "Job search not converting": "Reposition: stop selling time, start selling outcomes. Rewrite your offer this week.",
    "No personal brand online": "Buyers Google you before they DM. Publish one case study post this week.",
    "Can't negotiate my worth": "Raise your rate by 20% on the next new lead. Practice the line out loud.",
  },
};

function weakestPillar(scores: MeData["scores"]) {
  return PILLARS.reduce((min, p) => (scores[p.key] < scores[min.key] ? p : min), PILLARS[0]);
}

function daysSince(iso: string | null) {
  if (!iso) return 1;
  const start = new Date(iso).getTime();
  const days = Math.floor((Date.now() - start) / 86_400_000);
  return Math.max(1, days + 1);
}

export function TodaysBrief({ data }: { data: MeData }) {
  const p = data.profile;
  const weakest = weakestPillar(data.scores);
  const totalWeeks = p.target_timeline ? TIMELINE_WEEKS[p.target_timeline] ?? 0 : 0;
  const day = daysSince(p.created_at);
  const weeksElapsed = Math.floor((day - 1) / 7);
  const weeksLeft = Math.max(0, totalWeeks - weeksElapsed);

  const dailyDone = data.missions.filter((m) => m.category === "daily" && m.status === "completed").length;
  const firstName = p.first_name?.trim() || p.display_name?.split(" ")[0] || "operator";

  const focus = `Your ${weakest.label} score is your lowest pillar — ${weakest.prompt}`;

  const standParts: string[] = [];
  if (p.primary_goal) standParts.push(`Goal: ${p.primary_goal}`);
  if (p.target_timeline) standParts.push(`${weeksLeft} weeks remaining`);
  standParts.push(`Day ${day} of your journey`);
  const stand = standParts.join(" · ");

  const edge =
    (p.primary_goal && p.biggest_challenge && EDGE_MAP[p.primary_goal]?.[p.biggest_challenge]) ||
    "Pick one pillar and run it for 7 days. Compounding beats variety every time.";

  const closer = dailyDone > 0
    ? `You've cleared ${dailyDone} mission${dailyDone === 1 ? "" : "s"} already today — keep the chain alive, ${firstName}.`
    : `Nothing shipped yet today, ${firstName}. One mission unlocks the day.`;

  return (
    <div className="mt-4 max-w-3xl rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-electric/10 via-transparent to-purple/10">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-electric animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-electric">Today's Brief · from Deepa</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Day {day}{totalWeeks > 0 ? ` / ${totalWeeks * 7}` : ""}
        </span>
      </div>

      <div className="divide-y divide-border/60">
        <BriefRow icon={<Target className="size-3.5 text-electric" />} label="Focus today" body={focus} />
        <BriefRow icon={<Compass className="size-3.5 text-gold" />}    label="Where you stand" body={stand} />
        <BriefRow icon={<Lightbulb className="size-3.5 text-purple" />} label="Your edge this week" body={edge} />
      </div>

      <div className="px-5 py-3 bg-background/30 border-t border-border/60">
        <p className="text-xs text-muted-foreground italic">"{closer}"</p>
      </div>
    </div>
  );
}

function BriefRow({ icon, label, body }: { icon: React.ReactNode; label: string; body: string }) {
  return (
    <div className="px-5 py-4 flex gap-4">
      <div className="shrink-0 mt-0.5">
        <div className="size-6 rounded-md bg-background/60 border border-border grid place-items-center">
          {icon}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</div>
        <p className="text-sm leading-relaxed text-foreground">{body}</p>
      </div>
    </div>
  );
}
