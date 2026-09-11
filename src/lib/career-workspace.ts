export const PILLARS = ["clarity", "authority", "reach", "evidence", "energy", "revenue"] as const;
export type Pillar = (typeof PILLARS)[number];

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "range";
  options?: string[];
  optional?: boolean;
};

export type PillarConfig = {
  letter: string;
  name: string;
  title: string;
  description: string;
  loading: string;
  fields: Field[];
  components: string[];
};

const industries = ["Tech", "BFSI", "Consulting", "Manufacturing", "Healthcare", "Other"];

export const PILLAR_CONFIG: Record<Pillar, PillarConfig> = {
  clarity: {
    letter: "C", name: "Clarity", title: "Career Identity Scanner", loading: "Analyzing your Clarity Profile...",
    description: "Define the role, market position and career velocity that fit you now.",
    components: ["Specificity", "Market gap", "Velocity"],
    fields: [
      { key: "role_title", label: "Current role / title" },
      { key: "industry", label: "Industry", type: "select", options: industries },
      { key: "years_experience", label: "Years of experience", type: "number" },
      { key: "career_goal", label: "Career goal", type: "select", options: ["Get promoted", "Find a new job", "Increase my salary", "Build visibility", "Career restart"] },
      { key: "target_timeline", label: "Target timeline", type: "select", options: ["3 months", "6 months", "12 months"] },
      { key: "target_role", label: "What specific role or title are you targeting next?", type: "textarea" },
      { key: "differentiator", label: "What makes you different from others at your level?", type: "textarea" },
      { key: "direction_confidence", label: "How clearly can you explain your direction? (1–10)", type: "range" },
      { key: "target_environment", label: "Target companies, industries or environments", type: "textarea", optional: true },
    ],
  },
  authority: {
    letter: "A", name: "Authority", title: "Authority Builder", loading: "Building your Authority Profile...",
    description: "Turn repeated expertise into a named, memorable point of view.",
    components: ["Thought leadership", "Consistency", "Recognition", "Framework strength"],
    fields: [
      { key: "unique_insight", label: "What do you understand about your domain that most peers miss?", type: "textarea" },
      { key: "repeated_pattern", label: "What pattern do you repeatedly see or solve?", type: "textarea" },
      { key: "sharing_frequency", label: "How often do you share publicly?", type: "select", options: ["Never", "Monthly", "Weekly", "Several times a week"] },
      { key: "recognition", label: "What do colleagues already seek your advice for?", type: "textarea" },
      { key: "structured_approach", label: "Is your approach named or structured today?", type: "textarea" },
    ],
  },
  reach: {
    letter: "R", name: "Reach", title: "Visibility Amplifier", loading: "Mapping your Visibility Profile...",
    description: "Convert your positioning into the right conversations and opportunities.",
    components: ["Brand", "Find people", "Engage with insights", "Build relationships"],
    fields: [
      { key: "headline", label: "Current LinkedIn headline", type: "textarea" },
      { key: "target_connections", label: "Who specifically needs to know you?", type: "textarea" },
      { key: "posting_frequency", label: "Posting frequency", type: "select", options: ["Never", "Monthly", "Weekly", "Several times a week"] },
      { key: "commenting_frequency", label: "Meaningful comments per week", type: "number" },
      { key: "meaningful_conversations", label: "Meaningful professional conversations per month", type: "number" },
    ],
  },
  evidence: {
    letter: "E", name: "Evidence", title: "Achievement Vault", loading: "Polishing your achievement...",
    description: "Build a defensible bank of quantified, senior-level career proof.",
    components: ["Quantity", "Quality", "Diversity"], fields: [],
  },
  energy: {
    letter: "E", name: "Energy", title: "Executive Presence Analyzer", loading: "Analyzing your Executive Presence...",
    description: "Strengthen how your thinking, composure and conviction land in the room.",
    components: ["Clarity of thought", "Command", "Composure", "Conviction", "Consideration"],
    fields: [
      { key: "clarity_of_thought", label: "How clearly do you structure ideas? (1–10)", type: "range" },
      { key: "command_of_room", label: "How strongly do you command a room? (1–10)", type: "range" },
      { key: "composure", label: "How composed are you under pressure? (1–10)", type: "range" },
      { key: "conviction", label: "How confidently do you state a point of view? (1–10)", type: "range" },
      { key: "consideration", label: "How well do you listen and adapt? (1–10)", type: "range" },
      { key: "presence_example", label: "Describe one recent meeting where your presence fell short", type: "textarea" },
    ],
  },
  revenue: {
    letter: "R", name: "Revenue", title: "Market Value Intelligence", loading: "Researching current market data...",
    description: "Benchmark your compensation and turn career proof into negotiation leverage.",
    components: ["Market alignment", "Negotiation readiness"],
    fields: [
      { key: "current_ctc", label: "Current CTC (₹ Lakhs)", type: "number" },
      { key: "role", label: "Current role" }, { key: "industry", label: "Industry", type: "select", options: industries },
      { key: "experience", label: "Years of experience", type: "number" }, { key: "city", label: "City" },
      { key: "target_role", label: "Target role" }, { key: "last_raise", label: "Last raise or promotion", type: "textarea" },
      { key: "leverage", label: "Your strongest negotiation leverage", type: "textarea" },
    ],
  },
};

export type Assessment = {
  id: string; pillar: Pillar; score: number; createdAt: string; verdict: string;
  reasoning: string; breakdown: Array<{ label: string; score: number; reasoning: string }>;
  content: Record<string, unknown>;
};

export type WorkspaceSnapshot = {
  member: { id: string; role_title: string | null; industry: string | null; career_goal: string | null; target_timeline: string | null };
  scores: Partial<Record<Pillar, number>>;
  latest: Partial<Record<Pillar, Assessment>>;
  evidence: Array<Record<string, unknown>>;
  rewrites: Array<Record<string, unknown>>;
};