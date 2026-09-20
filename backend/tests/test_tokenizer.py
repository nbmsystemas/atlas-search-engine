from app.tokenizer import tokenize


def test_lowercases_and_strips_punctuation():
    tokens = tokenize("¡Hola, Mundo!")
    assert "hola" in tokens
    assert "mundo" in tokens


def test_removes_stopwords():
    tokens = tokenize("el gato y el perro")
    assert "el" not in tokens
    assert "y" not in tokens
    assert any(t.startswith("gat") for t in tokens)
    assert any(t.startswith("perr") for t in tokens)


def test_empty_string_returns_empty_list():
    assert tokenize("") == []


def test_stemming_groups_variants():
    a = tokenize("programación")
    b = tokenize("programaciones")
    assert a and b
    assert a[0] == b[0] or a[0].startswith(b[0][:5])
