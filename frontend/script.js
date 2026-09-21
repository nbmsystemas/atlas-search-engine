// The static frontend keeps the API URL configurable at runtime. Local Docker
// uses localhost; production uses the Render service from render.yaml. A
// `?api=https://...` query parameter is also supported for provider previews.
const localHosts = new Set(["localhost", "127.0.0.1"]);
const defaultApiBase = localHosts.has(window.location.hostname)
  ? "http://localhost:8000"
  : "https://atlas-search-engine-api.onrender.com";
const apiOverride = new URLSearchParams(window.location.search).get("api");
const API_BASE = (apiOverride || window.ATLAS_API_BASE || defaultApiBase).replace(/\/$/, "");

const translations = {
  en: {
    pageTitle: "Atlas — Search Engine Console",
    eyebrow: "search engine built from scratch — tokenizer, inverted index, BM25 ranking",
    introTitle: "See how a search engine thinks.",
    introCopy: "Explore 44 preloaded technical documents about algorithms, databases, systems, security, DevOps, and more. No account or upload is needed: choose an example or write your own query.",
    retry: "retry connection",
    healthcheck: "view healthcheck",
    searchButton: "search",
    placeholder: "try 'inverted index' or 'API security'…",
    quickStart: "start here",
    quickIndex: "inverted index",
    quickSecurity: "API security",
    quickDevops: "Docker and CI/CD",
    quickSemantic: "semantic search",
    helpSummary: "How do I try this?",
    helpHint: "a quick guide for curious and technical visitors",
    quickGuideTitle: "For a quick first result",
    quickGuideOne: "Choose a suggested query or type two or three words.",
    quickGuideTwo: "Use categories to narrow the corpus.",
    quickGuideThree: "Compare the BM25 score and real response latency.",
    tryLabel: "Try",
    orLabel: "or",
    technicalGuideTitle: "For technical reviewers and recruiters",
    technicalGuideOne: "The demo corpus loads automatically when the API starts.",
    technicalGuideTwo: "The ranking path is built from scratch: tokenizer, inverted index, and BM25.",
    technicalGuideThree: "Each response includes real latency;",
    openSwagger: "open Swagger",
    technicalGuideFour: "to explore the endpoints.",
    viewGithub: "view code on GitHub",
    viewArchitecture: "view architecture",
    categoryHeading: "filter by topic",
    optional: "optional",
    allCategories: "all topics",
    viewSource: "source code on GitHub",
    apiDocs: "API documentation (Swagger)",
    builtBy: "Built by Ing. Pablo Ezequiel Moscardo · nbmsystemas",
    authorBio: "Full-stack Developer · 20+ years of experience",
    juniorMessage: "For junior engineers: learn to ship the whole system—tests, observability, documentation, reproducible deployments, and honest trade-offs.",
    apiOffline: "API offline · the corpus is waiting for the backend",
    backendUnavailable: "The backend is unavailable",
    frontendOnline: "The frontend is online, but it needs the API to search.",
    backendUnavailableDetail: "The frontend is published, but the API is not responding at {api}. The preloaded corpus lives in the backend, so searching starts when the service is online.",
    stillUnavailable: "The API is still not responding at {api}. If this is a Render preview, check that the service is running.",
    searching: "searching…",
    resultNeedsApi: "The search needs the API to be available. Use “retry connection”.",
    searchFailed: "The API could not process this search at {api}. Try again when the backend is online.",
    noResults: "No results. Try a different query.",
    oneResult: "1 result",
    manyResults: "{count} results",
    statsDocs: " docs · ",
    statsTerms: " terms · p95 ",
    statsQueries: " queries served",
    connecting: "connecting…",
    openDocument: "open document →",
    openDocumentNamed: "Open {title}",
    backToResults: "back to results",
    loadingDocument: "loading document…",
    documentLoadFailed: "The document could not be loaded at {api}. Try again when the backend is online.",
    documentNotAvailable: "This document is not available right now.",
    bm25Explanation: "BM25 favors query terms that appear often here, down-weights common terms, and normalizes for document length.",
  },
  es: {
    pageTitle: "Atlas — Consola de búsqueda",
    eyebrow: "motor de búsqueda construido desde cero — tokenizer, índice invertido, ranking BM25",
    introTitle: "Probá cómo piensa un buscador.",
    introCopy: "Explorá 44 documentos técnicos precargados sobre algoritmos, bases de datos, sistemas, seguridad, DevOps y más. No necesitás crear una cuenta ni cargar datos: elegí un ejemplo o escribí tu propia consulta.",
    retry: "reintentar conexión",
    healthcheck: "ver healthcheck",
    searchButton: "buscar",
    placeholder: "probá con 'índice invertido' o 'seguridad API'…",
    quickStart: "empezá por acá",
    quickIndex: "índice invertido",
    quickSecurity: "seguridad API",
    quickDevops: "Docker y CI/CD",
    quickSemantic: "búsqueda semántica",
    helpSummary: "¿Cómo pruebo esto?",
    helpHint: "guía rápida para curiosos y técnicos",
    quickGuideTitle: "Para ver un resultado rápido",
    quickGuideOne: "Elegí una consulta sugerida o escribí dos o tres palabras.",
    quickGuideTwo: "Usá las categorías para acotar el corpus.",
    quickGuideThree: "Compará el score BM25 y la latencia real de la respuesta.",
    tryLabel: "Probá",
    orLabel: "o",
    technicalGuideTitle: "Para técnicos y recruiters",
    technicalGuideOne: "El corpus de demo se carga automáticamente al iniciar la API.",
    technicalGuideTwo: "El ranking está implementado desde cero: tokenizer, índice invertido y BM25.",
    technicalGuideThree: "Cada respuesta muestra latencia real;",
    openSwagger: "abrí Swagger",
    technicalGuideFour: "para explorar los endpoints.",
    viewGithub: "ver código en GitHub",
    viewArchitecture: "ver arquitectura",
    categoryHeading: "filtrá por tema",
    optional: "opcional",
    allCategories: "todos los temas",
    viewSource: "código fuente en GitHub",
    apiDocs: "documentación de la API (Swagger)",
    builtBy: "Desarrollado por Ing. Pablo Ezequiel Moscardo · nbmsystemas",
    authorBio: "Developer full-stack · más de 20 años de experiencia",
    juniorMessage: "Para quienes están empezando: aprendan a entregar el sistema completo—tests, observabilidad, documentación, deploys reproducibles y decisiones técnicas honestas.",
    apiOffline: "API offline · el corpus espera al backend",
    backendUnavailable: "El backend no está disponible",
    frontendOnline: "El frontend está online, pero necesita la API para buscar.",
    backendUnavailableDetail: "El frontend está publicado, pero la API no responde en {api}. El corpus precargado vive en el backend, así que la búsqueda se habilita cuando el servicio está online.",
    stillUnavailable: "La API sigue sin responder en {api}. Si estás usando un preview de Render, revisá que el servicio esté activo.",
    searching: "buscando…",
    resultNeedsApi: "La búsqueda necesita que la API esté disponible. Usá “reintentar conexión”.",
    searchFailed: "La API no pudo procesar la búsqueda en {api}. Probá de nuevo cuando el backend esté online.",
    noResults: "Sin resultados. Probá con otra consulta.",
    oneResult: "1 resultado",
    manyResults: "{count} resultados",
    statsDocs: " docs · ",
    statsTerms: " términos · p95 ",
    statsQueries: " consultas servidas",
    connecting: "conectando…",
    openDocument: "abrir documento →",
    openDocumentNamed: "Abrir {title}",
    backToResults: "volver a resultados",
    loadingDocument: "cargando documento…",
    documentLoadFailed: "No se pudo cargar el documento en {api}. Probá de nuevo cuando el backend esté online.",
    documentNotAvailable: "Este documento no está disponible por ahora.",
    bm25Explanation: "BM25 prioriza los términos de la consulta que aparecen acá, pondera menos los comunes y normaliza por longitud del documento.",
  },
};

let currentLanguage = (() => {
  try {
    return localStorage.getItem("atlas-language") === "es" ? "es" : "en";
  } catch {
    return "en";
  }
})();

function t(key, replacements = {}) {
  return Object.entries(replacements).reduce(
    (text, [name, value]) => text.replace(`{${name}}`, value),
    translations[currentLanguage][key],
  );
}

const docsLink = document.getElementById("api-docs-link");
const helpApiLink = document.getElementById("help-api-link");
const apiStatusLink = document.getElementById("api-status-link");
const languageButtons = document.querySelectorAll("[data-language]");
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
let lastResultsData = null;
let activeDocument = null;
let latestStats = null;

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function setConnectionState(isOnline, detail = "") {
  if (isOnline) {
    connectionNotice.hidden = true;
    return;
  }

  connectionNotice.hidden = false;
  connectionTitle.textContent = t("backendUnavailable");
  connectionMessage.textContent = detail || t("backendUnavailableDetail", { api: API_BASE });
}

function applyLanguage(language) {
  currentLanguage = language === "es" ? "es" : "en";
  document.documentElement.lang = currentLanguage;
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  input.placeholder = t("placeholder");
  languageButtons.forEach((button) => {
    const isActive = button.dataset.language === currentLanguage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  quickSearches.forEach((button) => {
    const query = button.dataset[`query${currentLanguage === "es" ? "Es" : "En"}`];
    if (query) {
      button.dataset.query = query;
      if (button.classList.contains("inline-query")) button.textContent = query;
    }
  });
  try {
    localStorage.setItem("atlas-language", currentLanguage);
  } catch {
    // Private browsing can disable localStorage; the toggle still works.
  }
  if (categoriesEl.children.length) loadCategories();
  if (latestStats) renderStats(latestStats);
  if (activeDocument) {
    if (activeDocument.data) renderDocumentDetail(activeDocument.data);
    else renderDocumentLoading();
  } else if (lastResultsData) {
    renderResults(lastResultsData);
  }
  if (!connectionNotice.hidden) setConnectionState(false);
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
  retryButton.textContent = t("connecting");
  try {
    await requestJson("/api/health");
    setConnectionState(true);
    await Promise.all([loadStats(), loadCategories()]);
    if (lastQuery) runSearch(lastQuery);
  } catch {
    setConnectionState(false, t("stillUnavailable", { api: API_BASE }));
  } finally {
    retryButton.disabled = false;
    retryButton.textContent = t("retry");
  }
}

function renderStats(data) {
  statsEl.replaceChildren(
    strongText(data.documents_indexed),
    document.createTextNode(t("statsDocs")),
    strongText(data.vocabulary_size),
    document.createTextNode(t("statsTerms")),
    strongText(`${data.p95_latency_ms.toFixed(2)}ms`),
    document.createTextNode(" · "),
    strongText(data.total_queries_served),
    document.createTextNode(t("statsQueries")),
  );
}

async function loadStats() {
  try {
    const data = await requestJson("/api/stats");
    latestStats = data;
    setConnectionState(true);
    renderStats(data);
  } catch {
    statsEl.textContent = t("apiOffline");
    setConnectionState(false);
  }
}

async function loadCategories() {
  try {
    const data = await requestJson("/api/categories");
    categoriesEl.replaceChildren();
    const allChip = makeChip(t("allCategories"), null);
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

function normalizeToken(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function stemToken(token) {
  for (const suffix of ["mente", "ciones", "cion", "ando", "iendo", "amente", "ing", "es", "s"]) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 3) {
      return token.slice(0, -suffix.length);
    }
  }
  return token;
}

function queryTerms(query) {
  const normalized = normalizeToken(query);
  const terms = normalized.match(/[a-z0-9]+/g) || [];
  return new Set(terms.map(stemToken));
}

function appendHighlightedText(parent, text, query) {
  const terms = queryTerms(query);
  if (!terms.size) {
    parent.textContent = text;
    return;
  }

  const wordPattern = /[\p{L}\p{N}]+/gu;
  let cursor = 0;
  let match;
  while ((match = wordPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      parent.appendChild(document.createTextNode(text.slice(cursor, match.index)));
    }
    const word = normalizeToken(match[0]);
    if (terms.has(stemToken(word))) {
      const mark = document.createElement("mark");
      mark.className = "matched-term";
      mark.textContent = match[0];
      parent.appendChild(mark);
    } else {
      parent.appendChild(document.createTextNode(match[0]));
    }
    cursor = match.index + match[0].length;
  }
  parent.appendChild(document.createTextNode(text.slice(cursor)));
}

function makeBackToResultsButton() {
  const back = document.createElement("button");
  back.type = "button";
  back.className = "document-back";
  back.textContent = `← ${t("backToResults")}`;
  back.addEventListener("click", closeDocumentDetail);
  return back;
}

function renderDocumentLoading() {
  const detail = document.createElement("article");
  detail.className = "document-view";
  const back = makeBackToResultsButton();
  const status = document.createElement("p");
  status.className = "document-status";
  status.setAttribute("role", "status");
  status.textContent = t("loadingDocument");
  detail.append(back, status);
  resultsEl.replaceChildren(detail);
  back.focus();
}

function renderDocumentError() {
  const detail = document.createElement("article");
  detail.className = "document-view document-error";
  const back = makeBackToResultsButton();
  const message = document.createElement("p");
  message.className = "document-status";
  message.textContent = t("documentNotAvailable");
  detail.append(back, message);
  resultsEl.replaceChildren(detail);
  back.focus();
}

function renderDocumentDetail(data) {
  const detail = document.createElement("article");
  detail.className = "document-view";
  const back = makeBackToResultsButton();
  const header = document.createElement("header");
  header.className = "document-header";
  const category = document.createElement("span");
  category.className = "result-category";
  category.textContent = data.category;
  const title = document.createElement("h2");
  title.className = "document-title";
  title.textContent = data.title;
  header.append(category, title);

  const content = document.createElement("div");
  content.className = "document-content";
  const paragraphs = String(data.content || "").split(/\n\s*\n/).filter(Boolean);
  (paragraphs.length ? paragraphs : [t("documentNotAvailable")]).forEach((paragraphText) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = paragraphText;
    content.appendChild(paragraph);
  });

  detail.append(back, header, content);
  resultsEl.replaceChildren(detail);
  back.focus();
}

function closeDocumentDetail() {
  if (!lastResultsData) return;
  const documentId = activeDocument && activeDocument.id;
  activeDocument = null;
  renderResults(lastResultsData);
  if (documentId !== undefined) {
    window.requestAnimationFrame(() => {
      const resultAction = resultsEl.querySelector(`[data-document-id="${documentId}"]`);
      if (resultAction) resultAction.focus();
    });
  }
}

async function openDocument(docId) {
  activeDocument = { id: docId, data: null };
  renderDocumentLoading();
  try {
    const data = await requestJson(`/api/documents/${encodeURIComponent(docId)}`);
    setConnectionState(true);
    activeDocument.data = data;
    renderDocumentDetail(data);
  } catch {
    setConnectionState(false, t("documentLoadFailed", { api: API_BASE }));
    renderDocumentError();
  }
}

function renderResults(data) {
  lastResultsData = data;
  const resultCount = data.total_results === 1
    ? t("oneResult")
    : t("manyResults", { count: data.total_results });
  metaEl.replaceChildren(
    document.createTextNode(`${resultCount} · `),
    (() => {
      const latency = document.createElement("span");
      latency.className = "latency";
      latency.textContent = `${data.latency_ms.toFixed(3)} ms`;
      return latency;
    })(),
  );

  if (data.results.length === 0) {
    renderEmpty(t("noResults"));
    return;
  }

  const maxScore = Math.max(...data.results.map((r) => r.score), 1);
  const explanation = document.createElement("p");
  explanation.className = "ranking-explanation";
  explanation.textContent = t("bm25Explanation");
  const resultNodes = data.results.map((result) => {
    const pct = Math.max(6, Math.round((result.score / maxScore) * 100));
    const article = document.createElement("article");
    article.className = "result";

    const header = document.createElement("div");
    header.className = "result-head";
    const title = document.createElement("button");
    title.type = "button";
    title.className = "result-title";
    title.dataset.documentId = String(result.doc_id);
    title.textContent = result.title;
    title.setAttribute("aria-label", t("openDocumentNamed", { title: result.title }));
    title.addEventListener("click", () => openDocument(result.doc_id));
    const category = document.createElement("span");
    category.className = "result-category";
    category.textContent = result.category;
    header.append(title, category);

    const snippet = document.createElement("p");
    snippet.className = "result-snippet";
    appendHighlightedText(snippet, result.snippet, lastQuery);

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
    const action = document.createElement("button");
    action.type = "button";
    action.className = "result-open";
    action.dataset.documentId = String(result.doc_id);
    action.textContent = t("openDocument");
    action.addEventListener("click", () => openDocument(result.doc_id));
    scoreRow.append(track, score, action);

    article.append(header, snippet, scoreRow);
    return article;
  });
  resultsEl.replaceChildren(explanation, ...resultNodes);
}

async function runSearch(query) {
  activeDocument = null;
  lastQuery = query;
  metaEl.textContent = t("searching");
  try {
    const params = new URLSearchParams({ q: query, limit: "10" });
    if (activeCategory) params.set("category", activeCategory);
    const data = await requestJson(`/api/search?${params.toString()}`);
    setConnectionState(true);
    renderResults(data);
    loadStats();
  } catch {
    metaEl.textContent = "";
    setConnectionState(false, t("searchFailed", { api: API_BASE }));
    renderEmpty(t("resultNeedsApi"));
  }
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
});
applyLanguage(currentLanguage);

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
