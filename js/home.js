const MEMBER_API_URL = "https://script.google.com/macros/s/AKfycbxsHYfop671-Fb4GehXwx5XhfZguvlDZqvH2xCusPevwaggSRc3omhxittN7IQHPlC2/exec";
const EVENT_API_URL = "https://script.google.com/macros/s/AKfycbyab1CGFlddCTXm02GnH-na5HCXbhJ1XjGNZ2i23cWvTOaxOWH2qxyeL94U2FrnatCsbg/exec";

const memberId = localStorage.getItem("meteor_member_id");
const token = localStorage.getItem("meteor_token");

if (!memberId || !token) {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
  setGreeting();
  loadMemberInfo();
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
        document.getElementById("todayNews").textContent =
          result.message || "会員情報が見つかりません。";
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
      document.getElementById("todayNews").textContent =
        "会員情報の取得に失敗しました。";
    });
}

function loadHomeEvent() {
  const card = document.getElementById("homeEventCard");
  if (!card) return;

  fetch(`${EVENT_API_URL}?action=events`)
    .then(response => response.json())
    .then(data => {
      if (!data.success || !data.events || data.events.length === 0) {
        card.style.display = "none";
        return;
      }

      const event = data.events[0];

      document.getElementById("homeEventTitle").textContent = event.title || "イベント";
      document.getElementById("homeEventDate").textContent = event.start || "日時はイベント詳細をご確認ください";
      document.getElementById("homeEventPlace").textContent = event.place || "メテオゴルフ";
      document.getElementById("homeEventDetail").textContent = event.description || "タップして詳細を見る";

      const image = document.getElementById("homeEventImage");

      if (event.image) {
        image.src = event.image;
      } else {
        image.removeAttribute("src");
        image.alt = "METEO イベント";
      }

      card.style.display = "block";
    })
    .catch(error => {
      console.error(error);
      card.style.display = "none";
    });
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

    const news = document.getElementById("todayNews");
    if (news) {
      news.textContent = "会員期限が切れています。受付で更新手続きをお願いします。";
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