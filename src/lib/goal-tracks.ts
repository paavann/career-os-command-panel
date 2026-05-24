export type GoalTrack = {
  goal: string;
  missions: Array<{
    slug: string;
    title: string;
    xp: number;
    coins: number;
    pillar: "clarity" | "authority" | "reach" | "evidence" | "energy" | "revenue";
  }>;
};

export const GOAL_TRACKS: Record<string, GoalTrack> = {
  "Get promoted": {
    goal: "Get promoted",
    missions: [
      { slug: "promo_li_leadership_proof", title: "Update LinkedIn with leadership proof point", xp: 50, coins: 10, pillar: "authority" },
      { slug: "promo_senior_feedback",     title: "Request feedback from one senior stakeholder", xp: 75, coins: 15, pillar: "evidence"  },
      { slug: "promo_visibility_moment",   title: "Attend one internal visibility moment",        xp: 60, coins: 12, pillar: "reach"     },
    ],
  },
  "Find a new job": {
    goal: "Find a new job",
    missions: [
      { slug: "job_apply_target_roles",  title: "Apply to 2 target roles",               xp: 75, coins: 15, pillar: "evidence"  },
      { slug: "job_connect_recruiter",   title: "Connect with one recruiter",            xp: 50, coins: 10, pillar: "reach"     },
      { slug: "job_thought_leadership",  title: "Post one thought leadership piece",     xp: 60, coins: 12, pillar: "authority" },
    ],
  },
  "Build external visibility": {
    goal: "Build external visibility",
    missions: [
      { slug: "viz_publish_post",        title: "Publish one post on your area of expertise", xp: 60, coins: 12, pillar: "reach"     },
      { slug: "viz_engage_seniors",      title: "Engage on 3 senior professionals' posts",    xp: 40, coins: 8,  pillar: "reach"     },
      { slug: "viz_add_case_study",      title: "Add one case study to your profile",         xp: 75, coins: 15, pillar: "evidence"  },
    ],
  },
  "Get a salary raise": {
    goal: "Get a salary raise",
    missions: [
      { slug: "raise_log_win",           title: "Document one revenue or cost win today",  xp: 50, coins: 10, pillar: "evidence"  },
      { slug: "raise_comp_benchmark",    title: "Pull 3 comp benchmarks for your role",    xp: 60, coins: 12, pillar: "revenue"   },
      { slug: "raise_send_winupdate",    title: "Send your weekly win-update to manager",  xp: 75, coins: 15, pillar: "authority" },
    ],
  },
  "Grow my consulting income": {
    goal: "Grow my consulting income",
    missions: [
      { slug: "cons_share_outcome",      title: "Share one anonymized client outcome",     xp: 60, coins: 12, pillar: "reach"     },
      { slug: "cons_productize_offer",   title: "Refine one productized offer line",       xp: 75, coins: 15, pillar: "revenue"   },
      { slug: "cons_outreach_warm",      title: "Send 3 warm-lead outreach messages",      xp: 50, coins: 10, pillar: "revenue"   },
    ],
  },
};

export const DEFAULT_TRACK = GOAL_TRACKS["Build external visibility"];

export function trackForGoal(goal: string | null | undefined): GoalTrack {
  if (!goal) return DEFAULT_TRACK;
  return GOAL_TRACKS[goal] ?? DEFAULT_TRACK;
}
