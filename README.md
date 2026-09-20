# Atlas Search Engine

Motor de búsqueda construido desde cero: tokenizer, índice invertido y
ranking **BM25** (el mismo algoritmo que usa Elasticsearch por default),
expuesto vía una API REST y una consola web que muestra latencia real en
cada búsqueda.

[![CI](https://github.com/TU_USUARIO/atlas-search-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/TU_USUARIO/atlas-search-engine/actions)
![Python](https://img.shields.io/badge/python-3.12-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**[▶ Probar la demo en vivo](#)** &nbsp;·&nbsp; **[Documentación de la API (Swagger)](#)** &nbsp;·&nbsp; [Arquitectura](docs/architecture.md)

> Reemplazá los links de arriba una vez que hagas el deploy (ver sección
> "Deploy" más abajo). Un repo con links rotos es peor que no tenerlos.

---

## Por qué este proyecto

La mayoría de los proyectos de portfolio usan una librería para resolver
la parte difícil (`elasticsearch-py`, `algolia`, etc). Acá la parte difícil
—tokenización, índice invertido, ranking probabilístico— está implementada
a mano y testeada, para demostrar el razonamiento algorítmico completo, no
solo la integración con una API externa.

## Cómo probarlo en 60 segundos

```bash
git clone https://github.com/TU_USUARIO/atlas-search-engine.git
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
Avg query latency:     0.02 ms
P95 latency:           0.03 ms
Throughput:            64,784 queries/sec (single process, sin caché)
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

- **Backend** (`backend/Dockerfile`): Railway, Render o Fly.io — cualquiera
  de los tres tiene free tier y deploya un Dockerfile sin configuración
  extra. Después de deployar, actualizá `ATLAS_API_BASE` en
  `frontend/script.js` (o pasalo como variable global antes de cargar el
  script) con la URL pública del backend.
- **Frontend**: Vercel, Netlify o GitHub Pages (es HTML/CSS/JS estático).

## Licencia

MIT — ver [LICENSE](LICENSE).
