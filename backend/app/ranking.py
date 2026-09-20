"""
ranking.py
----------
Implementación de BM25 (Okapi BM25), el algoritmo de ranking que usan
Elasticsearch y Lucene por default.

Fórmula por término t en un documento d:

    score(d, t) = IDF(t) * ( f(t,d) * (k1 + 1) ) /
                  ( f(t,d) + k1 * (1 - b + b * |d| / avgdl) )

Donde:
    f(t,d)  = frecuencia del término t en el documento d
    |d|     = longitud del documento d (en tokens)
    avgdl   = longitud promedio de documento en la colección
    k1, b   = hiperparámetros (valores estándar: k1=1.5, b=0.75)

IDF(t) = ln( (N - n(t) + 0.5) / (n(t) + 0.5) + 1 )
    N    = cantidad total de documentos
    n(t) = cantidad de documentos que contienen t
"""

import math
from dataclasses import dataclass

from .index import InvertedIndex
from .tokenizer import tokenize


@dataclass
class SearchResult:
    doc_id: int
    title: str
    snippet: str
    category: str
    score: float


class BM25Ranker:
    def __init__(self, index: InvertedIndex, k1: float = 1.5, b: float = 0.75):
        self.index = index
        self.k1 = k1
        self.b = b

    def _idf(self, term: str) -> float:
        n = self.index.document_frequency(term)
        N = self.index.total_documents
        if n == 0 or N == 0:
            return 0.0
        return math.log((N - n + 0.5) / (n + 0.5) + 1)

    def score(self, doc_id: int, query_terms: list[str]) -> float:
        total = 0.0
        doc_len = self.index.doc_lengths.get(doc_id, 0)
        avgdl = self.index.avg_doc_length or 1
        for term in query_terms:
            f = self.index.postings(term).get(doc_id, 0)
            if f == 0:
                continue
            idf = self._idf(term)
            numerator = f * (self.k1 + 1)
            denominator = f + self.k1 * (1 - self.b + self.b * doc_len / avgdl)
            total += idf * (numerator / denominator)
        return total

    def search(self, query: str, top_k: int = 10) -> list[SearchResult]:
        query_terms = tokenize(query)
        if not query_terms:
            return []

        candidate_docs = self.index.matching_documents(query_terms)
        scored = [
            (doc_id, self.score(doc_id, query_terms)) for doc_id in candidate_docs
        ]
        scored = [s for s in scored if s[1] > 0]
        scored.sort(key=lambda x: x[1], reverse=True)

        results = []
        for doc_id, score in scored[:top_k]:
            doc = self.index.documents[doc_id]
            results.append(
                SearchResult(
                    doc_id=doc_id,
                    title=doc.title,
                    snippet=doc.text[:220].rstrip() + ("…" if len(doc.text) > 220 else ""),
                    category=doc.category,
                    score=round(score, 4),
                )
            )
        return results
