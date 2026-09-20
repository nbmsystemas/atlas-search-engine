from app.data.corpus import load_corpus
from app.index import InvertedIndex
from app.ranking import BM25Ranker


def _make_ranker():
    idx = InvertedIndex()
    idx.build_from_documents(load_corpus())
    return BM25Ranker(idx)


def test_search_returns_relevant_results():
    ranker = _make_ranker()
    results = ranker.search("índice invertido búsqueda", top_k=5)
    assert len(results) > 0
    titles = [r.title for r in results]
    assert any("invertido" in t.lower() or "búsqueda" in t.lower() for t in titles)


def test_search_empty_query_returns_nothing():
    ranker = _make_ranker()
    assert ranker.search("") == []


def test_search_no_match_returns_empty():
    ranker = _make_ranker()
    results = ranker.search("xyzxyzxyz noexiste")
    assert results == []


def test_results_are_sorted_by_score_descending():
    ranker = _make_ranker()
    results = ranker.search("base de datos")
    scores = [r.score for r in results]
    assert scores == sorted(scores, reverse=True)


def test_top_k_limits_results():
    ranker = _make_ranker()
    results = ranker.search("programación", top_k=2)
    assert len(results) <= 2
