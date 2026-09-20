# Architecture

[English](architecture.md) · [Español](architecture.es.md) · [Interactive diagram](architecture.html)

## Query flow

```mermaid
flowchart LR
    browser[Browser] -->|HTTPS| frontend[Frontend]
    frontend -->|GET /api/search| api[FastAPI]
    api --> tokenizer[Tokenizer]
    tokenizer --> index[Inverted index]
    index --> ranker[BM25 ranker]
    ranker -->|top-K + latency_ms| response[JSON response]
```

For a richer explorable version with guided views, relationship tracing, pan/zoom, and theme controls, open the [interactive architecture diagram](architecture.html).

## Design decisions

### Why an in-memory inverted index instead of an external database?

For an educational and portfolio search engine, keeping the index in memory makes the algorithm the protagonist instead of hiding it behind a library such as Elasticsearch. The `InvertedIndex` design in `backend/app/index.py` follows the same core concept used by Lucene: `term → {doc_id: frequency}`.

A natural v2 step would persist the index to disk—for example with SQLite or a purpose-built binary format—so the service does not have to rebuild it on every start.

### Why BM25 instead of plain TF-IDF cosine similarity?

BM25 saturates the contribution of terms that repeat many times, preventing a document from winning just because it repeats a word 50 times. It also normalizes for document length, which plain TF-IDF does less effectively. BM25 is the default ranking family used by Elasticsearch/Lucene, so implementing it manually is a direct way to demonstrate how a real search engine ranks results internally.

### Why a custom tokenizer?

The tokenizer normalizes accents, lowercases input, removes Spanish and English stopwords, and applies intentionally simple stemming. That keeps the query and indexing paths deterministic and easy to inspect in unit tests without introducing a heavyweight NLP dependency.

## Known limitations

- The stemmer is intentionally naive suffix trimming, not a full Porter or Snowball implementation. This is documented simplification in `backend/app/tokenizer.py`, not an accidental omission.
- The index lives in one process's memory: it does not survive a restart and does not scale horizontally. See the README roadmap for persistence, sharding, and embeddings.
- Search is lexical rather than semantic. Two words with similar meaning but different roots do not necessarily match.
- The demo corpus has only 44 documents, so benchmark numbers are useful for regression checks, not capacity planning.

## Repository structure

```text
atlas-search-engine/
├── backend/
│   ├── app/
│   │   ├── tokenizer.py    # text normalization and tokenization
│   │   ├── index.py        # inverted index
│   │   ├── ranking.py      # BM25 scoring
│   │   ├── main.py         # FastAPI endpoints
│   │   └── data/corpus.py  # demo dataset
│   ├── tests/               # 19 unit and integration tests
│   └── benchmark.py         # real latency and throughput benchmark
├── frontend/                # vanilla HTML/CSS/JavaScript search console
├── docs/architecture.md     # this document
└── .github/workflows/ci.yml # automated tests on every push
```
