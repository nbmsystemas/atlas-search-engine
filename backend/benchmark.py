"""
benchmark.py
------------
Mide latencia y throughput reales del motor de búsqueda contra el corpus
de demo, y deja el resultado en markdown listo para pegar en el README.

Uso:
    python benchmark.py
"""

import statistics
import time

from app.data.corpus import load_corpus
from app.index import InvertedIndex
from app.ranking import BM25Ranker

QUERIES = [
    "índice invertido búsqueda", "base de datos relacional", "machine learning",
    "kubernetes contenedores", "seguridad autenticación", "python go rust",
    "algoritmos de ordenamiento", "arquitectura microservicios", "redes DNS",
    "testing unitario", "caching redis", "grafos BFS DFS", "TDD tests",
    "replicación tolerancia a fallos", "embeddings semántica",
]


def run_benchmark(iterations: int = 200):
    idx = InvertedIndex()
    docs = load_corpus()
    idx.build_from_documents(docs)
    ranker = BM25Ranker(idx)

    latencies_ms = []
    t_start = time.perf_counter()
    for i in range(iterations):
        q = QUERIES[i % len(QUERIES)]
        t0 = time.perf_counter()
        ranker.search(q, top_k=10)
        latencies_ms.append((time.perf_counter() - t0) * 1000)
    total_time = time.perf_counter() - t_start

    latencies_ms.sort()
    p50 = latencies_ms[int(len(latencies_ms) * 0.50)]
    p95 = latencies_ms[int(len(latencies_ms) * 0.95) - 1]
    p99 = latencies_ms[int(len(latencies_ms) * 0.99) - 1]
    avg = statistics.mean(latencies_ms)
    qps = iterations / total_time

    print("Atlas Search Engine — Benchmark")
    print("=" * 40)
    print(f"Documents indexed:     {idx.total_documents}")
    print(f"Vocabulary size:       {idx.vocabulary_size}")
    print(f"Queries executed:      {iterations}")
    print(f"Avg latency:           {avg:.3f} ms")
    print(f"P50 latency:           {p50:.3f} ms")
    print(f"P95 latency:           {p95:.3f} ms")
    print(f"P99 latency:           {p99:.3f} ms")
    print(f"Throughput:            {qps:.1f} queries/sec (single process)")
    print()
    print("Markdown para el README:")
    print("```text")
    print(f"Documents indexed:     {idx.total_documents}")
    print(f"Vocabulary size:       {idx.vocabulary_size}")
    print(f"Avg query latency:     {avg:.2f} ms")
    print(f"P95 latency:           {p95:.2f} ms")
    print(f"Throughput:            {qps:.0f} queries/sec (single process, sin caché)")
    print("```")


if __name__ == "__main__":
    run_benchmark()
