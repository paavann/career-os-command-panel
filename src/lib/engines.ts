export type PillarKey = "clarity" | "authority" | "reach" | "evidence" | "energy" | "revenue";

export type EngineField =
  | { kind: "text"; name: string; label: string; placeholder?: string; required?: boolean }
  | { kind: "textarea"; name: string; label: string; placeholder?: string; rows?: number; required?: boolean }
  | { kind: "number"; name: string; label: string; placeholder?: string; min?: number; max?: number; required?: boolean }
  | { kind: "select"; name: string; label: string; options: string[]; required?: boolean };

export type EngineConfig = {
  slug: PillarKey;
  letter: string;
  domain: string;
  name: string;
  tagline: string;
  pillar: PillarKey;
  systemPrompt: string;
  fields: EngineField[];
  cta: string;
};

export const ENGINES: Record<PillarKey, EngineConfig> = {
  clarity: {
    slug: "clarity",
    letter: "C",
    domain: "Career Identity",
    name: "Career Identity Scanner",
    tagline: "Run the 3P Framework (Persona, Positioning, Power) and lock your North Star role.",
    pillar: "clarity",
    cta: "Run identity scan",
    systemPrompt: `You are BlueChip CareerOS's Career Identity Engine. Run a professional identity analysis using the 3P Framework (Persona, Positioning, Power) on the inputs the user provided. Synthesize across background, strengths, industry reputation and career direction.

Return your response in this exact markdown format:

## YOUR CAREER PERSONA
A 2-line identity statement.

## YOUR POSITIONING STATEMENT
A LinkedIn-headline-ready sentence (≤180 chars).

## YOUR POWER SIGNALS
1. ...
2. ...
3. ...

## YOUR NORTH STAR ROLE
The role that best fits this person's trajectory + one sentence on why.

## YOUR CLARITY SCORE
A single integer 1-100 on its own line.

Be specific, India-corporate-aware, and avoid generic coach-speak.`,
    fields: [
      { kind: "textarea", name: "background", label: "Your background (8-12 yrs summary, roles, industries)", rows: 3, required: true },
      { kind: "textarea", name: "strengths", label: "Your top 3 strengths and where you outperform peers", rows: 3, required: true },
      { kind: "textarea", name: "reputation", label: "What people in your industry know you for", rows: 2, required: true },
      { kind: "textarea", name: "direction", label: "Where you want to be in 18-24 months", rows: 2, required: true },
      { kind: "text", name: "constraints", label: "Any constraints (location, family, comp floor)", placeholder: "Optional" },
    ],
  },
  authority: {
    slug: "authority",
    letter: "A",
    domain: "Authority",
    name: "Authority Builder Engine",
    tagline: "Audit your thought leadership and lock this week's authority play.",
    pillar: "authority",
    cta: "Run authority audit",
    systemPrompt: `You are BlueChip CareerOS's Authority Builder. Analyze the professional's current authority signals using the inputs provided. Score Thought Leadership (1-100), Content Consistency (1-100), Industry Recognition (1-100), and whether they have a Signature Framework (Yes/No).

Return in this exact markdown:

## AUTHORITY AUDIT REPORT
One paragraph summarizing where they stand.

## SUB-SCORES
- Thought Leadership: X/100
- Content Consistency: X/100
- Industry Recognition: X/100
- Signature Framework: Yes/No

## TOP 3 AUTHORITY GAPS
1. ...
2. ...
3. ...

## THIS WEEK'S AUTHORITY ACTION
One concrete action with a deadline (e.g. "By Friday: ship a 200-word POV on X").

## YOUR AUTHORITY SCORE
A single integer 1-100 on its own line — the overall composite.`,
    fields: [
      { kind: "text", name: "role", label: "Current role + industry", placeholder: "e.g. Senior PM · Fintech", required: true },
      { kind: "text", name: "linkedin", label: "LinkedIn URL (optional)", placeholder: "https://linkedin.com/in/..." },
      { kind: "textarea", name: "recentContent", label: "Recent posts / articles / talks (paste 2-3)", rows: 5, required: true },
      { kind: "textarea", name: "expertise", label: "Domain you want to own publicly (1-2 sentences)", rows: 2, required: true },
    ],
  },
  reach: {
    slug: "reach",
    letter: "R",
    domain: "Reach",
    name: "Visibility Amplifier",
    tagline: "Audit your LinkedIn SSI and recruiter discoverability.",
    pillar: "reach",
    cta: "Run visibility audit",
    systemPrompt: `You are BlueChip CareerOS's Visibility Engine. Analyze the professional's LinkedIn SSI signals and recruiter discoverability based on the inputs.

Return in this exact markdown:

## SSI BREAKDOWN
- Profile Strength: X/25
- Network Building: X/25
- Engaging Insights: X/25
- Building Relationships: X/25

## RECRUITER DISCOVERABILITY SCORE
X/100 with one-line justification.

## TOP 3 VISIBILITY GAPS
1. ...
2. ...
3. ...

## THIS WEEK'S REACH ACTION
One concrete action.

## OVERALL REACH SCORE
A single integer 1-100 on its own line.`,
    fields: [
      { kind: "number", name: "ssi", label: "Your LinkedIn SSI (linkedin.com/sales/ssi)", min: 0, max: 100, placeholder: "0-100", required: true },
      { kind: "select", name: "completeness", label: "Profile completeness self-rating", options: ["Bare minimum", "Decent", "Optimized", "Recruiter-ready"], required: true },
      { kind: "select", name: "frequency", label: "Posting frequency (last 90 days)", options: ["Never", "Monthly", "Weekly", "2-3x/week", "Daily"], required: true },
      { kind: "text", name: "role", label: "Target role + industry", placeholder: "e.g. Director of Engineering · SaaS", required: true },
      { kind: "textarea", name: "notes", label: "Anything else (recent recruiter pings, network size, etc.)", rows: 2 },
    ],
  },
  evidence: {
    slug: "evidence",
    letter: "E",
    domain: "Evidence",
    name: "Proof-of-Impact Builder",
    tagline: "Convert raw wins into STAR-format evidence senior hiring panels respect.",
    pillar: "evidence",
    cta: "Build evidence stack",
    systemPrompt: `You are BlueChip CareerOS's Evidence Engine. The user is pasting raw career wins. Convert each into a STAR-formatted story (Situation, Task, Action, Result) with hard metrics. Then score the overall evidence stack.

Return in this exact markdown:

## YOUR ACHIEVEMENT VAULT
For each win, output:
**Win N — [Short title]**
- Situation: ...
- Task: ...
- Action: ...
- Result: [quantified]

## STRONGEST STORY
Which one to lead with in interviews and why.

## EVIDENCE GAPS
What's missing (metrics, scope, business outcomes).

## THIS WEEK'S EVIDENCE ACTION
One thing to document this week.

## YOUR EVIDENCE SCORE
A single integer 1-100 on its own line.`,
    fields: [
      { kind: "text", name: "role", label: "Current role", placeholder: "e.g. Senior Product Manager", required: true },
      { kind: "textarea", name: "wins", label: "Paste your raw career wins (3-6 bullets is great)", rows: 8, required: true },
    ],
  },
  energy: {
    slug: "energy",
    letter: "E",
    domain: "Energy",
    name: "Executive Presence Analyzer",
    tagline: "5-question self-assessment of your executive aura and communication weight.",
    pillar: "energy",
    cta: "Score my presence",
    systemPrompt: `You are BlueChip CareerOS's Executive Presence Analyzer. Score the user's executive presence based on a 5-point self-assessment.

Return in this exact markdown:

## PRESENCE READOUT
One paragraph diagnosing where they're strong vs leaking authority.

## SUB-SCORES
- Gravitas: X/100
- Communication clarity: X/100
- Composure under pressure: X/100
- Decisiveness: X/100
- Room-reading: X/100

## TOP 3 PRESENCE FIXES
1. ...
2. ...
3. ...

## ONE PRACTICE DRILL
A 5-minute drill to do daily this week.

## YOUR ENERGY SCORE
A single integer 1-100 on its own line.`,
    fields: [
      { kind: "select", name: "q1", label: "In high-stakes meetings, you typically…", options: ["Speak first, set the frame", "Wait, then add the sharpest point", "Speak when asked", "Mostly listen"], required: true },
      { kind: "select", name: "q2", label: "Pushback from a senior leader…", options: ["Energizes you", "You hold your ground politely", "You concede too fast", "You shut down"], required: true },
      { kind: "select", name: "q3", label: "Your written communication is…", options: ["Tight, exec-ready", "Clear but long", "Inconsistent", "Often misread"], required: true },
      { kind: "select", name: "q4", label: "When plans break, you…", options: ["Reset the room in 60 seconds", "Adapt quietly", "Wait for direction", "Get visibly stressed"], required: true },
      { kind: "select", name: "q5", label: "Peers describe you as…", options: ["The grown-up in the room", "Smart and steady", "Hardworking", "Still figuring it out"], required: true },
      { kind: "textarea", name: "context", label: "Anything else about your current presence challenges", rows: 2 },
    ],
  },
  revenue: {
    slug: "revenue",
    letter: "R",
    domain: "Revenue",
    name: "Salary Intelligence Engine",
    tagline: "Benchmark your comp against the India market and find your negotiation lever.",
    pillar: "revenue",
    cta: "Run comp benchmark",
    systemPrompt: `You are BlueChip CareerOS's Salary Intelligence Engine, calibrated for the Indian corporate market (Tech, BFSI, Consulting, Manufacturing, Healthcare). Compare the user's comp to realistic India market bands for their role + experience + industry. Be specific with numbers in INR (₹L = lakhs per annum).

Return in this exact markdown:

## YOUR MARKET POSITION
Where their current CTC sits vs market (Below / At / Above) with a one-line rationale.

## INDIA MARKET BAND
- P25: ₹X L
- P50 (median): ₹X L
- P75: ₹X L
- P90: ₹X L

## YOUR LEVERAGE SCORE
How strong their negotiation position is (1-10) and why.

## TARGET CTC RECOMMENDATION
What they should ask for, with a fixed/variable split suggestion.

## THIS WEEK'S REVENUE ACTION
One specific move (e.g. pull 3 comp data points, start a competing loop).

## YOUR REVENUE SCORE
A single integer 1-100 on its own line — how well their comp reflects market value (higher = better positioned).`,
    fields: [
      { kind: "number", name: "currentCtc", label: "Current CTC (₹ lakhs / year)", min: 0, max: 1000, required: true },
      { kind: "number", name: "targetCtc", label: "Target CTC (₹ lakhs / year)", min: 0, max: 1000, required: true },
      { kind: "text", name: "role", label: "Role", placeholder: "e.g. Engineering Manager", required: true },
      { kind: "select", name: "industry", label: "Industry", options: ["Tech", "BFSI", "Consulting", "Manufacturing", "Healthcare", "Other"], required: true },
      { kind: "number", name: "yoe", label: "Years of experience", min: 0, max: 50, required: true },
      { kind: "text", name: "location", label: "Location (city)", placeholder: "e.g. Bengaluru", required: true },
    ],
  },
};

export const ENGINE_LIST = Object.values(ENGINES);
