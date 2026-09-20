# Finish Atlas Search Engine Deployment

## Goal
Publish the repository to `nbmsystemas/atlas-search-engine`, deploy the FastAPI backend on Render, deploy the static frontend on Vercel, and replace README placeholders with working public links.

## Decisions
- Backend: Render using the existing Dockerfile.
- Frontend: Vercel using the static `frontend/` directory.
- Keep the existing Docker Compose local workflow.
- Do not claim live URLs until provider deployment responses are verified.

## Tasks
- [ ] Prepare Render and Vercel configuration, production API URL handling, and repository links.
- [ ] Run the existing tests and benchmark; add only deployment-blocking fixes.
- [ ] Create reviewable commits and push the repository to GitHub.
- [ ] Deploy backend and frontend through authenticated provider tooling or surface the exact external authorization step.
- [ ] Update README with verified URLs and run final endpoint/link checks.

## Evidence
- Repository is initialized locally but has no commits yet.
- GitHub CLI is authenticated as `nbmsystemas` with repository and workflow scopes.
- Final deployment URLs are pending provider authorization/deployment.
