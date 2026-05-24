
# Bluechip CareerOS — Cloud Rollout Plan

Lovable Cloud is now enabled. The scope you asked for (real auth + XP/streak persistence + AI copilots + admin panel) is large, so I'll ship it in three phases. Each phase is independently usable; you approve and I build phase 1 immediately.

## Phase 1 — Auth, Profiles & Gamification Persistence

**Database (migration)**
- `profiles` — id (uuid, fk to auth.users), display_name, avatar_url, headline, level, xp, coins, streak_days, last_active_date, cpi_score, tier (L1/L2/L3), created_at
- `user_roles` — id, user_id, role (enum: admin, member) — separate table per security rules
- `career_scores` — user_id, clarity, authority, reach, evidence, energy, revenue (the C.A.R.E.E.R. framework)
- `missions` — id, title, description, xp_reward, coin_reward, category, active
- `user_missions` — user_id, mission_id, status (pending/completed), completed_at
- `xp_events` — id, user_id, amount, source, created_at (audit log + streak engine)
- DB function `has_role(uuid, app_role)` (SECURITY DEFINER) + `award_xp(uuid, int, text)` (updates xp, level, streak atomically)
- Trigger on `auth.users` insert → auto-create profile + default career_scores + 7 default missions
- RLS: users read/update own rows; admins read all (via has_role)

**Auth UI**
- `/login` route — email/password + Google sign-in (via lovable.auth.signInWithOAuth)
- `/signup` route — same, with display_name capture
- `_authenticated` layout wrapping all existing routes; redirects to `/login` if not signed in
- Root `onAuthStateChange` listener invalidating queries
- Profile page wired to real data; top bar reads real XP/level/coins/streak; CPI card reads real score

**Server functions**
- `getMe` — profile + scores + active missions
- `completeMission(missionId)` — calls `award_xp`, returns new totals
- `updateProfile(patch)` — display_name, headline, avatar
- Daily streak check on login via server fn

## Phase 2 — AI Copilots (Lovable AI Gateway)

- TanStack server route `/api/ai/chat` streaming SSE from `ai.gateway.lovable.dev` (model: `google/gemini-3-flash-preview`)
- 9 copilot system prompts (Resume Reviewer, Interview Simulator, LinkedIn Optimizer, Salary Negotiator, Career Strategist, Pitch Coach, Networking Architect, Personal Brand, Executive Presence)
- `/ai/$copilotSlug` chat route with token-by-token streaming, markdown rendering (`react-markdown`)
- `ai_conversations` + `ai_messages` tables, RLS scoped to user, history loaded into context
- Handle 429 (rate limit) and 402 (credits) with friendly toasts

## Phase 3 — Admin Panel

- `/_authenticated/_admin/*` subtree gated by `has_role(uid, 'admin')`
- Overview: total users, active today, XP distributed, top performers
- Users table: search, view profile, adjust XP/coins/tier, grant admin role
- Missions CRUD: create, edit, toggle active
- Content moderation: community posts feed with hide/delete
- AI usage dashboard: messages per user, top copilots

## Technical Notes

- All server-side reads/writes via `createServerFn` (per stack rules — no Edge Functions)
- Roles in dedicated `user_roles` table with `has_role()` SECURITY DEFINER fn (avoids RLS recursion)
- Service-role admin client only inside admin-gated server fns
- Google OAuth via Lovable broker + `configure_social_auth(['google'])` in same turn
- No CHECK constraints for time-based rules — validation triggers instead

## Proposed order

Start with **Phase 1** now (it's the foundation everything else needs). Once you confirm auth works end-to-end and XP persists across reloads, I'll proceed to Phase 2, then Phase 3.

Approve to start Phase 1, or tell me to reshuffle (e.g. "do admin first" or "skip Google sign-in").
