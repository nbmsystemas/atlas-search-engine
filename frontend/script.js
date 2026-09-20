// The static frontend keeps the API URL configurable at runtime. Local Docker
// uses localhost; production uses the Render service from render.yaml. A
// `?api=https://...` query parameter is also supported for provider previews.
const localHosts = new Set(["localhost", "127.0.0.1"]);
const defaultApiBase = localHosts.has(window.location.hostname)
  ? "http://localhost:8000"
  : "https://atlas-search-engine-api.onrender.com";
const apiOverride = new URLSearchParams(window.location.search).get("api");
const API_BASE = (apiOverride || window.ATLAS_API_BASE || defaultApiBase).replace(/\/$/, "");

const docsLink = document.getElementById("api-docs-link");
const helpApiLink = document.getElementById("help-api-link");
const apiStatusLink = document.getElementById("api-status-link");
if (docsLink) docsLink.href = `${API_BASE}/docs`;
if (helpApiLink) helpApiLink.href = `${API_BASE}/docs`;
if (apiStatusLink) apiStatusLink.href = `${API_BASE}/api/health`;

const form = document.getElementById("search-form");
const input = document.getElementById("query");
const resultsEl = document.getElementById("results");
const metaEl = document.getElementById("results-meta");
const statsEl = document.getElementById("stats");
const categoriesEl = document.getElementById("categories");
const connectionNotice = document.getElementById("connection-notice");
const connectionTitle = document.getElementById("connection-title");
const connectionMessage = document.getElementById("connection-message");
const retryButton = document.getElementById("retry-button");
const quickSearches = document.querySelectorAll("[data-query]");

let activeCategory = null;
let lastQuery = "";

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function setConnectionState(isOnline, detail = "") {
  if (isOnline) {
    connectionNotice.hidden = true;
    return;
  }

  connectionNotice.hidden = false;
  connectionTitle.textContent = "El backend no está disponible";
  connectionMessage.textContent = detail ||
    `La interfaz está publicada, pero la API no responde en ${API_BASE}. El corpus precargado vive en el backend, así que la búsqueda se habilita cuando el servicio está online.`;
}

async function requestJson(path) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(apiUrl(path), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

async function checkConnection() {
  retryButton.disabled = true;
  retryButton.textContent = "conectando…";
  try {
    await requestJson("/api/health");
    setConnectionState(true);
    await Promise.all([loadStats(), loadCategories()]);
    if (lastQuery) runSearch(lastQuery);
  } catch {
    setConnectionState(false, `La API sigue sin responder en ${API_BASE}. Si estás usando un preview de Render, revisá que el servicio esté activo.`);
  } finally {
    retryButton.disabled = false;
    retryButton.textContent = "reintentar conexión";
  }
}

async function loadStats() {
  try {
    const data = await requestJson("/api/stats");
    setConnectionState(true);
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
    statsEl.textContent = "API offline · el corpus espera al backend";
    setConnectionState(false);
  }
}

async function loadCategories() {
  try {
    const data = await requestJson("/api/categories");
    categoriesEl.replaceChildren();
    const allChip = makeChip("todas", null);
    categoriesEl.appendChild(allChip);
    data.categories.forEach((cat) => {
      categoriesEl.appendChild(makeChip(cat, cat));
    });
  } catch {
    categoriesEl.replaceChildren();
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
  lastQuery = query;
  metaEl.textContent = "buscando…";
  try {
    const params = new URLSearchParams({ q: query, limit: "10" });
    if (activeCategory) params.set("category", activeCategory);
    const data = await requestJson(`/api/search?${params.toString()}`);
    setConnectionState(true);
    renderResults(data);
    loadStats();
  } catch {
    metaEl.textContent = "";
    setConnectionState(false, `La API no pudo procesar la búsqueda en ${API_BASE}. Podés reintentar cuando el backend esté online.`);
    renderEmpty("La búsqueda necesita que la API esté disponible. Usá “reintentar conexión”.");
  }
}

retryButton.addEventListener("click", checkConnection);
quickSearches.forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.query;
    runSearch(input.value);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (q) runSearch(q);
});

loadStats();
loadCategories();
setInterval(loadStats, 5000);
