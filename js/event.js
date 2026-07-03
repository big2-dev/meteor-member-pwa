const API_BASE_URL = "https://script.google.com/macros/s/AKfycbyab1CGFlddCTXm02GnH-na5HCXbhJ1XjGNZ2i23cWvTOaxOWH2qxyeL94U2FrnatCsbg/exec";

const EVENT_CACHE_KEY = "meteor_event_page_cache_v2";

const eventArea = document.getElementById("eventArea");

document.addEventListener("DOMContentLoaded", () => {
  renderEventCache();
  loadEvents();
});

function renderEventCache() {
  const cache = getCache(EVENT_CACHE_KEY);
  if (!cache) return;

  renderEvents(cache);
}

async function loadEvents() {
  try {
    if (!getCache(EVENT_CACHE_KEY)) {
      eventArea.innerHTML = `<div class="loading-card">イベント情報を読み込み中...</div>`;
    }

    const response = await fetch(`${API_BASE_URL}?action=events`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "イベント情報を取得できませんでした");
    }

    const events = data.events || [];

    setCache(EVENT_CACHE_KEY, events);
    renderEvents(events);

  } catch (error) {
    console.error(error);

    if (!getCache(EVENT_CACHE_KEY)) {
      eventArea.innerHTML = `
        <div class="empty-card">
          イベント情報を読み込めませんでした。<br>
          しばらくしてから再度お試しください。
        </div>
      `;
    }
  }
}

function renderEvents(events) {
  if (!events.length) {
    eventArea.innerHTML = `
      <div class="empty-card">
        現在開催予定のイベントはありません。
      </div>
    `;
    return;
  }

  eventArea.innerHTML = events
    .map(event => createEventCard(event))
    .join("");
}

function createEventCard(event) {
  const imageHtml = event.image
    ? `<img src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title)}" class="event-image">`
    : `<div class="event-image-placeholder">METEO</div>`;

  const entryHtml = event.entryUrl
    ? `<a href="${escapeHtml(event.entryUrl)}" target="_blank" rel="noopener" class="event-link">申込みページを開く</a>`
    : "";

  return `
    <article class="event-card">
      <div class="event-image-wrap">
        ${imageHtml}
        <div class="event-badge">イベント</div>
      </div>

      <div class="event-body">
        <p class="event-date">${escapeHtml(event.start || "")}</p>
        <h2 class="event-title">${escapeHtml(event.title || "")}</h2>
        <p class="event-text">${escapeHtml(event.description || "")}</p>

        <div class="event-meta">
          <div class="event-meta-row">
            <span>場所</span>
            <span>${escapeHtml(event.place || "メテオゴルフ")}</span>
          </div>
          <div class="event-meta-row">
            <span>終了</span>
            <span>${escapeHtml(event.end || "未定")}</span>
          </div>
        </div>

        ${entryHtml}
      </div>
    </article>
  `;
}

function createMoreButton(count) {
  return `
    <div class="more-card">
      <button class="more-btn" onclick="showAllEvents()">
        もっと見る（全${count}件）
      </button>
    </div>
  `;
}

function showAllEvents() {
  alert("イベント一覧は次の工程で作成します。");
}

function setCache(key, value) {
  localStorage.setItem(key, JSON.stringify({
    savedAt: Date.now(),
    value: value
  }));
}

function getCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const cache = JSON.parse(raw);
    return cache.value || null;
  } catch (error) {
    return null;
  }
}

function goHome() {
  window.location.href = "home.html";
}

function goQR() {
  window.location.href = "qr.html";
}

function goNews() {
  window.location.href = "news.html";
}

function goMore() {
  window.location.href = "settings.html";
}

function goSettings() {
  window.location.href = "settings.html";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}