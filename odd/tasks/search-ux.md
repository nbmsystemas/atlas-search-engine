# Search UX Improvements

## Goal
Turn Atlas from a ranking demonstration into a practical search experience without changing the core tokenizer, inverted index, or BM25 behavior.

## Scope
- Make search results actionable with document details.
- Improve accessible naming and state semantics for search and filters.
- Make loading, empty, error, and stale-request states explicit and recoverable.
- Explain lexical relevance through matched terms and BM25 context.
- Preserve the current visual identity, localization, and technical-console positioning.

## Non-goals
- No redesign of the visual language.
- No semantic/embedding search.
- No production authentication, rate limiting, or persistent index.
- No autocomplete/history/pagination in this first slice unless the core interaction remains complete.

## Resolved execution
- Workflow: Organic Driven Development.
- Branch: `feat/search-ux`.
- Delivery strategy: `single-pr` with one work-unit commit per task; forecast is below the chaining threshold.
- TDD: unknown/not configured; use ordinary focused checks and record observed commands.
- Implementation route: delegated direct workers because each task touches multiple non-trivial files.
- Verification route: delegated `gentle-ai-verify` for each task; parent performs final readback and spot checks.
- Native review: assess each work-unit commit after implementation if the repository review switch requires it.

## Work units

### Task 1 — Add document detail retrieval
- Status: done
- Route: delegated direct writer; parent corrected one brittle test threshold after the worker's environment-independent test run.
- Allowed edit surfaces: `backend/app/main.py`, `backend/tests/test_api.py`.
- Behavior: expose a safe document-detail endpoint by `doc_id`, returning title/category/content; return a typed 404 for unknown IDs.
- Checks: worker's `cd backend && pytest -q` was blocked by the system interpreter missing FastAPI; parent spot check with `cd backend && ../.venv/bin/python -m pytest -q` passed: 21 passed, 1 warning. `git diff --check` passed.
- Forecast: ~55 authored lines; actual source diff 48 lines before feature-document bookkeeping.
- Commit: pending.

### Task 2 — Make results actionable and explain relevance
- Status: done
- Route: delegated direct writer.
- Allowed edit surfaces: `frontend/index.html`, `frontend/script.js`, `frontend/style.css`.
- Behavior: result titles/actions open document details through `/api/documents/{doc_id}`, snippets highlight matched terms, and BM25 relevance is explained in English and Spanish while preserving the visual identity.
- Checks: `node --check frontend/script.js` passed; detector completed with `[]` in degraded regex fallback because parser modules were unavailable, so computed contrast and selector analysis remain unverified.
- Forecast: ~180 authored lines; actual source diff 269 lines.
- Commit: pending.

### Task 3 — Harden search, filter, and recovery states
- Status: done
- Route: delegated direct writer.
- Allowed edit surfaces: `frontend/index.html`, `frontend/script.js`, `frontend/style.css`.
- Behavior: persistent input label, semantic filter state, explicit loading/busy state, empty-query validation, stale-response protection for searches and document details, clear recovery actions, localized context, and mobile result-header adaptation.
- Checks: `node --check frontend/script.js` passed; detector completed with `[]` in degraded regex fallback; `git diff --check` passed; parent spot check also passed backend `21 passed, 1 warning`. LSP diagnostics found only pre-existing plaintext HTTP/hardcoded URL warnings and did not identify a new frontend correctness error.
- Forecast: ~170 authored lines; actual source diff 146 lines.
- Commit: pending.

## Acceptance criteria
- A visitor can search, identify the active query/filter, open a result's document content, and recover from zero results or API failure without guessing.
- Keyboard and assistive-technology users receive names and state changes for the search input, filters, loading state, and result details.
- A newer search cannot be overwritten by an older response.
- Existing English/Spanish behavior and technical metrics remain intact.
- Backend tests and JavaScript syntax checks pass.

## Evidence log
- Initial review: feedback materially valid; current UI has onboarding and technical transparency but weak practical result continuation.
- Base commit: `c733421`.
- Task 1 commit: `8ec6e0b`.
- Task 2 commit: `5184bd5`.
- Task 3 commit: `780acc5`.

## Review and delivery evidence
- Work-unit commits: `8ec6e0b` (document details), `5184bd5` (actionable results), `780acc5` (interaction hardening); evidence bookkeeping commit: `3e7ecfc`.
- Native review inspect was attempted against `main` with committed-only scope; the controller stopped with `managed_assets_outdated` even after the exact `gentle-ai sync --agent pi` continuation reported no sync actions. No review lineage was created, so native review outcome is unavailable for this candidate.
- The branch contains 537 authored changed lines including task artifacts and docs, above the advisory 400-line slice budget; the three behavior commits are natural review slices, so a future PR should use chained slices rather than one oversized review.

## Key risks
- The corpus currently exposes snippets through search; detail retrieval must not expose arbitrary filesystem paths or internal index structures.
- The detector currently falls back to regex because parser dependencies are unavailable; an empty result is not proof of a clean UI.
- The static frontend has no browser automation in this environment, so responsive and screen-reader behavior needs source-level validation plus explicit caveats.
