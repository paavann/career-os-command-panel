# Complete C.A.R.E.E.R. Engine

## Outcome

Build a dedicated Diamond C.A.R.E.E.R. workspace for working professionals. It will coexist with the current signed-in product, use one shared access code, remember each member on their device, and provide all six assessment journeys without changing unrelated pages.

## Experience

- Add a public C.A.R.E.E.R. entry screen with the shared Diamond access code. A successful unlock creates or restores `bc_member_id`, updates the member’s last visit, and opens the engine workspace without email or login.
- Build a premium midnight-blue dashboard with live pillar cards, completed/not-started states, a six-axis radar, and CPI calculated from completed pillars only.
- Build one consistent full-screen engine shell for Clarity, Authority, Reach, Evidence, Energy, and Revenue, including the specified forms, conditional follow-up conversation, pillar-specific loading and error states, and assessment history.
- Build one reusable results experience with Summary Card and Full Report tabs, score ring, verdict, reasoning bars, Diamond watermark, image export, and PDF export.
- Keep Evidence as a persistent achievement vault with deterministic scoring and no retake pattern. Make Energy’s rewrite tool independently accessible at all times.
- Feed Evidence wins into the existing Resume Writer and LinkedIn Optimizer where available, while leaving unrelated AI Hub behavior unchanged.
- For Revenue, attempt current India-market benchmark retrieval and show a clearly labeled benchmark fallback if live retrieval is unavailable.

## Data and security

- Add a `members` record and one dedicated data table per pillar, all keyed by `member_id`; Evidence stores individual vault entries.
- Store only a one-way fingerprint of the shared access code, never its readable value.
- Validate the shared code on the server and issue a signed member session. Every member read/write verifies that signed session; browser requests never receive privileged database credentials.
- Keep the new tables locked from direct anonymous access. Only the verified server layer can manage a member’s records.
- Recompute and return live pillar scores and CPI after every completed assessment or Evidence vault change.

## AI implementation

- Use the already configured Lovable AI connection with the current default reasoning model rather than adding a second provider credential.
- Require strict structured output for every assessment so scores, bar breakdowns, verdicts, reports, and deliverables persist as complete JSON.
- Stream long-running AI work, expose pillar-specific progress, preserve the user’s inputs on failure, and surface actionable rate-limit, policy, and credit messages.
- Keep prompts, score safeguards, identity verification, and AI credentials server-side.

## Technical details

- Add focused shared modules for member sessions, pillar definitions, assessment functions, radar/results UI, and export utilities rather than duplicating six implementations.
- Add the new public route outside the existing account-protected route tree; update only the C.A.R.E.E.R. navigation entry to reach it.
- Use client-side image/PDF export libraries that work in the browser and do not alter the server runtime.
- Add unique page metadata and verify desktop and mobile form, history, result, export, persistence, and CPI flows.
- Fix the existing AI route type error encountered by the current build so the completed preview is healthy.

## Validation

- Verify a first unlock, repeat visit, invalid code, and member persistence.
- Complete each of the six flows and confirm history, JSON persistence, score changes, and CPI recalculation.
- Verify Evidence add/edit/delete and deterministic score changes; verify Energy rewrite without a new assessment.
- Verify Summary image and Full Report PDF downloads.
- Verify Revenue live-source fallback behavior and all friendly AI error states.
- Verify the existing signed-in product still works and no unrelated route or feature changed.