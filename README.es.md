# Atlas Search Engine

[English](README.md) · [Español](README.es.md)

Motor de búsqueda construido desde cero: tokenizer, índice invertido y
ranking **BM25** (el mismo algoritmo que usa Elasticsearch por default),
expuesto vía una API REST y una consola web que muestra latencia real en
cada búsqueda.

[![CI](https://github.com/nbmsystemas/atlas-search-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/nbmsystemas/atlas-search-engine/actions)
![Python](https://img.shields.io/badge/python-3.12-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**[▶ Probar la demo en vivo](https://atlas.nbmsystemas.com)** &nbsp;·&nbsp; **[Swagger API](https://atlas-search-engine-api.onrender.com/docs)** &nbsp;·&nbsp; [Notas de arquitectura](docs/architecture.es.md) &nbsp;·&nbsp; [Diagrama interactivo](docs/architecture.html)

> El frontend está publicado en Vercel y el backend FastAPI está activo en Render.
> Healthcheck: `https://atlas-search-engine-api.onrender.com/api/health`.

---

## Por qué este proyecto

La mayoría de los proyectos de portfolio usan una librería para resolver
la parte difícil (`elasticsearch-py`, `algolia`, etc). Acá la parte difícil
—tokenización, índice invertido, ranking probabilístico— está implementada
a mano y testeada, para demostrar el razonamiento algorítmico completo, no
solo la integración con una API externa.

## Cómo probarlo en 60 segundos

```bash
git clone https://github.com/nbmsystemas/atlas-search-engine.git
cd atlas-search-engine
docker compose up --build
```

- Frontend: http://localhost:8080
- API: http://localhost:8000/api/search?q=base+de+datos
- Docs interactivas (Swagger): http://localhost:8000/docs

Sin Docker:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# en otra terminal:
cd frontend && python3 -m http.server 8080
```

## Ejemplo de uso de la API

```bash
curl "http://localhost:8000/api/search?q=indice+invertido&limit=3"
```

```json
{
  "query": "indice invertido",
  "total_results": 3,
  "latency_ms": 0.099,
  "results": [
    {
      "title": "Índices invertidos: la base de todo motor de búsqueda",
      "snippet": "Un índice invertido mapea cada palabra a la lista de documentos...",
      "category": "algoritmos",
      "score": 6.1881
    }
  ]
}
```

## Benchmark (números reales, no estimados)

Medido corriendo `python backend/benchmark.py` — 200 queries contra el
corpus de demo, single process, sin caché:

```text
Documents indexed:     44
Vocabulary size:       648
Avg query latency:     0.03 ms
P95 latency:           0.05 ms
Throughput:            37,413 queries/sec (single process, sin caché)
```

> Estos números son bajos en absoluto porque el corpus de demo es chico
> (44 documentos). Lo que importa no es el número en sí, sino que el
> script que lo generó está en el repo y cualquiera lo puede correr —
> nada acá está inventado. Correlo vos mismo con `python benchmark.py`.

## Arquitectura

```text
┌──────────────┐      GET /api/search?q=...      ┌──────────────┐
│   Frontend   │ ───────────────────────────────▶ │   FastAPI    │
│ (HTML/CSS/JS)│ ◀─────────────────────────────── │              │
└──────────────┘      JSON + latency_ms            └──────┬───────┘
                                                            │
                                                   ┌────────▼────────┐
                                                   │    Tokenizer     │
                                                   └────────┬────────┘
                                                            │
                                                   ┌────────▼────────┐
                                                   │ Índice invertido │
                                                   └────────┬────────┘
                                                            │
                                                   ┌────────▼────────┐
                                                   │   BM25 Ranker    │
                                                   └───────────────────┘
```

Detalle completo de decisiones de diseño y límites conocidos en
[`docs/architecture.md`](docs/architecture.md).

## Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Core / API | Python 3.12 + FastAPI | Legibilidad del algoritmo + docs OpenAPI gratis |
| Frontend | HTML/CSS/JS vanilla | Cero dependencias, carga instantánea |
| Tests | pytest (21 tests) | Unitarios (tokenizer, índice, ranking) + integración (API) |
| CI | GitHub Actions | Tests corren en cada push/PR |
| Deploy | Docker + docker-compose | Un solo comando para levantar todo |

## Tests

```bash
cd backend
pytest -v          # 21 passed
```

## Roadmap (evolución honesta, no prometida de una)

- [ ] Persistir el índice a disco (SQLite) en vez de reconstruirlo en cada arranque
- [ ] Búsqueda semántica con embeddings (hybrid search: BM25 + vectores)
- [ ] Autocomplete con un trie
- [ ] Highlighting de los términos encontrados en el snippet
- [ ] Paginación real (cursor-based)
- [ ] Rate limiting en la API

## Deploy

- **Backend en Render**: el archivo [`render.yaml`](render.yaml) define el
  servicio Docker `atlas-search-engine-api`, que está activo en
  `https://atlas-search-engine-api.onrender.com`.
  - Health: `https://atlas-search-engine-api.onrender.com/api/health`
  - Swagger: `https://atlas-search-engine-api.onrender.com/docs`
  - Búsqueda de ejemplo: `https://atlas-search-engine-api.onrender.com/api/search?q=inverted+index&limit=3`
  - Para reproducir el deploy, usá el [deploy directo de Render](https://render.com/deploy?repo=https://github.com/nbmsystemas/atlas-search-engine).
- **Frontend en Vercel**: importá el repositorio, configurá `frontend` como
  *Root Directory* y publicá como sitio estático. Abre en inglés e incluye un
  selector inglés/español que recuerda la preferencia del visitante.
  `vercel.json` también permite desplegar desde la raíz con `vercel --prod`.
- **CORS**: `render.yaml` ya configura `ATLAS_ALLOWED_ORIGINS` con
  `https://atlas.nbmsystemas.com`. Podés agregar más orígenes separados por
  comas si usás un preview de Vercel.
- La demo ya está publicada en
  `https://atlas.nbmsystemas.com`. Después de crear el servicio
  de Render, verificá el endpoint y completá el link de Swagger del encabezado.
  La interfaz usa automáticamente localhost en desarrollo y el servicio Render
  en producción.

## Licencia

MIT — ver [LICENSE](LICENSE).
