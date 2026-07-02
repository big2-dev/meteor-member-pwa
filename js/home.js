const MEMBER_API_URL = "https://script.google.com/macros/s/AKfycbxsHYfop671-Fb4GehXwx5XhfZguvlDZqvH2xCusPevwaggSRc3omhxittN7IQHPlC2/exec";
const CONTENT_API_URL = "https://script.google.com/macros/s/AKfycbyab1CGFlddCTXm02GnH-na5HCXbhJ1XjGNZ2i23cWvTOaxOWH2qxyeL94U2FrnatCsbg/exec";

const memberId = localStorage.getItem("meteor_member_id");
const token = localStorage.getItem("meteor_token");

if (!memberId || !token) {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
  setGreeting();
  loadMemberInfo();
  loadHomeNews();
  loadHomeEvent();
});

function setGreeting() {
  const hour = new Date().getHours();
  const greeting = document.getElementById("greeting");

  if (hour < 11) {
    greeting.textContent = "☀️ おはようございます！";
  } else if (hour < 18) {
    greeting.textContent = "こんにちは！";
  } else {
    greeting.textContent = "🌙 こんばんは！";
  }
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

      document.getElementById("memberName").textContent = result.name || "会員";
      document.getElementById("memberType").textContent = result.memberType || "-";
      document.getElementById("pointBalance").textContent = formatPoint(result.points);

      setExpireDisplay(result.expireDate);
    })
    .catch(error => {
      console.error(error);
      document.getElementById("memberName").textContent = "通信エラー";
    });
}

function loadHomeNews() {

  const card = document.getElementById("homeNewsCard");
  const list = document.getElementById("homeNewsList");

  if (!card || !list) return;

  fetch(`${CONTENT_API_URL}?action=news`)
    .then(response => response.json())
    .then(data => {

      if (!data.success || !data.news || data.news.length === 0) {
        card.style.display = "none";
        return;
      }

      const newsList = data.news.slice(0, 2);

      list.innerHTML = "";

      newsList.forEach(news => {

        const row = document.createElement("div");
        row.className = "home-news-row";

        row.innerHTML = `
          <span class="home-news-title">${escapeHtml(news.title)}</span>
          <span class="material-symbols-rounded">chevron_right</span>
        `;

        list.appendChild(row);

      });

      card.style.display = "grid";

    })
    .catch(error => {

      console.error(error);
      card.style.display = "none";

    });

}

function loadHomeEvent() {
  const card = document.getElementById("homeEventCard");
  const imageWrap = document.getElementById("homeEventImageWrap");

  if (!card || !imageWrap) return;

  fetch(`${CONTENT_API_URL}?action=events`)
    .then(response => response.json())
    .then(data => {
      if (!data.success || !data.events || data.events.length === 0) {
        card.style.display = "none";
        return;
      }

      const event = data.events[0];

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
          <div class="home-event-placeholder">METEO EVENT</div>
        `;
      }

      card.style.display = "block";
    })
    .catch(error => {
      console.error(error);
      card.style.display = "none";
    });
}

function formatEventDateRange(startValue, endValue) {
  if (!startValue) return "日時未定";

  const start = new Date(startValue);
  const end = new Date(endValue);

  if (isNaN(start.getTime())) return startValue;

  const weekList = ["日", "月", "火", "水", "木", "金", "土"];

  const month = start.getMonth() + 1;
  const day = start.getDate();
  const week = weekList[start.getDay()];
  const startTime = formatTime(start);

  if (!endValue || isNaN(end.getTime())) {
    return `${month}/${day}(${week}) ${startTime}〜`;
  }

  const endTime = formatTime(end);
  return `${month}/${day}(${week}) ${startTime}〜${endTime}`;
}

function formatTime(date) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function setExpireDisplay(value) {
  const box = document.getElementById("expireInline");
  const dateText = document.getElementById("expireDate");

  if (!box || !dateText) return;

  const formatted = formatDate(value);
  const diffDays = getDiffDays(value);

  box.classList.remove("warning", "danger", "expired");

  if (diffDays === null) {
    dateText.textContent = formatted;
    return;
  }

  if (diffDays < 0) {
    dateText.textContent = `期限切れ ${formatted}`;
    box.classList.add("expired", "danger");

    const newsCard = document.getElementById("homeNewsCard");
    const newsTitle = document.getElementById("homeNewsTitle");
    const newsBody = document.getElementById("todayNews");

    if (newsCard && newsTitle && newsBody) {
      newsTitle.textContent = "会員期限が切れています";
      newsBody.textContent = "受付で更新手続きをお願いします。";
      newsCard.style.display = "grid";
    }

    return;
  }

  dateText.textContent = formatted;

  if (diffDays <= 7) {
    box.classList.add("danger");
  } else if (diffDays <= 30) {
    box.classList.add("warning");
  }
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

function logout() {
  localStorage.removeItem("meteor_token");
  localStorage.removeItem("meteor_member_id");
  localStorage.removeItem("meteor_member_cache");
  localStorage.removeItem("meteor_point_cache");
  window.location.href = "index.html";
}