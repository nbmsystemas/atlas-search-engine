# Fix bilingual search and Render availability

## Goal
Make the English quick searches `inverted index` and `semantic search` return the intended seeded documents, and keep the Render API continuously available so the frontend does not fail on service sleep.

## Scope
- Add explicit English terminology to the two corresponding corpus entries so the lexical BM25 engine supports the visible English queries without pretending to implement vector semantic search.
- Add regression coverage for English and Spanish variants.
- Change the Render service from the sleeping Free plan to the always-on Starter plan, with the existing health check preserved.

## Non-goals
- Implement embeddings or vector semantic search.
- Add artificial keep-alive polling.
- Change the frontend search UX beyond what is required by the backend contract.

## Tasks
- [x] Add bilingual terminology to the seeded index and tests.
- [x] Configure Render for an always-on service.
- [x] Run focused tests and verify the deployment configuration.

## Commit evidence
- `4ac44bd` — `fix(search): support bilingual quick queries`

## Verification evidence
- `.venv/bin/pytest -q`: 25 passed, 1 warning.
- `.venv/bin/pytest -q backend/tests/test_api.py`: 7 passed, 1 warning.
- In-process checks confirmed results for `inverted index`, `semantic search`, `índice invertido`, and `búsqueda semántica`.
- LSP diagnostics reported no findings on the changed source/config/task files; the Markdown server did not provide a clean confirmation.
- Render YAML inspection confirmed `plan: starter`, `/api/health`, Docker paths, and `ATLAS_ALLOWED_ORIGINS`.
- Pending outside the repository: activate/confirm the paid Starter plan and live service availability in Render.
