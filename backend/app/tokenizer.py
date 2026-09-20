"""
tokenizer.py
------------
Convierte texto crudo en una lista de tokens normalizados.

Pipeline:
    1. lowercase
    2. eliminar puntuación / caracteres no alfanuméricos
    3. split por espacios
    4. eliminar stopwords (ES + EN, el motor es bilingüe)
    5. stemming ligero (sufijos comunes) para agrupar variantes de una palabra
"""

import re
import unicodedata

_STOPWORDS = {
    # español
    "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del",
    "en", "y", "o", "a", "que", "es", "se", "por", "con", "para", "su",
    "al", "como", "más", "pero", "sus", "le", "ya", "o", "este", "sí",
    "porque", "esta", "entre", "cuando", "muy", "sin", "sobre", "también",
    # inglés
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is",
    "are", "was", "were", "be", "this", "that", "it", "as", "with", "by",
    "at", "from", "which", "but", "not", "have", "has", "had",
}

_STOPWORDS = {unicodedata.normalize("NFKD", w).encode("ascii", "ignore").decode()
              for w in _STOPWORDS}

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _strip_accents(text: str) -> str:
    """Normaliza tildes/diéresis (á->a, ñ->n, ü->u) para que una búsqueda sin
    acentos ('programacion') encuentre documentos con acentos ('programación').
    Esto es clave en un motor bilingüe: la mayoría de los usuarios escriben
    sin tildes al buscar."""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))

# Sufijos que recortamos para un stemming muy simple (no es Porter/Snowball,
# es intencionalmente ingenuo para que el código quede legible en el repo).
_SUFFIXES = ("mente", "ciones", "cion", "ando", "iendo", "amente",
             "ing", "es", "s")


def _naive_stem(token: str) -> str:
    for suf in _SUFFIXES:
        if token.endswith(suf) and len(token) - len(suf) >= 3:
            return token[: -len(suf)]
    return token


def tokenize(text: str, *, stem: bool = True) -> list[str]:
    """Tokeniza un texto: minúsculas, sin puntuación, sin stopwords."""
    normalized = _strip_accents(text.lower())
    raw_tokens = _TOKEN_RE.findall(normalized)
    tokens = [t for t in raw_tokens if t not in _STOPWORDS and len(t) > 1]
    if stem:
        tokens = [_naive_stem(t) for t in tokens]
    return tokens
