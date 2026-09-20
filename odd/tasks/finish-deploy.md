# Finish Atlas Search Engine Deployment

## Goal
Publish the repository to `nbmsystemas/atlas-search-engine`, deploy the FastAPI backend on Render, deploy the static frontend on Vercel, and replace README placeholders with working public links.

## Decisions
- Backend: Render using the existing Dockerfile.
- Frontend: Vercel using the static `frontend/` directory.
- Keep the existing Docker Compose local workflow.
- Do not claim live URLs until provider deployment responses are verified.

## Tasks
- [x] Prepare Render and Vercel configuration, production API URL handling, and repository links.
- [x] Run the existing tests and benchmark; add only deployment-blocking fixes.
- [x] Create reviewable commits and push the repository to GitHub.
- [ ] Deploy backend and frontend through authenticated provider tooling or surface the exact external authorization step.
- [ ] Update README with verified URLs and run final endpoint/link checks.
- [x] Make English the default documentation language and add Spanish alternatives plus an interactive architecture artifact.

## Evidence
- Repository was initialized on the `main` branch with commit `1f5dc82`.
- GitHub CLI is authenticated as `nbmsystemas` with repository and workflow scopes.
- Final backend URL is pending Render authorization/deployment; the Vercel frontend is live at `https://atlas-search-engine-kappa.vercel.app`.
- Verification: 19 tests passed; Docker images for backend and frontend built successfully; `docker compose config` and `node --check frontend/script.js` passed.
- GitHub publication verified: `main` is pushed to `https://github.com/nbmsystemas/atlas-search-engine` and CI completed successfully.
- Local verification requires Python 3.12 because the pinned pydantic-core does not build under the host Python 3.14.
- Documentation artifact: `docs/architecture.html` delivered by Archify with 9/9 checks passing, showcase composition, 0 errors, and 0 warnings. Automated Chrome visual-check could not run because the configured Chrome executable path is a non-executable directory (`EACCES`); no visual pass is claimed.
