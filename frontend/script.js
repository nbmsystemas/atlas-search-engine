// Apunta a la API. En desarrollo local es localhost:8000; en producción,
// reemplazar por la URL del backend deployado (ver README).
const API_BASE = window.ATLAS_API_BASE || "http://localhost:8000";

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
    statsEl.innerHTML =
      `<b>${data.documents_indexed}</b> docs · ` +
      `<b>${data.vocabulary_size}</b> términos · ` +
      `p95 <b>${data.p95_latency_ms.toFixed(2)}ms</b> · ` +
      `<b>${data.total_queries_served}</b> queries servidas`;
  } catch (err) {
    statsEl.textContent = "no se pudo conectar con la API — ¿está corriendo el backend?";
  }
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    const data = await res.json();
    categoriesEl.innerHTML = "";
    const allChip = makeChip("todas", null);
    categoriesEl.appendChild(allChip);
    data.categories.forEach((cat) => {
      categoriesEl.appendChild(makeChip(cat, cat));
    });
  } catch (err) {
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

function renderEmpty(message) {
  resultsEl.innerHTML = `<div class="empty-state">${message}</div>`;
}

function renderResults(data) {
  metaEl.innerHTML =
    `${data.total_results} resultado${data.total_results === 1 ? "" : "s"} · ` +
    `<span class="latency">${data.latency_ms.toFixed(3)} ms</span>`;

  if (data.results.length === 0) {
    renderEmpty("Sin resultados. Probá con otros términos.");
    return;
  }

  const maxScore = Math.max(...data.results.map((r) => r.score), 1);

  resultsEl.innerHTML = data.results
    .map((r) => {
      const pct = Math.max(6, Math.round((r.score / maxScore) * 100));
      return `
        <article class="result">
          <div class="result-head">
            <span class="result-title">${escapeHtml(r.title)}</span>
            <span class="result-category">${escapeHtml(r.category)}</span>
          </div>
          <p class="result-snippet">${escapeHtml(r.snippet)}</p>
          <div class="score-row">
            <div class="score-bar-track">
              <div class="score-bar-fill" style="width:${pct}%"></div>
            </div>
            <span class="score-value">bm25 = ${r.score.toFixed(3)}</span>
          </div>
        </article>`;
    })
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
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
  } catch (err) {
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
