"""
main.py
-------
API REST del motor de búsqueda. Expone:

    GET  /api/search?q=...&category=...&limit=10   -> resultados + latencia real
    GET  /api/stats                                  -> tamaño del índice, vocabulario
    GET  /api/categories                             -> categorías disponibles
    GET  /api/health                                  -> healthcheck

Cada búsqueda mide su propia latencia con time.perf_counter() y la devuelve
en la respuesta, para que la demo muestre números reales, no inventados.
"""

import os
import time
from collections import deque
from math import ceil

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .data.corpus import load_corpus
from .index import InvertedIndex
from .ranking import BM25Ranker

app = FastAPI(
    title="Atlas Search Engine",
    description="Motor de búsqueda con índice invertido y ranking BM25, "
                 "construido desde cero.",
    version="1.0.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ATLAS_ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Estado del proceso: índice construido una sola vez al arrancar ---
_index = InvertedIndex()
_index.build_from_documents(load_corpus())
_ranker = BM25Ranker(_index)

# Ventana móvil de las últimas N latencias, para calcular p95 real en /api/stats
_latency_window: deque[float] = deque(maxlen=500)
_query_count = 0
_start_time = time.time()


class SearchResultOut(BaseModel):
    doc_id: int
    title: str
    snippet: str
    category: str
    score: float


class SearchResponse(BaseModel):
    query: str
    total_results: int
    latency_ms: float
    results: list[SearchResultOut]


class StatsResponse(BaseModel):
    documents_indexed: int
    vocabulary_size: int
    total_queries_served: int
    avg_latency_ms: float
    p95_latency_ms: float
    uptime_seconds: float


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/search", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1, description="Texto de búsqueda"),
    category: str | None = Query(None, description="Filtrar por categoría"),
    limit: int = Query(10, ge=1, le=50),
):
    global _query_count

    t0 = time.perf_counter()
    results = _ranker.search(q, top_k=limit * 3 if category else limit)
    if category:
        results = [r for r in results if r.category == category][:limit]
    latency_ms = (time.perf_counter() - t0) * 1000

    _latency_window.append(latency_ms)
    _query_count += 1

    return SearchResponse(
        query=q,
        total_results=len(results),
        latency_ms=round(latency_ms, 3),
        results=[SearchResultOut(**r.__dict__) for r in results],
    )


@app.get("/api/categories")
def categories():
    cats = sorted({doc.category for doc in _index.documents.values()})
    return {"categories": cats}


@app.get("/api/stats", response_model=StatsResponse)
def stats():
    latencies = sorted(_latency_window)
    avg = sum(latencies) / len(latencies) if latencies else 0.0
    p95_index = max(0, ceil(len(latencies) * 0.95) - 1)
    p95 = latencies[p95_index] if latencies else 0.0

    return StatsResponse(
        documents_indexed=_index.total_documents,
        vocabulary_size=_index.vocabulary_size,
        total_queries_served=_query_count,
        avg_latency_ms=round(avg, 3),
        p95_latency_ms=round(p95, 3),
        uptime_seconds=round(time.time() - _start_time, 1),
    )
