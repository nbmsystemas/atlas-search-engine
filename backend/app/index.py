"""
index.py
--------
Implementación de un índice invertido en memoria.

Estructura:
    term -> {doc_id: term_frequency}

Además guarda:
    - doc_lengths: cantidad de tokens por documento (para BM25)
    - avg_doc_length: promedio de longitud de documento
    - documents: metadata original (id, title, text) para mostrar resultados

Un índice invertido es la estructura base de cualquier motor de búsqueda
real (Lucene, Elasticsearch, etc. son, en el fondo, una versión distribuida
y muy optimizada de esto).
"""

from collections import defaultdict
from dataclasses import dataclass, field

from .tokenizer import tokenize


@dataclass
class Document:
    doc_id: int
    title: str
    text: str
    category: str = "general"


class InvertedIndex:
    def __init__(self) -> None:
        self._postings: dict[str, dict[int, int]] = defaultdict(dict)
        self.documents: dict[int, Document] = {}
        self.doc_lengths: dict[int, int] = {}
        self.avg_doc_length: float = 0.0

    def add_document(self, doc: Document) -> None:
        tokens = tokenize(f"{doc.title} {doc.text}")
        self.documents[doc.doc_id] = doc
        self.doc_lengths[doc.doc_id] = len(tokens)

        term_freq: dict[str, int] = defaultdict(int)
        for tok in tokens:
            term_freq[tok] += 1

        for term, freq in term_freq.items():
            self._postings[term][doc.doc_id] = freq

        self._recompute_avg_length()

    def build_from_documents(self, docs: list[Document]) -> None:
        for doc in docs:
            self.add_document(doc)

    def _recompute_avg_length(self) -> None:
        if not self.doc_lengths:
            self.avg_doc_length = 0.0
            return
        self.avg_doc_length = sum(self.doc_lengths.values()) / len(self.doc_lengths)

    def postings(self, term: str) -> dict[int, int]:
        """Devuelve {doc_id: term_frequency} para un término dado."""
        return self._postings.get(term, {})

    def document_frequency(self, term: str) -> int:
        """En cuántos documentos aparece el término (para IDF)."""
        return len(self._postings.get(term, {}))

    @property
    def total_documents(self) -> int:
        return len(self.documents)

    @property
    def vocabulary_size(self) -> int:
        return len(self._postings)

    def matching_documents(self, terms: list[str]) -> set[int]:
        """Unión de documentos que contienen al menos uno de los términos (OR)."""
        result: set[int] = set()
        for term in terms:
            result |= set(self._postings.get(term, {}).keys())
        return result
