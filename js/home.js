const MEMBER_API_URL = "https://script.google.com/macros/s/AKfycbxsHYfop671-Fb4GehXwx5XhfZguvlDZqvH2xCusPevwaggSRc3omhxittN7IQHPlC2/exec";
const CONTENT_API_URL = "https://script.google.com/macros/s/AKfycbyab1CGFlddCTXm02GnH-na5HCXbhJ1XjGNZ2i23cWvTOaxOWH2qxyeL94U2FrnatCsbg/exec";

const CACHE_MEMBER = "meteor_home_member_cache";
const CACHE_NEWS = "meteor_home_news_cache";
const CACHE_EVENT = "meteor_home_event_cache";

const memberId = localStorage.getItem("meteor_member_id");
const token = localStorage.getItem("meteor_token");

if (!memberId || !token) {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
  setGreeting();

  renderMemberCache();
  renderNewsCache();
  renderEventCache();

  loadMemberInfo();
  loadHomeNews();
  loadHomeEvent();
  checkForUpdates();
});

function setGreeting() {
  const hour = new Date().getHours();
  const greeting = document.getElementById("greeting");

  if (!greeting) return;

  if (hour < 11) {
    greeting.textContent = "☀️ おはようございます！";
  } else if (hour < 18) {
    greeting.textContent = "こんにちは！";
  } else {
    greeting.textContent = "🌙 こんばんは！";
  }
}

function renderMemberCache() {
  const cache = getCache(CACHE_MEMBER);
  if (!cache) return;
  renderMember(cache);
}

function renderNewsCache() {
  const cache = getCache(CACHE_NEWS);
  if (!cache) return;
  renderHomeNews(cache);
}

function renderEventCache() {
  const cache = getCache(CACHE_EVENT);
  if (!cache) return;
  renderHomeEvent(cache);
}

function loadMemberInfo() {
  fetch(MEMBER_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "getMemberInfo",
      memberId: memberId
    })
  })
    .then(response => response.json())
    .then(result => {
      if (!result.success) {
        document.getElementById("memberName").textContent = "会員情報なし";
        return;
      }

      setCache(CACHE_MEMBER, result);
      renderMember(result);
    })
    .catch(error => {
      console.error(error);
      if (!getCache(CACHE_MEMBER)) {
        document.getElementById("memberName").textContent = "通信エラー";
      }
    });
}

function renderMember(result) {
  document.getElementById("memberName").textContent = result.name || "会員";
  document.getElementById("memberType").textContent = result.memberType || "-";

  renderPointCard(result.memberType, result.points);
  setExpireDisplay(result.expireDate);
}

function renderPointCard(memberType, points) {
  const card = document.getElementById("pointCard");
  const title = document.getElementById("pointTitle");
  const balance = document.getElementById("pointBalance");
  const note = document.getElementById("pointNote");

  if (!card || !title || !balance || !note) return;

  const typeText = String(memberType || "");
  const pointValue = Number(points || 0);
  const isYearMember = typeText.includes("1年");

  card.classList.remove("residual-point");
  note.style.display = "none";

  balance.textContent = formatPoint(pointValue);

  if (isYearMember) {
    title.textContent = "現在ポイント";
    card.style.display = "block";
    return;
  }

  if (pointValue > 0) {
    title.textContent = "残ポイント";
    note.style.display = "block";
    card.classList.add("residual-point");
    card.style.display = "block";
    return;
  }

  card.style.display = "none";
}

function loadHomeNews() {
  fetch(`${CONTENT_API_URL}?action=news`)
    .then(response => response.json())
    .then(data => {
      if (!data.success) throw new Error("お知らせ取得エラー");

      setCache(CACHE_NEWS, data.news || []);
      renderHomeNews(data.news || []);
    })
    .catch(error => {
      console.error(error);
    });
}

function renderHomeNews(newsList) {
  const card = document.getElementById("homeNewsCard");
  const list = document.getElementById("homeNewsList");

  if (!card || !list) return;

  if (!newsList.length) {
    card.style.display = "none";
    return;
  }

  list.innerHTML = "";

  newsList.slice(0, 2).forEach(news => {
    const row = document.createElement("div");
    row.className = "home-news-row";
    row.innerHTML = `
      <span class="home-news-title">${escapeHtml(news.title)}</span>
    `;
    list.appendChild(row);
  });

  card.style.display = "grid";
}

function loadHomeEvent() {
  fetch(`${CONTENT_API_URL}?action=events`)
    .then(response => response.json())
    .then(data => {
      if (!data.success) throw new Error("イベント取得エラー");

      setCache(CACHE_EVENT, data.events || []);
      renderHomeEvent(data.events || []);
    })
    .catch(error => {
      console.error(error);
    });
}

function renderHomeEvent(events) {
  const card = document.getElementById("homeEventCard");
  const imageWrap = document.getElementById("homeEventImageWrap");

  if (!card || !imageWrap) return;

  if (!events.length) {
    card.style.display = "none";
    return;
  }

  const event = events[0];

  document.getElementById("homeEventTitle").textContent =
    event.title || "イベント";

  document.getElementById("homeEventDate").textContent =
    formatEventDateRange(event.start, event.end);

  document.getElementById("homeEventPlace").textContent =
    event.place || "メテオゴルフ";

  if (event.image) {
    imageWrap.innerHTML = `
      <img src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title || "イベント画像")}">
    `;
  } else {
    imageWrap.innerHTML = `
      <div class="home-event-placeholder">開催予定イベント</div>
    `;
  }

  card.style.display = "block";
}

function setExpireDisplay(value) {
  const box = document.getElementById("expireInline");
  const dateText = document.getElementById("expireDate");
  const alertBox = document.getElementById("expireAlert");

  if (!box || !dateText) return;

  const formatted = formatDate(value);
  const diffDays = getDiffDays(value);

  box.classList.remove("warning", "danger", "expired");

  if (alertBox) {
    alertBox.style.display = "none";
  }

  if (diffDays === null) {
    dateText.textContent = formatted;
    return;
  }

  if (diffDays < 0) {
    dateText.textContent = formatted;
    box.classList.add("expired", "danger");

    if (alertBox) {
      alertBox.style.display = "flex";
    }

    return;
  }

  dateText.textContent = formatted;
}

function formatEventDateRange(startValue, endValue) {
  if (!startValue) return "日時未定";

  const start = new Date(startValue);
  const end = new Date(endValue);

  if (isNaN(start.getTime())) return startValue;

  const startText = formatEventDateWithTime(start);

  if (!endValue || isNaN(end.getTime())) {
    return `${startText}〜`;
  }

  const sameDate =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDate) {
    return `${startText}〜${formatTime(end)}`;
  }

  return `${startText}〜${formatEventDateWithTime(end)}`;
}

function formatEventDateWithTime(date) {
  const weekList = ["日", "月", "火", "水", "木", "金", "土"];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = weekList[date.getDay()];
  const time = formatTime(date);

  return `${month}/${day}(${week}) ${time}`;
}

function formatTime(date) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function getDiffDays(value) {
  if (!value) return null;

  const expire = new Date(value);
  if (isNaN(expire.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expire.setHours(0, 0, 0, 0);

  return Math.ceil((expire - today) / (1000 * 60 * 60 * 24));
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}

function formatPoint(value) {
  const num = Number(value || 0);
  return num.toLocaleString("ja-JP");
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
  if (
    location.pathname.endsWith("home.html") ||
    location.pathname === "/" ||
    location.pathname.endsWith("/")
  ) {
    refreshAllAppData();
    return;
  }

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

function logout() {
  localStorage.removeItem("meteor_token");
  localStorage.removeItem("meteor_member_id");
  localStorage.removeItem("meteor_member_cache");
  localStorage.removeItem("meteor_point_cache");
  window.location.href = "index.html";
}

const UPDATE_STATUS_KEY = "meteor_last_update";

async function checkForUpdates() {
  try {
    const response = await fetch(`${CONTENT_API_URL}?action=updateStatus`);
    const data = await response.json();

    if (!data.success) return;

    const latest = Number(data.lastUpdated || 0);
    const saved = Number(localStorage.getItem(UPDATE_STATUS_KEY) || 0);

    if (saved && latest > saved) {
      showUpdateBadge();
    }

    localStorage.setItem(UPDATE_STATUS_KEY, latest);

  } catch (e) {
    console.error(e);
  }
}

function showUpdateBadge() {
  const badge = document.getElementById("updateBadge");
  if (badge) {
    badge.style.display = "block";
  }
}

function refreshAllAppData() {
  localStorage.removeItem(CACHE_MEMBER);
  localStorage.removeItem(CACHE_NEWS);
  localStorage.removeItem(CACHE_EVENT);
  localStorage.removeItem("meteor_home_cache");
  localStorage.removeItem("meteor_event_page_cache");
  localStorage.removeItem("meteor_event_page_cache_v2");
  localStorage.removeItem("meteor_news_page_cache");

  window.location.reload();
}