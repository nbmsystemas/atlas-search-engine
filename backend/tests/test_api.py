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
