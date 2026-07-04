const CONTENT_API_URL = "https://script.google.com/macros/s/AKfycbyab1CGFlddCTXm02GnH-na5HCXbhJ1XjGNZ2i23cWvTOaxOWH2qxyeL94U2FrnatCsbg/exec";

const NEWS_CACHE_KEY = "meteor_news_page_cache";

const newsArea = document.getElementById("newsArea");

document.addEventListener("DOMContentLoaded", () => {
  renderNewsCache();
  loadNews();
});

function renderNewsCache() {
  const cache = getCache(NEWS_CACHE_KEY);
  if (!cache) return;

  renderNews(cache);
}

async function loadNews() {
  try {
    if (!getCache(NEWS_CACHE_KEY)) {
      newsArea.innerHTML =
        `<div class="loading-card">お知らせを読み込み中...</div>`;
    }

    const url = `${CONTENT_API_URL}?action=news&t=${Date.now()}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store"
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "取得できませんでした");
    }

    const newsList = data.news || [];

    setCache(NEWS_CACHE_KEY, newsList);
    renderNews(newsList);

  } catch (error) {
    console.error(error);

    if (!getCache(NEWS_CACHE_KEY)) {
      newsArea.innerHTML = `
        <div class="empty-card">
          お知らせを読み込めませんでした。<br>
          しばらくしてから再度お試しください。
        </div>
      `;
    }
  }
}

function renderNews(newsList) {
  if (!newsList.length) {
    newsArea.innerHTML = `
      <div class="empty-card">
        現在お知らせはありません。
      </div>
    `;
    return;
  }

  newsArea.innerHTML = newsList.map(createNewsCard).join("");
}

function createNewsCard(news) {
  const dateText = formatNewsDate(
    news.createdAt ||
    news.registeredAt ||
    news.registrationDate ||
    news.registeredDate ||
    news.date ||
    news.createdDate ||
    news.publishDate ||
    news["登録日時"] ||
    news["更新日時"]
  );

  const linkButton = news.linkUrl
    ? `
      <a class="news-link"
         href="${escapeHtml(news.linkUrl)}"
         target="_blank"
         rel="noopener">
        <span class="material-symbols-rounded">open_in_new</span>
        詳しく見る
      </a>
    `
    : "";

  return `
    <article class="news-card">

      <div class="news-card-head">

        <div class="news-label">
          <span class="material-symbols-rounded">campaign</span>
          お知らせ
        </div>

        ${dateText ? `<div class="news-date">${escapeHtml(dateText)}</div>` : ""}

        <h2>${escapeHtml(news.title)}</h2>

      </div>

      <div class="news-body">

        <p>${escapeHtml(news.body)}</p>

        ${linkButton}

      </div>

    </article>
  `;
}

function formatNewsDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function goHome() {
  window.location.href = "home.html";
}

function goQR() {
  window.location.href = "qr.html";
}

function goEvent() {
  window.location.href = "event.html";
}

function goNews() {
  window.location.href = "news.html";
}

function goSettings() {
  window.location.href = "settings.html";
}