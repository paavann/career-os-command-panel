# BlueChip CareerOS™ Diamond Control Center — Production Audit and Weekend MVP Plan

## Executive recommendation

Ship one coherent authenticated member loop:

```text
Set 90-day goal → receive next action → complete meaningful work
       ↓                                      ↓
See milestone/CPI/certification progress ← earn ledgered XP
       ↓
Coach sees progress, stalled reason, and next intervention
```

Use Supabase-authenticated `profiles.id` as the production identity. Keep the public `/career` workspace available but outside the primary Control Center flow until its `members.id` identity is deliberately mapped to an authenticated user. Do not expand Community, Marketplace, charity, or cosmetic gamification before this loop is reliable.

## A. Already production-ready or strongly reusable

These areas are substantially functional, though every release path still needs final authenticated smoke testing:

- **Account foundation:** password and Google sign-in, protected routes, onboarding, editable profile.
- **Control Center foundation:** Command dashboard, Today’s Brief, CPI display, weakest-pillar insight, goal-aware content.
- **C.A.R.E.E.R. core:** six authenticated pillar scores and CPI recalculation; separate rich `/career` assessments, Evidence Vault, Energy Rewrite, structured AI, history, and exports.
- **Actions and rewards:** daily missions, five goal tracks, completion states, XP/coins/streak fields, leaderboard, and service-side `award_xp` RPC.
- **Learning:** six complete courses, 30 modules, lesson/exercise content, notes, module completion, progress, and XP.
- **Job execution:** complete tracker CRUD, stages, history, follow-ups, notes, stale alerts, AI assistance, KPIs, and export.
- **AI Hub:** ten authenticated copilots with streaming and persisted conversations through the configured Lovable AI/Gemini gateway.
- **Coach foundation:** `/admin/clients` aggregates identity, scores, missions, jobs, courses, AI activity, and status into one Diamond-client roster and drawer.
- **Operational baseline:** all 19 public tables have RLS enabled; recent builds passed.

## B. Partially built

- **Goals:** `primary_goal`, `target_timeline`, `target_role`, and challenge exist, but there is no 90-day goal record, target date, milestones, progress method, or history.
- **Actions:** daily and goal-track actions work in separate models. Goal tracks contain only three hard-coded actions each; weekly planning and one coherent action queue are absent.
- **Points:** XP events exist and several flows call `award_xp`, but the ledger is empty in live data, lacks idempotency/related-object detail, and admin edits bypass it. Course uncompletion can award negative XP.
- **Checkup:** CPI and six pillar scores provide a health snapshot, but there is no dated checkup history, explicit health state, or persisted next recommendation.
- **Progress:** XP, levels, streaks, course progress, CPI, and mission totals exist, but Journey is mainly static and does not derive a trustworthy member stage.
- **Certification:** course completion can be used as evidence, but no certification requirements, checklist, evidence review, readiness state, or issuance model exists.
- **Clusters:** courses, pillars, AI tools, and goal tracks can form capability clusters, but no shared cluster map currently ties them together.
- **Coach view:** useful and about 80% reusable, but has a 500-row/client-side filtering ceiling, inconsistent CPI sources, no precise stalled reason, coach notes, assignment, nudge, or certification oversight.
- **Community:** attractive journey UI exists, but other members’ stages are assigned artificially and wins are fixtures rather than persisted activity.
- **Live events:** currently static fixture data; RSVP and Calendar controls are not operational.

## C. Missing from the required end-state

- Canonical primary and 90-day goals with milestones, due dates, completion, and calculated progress.
- A single “Next Best Action” queue combining first, daily, weekly, learning, and opportunity actions.
- Auditable, idempotent XP/points rules across every meaningful action.
- Dated checkups with recommendation history.
- Diamond certification checklist, evidence submission, coach review, and completion state.
- Goal-linked capability clusters and derived cluster progress.
- Optional contribution/charity records.
- Marketplace records for referrals, offers, alliances, and discovery.
- Production coach workflow: stalled reasons, notes, follow-up state, and intervention queue.
- One identity across authenticated CareerOS and access-code `/career`.
- Automated end-to-end tests, seeded acceptance accounts, operational monitoring, backup/rollback drill, and AI cost/rate controls.

## D. Minimal production architecture and data model

### Identity and boundaries

- **Canonical identity:** `auth.users.id = profiles.id` for Control Center, goals, actions, XP, certification, courses, jobs, and coach reporting.
- **Admin authorization:** keep `user_roles`; use `admin` for weekend delivery instead of introducing a new coach role.
- **Standalone `/career`:** do not silently merge browser-generated `bc_member_id` records. Keep it optional/unlinked for MVP, then add an explicit verified claim/mapping flow after launch.
- **Access:** make `/` the authenticated Control Center. Do not expose `/pricing` or legacy tier language in Diamond navigation.

### Add only the minimum persisted models

1. **`career_goals`**
   - `id`, `user_id`, `goal_type` (`primary`, `90_day`), `title`, `target_date`, `status`, `created_at`, `updated_at`.
   - One active row of each type per user.

2. **`goal_milestones`**
   - `id`, `goal_id`, `title`, `position`, `due_date`, `status`, `completed_at`, timestamps.
   - Goal progress is derived from completed milestones, not manually duplicated.

3. **`career_checkups`**
   - `id`, `user_id`, six score snapshots, `cpi`, `health_state`, `recommendation`, `created_at`.
   - The current CPI remains derived from the six current `career_scores`; never increment CPI directly for course completion.

4. **`certification_requirements`**
   - `id`, `code`, `title`, `description`, `position`, `evidence_type`, `active`.
   - Seed one small, approved Diamond requirement set.

5. **`member_certification_items`**
   - `user_id`, `requirement_id`, `status` (`not_started`, `in_progress`, `submitted`, `approved`), `evidence_note`, `evidence_url`, `completed_at`, `reviewed_at`, `reviewed_by`.
   - Certification progress is approved requirements / active requirements. MVP ends at “Ready for review”; formal credential issuance can follow.

6. **`coach_member_notes`**
   - `id`, `member_id`, `coach_id`, `note`, `created_at`.
   - Keep notes admin-only and append-only for the MVP.

### Reuse rather than replace

- Keep `missions`, `user_missions`, and `goal_mission_completions`; expose them through one action service/view instead of creating a generic workflow engine.
- Keep `xp_events`, but add an idempotency key, related entity/source metadata, and one server-only award/reversal path. Profiles remain the cached total; the ledger is the audit source.
- Define **clusters in application configuration**, mapping each goal to relevant pillars, courses, AI tools, and mission types. Derive progress from existing records; add no cluster tables this weekend.
- Derive coach status server-side from last meaningful activity, overdue milestones, incomplete actions, job follow-up dates, and checkup age.

### Security changes required before launch

- Restrict profile reads to self and admin; the current policy allows every signed-in user to read all profiles.
- Revoke public/authenticated execution of `has_role` except where explicitly required by safe policies, addressing both linter warnings.
- Add/fix own-row insert policy for goal mission completion.
- Route all points changes, including admin adjustments and reversals, through the ledger RPC.
- Validate ownership of AI conversation IDs before reading or appending messages.
- Add server validation, useful error states, and audit logging around admin review actions.

## E. Exact weekend MVP scope

### Must ship

1. **Unified Control Center home**
   - Goal/target-date header; milestone progress; one prominent Next Best Action; today/this-week checklist; CPI/checkup summary; certification progress; XP recent activity; coach-visible status.

2. **90-day plan**
   - Create/edit primary goal and 90-day goal; 3–5 milestones; complete/reopen milestones; progress derived automatically.

3. **Action loop**
   - Merge existing daily missions and goal-track actions into one dashboard presentation; show first action, today, and this week; reliable completion and refresh.

4. **Trustworthy points**
   - Idempotent XP ledger for mission, milestone, course module/course, and job-stage achievements; no direct profile edits that bypass history; visible recent ledger entries.

5. **Checkup and progress**
   - Save one dated C.A.R.E.E.R. snapshot; show weakest pillar and next recommendation; align stored CPI everywhere to the six-pillar average; replace static progress claims with derived values.

6. **Diamond certification MVP**
   - Fixed approved checklist, automatic course/action evidence where possible, manual evidence note/link, progress percentage, submit/readiness state, and admin review visibility. Do not promise downloadable certification issuance this weekend.

7. **Coach intervention view**
   - Correct server-side status and CPI; filters for active/stalled/at-risk/ready-for-review; stalled reason, overdue item, next action, recent activity, and append-only note.

8. **Production hardening and release proof**
   - Security fixes above; migration rollback plan; seed/acceptance accounts; desktop/mobile authenticated E2E for the core loop; loading/empty/error states; AI failure fallback; production smoke checklist.

### Explicitly defer

- Marketplace/referrals/offers/alliances.
- Charity/contribution tracker.
- Full coach assignment, automated nudges, messaging, or CRM.
- Public community feeds, persisted wins, or cohort redesign.
- Certification PDF, public verification, badges, renewal, or multiple programs.
- Custom cluster builder or database-backed learning-path authoring.
- Full merge of `/career` access-code identity with authenticated accounts.
- Events backend/RSVP and advanced analytics.

## F. Day-by-day execution plan

### Monday, Sep 21 — Audit and decisions
- Approve this MVP, certification requirements, XP rule matrix, stalled definitions, and canonical authenticated identity.
- Freeze new feature requests and prepare acceptance scenarios with the seven intended members plus one admin.

### Tuesday, Sep 22 — Data and security foundation
- Add goals, milestones, checkups, certification progress, and coach notes migrations with RLS.
- Harden profile visibility, `has_role`, goal completion writes, AI conversation ownership, and XP idempotency.
- Back up production data and rehearse migration/rollback in a non-production environment.

### Wednesday, Sep 23 — Member loop
- Build goal/milestone editing and the unified Next Best Action presentation.
- Connect meaningful completions to the XP ledger and recent activity.
- Remove CPI mutation from course completion and use one CPI calculation everywhere.

### Thursday, Sep 24 — Checkup and certification
- Add dated checkup snapshot/recommendation flow.
- Add Diamond certification checklist, evidence submission, automatic evidence links, and derived progress.
- Map the five goal tracks into static capability clusters and display recommended learning/tools.

### Friday, Sep 25 — Coach controls and feature freeze
- Upgrade Diamond Clients with server-side status, stalled reason, certification readiness, overdue action, and notes.
- Finish empty/error/loading states and mobile layout.
- Code freeze by end of day; only blocker fixes afterward.

### Saturday, Sep 26 — UAT and controlled launch
- Run full desktop/mobile E2E with fresh member and returning member accounts.
- Verify RLS using member/admin/anonymous scenarios; verify duplicate clicks cannot duplicate XP.
- Validate AI degradation, backups, rollback, browser support, and coach operating instructions.
- Release first to the seven-member cohort if all go/no-go checks pass.

### Sunday, Sep 27 — Stabilize and hand over
- Fix launch blockers only; reconcile data and XP ledger; review stalled/at-risk classifications with Deepa.
- Capture baseline metrics and publish a known-limitations/deferred-work list.

## G. Risks, dependencies, and go/no-go gates

| Risk | Current evidence | Required decision or mitigation |
|---|---|---|
| Split identity | 7 `members`, 8 `profiles`, zero matching IDs | Authenticated profile is source of truth; keep `/career` outside core MVP. |
| No usage proof | 0 jobs, 0 courses, 0 XP events, 0 goal-track completions; 0 completed assigned missions | Seed only test accounts; run real acceptance journeys before launch. |
| Stalled cohort | All 8 profiles meet current 14-day stalled rule | Define “meaningful activity” and reset/test status logic deliberately. |
| CPI divergence | Course completion mutates profile CPI while engines average pillars | One calculation: average six current pillar scores; snapshot separately. |
| XP integrity | Empty ledger, direct admin edits, negative course reversal | Idempotent RPC and explicit reversal events; reconciliation test. |
| Profile privacy | All authenticated users can read all profiles | Restrict to self/admin before inviting members. |
| Security-definer warning | `has_role` executable by public/authenticated | Revoke unnecessary execute grants and rerun linter. |
| Certification ambiguity | No approved requirement set or reviewer rules | Deepa must approve checklist, evidence standard, and review authority by Tuesday. |
| AI dependency | External gateway, credits/rate limits | Non-AI fallback recommendation and clear retry states; confirm credits. |
| Schedule | Five build days before Sep 26 | Freeze deferred features; fail closed rather than shipping partial financial/certification claims. |
| Test coverage | No dedicated automated suite was found | Add focused E2E and server-function tests for the critical loop, not broad visual tests. |

**Launch only if:** account/onboarding works; goal and milestones persist; actions complete once; XP ledger reconciles; CPI is consistent; certification evidence is private; member cannot read another member; admin sees correct status; rollback is tested; core mobile flow passes.

## H. Recommended navigation and dashboard information architecture

### Primary navigation

1. **Control Center** — one home and daily operating view.
2. **My Plan** — primary goal, 90-day goal, milestones, capability cluster.
3. **Actions** — daily/weekly missions and completion history.
4. **C.A.R.E.E.R.** — six engines and checkup history.
5. **Learn** — courses tied to goal/cluster.
6. **Opportunities** — Job Tracker first; Marketplace later.
7. **AI Hub** — copilots supporting the current action.
8. **Community** — existing community and leaderboard, without fabricated cohort claims.
9. **Progress** — XP ledger, milestones, levels, CPI trend, and Diamond certification.
10. **Profile** — identity and member-entered career metrics.
11. **Coach Admin** — Diamond Clients, intervention queue, certification review, notes.

### Control Center information order

1. **Orientation:** greeting, Diamond identity, primary goal, target date, days remaining.
2. **Do next:** one Next Best Action with completion control and expected outcome/XP.
3. **Today and this week:** compact action list with clear states.
4. **Momentum:** 90-day milestone bar, current milestone, completed meaningful actions.
5. **Career health:** CPI, weakest pillar, last checkup, one recommendation.
6. **Certification:** requirements completed, next evidence needed, review state.
7. **Opportunity signals:** job follow-up due, recommended course/tool, coach note if present.
8. **Points:** current XP/level and last three auditable events—not leaderboard dominance.

This order directly supports Buying → Belonging → Implementing: premium identity establishes belonging, goal/action clarity drives implementation, and evidence-based movement justifies the purchase.
