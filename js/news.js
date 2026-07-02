const CONTENT_API_URL = "https://script.google.com/macros/s/AKfycbyab1CGFlddCTXm02GnH-na5HCXbhJ1XjGNZ2i23cWvTOaxOWH2qxyeL94U2FrnatCsbg/exec";

const newsArea = document.getElementById("newsArea");

document.addEventListener("DOMContentLoaded", () => {
  loadNews();
});

async function loadNews() {
  try {

    newsArea.innerHTML =
      `<div class="loading-card">お知らせを読み込み中...</div>`;

    const response = await fetch(`${CONTENT_API_URL}?action=news`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "取得できませんでした");
    }

    renderNews(data.news || []);

  } catch (error) {

    console.error(error);

    newsArea.innerHTML = `
      <div class="empty-card">
        お知らせを読み込めませんでした。<br>
        しばらくしてから再度お試しください。
      </div>
    `;
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

        <h2>${escapeHtml(news.title)}</h2>

      </div>

      <div class="news-body">

        <p>${escapeHtml(news.body)}</p>

        ${linkButton}

      </div>

    </article>
  `;
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