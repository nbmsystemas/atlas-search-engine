# Atlas Search Engine

Motor de búsqueda construido desde cero: tokenizer, índice invertido y
ranking **BM25** (el mismo algoritmo que usa Elasticsearch por default),
expuesto vía una API REST y una consola web que muestra latencia real en
cada búsqueda.

[![CI](https://github.com/nbmsystemas/atlas-search-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/nbmsystemas/atlas-search-engine/actions)
![Python](https://img.shields.io/badge/python-3.12-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Demo en vivo: pendiente de deploy** &nbsp;·&nbsp; **Swagger: pendiente de deploy** &nbsp;·&nbsp; [Arquitectura](docs/architecture.md)

> Los links públicos se agregan únicamente después de verificar las URLs reales
> de Render y Vercel. No se publican URLs inventadas.

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
| Tests | pytest (19 tests) | Unitarios (tokenizer, índice, ranking) + integración (API) |
| CI | GitHub Actions | Tests corren en cada push/PR |
| Deploy | Docker + docker-compose | Un solo comando para levantar todo |

## Tests

```bash
cd backend
pytest -v          # 19 passed
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
  servicio Docker, el healthcheck y el nombre `atlas-search-engine-api`.
  Importá el repositorio en Render como Blueprint y verificá
  `https://atlas-search-engine-api.onrender.com/api/health`.
- **Frontend en Vercel**: importá el repositorio, configurá `frontend` como
  *Root Directory* y publicá como sitio estático. `vercel.json` también
  permite desplegar desde la raíz con `vercel --prod`.
- **CORS**: `ATLAS_ALLOWED_ORIGINS` acepta una lista separada por comas. Para
  producción, reemplazá `*` por la URL real de Vercel en la configuración del
  servicio de Render.
- Una vez verificadas ambas URLs, reemplazá los dos links `#` del encabezado y
  el link de Swagger del frontend. La interfaz usa automáticamente localhost
  en desarrollo y el servicio Render en producción.

## Licencia

MIT — ver [LICENSE](LICENSE).
