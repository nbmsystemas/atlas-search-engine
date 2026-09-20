from app.index import Document, InvertedIndex


def _make_index():
    idx = InvertedIndex()
    idx.build_from_documents([
        Document(1, "Python básico", "Python es un lenguaje de programación"),
        Document(2, "Go concurrente", "Go tiene goroutines para concurrencia"),
        Document(3, "Rust seguro", "Rust evita errores de memoria en programación"),
    ])
    return idx


def test_total_documents():
    idx = _make_index()
    assert idx.total_documents == 3


def test_postings_contains_correct_docs():
    idx = _make_index()
    # "programación" se stemmea a "programa" (ver tokenizer._naive_stem)
    postings = idx.postings("programa")
    assert 1 in postings
    assert 3 in postings
    assert 2 not in postings


def test_document_frequency():
    idx = _make_index()
    assert idx.document_frequency("programa") == 2


def test_matching_documents_is_union():
    idx = _make_index()
    # "goroutines" -> stem "goroutin", "rust" no cambia
    matches = idx.matching_documents(["goroutin", "rust"])
    assert matches == {2, 3}


def test_avg_doc_length_updates():
    idx = _make_index()
    assert idx.avg_doc_length > 0
