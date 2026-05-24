// Rich lesson content for every course module.
// Indexed by course slug (matching src/lib/courses.ts) and module position.
// Each entry feeds the in-course viewer: lesson body + insight + exercise + reflection.

export type ModuleContent = {
  lesson: string;
  insight: string;
  exercise: string;
  reflection: string;
};

export const COURSE_CONTENT: Record<string, ModuleContent[]> = {
  "resume-magnet": [
    {
      lesson: `After 18 years inside hiring rooms — I was the recruiter deciding your fate — here is the truth no career coach will tell you: recruiters do not read resumes. They scan for signals. The average recruiter spends 6 seconds on an initial scan. In those 6 seconds they are answering one question: does this person match our invisible benchmark?

This benchmark is called The Calibration Room Code™. Every hiring decision is made by comparing candidates to a mental model of the "ideal" hire. Your resume does not need to be impressive. It needs to match that model.

THE 3 SIGNALS RECRUITERS SCAN FOR:
**SIGNAL 1 — ROLE FIT:** Are you the right type for this role? Your title, recent company, and headline answer this instantly.
**SIGNAL 2 — LEVEL FIT:** Are you at the right career stage? Seniority, team size managed, and budget owned signal this.
**SIGNAL 3 — IMPACT FIT:** Can you show you've done this before? Numbers on the page answer this.

WHAT GETS A RESUME REJECTED IN UNDER 3 SECONDS:
• An objective statement instead of a summary (1995 called)
• Responsibilities listed instead of results (you were present, not impactful)
• Zero numbers on the entire page
• More than 2 pages under 15 years of experience
• Inconsistent formatting (signals lack of attention to detail)

WHAT MAKES A RECRUITER SLOW DOWN AND READ:
• A headline that communicates role + specialization + outcome
• A summary that opens with your strongest proof point
• Bullets that begin with a strong action verb followed by a number`,
      insight: "The Calibration Room Code™: Every recruiter compares your resume to an invisible benchmark. Your job is not to be impressive — it is to match that benchmark precisely.",
      exercise: "Open your current resume. Circle every bullet point that contains a number. If you have fewer than 5 numbers on the entire document, that is your single biggest fix this week.",
      reflection: "What is the one career result you are most proud of that you have never written down clearly with a number attached to it?",
    },
    {
      lesson: `Structure is not aesthetic — it is a communication strategy. A well-structured resume tells a recruiter exactly who you are before they read a single word.

THE 5-SECTION ARCHITECTURE:

**SECTION 1 — THE HEADER** (6 lines maximum)
Your name in large text. Your professional headline (not your job title — more on this below). City · Phone · Email · LinkedIn URL.

**SECTION 2 — THE PROFESSIONAL SUMMARY** (4 sentences)
1. Your authority statement — years of experience + domain + one proof point
2. Your specialization — the specific problem you solve
3. Your results — 2 to 3 specific outcomes with numbers
4. What you are targeting next (optional but powerful for senior roles)

Example for a 12-year HR professional: "HR Business Partner with 12 years of experience across BFSI and Tech, specializing in talent acquisition and organizational design. I help fast-scaling companies build hiring systems that reduce cost-per-hire by 30–40% while improving quality-of-hire. Built and led the TA function at [Company] from 40 to 400 employees in 18 months. Currently targeting Director-level HRBP roles in high-growth tech companies."

THE HEADLINE FORMULA: [What you do] | [Your specialization] | [The outcome you deliver]
Wrong: "Senior Marketing Manager"
Right: "Senior Marketing Leader | D2C Growth & Brand Strategy | Scaled 3 brands from ₹5Cr to ₹50Cr+"

**SECTION 3 — CORE EXPERIENCE**
Each role: Company + Title + Duration + Location. 4 to 5 bullets per role following the Q-STAR formula (Module 3).

**SECTION 4 — EDUCATION + CERTIFICATIONS**
Brief. At the bottom. Unless you are a recent graduate.

**SECTION 5 — SKILLS**
Only include skills you can defend in a 15-minute interview. If you list Advanced Excel, expect Advanced Excel questions.

REMOVE IMMEDIATELY: "References available on request" | Hobbies section | "Seeking a challenging role" | More than 2 pages if under 15 years experience`,
      insight: "Your headline is not your job title — it is your positioning statement. It should tell a recruiter what you do, for whom, and what they get when they hire you. Spend 30 minutes on this line alone.",
      exercise: "Rewrite your professional headline using the formula: [What you do] | [Specialization] | [Outcome you deliver]. Test it on 3 people who don't know your work. If they cannot explain your value after reading it, rewrite.",
      reflection: "What is the specific outcome that you reliably deliver that other people in your role do not? That is your differentiator — and it belongs in your headline.",
    },
    {
      lesson: `The single biggest difference between a resume that generates calls and one that doesn't: numbers. Not just any numbers — specific, credible, contextual numbers.

THE Q-STAR FORMULA: (Quantified) Situation + Task + Action + Result

Old way: "Managed a team of engineers to deliver a product launch"
Q-STAR way: "Led a cross-functional team of 12 engineers to deliver a ₹8Cr product launch 3 weeks ahead of schedule, reducing time-to-market by 40% versus the company average"

THE 5 TYPES OF NUMBERS THAT MATTER:
1. **SCALE numbers:** team size, budget managed, users served, locations covered
2. **GROWTH numbers:** revenue increase %, lead growth, efficiency gains
3. **SPEED numbers:** delivered X weeks/months early, reduced time-to-X by Y%
4. **SAVINGS numbers:** cost reduction in ₹ or %
5. **RANK/SCOPE numbers:** managed X across Y cities, #1 in region, top 10%

WHAT IF YOUR ROLE IS NOT "NUMBERS-FRIENDLY"? Every role has numbers. Examples by function:

**HR / Talent Acquisition:** "Reduced time-to-hire from 45 to 22 days across 3 business units, saving ₹18L in agency fees annually"
**Operations:** "Standardized vendor contracts across 6 categories, reducing renewal cycle time by 60% and contract disputes by 80%"
**Finance / Accounts:** "Built quarterly reporting dashboard used by 8 C-suite leaders to make ₹15Cr budget allocation decisions"
**L&D / Training:** "Delivered 40-hour leadership program for 120 managers across 5 locations with 94% satisfaction score and 30% reduction in team attrition the following quarter"
**Marketing:** "Grew LinkedIn company page from 2,000 to 18,000 followers in 8 months through organic content strategy, reducing paid acquisition dependency by 35%"

THE RULE: If you cannot find a single number for a bullet point, that bullet point is probably describing a task, not an achievement. Either find the number or cut the bullet.`,
      insight: "Numbers are credibility. Every bullet point on your resume must contain at least one number. If a bullet has no number, it is a task — not an achievement. Recruiters hire for achievements, not tasks.",
      exercise: "List your last 3 roles. For each role, write at least 3 Q-STAR bullets. Every single bullet must contain at least one number. Aim for 5 bullets per role.",
      reflection: "Think about the biggest project or initiative you led in the past 2 years. What changed because you were there? What would NOT have happened if you hadn't been involved? That delta — in numbers — is your achievement.",
    },
    {
      lesson: `Here is a fact that will change how you write your resume: over 70% of resumes are rejected by software before a single human sees them. Applicant Tracking Systems (ATS) scan your resume for keyword matches. If your keywords don't match the job description, you're out — regardless of how qualified you are.

HOW ATS WORKS: The system compares your resume to the job description and scores it on keyword density. Many companies only review resumes scoring above 60–70%.

THE 80% MIRROR RULE: Your resume should contain at least 80% of the key terms used in the job description you are applying to.

WHAT ATS CANNOT READ (avoid these):
• Tables and multi-column layouts (system reads left to right, misses columns)
• Headers and footers (often skipped entirely)
• Graphics, charts, icons, logos
• Text embedded in images
• Unusual section titles ("My Journey" instead of "Experience")
• Creative fonts
• PDF files at many companies — use .docx when applying directly

WHAT ATS LOVES:
• Single-column clean layout
• Standard section titles: Summary, Experience, Education, Skills, Certifications
• Keywords from the job description appearing naturally in your text
• Full words and abbreviations both (e.g., "Human Resources (HR)")
• Consistent date formats

THE KEYWORD EXTRACTION TECHNIQUE:
1. Copy the job description into a document
2. Highlight every skill, technology, tool, and role-specific term
3. Count how many of those exact terms appear in your current resume
4. Add missing keywords naturally into your summary, bullets, and skills section

THE HYBRID APPROACH (best of both worlds): Keep two versions of your resume.
**Version A** — ATS-optimized .docx (single column, keyword-dense) for online applications
**Version B** — Visually designed PDF for sending directly to a recruiter or at an interview

Pro tip from the recruiter's side: When applying to a senior role at a specific company, find the LinkedIn profile of someone who was recently promoted into that role at that company. Their profile will show you exactly what keywords and experience the company values. Mirror those in your resume.`,
      insight: "The Recruiter Signal Radar™: Before your resume reaches a human, it passes through an algorithm. Your keywords are your entry ticket. Match the language of the job description — don't reinvent it.",
      exercise: "Take one specific job description you are targeting right now. Paste it into a document. Highlight every technical term, skill name, and role-specific phrase. Check your resume. Add the missing terms naturally. Your ATS score just went up.",
      reflection: "Are you applying to roles using a single generic resume? If yes, that is your biggest conversion problem. A tailored resume for each application is not extra work — it is the minimum requirement.",
    },
  ],

  "linkedin-sprint": [
    {
      lesson: `Here is what happens when a recruiter opens LinkedIn and searches for a Senior Product Manager in Bangalore with BFSI experience. In 3 seconds they see 40 profiles. In the next 10 seconds, they click on 5. In the following 2 minutes, they message 2. What made those 2 stand out?

The Recruiter Signal Radar™ maps exactly what recruiters scan when they land on your profile. There are 5 zones they assess — in this exact order:

**ZONE 1 — HEADLINE** (0.5 seconds)
Does this person do what I'm looking for? Your headline is not your job title. It is your positioning statement. Most professionals waste this with "Senior Manager at XYZ Company." That tells a recruiter nothing about your value.

**ZONE 2 — PHOTO + BANNER** (1 second)
Does this person look credible? A professional photo increases profile views by 14x. A custom banner that reinforces your positioning adds another layer of authority.

**ZONE 3 — ABOUT SECTION** (10 seconds)
Is this someone I'd want to interview? The first 3 lines decide whether they keep reading. Open with your strongest proof point, not your job history.

**ZONE 4 — EXPERIENCE** (30 seconds)
Can they back up the headline? Bullets must mirror your resume — quantified, specific, results-led.

**ZONE 5 — ACTIVITY** (10 seconds)
Are they alive on this platform? Recent posts and comments signal credibility. Silence signals "ghost profile."

THE RULE: Every zone must reinforce the same positioning. Inconsistency between headline and experience destroys trust instantly.`,
      insight: "Recruiters do not read your profile. They scan 5 zones in 60 seconds. Your job is to win every zone with consistent, specific positioning.",
      exercise: "Open your LinkedIn profile in incognito mode. Time yourself for 60 seconds and rank yourself on each of the 5 zones from 1–5. Fix the lowest-scoring zone this week.",
      reflection: "If a recruiter saw only your headline, photo, and first 3 lines of your About, what story does it tell? Is that the story you want to be telling?",
    },
    {
      lesson: `Every section of your LinkedIn profile is a decision point. The recruiter is constantly asking: "Should I keep reading?" Your job is to make that answer yes — five times in a row.

**THE HEADLINE REBUILD**
Formula: [Role + Seniority] | [Specialization] | [Quantified Outcome]
Wrong: "Senior Manager at Infosys"
Right: "Senior Product Manager | Fintech & Payments | Launched 3 platforms processing ₹400Cr+ annually"

**THE BANNER**
A blank or default banner says "I don't take this seriously." A custom banner reinforces your positioning. Use Canva. Free templates work. Add: your one-liner, a quantified proof point, and 1 contact CTA.

**THE ABOUT SECTION — 3-PARAGRAPH STRUCTURE**
Paragraph 1: Authority hook. Who you are + one big proof point.
Paragraph 2: Specialization + 2–3 quantified wins.
Paragraph 3: What you're open to + how to contact you.

End with a CTA: "Open to senior PM roles in fintech. DM me or email name@domain.com."

**THE EXPERIENCE SECTION**
Same Q-STAR bullets as your resume. Do NOT just paste your JD. Lead with outcome, support with action.

**THE FEATURED SECTION**
Pin 3 things: your best post, a published article, a portfolio link or case study. This is your visual proof.

**THE SKILLS SECTION**
Pin your 3 most relevant skills to the top. Endorsements matter for search ranking — ask 10 colleagues for endorsements on your top 3.`,
      insight: "Your profile is a sales page. Every section should answer one buyer question: 'Why should I keep reading?' Win that question five times in a row and you become discoverable.",
      exercise: "Rebuild your headline, banner, and About section this week using the formulas above. Post the new About in a community for feedback before publishing.",
      reflection: "If your profile is your shopfront, what does a recruiter walk in and see today? What would change if they saw the profile you should have?",
    },
    {
      lesson: `Content is active visibility. The professionals who receive the most inbound opportunities are not the most qualified — they are the most consistently visible.

THE VISIBILITY MULTIPLIER FLYWHEEL™: Content → Engagement → Network Growth → More Visibility → More Content. The flywheel starts with one post. It compounds with consistency. Professionals who post 3x per week receive 5x more profile views and 2x more connection requests than those who post once a month.

THE 3-PILLAR CONTENT STRATEGY: Every post comes from one of 3 pillars.

**PILLAR 1 — EXPERTISE:** What do you know that others in your field don't? Share an insight, a framework, a pattern. Builds authority.
Example: "After reviewing 400 CVs this quarter, here's the one thing that separates shortlisted candidates from rejected ones..."

**PILLAR 2 — EXPERIENCE:** What have you done, seen, or learned from your career? Share a specific story — the client win, the failure, the unexpected lesson. Builds trust.
Example: "The day I told a CFO his hiring strategy was wrong in a board meeting. And why I'd do it again."

**PILLAR 3 — ENGAGEMENT:** React to industry conversations. Add context, share a perspective. Builds relationships.
Example: Sharing an article on AI in hiring and adding: "What they missed is the calibration problem — here's what I've seen in practice..."

THE BLUECHIP POST FORMULA:
1. The hook (counterintuitive statement, number, bold claim, question)
2. The tension (why this matters)
3. The insight (the actual value, broken into lines)
4. The CTA (ask a question, invite a comment)

**POSTING FREQUENCY:** Minimum 2x/week. Optimal 3x/week (Mon, Wed, Fri). Best time: Tue–Thu, 8–10am or 6–8pm IST.

THE CONSISTENCY RULE: 12 posts in 4 weeks will produce more results than 50 posts in 1 week followed by 6 weeks of silence. LinkedIn rewards consistency, not bursts.`,
      insight: "The Visibility Multiplier Flywheel™: Content creates visibility, visibility creates connections, connections create opportunities, opportunities create more content. Start the flywheel with one post. Keep it spinning with consistency.",
      exercise: "Write your first 3 LinkedIn posts using the 3 pillars: Post 1 (Expertise), Post 2 (Experience), Post 3 (Engagement). Schedule them for Monday, Wednesday, and Friday this week.",
      reflection: "What is the expertise you have that people in your network regularly ask you about? That is your content niche. Start there.",
    },
    {
      lesson: `LinkedIn is not a database — it's a dynamic network. The professionals who get hired, promoted, and paid more are not necessarily the most qualified. They are the ones who have invested in building relationships before they needed them.

THE 3 TYPES OF CONNECTIONS YOU NEED:
1. **DECISION-MAKERS:** People who hire for, or influence, the roles you want. VPs, CHROs, hiring managers at target companies. Connect before you need them.
2. **RECRUITERS:** Executive recruiters and internal talent acquisition leaders at your target companies.
3. **PEERS:** Strong performers at your level in adjacent companies. They refer, recommend, validate.

THE WARM OUTREACH FORMULA (connection requests):
[Personalization hook] + [Why you're connecting] + [Value you can offer or common ground]

Example for a CHRO at a target company:
"I've been following your work on building agile HR teams at [Company] — specifically your post on re-architecting the performance cycle resonated deeply with what I'm working through at [Your Company]. I'd value being in your network. Happy to share the framework we built if useful."

THE COLD OUTREACH FORMULA (recruiters):
"I came across your profile while researching [Company]'s talent acquisition team. I'm a [Role] with [X] years in [Domain] — I've [one-line achievement]. I'd love to be on your radar for senior opportunities in [Function]. Happy to share my profile — would a brief 15-minute call work?"

THE ENGAGEMENT STRATEGY: Comment on 3 posts per day from people in your target network. Comments are 10x more powerful than likes for visibility.
A good comment adds a perspective, shares a data point, asks a thoughtful question.
A bad comment is "Great post!" or "Well said!"

THE 10-5-1 WEEKLY RHYTHM:
• 10 meaningful comments on target connections' posts
• 5 new connection requests with personalized notes
• 1 post of your own

This rhythm, maintained for 8 weeks, transforms your LinkedIn presence from passive to magnetic.`,
      insight: "Build your network before you need it. The professionals who find opportunities fastest are those who invested in relationships during the good times. Start connecting with 5 new strategic contacts every week — starting today.",
      exercise: "Identify 10 people in your target network: 3 decision-makers, 4 recruiters, 3 peers. Send personalized connection requests to all 10 this week using the Warm or Cold Outreach Formula.",
      reflection: "Who in your current network could open a door for you right now, if you simply asked? Have you invested enough in that relationship? What is one action you can take this week to deepen it?",
    },
    {
      lesson: `What you cannot measure, you cannot improve. Most professionals treat LinkedIn as a vibes platform. Operators treat it as a metrics platform.

THE 4 METRICS THAT MATTER:

1. **PROFILE VIEWS** (weekly): The leading indicator. If views are flat, your headline, banner, or activity is the problem.
2. **SEARCH APPEARANCES** (weekly): How often you show up in recruiter searches. Driven by skills, keywords, headline, and recent activity.
3. **POST IMPRESSIONS** (per post): Reach of each post. Compare across pillars to see what resonates.
4. **INBOUND DMs** (monthly): The lagging indicator. The real measure of brand pull.

**THE SOCIAL SELLING INDEX (SSI):** LinkedIn scores you out of 100 across 4 dimensions — Professional Brand, Find the Right People, Engage with Insights, Build Relationships. Target: 70+ within 8 weeks. Check it weekly at linkedin.com/sales/ssi.

THE WEEKLY VISIBILITY REVIEW (15 minutes every Sunday):
1. Record this week's profile views, search appearances, SSI score
2. Identify the post with highest impressions — why did it work?
3. Identify the post with lowest — why did it flop?
4. Plan next week's 3 posts using insights from above

THE 90-DAY VISIBILITY SPRINT TARGETS:
• Profile views: 3x baseline
• Search appearances: 5x baseline
• SSI: 70+
• Inbound DMs: 2+ per week from recruiters or decision-makers

If you hit these, you no longer apply for jobs. Jobs apply to you.`,
      insight: "Visibility without measurement is hope. Visibility with measurement is a system. Track 4 numbers weekly and your LinkedIn becomes the highest-leverage asset in your career.",
      exercise: "Set up your weekly Visibility Review this Sunday. Record baseline numbers for profile views, search appearances, SSI score. Re-measure every Sunday for the next 8 weeks.",
      reflection: "What gets measured gets managed. What in your career are you NOT measuring that — if you tracked it weekly — would transform your trajectory?",
    },
  ],

  "authority-os": [
    {
      lesson: `Authority is not seniority. Authority is not expertise. Authority is the intersection of expertise and perception.

You can have 20 years of deep expertise and zero authority if no one knows about it. You can have 5 years of experience and enormous authority if you've been consistently visible and specific.

**THE AUTHORITY EQUATION: Authority = Expertise × Visibility × Trust**

Expertise without visibility = the best-kept secret in your industry.
Visibility without expertise = noise.
Expertise + Visibility without Trust = sales, not authority.

THE 3 INPUTS BROKEN DOWN:
1. **EXPERTISE:** Depth in a specific, defined domain. Not breadth — depth.
2. **VISIBILITY:** Consistent, public output in that domain. Posts, articles, talks, comments.
3. **TRUST:** Specificity over time. The same point of view, repeated, refined, demonstrated.

The fastest path to authority is to narrow your domain. "Marketing leader" has 4 million peers. "B2B SaaS pricing strategy for India-based ARR companies" has 200. The smaller the pond, the faster you become the obvious choice.`,
      insight: "Authority compounds. One year of consistent, specific output beats 10 years of generic experience. Start narrow. Stay narrow. Get known for one thing.",
      exercise: "Write your authority statement in one sentence: 'I help [specific audience] solve [specific problem] using [your unique approach].' Test it on 5 people in your target network.",
      reflection: "What is the one thing you want to be known for in 3 years? What would your output have to look like, every week, to make that real?",
    },
    {
      lesson: `Generic experts are forgotten. Branded frameworks are remembered.

A Signature Framework is your proprietary way of explaining how something in your domain works. It is the structure that organizes your expertise and makes it teachable, repeatable, and credible.

**WHY FRAMEWORKS MATTER:**
• They convert tacit expertise into transferable knowledge
• They give your audience a memorable handle
• They differentiate you from every other expert who "just talks"

**THE 3-STEP FRAMEWORK BUILD:**
1. **IDENTIFY THE PROBLEM:** What is the recurring question your audience asks you?
2. **MAP THE SOLUTION:** What are the 3–5 steps, levers, or components of your approach?
3. **NAME IT:** Give it a memorable, ownable name. Add ™ if you want.

Examples: "The Calibration Room Code™", "The Recruiter Signal Radar™", "The Visibility Multiplier Flywheel™".

**WHERE TO DEPLOY YOUR FRAMEWORK:**
• In every LinkedIn post that references your domain
• In your About section
• In every talk, podcast, or webinar
• In your DM responses and proposals

Repeat the framework relentlessly. The 47th time you mention it is when it starts becoming associated with you.`,
      insight: "A framework is intellectual property. Once people repeat your framework in their own words, you have authority. Build one. Name it. Repeat it.",
      exercise: "Draft your signature framework this week. 3–5 steps. A memorable name. Post it on LinkedIn as a carousel or text post with one real example.",
      reflection: "What pattern have you seen across your career that others in your field haven't named yet? That pattern is your framework waiting to be born.",
    },
    {
      lesson: `Thought leadership on LinkedIn is the highest-leverage content channel in professional life. Done well, it generates inbound for the rest of your career.

**THE 4 FORMATS THAT BUILD AUTHORITY:**

1. **THE FRAMEWORK POST:** Share a piece of your signature framework with one example. ~150 words.
2. **THE COUNTERINTUITIVE TAKE:** Challenge a widely-held belief in your industry with evidence.
3. **THE CASE STUDY:** Tell a specific client/project story. Anonymize if needed. Numbers in. Lessons out.
4. **THE INDUSTRY ANALYSIS:** Take a recent news event in your domain and add insider context only you can provide.

**THE THOUGHT LEADERSHIP CADENCE:**
• 2 framework or analysis posts per week
• 1 case study per month
• 1 long-form article per month

**THE COMMENT STRATEGY:** Authority is built as much in comments as in posts. Comment with substance on 5 posts per day from people more senior than you. Add a data point, a counter-perspective, or a question that reframes the conversation.

**THE QUOTE-RETWEET PLAY:** Re-post (or repost-with-thoughts) industry articles with your unique angle. This builds the perception that you are "in the conversation" without requiring you to generate original content every day.`,
      insight: "Thought leadership is not about being the smartest. It is about having the clearest, most consistent perspective on a narrow domain. Pick your angle. Hold it. Repeat it in 50 different shapes.",
      exercise: "This week, publish 1 framework post and write 10 substantive comments on senior leaders' posts in your domain. Track the inbound that results over 2 weeks.",
      reflection: "Whose thought leadership do you respect most? What 3 patterns do they repeat? Which of those could you adapt to your voice?",
    },
    {
      lesson: `Authority that doesn't reach decision-makers doesn't change your career. The goal is not popularity — it is recognition by the specific people who can hire you, promote you, or partner with you.

**THE DECISION-MAKER ENGAGEMENT MAP:**
List the 25 people whose recognition would change your career. CHROs, VPs, founders, partners. This is your target list.

**THE 3-TOUCH PROTOCOL:**
For each person on your list:
1. **TOUCH 1 — COMMENT:** Add a substantive comment on 3 of their posts over 2 weeks. They start to recognize your name.
2. **TOUCH 2 — CONNECT:** Send a personalized connection request referencing one of their posts. Acceptance rate ~70%.
3. **TOUCH 3 — VALUE:** Within 30 days of connecting, send ONE message offering something useful — an article, a perspective, an intro. No ask.

**WHAT KILLS IT:**
• Asking for anything in your first message
• Generic "I'd love to connect" templates
• Disappearing for 6 months then asking for a favor

**WHAT WORKS:**
• Consistent presence in their comments
• Sharing their work with your audience and tagging them
• Sending them clients, candidates, or intros with zero ask

After 90 days of this protocol on 25 people, you will have 3–5 warm relationships with senior leaders who know your work. That is more than 99% of professionals ever build.`,
      insight: "Decision-makers don't hire strangers. They hire people they've seen show up, repeatedly, with substance. The 3-Touch Protocol is how you become someone they've seen.",
      exercise: "Build your list of 25 decision-makers this week. Start Touch 1 on the first 10. Track every interaction in a simple spreadsheet.",
      reflection: "Which 5 senior leaders, if they knew your work in depth, would unlock the next 10 years of your career? What is your plan to be known by them?",
    },
    {
      lesson: `Building authority is one challenge. Maintaining it as you scale — more roles, more responsibilities, more visibility — is another.

**THE 3 ENEMIES OF SUSTAINED AUTHORITY:**
1. **DILUTION:** Saying yes to too many domains. Your specificity erodes.
2. **EXHAUSTION:** Content becomes a chore. Quality drops. Audience disengages.
3. **DRIFT:** Your point of view loosens. You start sounding like everyone else.

**THE AUTHORITY MAINTENANCE SYSTEM:**

**MONTHLY:**
• Audit your output — does every post still ladder up to your one positioning?
• Identify 3 new decision-makers to add to the engagement map
• Publish 1 long-form article that deepens your framework

**QUARTERLY:**
• Review your inbound DMs — what are they asking? Is it the right thing?
• Update your About section if your positioning has sharpened
• Refresh your banner and featured section

**ANNUALLY:**
• Re-state your authority statement. Has it become more specific or more generic?
• List the 10 most consequential opportunities authority brought you this year
• Decide what to double down on, what to drop, and what to evolve

**THE COMPOUND EFFECT:** Authority maintained for 3 years becomes structurally hard to compete with. Authority maintained for 10 becomes industry-defining. Your job is consistency, not heroics.`,
      insight: "Authority is not a launch. It is a maintenance discipline. The leaders who dominate their domains for decades are those who do the unsexy monthly audits and quarterly refreshes — forever.",
      exercise: "Block 60 minutes on your calendar for the last Sunday of every month, recurring. Title it: 'Authority Audit.' Run the monthly checklist above.",
      reflection: "What would your career look like in 10 years if you stayed exactly this consistent, this specific, this visible — for every one of those 120 months?",
    },
  ],

  "negotiate-director": [
    {
      lesson: `Salary negotiation begins long before the offer. It begins with intelligence — knowing exactly what the market pays for someone like you, doing what you do, in your location.

**THE 3 LAYERS OF SALARY INTELLIGENCE:**

1. **MARKET RATE:** What the role pays in the open market across companies of similar size and stage. Sources: Glassdoor, LinkedIn Salary Insights, AmbitionBox, Levels.fyi, direct conversations with recruiters.

2. **COMPANY-SPECIFIC RATE:** What this specific company pays at this specific level. Sources: ex-employees on LinkedIn, recruiters who place at this company, the company's published bands if available.

3. **YOUR PERSONAL VALUE:** What you, with your specific track record, are worth at the upper end of the band. Sources: your last 3 quantified achievements, recent competing offers, demand signals from inbound recruiter activity.

**THE SALARY RESEARCH PROTOCOL (do this every 6 months whether or not you're job hunting):**
• Pull 5 active job descriptions for your level + function
• Cross-reference 3 salary data sources
• Talk to 2 recruiters who place in your space
• Document your current market rate range (low / mid / high)

**THE NUMBER YOU ANCHOR ON:** Always the upper end of the band, justified by specific achievements. Never the midpoint. Never your current CTC + a percentage.`,
      insight: "You cannot negotiate from a number you don't have. Most professionals walk into salary conversations with a wish, not a benchmark. The salary intelligence framework converts wishes into evidence-backed asks.",
      exercise: "Run the salary research protocol this week. Document your market rate range (low, mid, high). Save it. This is now your baseline for every negotiation for the next 6 months.",
      reflection: "If you were paid at the upper end of your market band today, what would that number be? What is the gap between that and your current CTC? That gap is your negotiation opportunity.",
    },
    {
      lesson: `The first number in any negotiation creates the gravitational center for everything that follows. This is the anchoring effect — and it is the single most studied phenomenon in negotiation science.

**THE ANCHORING RULE:** Whoever puts the first credible number on the table sets the range. If you wait for them to anchor, you negotiate in their range. If you anchor first with evidence, you negotiate in yours.

**THE ANCHOR FORMULA:** [Specific Number] + [Specific Justification] + [Silence]

Example: "Based on my research on market rates for senior PM roles in fintech, and given my track record of launching 3 platforms that processed ₹400Cr+ annually, I'm targeting a CTC of ₹85L." Then stop talking.

**THE COUNTER-OFFER MECHANICS:**
When they come back with a lower number, do NOT immediately counter. First:
1. **ACKNOWLEDGE:** "I appreciate the offer."
2. **PROBE:** "Help me understand how you arrived at that number."
3. **RE-ANCHOR:** "Based on what I've shared, the target I had in mind was ₹X — what would it take to close the gap?"

**THE 3 ZONES OF NEGOTIATION:**
• **YOUR TARGET** (the number you want): always 15–25% above their first offer
• **YOUR WALKAWAY** (the number below which you say no): set in advance, never disclosed
• **YOUR ZONE OF AGREEMENT** (the band between target and walkaway): this is where the deal lives

THE POWER OF GENUINE ALTERNATIVES: The single biggest negotiation lever is a real alternative offer. If you have another offer — or another process at an advanced stage — your position transforms. This is why job search and negotiation are the same activity: the best way to negotiate at your current company is evidence of your market value from an external offer.`,
      insight: "Silence is your most powerful negotiation tool. When you state your number, stop talking. The first person to break the silence after an anchor loses leverage. Practice sitting in silence for 10 seconds after naming your price.",
      exercise: "In your next significant negotiation (salary, contract, vendor, internal resource), state your position clearly and specifically, then say nothing. Count silently to 10 before speaking again. Notice what happens.",
      reflection: "In past negotiations, have you undercut yourself before the other side even responded? Have you added qualifiers, reduced your ask, or filled silences with justifications? That pattern is worth examining. Where does it come from?",
    },
    {
      lesson: `Negotiation is not just words. It is signal-reading. The skilled negotiator listens for what is NOT said as carefully as what is.

**THE 5 SIGNALS YOU MUST READ:**

**SIGNAL 1 — THE ENTHUSIASM GAP**
Are they pursuing you, or are you pursuing them? Pursuit = leverage. If they've come back 3 times, asked for more interviews, said "we really want you" — you have room. If they're slow, generic, and process-driven — you don't.

**SIGNAL 2 — THE BUDGET LANGUAGE**
"Our band is X" = strict policy, hard to move.
"Let me check what we can do" = soft constraint, room to negotiate.
"We typically pay X" = anchored to a benchmark, can be challenged with better data.

**SIGNAL 3 — THE DECISION-MAKER DISTANCE**
Are you negotiating with the hiring manager (high leverage), HR (medium), or a recruiter (low)? Push to negotiate with the highest-authority person possible.

**SIGNAL 4 — THE TIME PRESSURE**
Who needs this deal more — them or you? If they have a vacancy 3 months open, you have leverage. If they have 4 other candidates lined up, you don't.

**SIGNAL 5 — THE COUNTER WITHOUT A NUMBER**
"We'll see what we can do." "Let me take this back." These are not rejections — they are buying signals with a delay. Follow up in 24 hours with: "I appreciated our conversation. I'm excited about the role. Where did you land on the compensation question?"`,
      insight: "Every negotiation gives off signals. The amateur negotiates the number. The professional negotiates the relationship around the number. Read the room — and respond to what's actually being said.",
      exercise: "In your next negotiation, write down every word the other side uses about budget, timing, and decision-making. Map those words to the 5 signals above. Adjust your strategy mid-conversation based on what you read.",
      reflection: "Looking back at your last negotiation, which signals did you miss? What would you have done differently if you'd been reading the room more carefully?",
    },
    {
      lesson: `Every salary negotiation hits the same objections. You just need to have the right response prepared before they arise. Here are the 6 most common objections in Indian corporate negotiations — and the exact responses that work.

**OBJECTION 1: "This is our best offer. We don't have budget for more."**
Do NOT: Accept it immediately or push back aggressively.
DO SAY: "I appreciate your transparency. Help me understand — is the budget constraint specifically on base salary, or does it apply to the total package? Sometimes there's flexibility in variable pay, joining bonus, or the review timeline."

**OBJECTION 2: "Your current CTC is our benchmark, and we can only offer X% above that."**
DO SAY: "I understand that's a common starting point, but I'd like to separate my current CTC from my market value. Based on what this role requires and what comparable roles at similar companies offer, the market rate is ₹[X]–₹[Y]. I'm asking to be compensated at market, not above it."

**OBJECTION 3: "Let's revisit this after 6 months when we see your performance."**
DO SAY: "I'd love to make that commitment. What I'd ask is that we set that in writing — a specific target and a specific CTC outcome if I hit it. Can we agree on that today?"

**OBJECTION 4: "Everyone on the team is at this level — we need to maintain internal parity."**
DO SAY: "I respect the internal structure. The market for someone with my specific background — [2–3 specifics] — is above the band you've described. If internal parity is a constraint, what would it take to open a re-banding conversation?"

**OBJECTION 5: "We have other candidates we're considering."**
DO SAY (calmly): "I understand. I'd like to make my decision based on the right fit and the right compensation. If this role doesn't work at the level I've described, it's difficult for me to move at the offer as it stands. But I want this to work — is there any path to ₹[X]?"

**OBJECTION 6: "The role might not be the right fit for your salary expectation."**
DO SAY: "That's a fair point. Can you help me understand specifically where you see the gap? Is it about the scope, the budget, or my profile match?"

THE GOLDEN RULE: Never argue. Never justify. Never apologize. Acknowledge → Reframe → Redirect.`,
      insight: "Every salary objection is a question in disguise. 'We don't have budget' means 'convince me you're worth it.' 'We need to maintain parity' means 'help me make a case internally.' Your job is to understand the real question and answer it.",
      exercise: "Record yourself responding to all 6 objections above. Listen back. Are your responses calm, direct, and specific? Or are they apologetic, hesitant, and vague? The quality of your response in this recording is the quality of your negotiation in the room.",
      reflection: "Which of these 6 objections have you heard before and did not know how to respond to? What did you say instead? What would you say differently now?",
    },
    {
      lesson: `Getting the number is not enough. How you close a negotiation determines whether the offer holds, whether the relationship is intact, and whether you start your new role with goodwill or tension.

THE NEGOTIATION CLOSE — 3 POSSIBLE OUTCOMES:

**OUTCOME 1 — YOU GET WHAT YOU ASKED FOR:**
"Thank you — I'm really pleased we could find a number that works. I'm excited about this role and I'm committed to making this a great decision for both of us."
Then stop talking. Do not add qualifiers. Do not renegotiate. Close it.

**OUTCOME 2 — YOU GET CLOSE BUT NOT EXACTLY:**
"I appreciate the flexibility. I'm going to accept — I want to flag that I'm expecting to be reviewed at the 6-month mark and I'll be holding us both accountable to that conversation."
Then get the review commitment in writing. An email is enough.

**OUTCOME 3 — THE GAP IS TOO LARGE:**
"I've genuinely enjoyed this process and I respect the company greatly. The gap between what I'm targeting and what's available makes it difficult for me to say yes today. I'd ask for one final check — is there truly no path to ₹[X] in any form? If not, I'll need to continue my search, though I'd love the opportunity to revisit if something changes."
Then walk away cleanly. Bridges intact. No burning. Many of the best offers in careers come from a candidate who walked away and was called back 3 weeks later when budget was found.

**GET EVERYTHING IN WRITING:** Verbal offers mean nothing. Within 24 hours of accepting, email: "Thank you for the offer. As discussed, I'm accepting the position of [Title] with a CTC of ₹[X], with [any negotiated terms]. Please confirm the date for the formal offer letter."

THE COMPOUNDING EFFECT OF ONE NEGOTIATION: A ₹2L increase today compounds:
• Year 2 appraisal: your base is ₹2L higher
• Year 3 promotion: your new role starts from a higher base
• Next external offer: your current CTC is the anchor, and it is higher
• 10-year compounding: a single ₹2L negotiation can represent ₹20–40L in career earnings

Negotiate every time. Always.`,
      insight: "One successful negotiation today will compound into lakhs over the next decade. The discomfort of asking lasts 10 minutes. The financial impact lasts the rest of your career. The cost of not negotiating is always higher than the cost of asking.",
      exercise: "Write your personal Negotiation Close script for each of the 3 outcomes above. Personalize the language to feel natural in your voice. Rehearse the walk-away response specifically — this is the one that most professionals cannot do comfortably, and it is the one that changes the game.",
      reflection: "What is the total financial impact of every time you did not negotiate in your career? Add up the approximate CTC differences. How does that number feel? What would you tell your younger self?",
    },
  ],

  "executive-presence": [
    {
      lesson: `Executive presence is not confidence. It is not charisma. It is not a power suit or a corner office. Executive presence is the ability to make others feel, in your presence, that they are with someone who has the situation under control — even when they do not.

This is a learnable skill. Not a personality trait. Not a genetic advantage. A skill built through deliberate practice.

**THE 5 ELEMENTS OF EXECUTIVE PRESENCE:**

1. **CLARITY OF THOUGHT:** Can you articulate what you think, quickly and precisely? Executives don't think out loud. They think first, then speak.

2. **COMMAND OF ROOM:** Do people orient toward you when you speak? Command is earned through specificity, pacing, and the absence of apology.

3. **COMPOSURE UNDER PRESSURE:** How do you show up when things are difficult? The ability to stay regulated, measured, and clear in high-stakes moments is what separates senior leaders from capable technicians.

4. **CONVICTION:** Do you have a point of view? Constant hedging ("It depends," "Maybe," "I'm not sure but...") destroys presence instantly.

5. **CONSIDERATION OF OTHERS:** Does your presence make others feel seen? The most senior leaders have a quality of full attention.

**THE EXECUTIVE PRESENCE AUDIT:** After every significant meeting for the next 2 weeks, score yourself on each of the 5 elements from 1–5.
• Where are you strongest?
• Where do you consistently drop?
• Which element would make the biggest difference to your career if you improved it?

Start with the lowest-scoring element. Not the easiest — the most impactful.`,
      insight: "Executive presence is not about being impressive. It is about being clear. The professional who can state a complex situation in 3 sentences and a recommendation in 1 has more executive presence than the professional who speaks for 20 minutes and covers everything. Clarity is the code.",
      exercise: "Think of the last important meeting you were in. Score yourself from 1–5 on each of the 5 elements. Where were you strongest? Where did you drop? Write one specific thing you will do differently in your next meeting for your lowest-scoring element.",
      reflection: "Who in your organization or network embodies executive presence for you? What specifically do they do — or not do — that creates that impression? What of that can you practice?",
    },
    {
      lesson: `The single biggest communication error that prevents talented professionals from advancing: leading with context instead of conclusions. Senior stakeholders do not want to understand your process. They want to understand your recommendation, and then decide whether they need the context.

**THE PYRAMID PRINCIPLE FOR SENIOR COMMUNICATION:**
Start with the answer. Build the support below it.

WRONG (bottom-up, most common): "So we looked at the data from Q2, and we analyzed trends across 3 regions, and after cross-referencing with the market data... we think we should proceed with Option B."

RIGHT (top-down, pyramid principle): "Recommendation: proceed with Option B. Here's why — [3 supporting reasons in descending order of importance]. The data is here if you want to go deeper."

**THE BLUF FRAMEWORK (Bottom Line Up Front):**
1. State your recommendation in the first sentence
2. Follow with 3 supporting points, each in one sentence
3. Offer to go deeper if needed

Applies to emails, presentations, status updates, verbal briefings. Senior professionals make 50+ decisions a day. They need information structured for decisions, not for understanding.

**LANGUAGE UPGRADES — FROM JUNIOR TO SENIOR:**
• "I think maybe we should consider..." → "I recommend we..."
• "This is a bit tricky..." → "There are two specific tradeoffs..."
• "I'll try to..." → "I'll deliver by Friday."
• "Sorry to bother you..." → (delete)
• "Just wanted to..." → (delete the word 'just')
• "Does that make sense?" → "What questions do you have?"

**THE 1-3-1 STRUCTURE for any senior briefing:**
1 sentence: the recommendation
3 sentences: the supporting logic
1 sentence: the ask`,
      insight: "Senior leaders are time-poor. The professional who respects their time wins their attention. Lead with the conclusion. Drop the hedges. Make every sentence earn its place.",
      exercise: "Take your next email to a senior stakeholder. Rewrite it using the BLUF framework. Cut the word count by 50%. Send it. Notice the speed of response.",
      reflection: "What 3 verbal habits do you have that signal junior thinking? (e.g., 'just', 'sorry to bother', 'I think maybe'). What would happen if you eliminated them for 30 days?",
    },
    {
      lesson: `Speaking to a CXO is structurally different from speaking to a peer. The vocabulary is different. The pace is different. The framing is different.

**THE CXO COMMUNICATION RULES:**

1. **LEAD WITH BUSINESS IMPACT, NOT FUNCTIONAL DETAIL.** CXOs care about revenue, cost, risk, growth, and reputation. Translate everything you do into one of those 5 lenses.

Wrong: "We implemented a new ATS system."
Right: "We reduced time-to-hire by 40%, saving ₹2Cr in lost productivity this year."

2. **USE THEIR LANGUAGE, NOT YOURS.** Drop function-specific jargon. Speak in the language of the executive's domain: financial, strategic, competitive.

3. **OFFER OPTIONS, NOT ANSWERS.** CXOs prefer to choose between framed options rather than receive a single recommendation. Frame: "We have three paths. Path A optimizes for X. Path B optimizes for Y. I recommend B because Z."

4. **OWN THE FRAMING.** Whoever frames the conversation controls it. Open with your framing: "The decision in front of us is whether to..." or "The question I'd like to align on is..."

5. **ANTICIPATE THE NEXT 2 QUESTIONS.** When you make a recommendation, the CXO is already thinking 2 questions ahead. Answer them in advance.

**THE 4-MINUTE BRIEFING STRUCTURE for senior 1-on-1s:**
Minute 1: Recommendation + 3-point logic
Minute 2: Anticipated risks + mitigation
Minute 3: Options if they want optionality
Minute 4: Specific ask + timeline

Practice this until it's instinctive. It changes how CXOs perceive you within 3 interactions.`,
      insight: "Communicating like a CXO is not about complexity — it's about compression. Take a 30-minute analysis and compress it to a 4-minute briefing without losing the signal. That compression is the skill.",
      exercise: "Take your next senior briefing or 1-on-1. Prepare a 4-minute version of your update using the structure above. Rehearse it once. Deliver it. Time yourself.",
      reflection: "Which senior leader in your organization do you communicate with least effectively? What is one specific change in framing or compression that would change that relationship?",
    },
    {
      lesson: `Most professionals operate as if authority equals influence. It does not. The most influential people in any organization are rarely the most senior. They are the most trusted, the most credible, and the most strategic in their relationships.

**THE 4 SOURCES OF INFLUENCE WITHOUT AUTHORITY:**

1. **EXPERTISE INFLUENCE:** You know something others need. Build deep, defensible expertise in 1–2 areas your organization cares about. Become the go-to person for those topics.

2. **RELATIONSHIP INFLUENCE:** People do things for people they trust and like. Invest in cross-functional relationships before you need them. Coffee chats, intros, helping people get visible — this is the currency.

3. **INFORMATION INFLUENCE:** You know what's happening. You see across silos. You connect dots others don't. Curate and share intelligence in your network and you become indispensable.

4. **MOVEMENT INFLUENCE:** You make things happen. You take initiative. You deliver outcomes others didn't think were possible. Reputation for execution is the highest-leverage influence currency in any organization.

**THE INFLUENCE LADDER:**
• **Step 1:** Build a reputation for delivery (movement influence)
• **Step 2:** Become known for 1–2 specific areas of expertise (expertise influence)
• **Step 3:** Build deep, cross-functional relationships (relationship influence)
• **Step 4:** Become a curator and broker of information (information influence)
• **Step 5:** All four compound — you become structurally influential, regardless of title

**THE STAKEHOLDER MAP:** List every person in your organization whose alignment you need to be effective. For each, score your current relationship from 1–5. Identify the bottom 3. Invest in those over the next 90 days.`,
      insight: "Influence is not given by your title. It is earned through expertise, relationships, information, and execution. The professionals who advance fastest are those who build all four — deliberately, over years.",
      exercise: "Build your stakeholder map this week. Score every key relationship 1–5. Pick the 3 lowest scores. Schedule a coffee, a Loom video, or a substantive Slack message with each of them this month.",
      reflection: "Whose influence in your organization do you admire most? What do they do — beyond their title — that creates that influence? What of that can you adopt?",
    },
    {
      lesson: `Executive presence is unsustainable on willpower alone. The professionals who maintain presence over decades have built energy systems that keep them clear, composed, and effective — even under sustained pressure.

**THE 4 ENERGY DOMAINS:**

1. **PHYSICAL ENERGY:** Sleep, nutrition, exercise. The non-negotiable foundation. Most executive presence collapses under chronic sleep deprivation.

2. **EMOTIONAL ENERGY:** The ability to regulate under stress. Built through awareness, practice, and (often) therapy or coaching.

3. **MENTAL ENERGY:** The capacity for sustained focus and clarity. Eroded by context-switching, notifications, and decision fatigue. Restored by deep work, single-tasking, and structured time.

4. **SPIRITUAL ENERGY:** The connection to purpose and meaning. The "why" that gets you through the hard quarters. Without this, presence is performance — and performance is exhausting.

**THE EXECUTIVE ENERGY AUDIT (monthly):**
• Sleep: Am I averaging 7+ hours?
• Movement: Am I exercising 3x+ per week?
• Focus: Am I getting 2+ hours of deep work daily?
• Recovery: Am I taking real breaks, weekends, and vacations?
• Purpose: Am I clear on why this work matters to me?

If you score below 70% on this audit for 3 consecutive months, your executive presence is in structural decline — even if no one has told you yet.

**THE NON-NEGOTIABLES OF SENIOR LEADERS WHO LAST:**
• Sleep treated as a strategic asset, not a weakness
• A morning routine that loads the day with intention
• Calendar boundaries — meetings end when scheduled
• A weekly review — what went well, what didn't, what to change
• Quarterly time away from the business to think strategically

Executive presence is downstream of executive energy. Build the energy system. The presence follows.`,
      insight: "You cannot perform executive presence on an empty tank. The leaders who sustain presence for decades are the ones who treat energy management as a leadership skill, not a personal indulgence. Energy is infrastructure.",
      exercise: "Run the Executive Energy Audit this week. Identify your single weakest domain. Implement one specific change for the next 30 days. Re-audit in 30 days.",
      reflection: "What would your executive presence look like in 5 years if you treated your energy as the strategic asset it is? What would you have to start — and stop — to make that real?",
    },
  ],

  "ai-first-operator": [
    {
      lesson: `The professionals who will dominate the next decade are not those who use AI as a toy. They are those who treat AI as a force multiplier — built into every weekly routine of their career.

**THE 3 CATEGORIES OF AI USERS IN 2026:**

1. **AVOIDERS:** "It will pass. I don't need it." These professionals will be priced out of senior roles within 5 years. Every CXO is now asking: "Does this person use AI effectively?"

2. **DABBLERS:** Use ChatGPT for the occasional email. Treat it as a curiosity. Slight productivity gain. No structural advantage.

3. **OPERATORS:** Have built AI into their weekly career operating system. Use it for research, content, applications, interviews, negotiation, learning. Compound 2–4x productivity over peers, every month.

The gap between Dabblers and Operators in 2026 is the gap between Word users and typists in 1995. It is the difference between professionals who advance and professionals who plateau.

**THE AI OPERATOR MINDSET:**
• AI is a thinking partner, not a magic button
• Better prompts produce better outputs — prompt skill is a career skill
• The output is a draft, not a finished product — your judgment is the value-add
• Time saved is not the goal — quality compounded is the goal
• AI eliminates the excuses (no time, don't know how to start) — only execution remains

**THE 5 ZONES WHERE AI CHANGES THE CAREER MATH:**
1. **Content & visibility** (LinkedIn posts, articles, talks)
2. **Research & preparation** (companies, interviews, markets)
3. **Communication** (emails, briefings, presentations)
4. **Learning & upskilling** (new domains, frameworks, tools)
5. **Personal productivity** (planning, prioritization, documentation)

The Operator builds a workflow for each. The Dabbler does none. That is the entire difference.`,
      insight: "AI is not the future of work. AI is the present of work. The professionals who treat it as infrastructure — like email or calendar — will outpace those who treat it as a novelty. The gap compounds monthly.",
      exercise: "Audit your last 7 working days. Identify 5 specific tasks where AI could have saved 50%+ of the time. For each, write the prompt you would use next time. This is your starter prompt library.",
      reflection: "In 3 years, what would your career look like if you used AI deliberately every week for content, research, communication, and learning? What is stopping you from starting today?",
    },
    {
      lesson: `The single biggest skill multiplier in 2026 is prompt design. The professional who knows how to extract precise, useful output from AI is structurally more productive than the professional who doesn't — and the gap is growing.

**THE 4-LAYER PROMPT STACK:**

1. **CONTEXT:** Who you are, what you do, what situation you're in. Give the AI enough background to be useful.
2. **TASK:** What you want it to produce. Be specific about format, length, tone.
3. **CONSTRAINTS:** What it should NOT do. (e.g., "no generic openers," "under 200 words," "in my voice")
4. **EXAMPLES:** Show it what good looks like. 1–2 examples of the output you want.

**EXAMPLE — A POOR PROMPT:**
"Write a LinkedIn post about leadership."

**EXAMPLE — AN OPERATOR PROMPT:**
"I'm a senior HRBP with 12 years of experience in BFSI. I'm building a LinkedIn presence around the theme of 'building trust in leadership.' Write a 150-word LinkedIn post with: a counterintuitive hook in line 1, a specific story from my experience (use placeholder for me to fill in), and a question CTA. Avoid generic openers. Match the tone of [paste 2 examples of posts you like]."

**PROMPT STACKS FOR CAREER ACCELERATION:**

• **LinkedIn post stack:** Context + theme + format + constraints + 2 example posts
• **Resume tailoring stack:** Paste JD + paste current resume section + ask AI to mirror keywords without changing substance + flag top 5 keywords
• **Interview prep stack:** Paste JD + paste your background + ask for 10 likely questions + STAR structure for each + flag the 3 trickiest
• **Salary research stack:** Paste your role/level/location/specialization + ask for CTC range with base/variable/equity breakdown + identify factors that move someone to the upper end

**THE ITERATION RULE:** Your first prompt is a draft. Your second is sharper. Your fourth is excellent. Most people give up at the first output. Operators iterate.`,
      insight: "Prompt design is the new typing. The professionals who invest 10 hours in prompt fluency this quarter will compound that investment for the rest of their careers. Start your prompt library this week.",
      exercise: "Build a personal prompt library this week. Create one prompt stack each for: LinkedIn posts, resume tailoring, interview prep, salary research, and weekly intelligence briefing. Save them in a notes app. Use them weekly.",
      reflection: "What is the one career task you spend the most time on weekly? What would change if you had a refined prompt stack that cut that time by 70%?",
    },
    {
      lesson: `Content production is the highest-leverage application of AI for working professionals. Used correctly, AI can produce 10x the output at higher quality — without making your content sound generic.

**THE 3-STEP AI CONTENT WORKFLOW:**

**STEP 1 — YOUR INSIGHT (no AI):**
Spend 5 minutes writing your rough, raw insight. The specific observation, story, or point of view. This is the part only you can provide. Do not use AI here.

**STEP 2 — AI EXPANSION:**
Feed your rough insight into AI with this prompt:
"Here is a rough insight I want to turn into a LinkedIn post: [paste]. Expand this into a 150-word post with: a counterintuitive hook in line 1, the insight clearly developed in lines 2–7, and a question CTA in the final line. Match this tone: [paste 1–2 example posts of yours]."

**STEP 3 — EDIT BACK TO YOUR VOICE:**
Take the AI output and edit ruthlessly. Remove anything generic. Add your specific context, numbers, story. Keep the structure — replace the substance.

Result: A well-structured, well-written post that sounds like you — built in 20 minutes.

**THE AUTHENTICITY RULE:** AI can structure and enhance. Only you can provide the specific insight, the real story, the genuine perspective. If an AI-generated post could have been written by anyone — delete it. Your brand is built on what only you can say.

**AI TOOLS FOR PERSONAL BRAND:**
• **Claude (Anthropic):** Best for nuanced, thoughtful content. Strong on tone.
• **ChatGPT:** Good for first drafts and volume.
• **LinkedIn Newsletter AI:** Useful for longer-form thought leadership.
• **Canva AI:** Design your visual content with AI-generated layouts.`,
      insight: "AI does not replace your expertise — it amplifies it. The insight is yours. The story is yours. The experience is yours. AI's job is to help you express those things more clearly and more consistently than you could doing it alone.",
      exercise: "Write 3 LinkedIn posts this week using the 3-Step AI Content Workflow. For each: write your rough insight first (no AI), then use the AI expansion prompt, then edit it back to your voice. Compare the time investment to your usual approach.",
      reflection: "What is the version of your LinkedIn content that sounds most like you at your best — specific, insightful, grounded in real experience? What stops you from creating that content consistently without AI? What does AI make possible that removes that barrier?",
    },
    {
      lesson: `Job search is one of the highest-leverage applications of AI for working professionals. Used correctly, AI can reduce time spent on applications by 70%, while increasing the quality and personalization of every application.

**AI-POWERED RESUME TAILORING:**
The rule from Course 1: your resume must mirror the keywords in the job description. AI makes this fast.

Prompt: "Here is a job description: [paste JD]. Here is my current resume summary and experience bullets: [paste]. Rewrite my summary and adjust my bullets to mirror the keywords in this JD without changing the substance of my experience. Flag the 5 most important keywords I should prioritize."

Result: A tailored resume section in 3 minutes that would have taken 45 manually.

**AI FOR COMPANY RESEARCH (pre-interview):**
Prompt: "I'm interviewing for a [Role] at [Company]. The company is publicly traded / Series C funded / a subsidiary of [Parent]. Based on the industry, recent performance, and strategic challenges, what are the 3 most likely business priorities my role would need to address? What questions should I be prepared to answer?"

**AI FOR COVER LETTER:**
Prompt: "Write a 3-paragraph cover letter for a [Role] at [Company]. My background: [2–3 sentences]. Why this company: [1 specific reason based on research]. What I bring: [1–2 specific outcomes]. Make it direct, confident, under 250 words. No generic openers."

**AI FOR INTERVIEW PREPARATION:**
Prompt: "I am interviewing for [Role] at [Company]. Based on the JD below, generate the 10 most likely interview questions. For each, give me the STAR structure for my answer, based on this career summary: [your summary]. Flag the 3 questions most likely to trip me up."

**AI-POWERED SALARY RESEARCH:**
Prompt: "I am a [Role] with [X] years in [Domain] based in [City]. My specializations include [2–3 specifics]. I'm exploring roles at [Company type/size]. Based on current market data in India for 2025, what is the likely CTC range? Break down by base, variable, equity, total CTC. Identify the factors that move someone from lower to upper end."

**AI FOR COUNTER-OFFER DRAFTING:**
Prompt: "I have an offer of ₹[X] for a [Role] at [Company]. I want to negotiate to ₹[Y]. My leverage: [competing offer / market research / achievements]. Write a 4-sentence professional email that thanks them, requests a higher number with rationale, leaves the door open. Tone: confident, not apologetic."`,
      insight: "AI does not apply for jobs. You do. But AI can prepare you for every stage of the process in a fraction of the time — and with significantly more depth than manual research allows. The candidates getting offers at senior levels are the ones who show up most prepared.",
      exercise: "Take one job you're currently interested in. Run the AI resume tailoring prompt, the company research prompt, the interview preparation prompt, and the salary research prompt. Set aside 3 hours to do this seriously. Compare how prepared you feel.",
      reflection: "In your last 3 applications or interviews, how much time did you spend on preparation? Was it enough? AI can close the gap between how prepared you felt and how prepared you wanted to feel.",
    },
    {
      lesson: `The goal of this final module is not to teach you tools. It is to help you build a personal AI system that runs in the background of your career — consistently amplifying your output, your visibility, and your market value.

**YOUR PERSONAL AI CAREER OS — 5 COMPONENTS:**

**COMPONENT 1 — WEEKLY INTELLIGENCE BRIEFING**
Every Monday morning, use AI to generate your career intelligence brief.
Prompt: "I am a [Role] in [Industry]. What are the 3 most important developments in my industry from the past week? What are the implications for professionals in my function? What is one action I should consider taking?"
This keeps you plugged in — and generates LinkedIn content automatically.

**COMPONENT 2 — CONTENT PRODUCTION SYSTEM**
• 3 posts per week using the 3-step AI workflow
• 1 article per month using AI for structure + your expertise for substance
• Batch your content every Sunday for the coming week

**COMPONENT 3 — APPLICATION INTELLIGENCE**
Every time you target a role, run:
• Resume tailoring prompt
• Company research prompt
• Interview prep prompt
• Market rate research prompt
This takes 3 hours and is worth 3 weeks of generic preparation.

**COMPONENT 4 — PERFORMANCE DOCUMENTATION**
At the end of every month, use AI to document your achievements.
Prompt: "Here are key things I accomplished this month: [rough notes]. Convert these into Q-STAR achievement bullets suitable for LinkedIn and my resume. Each bullet: Action + Context + Specific quantified result."
When your annual review arrives, you have 12 months of documented achievements ready.

**COMPONENT 5 — LEARNING ACCELERATION**
When you need to quickly understand a new domain:
Prompt: "I need to understand [topic] well enough to have a credible conversation with senior stakeholders in [context] within 48 hours. Give me the 5 most important concepts, the most common misunderstandings, 3 questions I should ask to seem knowledgeable, and 2 things experts care most about."

**THE AI-FIRST PROFESSIONAL:** In 2025 and beyond, the professionals who advance fastest are those who have built these systems — and use them consistently. Not as a shortcut. As infrastructure. The same way you use a calendar, email, and a phone.

AI is now part of the professional toolkit. Use it deliberately, and it compounds. Ignore it, and your competitors compound past you. Your Career OS is now live. Use it.`,
      insight: "AI is infrastructure, not shortcut. The professionals who build AI into their weekly career systems — content, research, preparation, documentation — will compound their professional value at a rate manual-only professionals cannot match. Start building your system today.",
      exercise: "Set up all 5 components of your Personal AI Career OS this week. Block 30 minutes every Sunday for your weekly intelligence briefing and content batching. Block 2 hours at the end of every month for performance documentation. Your career OS is now operational.",
      reflection: "In 12 months, what would your career look like if you used this AI Career OS consistently every week? What would be different about your visibility, your preparation, your market value, your opportunities? That outcome is available to you — it starts with the system, not the talent.",
    },
  ],
};

export function getModuleContent(slug: string, moduleIndex: number): ModuleContent | null {
  return COURSE_CONTENT[slug]?.[moduleIndex] ?? null;
}
