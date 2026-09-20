# Arquitectura

[English](architecture.md) · [Español](architecture.es.md) · [Diagrama interactivo](architecture.html)

Para una vista más rica y explorable, abrí el [diagrama interactivo](architecture.html), con vistas guiadas, zoom, trazado de relaciones y temas claro/oscuro.

## Flujo de una consulta

```mermaid
flowchart LR
    navegador[Navegador] -->|HTTPS| frontend[Frontend]
    frontend -->|GET /api/search| api[FastAPI]
    api --> tokenizer[Tokenizer]
    tokenizer --> indice[Índice invertido]
    indice --> ranker[Ranking BM25]
    ranker -->|top-K + latency_ms| respuesta[Respuesta JSON]
```

## Decisiones de diseño

### ¿Por qué índice invertido en memoria y no una base de datos externa?

Para un motor de búsqueda educativo/portfolio, tener el índice en memoria
(un `dict` de Python) hace que el código del algoritmo sea el protagonista,
en vez de esconderlo detrás de una librería como Elasticsearch. El diseño
del `InvertedIndex` (ver `backend/app/index.py`) es intencionalmente el
mismo concepto que usa Lucene por debajo: `term -> {doc_id: freq}`.

Un paso natural de "v2" sería persistir el índice a disco (por ejemplo con
SQLite o un archivo binario propio) para no reconstruirlo en cada arranque.

### ¿Por qué BM25 y no similitud coseno con TF-IDF puro?

BM25 satura la contribución de términos muy repetidos (evita que un
documento que repite la palabra 50 veces gane artificialmente) y normaliza
por longitud de documento, lo cual TF-IDF puro no hace bien. Es, además,
el algoritmo que usa Elasticsearch/Lucene por default — implementarlo a
mano es la forma más directa de demostrar que entendés cómo funciona un
buscador "de verdad" por dentro.

### Límites conocidos (honestidad técnica > vender humo)

- El stemmer es intencionalmente ingenuo (recorte de sufijos), no un
  Porter/Snowball real. Es una simplificación documentada en
  `tokenizer.py`, no un descuido.
- El índice vive en memoria de un solo proceso: no sobrevive un restart
  ni escala horizontalmente. Ver la sección "Roadmap" del README para los
  siguientes pasos (persistencia, sharding, embeddings).
- La búsqueda es léxica (por coincidencia de términos), no semántica. Dos
  palabras con significado similar pero distinta raíz no matchean todavía.

## Estructura del repo

```text
atlas-search-engine/
├── backend/
│   ├── app/
│   │   ├── tokenizer.py    # normalización de texto
│   │   ├── index.py        # índice invertido
│   │   ├── ranking.py      # BM25
│   │   ├── main.py         # API FastAPI
│   │   └── data/corpus.py  # dataset de demo
│   ├── tests/               # 19 tests (unitarios + integración)
│   └── benchmark.py         # mide latencia/throughput reales
├── frontend/                 # consola de búsqueda (HTML/CSS/JS vanilla)
├── docs/architecture.md      # este archivo
└── .github/workflows/ci.yml  # tests automáticos en cada push
```
