from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_search_endpoint_returns_results_and_latency():
    resp = client.get("/api/search", params={"q": "base de datos"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["query"] == "base de datos"
    assert "latency_ms" in body
    assert body["latency_ms"] >= 0
    assert isinstance(body["results"], list)


def test_search_requires_query_param():
    resp = client.get("/api/search")
    assert resp.status_code == 422


def test_document_detail_endpoint_returns_full_document():
    resp = client.get("/api/documents/1")
    assert resp.status_code == 200
    body = resp.json()
    assert body["doc_id"] == 1
    assert body["title"] == "Python y el zen de la simplicidad"
    assert body["category"] == "general"
    assert body["content"].startswith("Python prioriza la legibilidad del código")
    assert body["content"].endswith("scripting.")
    assert len(body["content"]) > 200


def test_document_detail_endpoint_returns_typed_404_for_unknown_id():
    resp = client.get("/api/documents/999999")
    assert resp.status_code == 404
    assert resp.json() == {"detail": "Document not found"}


def test_categories_endpoint():
    resp = client.get("/api/categories")
    assert resp.status_code == 200
    assert "algoritmos" in resp.json()["categories"]


def test_stats_endpoint_shape():
    resp = client.get("/api/stats")
    assert resp.status_code == 200
    body = resp.json()
    for key in ("documents_indexed", "vocabulary_size", "avg_latency_ms"):
        assert key in body
