// The static frontend keeps the API URL configurable at runtime. Local Docker
// uses localhost; the production fallback points to the Render service defined
// in render.yaml. Set window.ATLAS_API_BASE before this script to override it.
const localHosts = new Set(["localhost", "127.0.0.1"]);
const defaultApiBase = localHosts.has(window.location.hostname)
  ? "http://localhost:8000"
  : "https://atlas-search-engine-api.onrender.com";
const API_BASE = window.ATLAS_API_BASE || defaultApiBase;
const docsLink = document.getElementById("api-docs-link");
if (docsLink) docsLink.href = `${API_BASE}/docs`;

const form = document.getElementById("search-form");
const input = document.getElementById("query");
const resultsEl = document.getElementById("results");
const metaEl = document.getElementById("results-meta");
const statsEl = document.getElementById("stats");
const categoriesEl = document.getElementById("categories");

let activeCategory = null;

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    const data = await res.json();
    statsEl.replaceChildren(
      strongText(data.documents_indexed),
      document.createTextNode(" docs · "),
      strongText(data.vocabulary_size),
      document.createTextNode(" términos · p95 "),
      strongText(`${data.p95_latency_ms.toFixed(2)}ms`),
      document.createTextNode(" · "),
      strongText(data.total_queries_served),
      document.createTextNode(" queries servidas"),
    );
  } catch {
    statsEl.textContent = "no se pudo conectar con la API — ¿está corriendo el backend?";
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    const data = await res.json();
    categoriesEl.replaceChildren();
    const allChip = makeChip("todas", null);
    categoriesEl.appendChild(allChip);
    data.categories.forEach((cat) => {
      categoriesEl.appendChild(makeChip(cat, cat));
    });
  } catch {
    /* silencioso: sin categorías si la API no responde */
  }
}

function makeChip(label, value) {
  const chip = document.createElement("button");
  chip.textContent = label;
  chip.className = "chip" + (activeCategory === value ? " active" : "");
  chip.type = "button";
  chip.addEventListener("click", () => {
    activeCategory = value;
    [...categoriesEl.children].forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    if (input.value.trim()) runSearch(input.value.trim());
  });
  return chip;
}

function strongText(value) {
  const element = document.createElement("b");
  element.textContent = value;
  return element;
}

function renderEmpty(message) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  resultsEl.replaceChildren(empty);
}

function renderResults(data) {
  metaEl.replaceChildren(
    document.createTextNode(
      `${data.total_results} resultado${data.total_results === 1 ? "" : "s"} · `,
    ),
    (() => {
      const latency = document.createElement("span");
      latency.className = "latency";
      latency.textContent = `${data.latency_ms.toFixed(3)} ms`;
      return latency;
    })(),
  );

  if (data.results.length === 0) {
    renderEmpty("Sin resultados. Probá con otros términos.");
    return;
  }

  const maxScore = Math.max(...data.results.map((r) => r.score), 1);
  const resultNodes = data.results.map((result) => {
    const pct = Math.max(6, Math.round((result.score / maxScore) * 100));
    const article = document.createElement("article");
    article.className = "result";

    const header = document.createElement("div");
    header.className = "result-head";
    const title = document.createElement("span");
    title.className = "result-title";
    title.textContent = result.title;
    const category = document.createElement("span");
    category.className = "result-category";
    category.textContent = result.category;
    header.append(title, category);

    const snippet = document.createElement("p");
    snippet.className = "result-snippet";
    snippet.textContent = result.snippet;

    const scoreRow = document.createElement("div");
    scoreRow.className = "score-row";
    const track = document.createElement("div");
    track.className = "score-bar-track";
    const fill = document.createElement("div");
    fill.className = "score-bar-fill";
    fill.style.width = `${pct}%`;
    track.appendChild(fill);
    const score = document.createElement("span");
    score.className = "score-value";
    score.textContent = `bm25 = ${result.score.toFixed(3)}`;
    scoreRow.append(track, score);

    article.append(header, snippet, scoreRow);
    return article;
  });
  resultsEl.replaceChildren(...resultNodes);
}

async function runSearch(query) {
  metaEl.textContent = "buscando…";
  try {
    const params = new URLSearchParams({ q: query, limit: "10" });
    if (activeCategory) params.set("category", activeCategory);
    const res = await fetch(`${API_BASE}/api/search?${params.toString()}`);
    const data = await res.json();
    renderResults(data);
    loadStats();
  } catch {
    metaEl.textContent = "";
    renderEmpty("No se pudo conectar con la API. Revisá que el backend esté corriendo.");
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (q) runSearch(q);
});

loadStats();
loadCategories();
setInterval(loadStats, 5000);
