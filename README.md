# Atlas Search Engine

[English](README.md) · [Español](README.es.md)

A search engine built from scratch: custom tokenization, an inverted index, and **BM25 ranking** (the same family of ranking algorithm used by Elasticsearch), exposed through a REST API and a technical-console frontend that reports real query latency.

[![CI](https://github.com/nbmsystemas/atlas-search-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/nbmsystemas/atlas-search-engine/actions)
![Python](https://img.shields.io/badge/python-3.12-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**[▶ Open the live demo](https://atlas.nbmsystemas.com)** · **[Swagger API](https://atlas-search-engine-api.onrender.com/docs)** · [Architecture notes](docs/architecture.md) · [Interactive architecture diagram](docs/architecture.html)

> The frontend is deployed on Vercel and the FastAPI backend is live on Render.
> The public health check is `https://atlas-search-engine-api.onrender.com/api/health`.

## Why this project exists

Most portfolio search projects outsource the difficult part to a hosted service or client library. Atlas implements the core search path manually—tokenization, inverted indexing, document statistics, and probabilistic ranking—to make the algorithmic decisions inspectable instead of hiding them behind an external service.

## Quick start

### Docker Compose

```bash
git clone https://github.com/nbmsystemas/atlas-search-engine.git
cd atlas-search-engine
docker compose up --build
```

- Frontend: <http://localhost:8080>
- API search: <http://localhost:8000/api/search?q=information+retrieval>
- Interactive API docs: <http://localhost:8000/docs>

### Without Docker

```bash
cd backend
python3.12 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

In another terminal:

```bash
cd frontend
python3 -m http.server 8080
```

## API example

```bash
curl "http://localhost:8000/api/search?q=inverted+index&limit=3"
```

```json
{
  "query": "inverted index",
  "total_results": 3,
  "latency_ms": 0.099,
  "results": [
    {
      "title": "Inverted indexes: the foundation of every search engine",
      "snippet": "An inverted index maps each term to the documents that contain it...",
      "category": "algorithms",
      "score": 6.1881
    }
  ]
}
```

Available endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /api/search?q=...&category=...&limit=10` | Search and BM25-ranked results |
| `GET /api/stats` | Index size, vocabulary, latency window, and uptime |
| `GET /api/categories` | Available document categories |
| `GET /api/health` | Deployment health check |
| `GET /docs` | Generated Swagger/OpenAPI documentation |

## Benchmark

Measured with `python backend/benchmark.py` against the demo corpus, using 200 queries in a single process without caching:

```text
Documents indexed:     44
Vocabulary size:       648
Avg query latency:     0.03 ms
P95 latency:           0.05 ms
Throughput:            37,413 queries/sec (single process, no cache)
```

These values are from a representative local run and vary with hardware and system load. The benchmark script is committed to the repository so anyone can regenerate the numbers instead of trusting a marketing claim.

## Architecture

```text
┌──────────────┐       GET /api/search?q=...       ┌──────────────┐
│   Frontend   │ ─────────────────────────────────▶ │   FastAPI    │
│ HTML/CSS/JS  │ ◀───────────────────────────────── │              │
└──────────────┘       JSON + latency_ms            └──────┬───────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │    Tokenizer     │
                                                  └────────┬────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │ Inverted index   │
                                                  └────────┬────────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │   BM25 ranker    │
                                                  └───────────────────┘
```

See [`docs/architecture.md`](docs/architecture.md) for the design decisions, data flow, trade-offs, and known limitations. For a richer explorable view, open the [interactive architecture diagram](docs/architecture.html).

## Technology stack

| Layer | Technology | Why |
|---|---|---|
| Core / API | Python 3.12 + FastAPI | Readable algorithms plus generated OpenAPI docs |
| Frontend | Vanilla HTML/CSS/JavaScript | Zero runtime dependencies and fast loading |
| Search core | Custom tokenizer, inverted index, and BM25 | Makes the complete ranking path inspectable |
| Tests | pytest (21 tests) | Unit tests plus API integration coverage |
| CI | GitHub Actions | Tests and benchmark run on every push and pull request |
| Local runtime | Docker Compose | One command to run the full stack |
| Production | Render + Vercel | Docker backend plus static frontend |

## Verification

```bash
cd backend
pytest -v                 # 21 passed
python benchmark.py       # benchmark output
```

The CI workflow runs both commands automatically. The repository targets Python 3.12 because the pinned `pydantic-core` dependency is built and tested against that version.

## Deployment

### Backend on Render

The [`render.yaml`](render.yaml) Blueprint defines the Docker service `atlas-search-engine-api`, and it is currently live at <https://atlas-search-engine-api.onrender.com>.

- Health: <https://atlas-search-engine-api.onrender.com/api/health>
- Swagger: <https://atlas-search-engine-api.onrender.com/docs>
- Search example: <https://atlas-search-engine-api.onrender.com/api/search?q=inverted+index&limit=3>
- CORS is restricted to `https://atlas.nbmsystemas.com` by default.

To reproduce the deployment in another Render workspace, open the [direct Render deploy](https://render.com/deploy?repo=https://github.com/nbmsystemas/atlas-search-engine) and confirm the Blueprint.

### Frontend on Vercel

The static frontend is live at <https://atlas.nbmsystemas.com>. It opens in English and includes an English/Spanish toggle that persists the visitor's preference in the browser. To reproduce the deployment, import the repository into Vercel and set `frontend` as the Root Directory, or deploy from the repository root with `vercel --prod`; [`vercel.json`](vercel.json) sets the output directory.

The frontend uses `http://localhost:8000` on local hosts and the Render service as its production fallback. You can override it before loading `script.js` with `window.ATLAS_API_BASE` or temporarily with `?api=https://your-backend.example.com`.

Vercel Web Analytics is wired into the static page through `/_vercel/insights/script.js`. Enable **Analytics** for the project in the Vercel dashboard and redeploy; the dashboard then reports aggregate visitors, page views, countries, devices, and referrers. It does not identify visitors by name or email.

## Honest limitations and roadmap

- The index is rebuilt at process startup; it is not persisted to disk yet.
- BM25 is lexical, so it does not understand semantic similarity or synonyms.
- The demo corpus is intentionally small and is not a production-scale benchmark.
- There is no rate limiting or authentication on the public API yet.

Possible next steps:

- [ ] Persist the index with SQLite.
- [ ] Add hybrid lexical + embedding search.
- [ ] Add trie-based autocomplete.
- [ ] Highlight matched terms in snippets.
- [ ] Add cursor-based pagination.
- [ ] Add API rate limiting and authentication.

## License

MIT — see [LICENSE](LICENSE).
