export type CourseModule = { title: string; mins: number };
export type Course = {
  slug: string;
  title: string;
  cat: string;
  xp: number;
  mins: number;
  tierRequired: 1 | 2 | 3;
  color: string; // tailwind gradient classes for the banner
  modules: CourseModule[];
};

export const COURSES: Course[] = [
  {
    slug: "authority-os",
    title: "The Authority Operating System",
    cat: "Personal Branding",
    xp: 800,
    mins: 240,
    tierRequired: 2,
    color: "from-purple-700 to-fuchsia-600",
    modules: [
      { title: "The Authority Equation", mins: 45 },
      { title: "Building Your Signature Framework", mins: 60 },
      { title: "Thought Leadership on LinkedIn", mins: 50 },
      { title: "Getting Recognized by Decision-Makers", mins: 45 },
      { title: "Maintaining Authority at Scale", mins: 40 },
    ],
  },
  {
    slug: "negotiate-director",
    title: "Negotiate Like a Director",
    cat: "Salary Negotiation",
    xp: 600,
    mins: 180,
    tierRequired: 2,
    color: "from-amber-600 to-orange-500",
    modules: [
      { title: "The Salary Intelligence Framework", mins: 35 },
      { title: "Anchoring and Counter-offer Mechanics", mins: 40 },
      { title: "Reading the Room in Negotiations", mins: 35 },
      { title: "Handling Objections Scripts", mins: 40 },
      { title: "Closing and Next Steps", mins: 30 },
    ],
  },
  {
    slug: "executive-presence",
    title: "Executive Presence Bootcamp",
    cat: "Leadership Growth",
    xp: 900,
    mins: 320,
    tierRequired: 3,
    color: "from-slate-700 to-zinc-900",
    modules: [
      { title: "Presence Audit & Baseline", mins: 60 },
      { title: "Voice, Body, and Boardroom Gravitas", mins: 80 },
      { title: "Communicating Like a CXO", mins: 60 },
      { title: "Influencing Without Authority", mins: 60 },
      { title: "Sustaining Executive Energy", mins: 60 },
    ],
  },
  {
    slug: "resume-magnet",
    title: "Resume → Recruiter Magnet",
    cat: "Resume Optimization",
    xp: 500,
    mins: 140,
    tierRequired: 1,
    color: "from-emerald-600 to-teal-500",
    modules: [
      { title: "What Recruiters Really Look For", mins: 30 },
      { title: "The BlueChip Resume Architecture", mins: 40 },
      { title: "Achievement Quantification Formula", mins: 35 },
      { title: "ATS Optimization", mins: 35 },
    ],
  },
  {
    slug: "linkedin-sprint",
    title: "LinkedIn Visibility Sprint",
    cat: "LinkedIn Branding",
    xp: 700,
    mins: 200,
    tierRequired: 2,
    color: "from-sky-700 to-blue-500",
    modules: [
      { title: "Profile-to-Magnet Rewrite", mins: 45 },
      { title: "The 7-Day Content Engine", mins: 50 },
      { title: "Network Activation Plays", mins: 40 },
      { title: "Recruiter & DM Outreach Scripts", mins: 35 },
      { title: "SSI & Visibility Tracking", mins: 30 },
    ],
  },
  {
    slug: "ai-first-operator",
    title: "AI-First Career Operator",
    cat: "AI Career Growth",
    xp: 1200,
    mins: 360,
    tierRequired: 3,
    color: "from-indigo-700 to-violet-600",
    modules: [
      { title: "The AI Operator Mindset", mins: 60 },
      { title: "Prompt Stacks for Career Acceleration", mins: 75 },
      { title: "Building Your Personal AI Workflow", mins: 75 },
      { title: "AI for Job Search & Negotiation", mins: 75 },
      { title: "Future-Proofing Your Role", mins: 75 },
    ],
  },
];

export const TIER_LABEL: Record<1 | 2 | 3, string> = {
  1: "L1",
  2: "L2",
  3: "L3 · Diamond",
};

export function tierRank(tier: string | null | undefined): number {
  if (!tier) return 1;
  const t = tier.toLowerCase();
  if (t === "diamond" || t === "l3") return 3;
  if (t === "l2") return 2;
  return 1;
}

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
