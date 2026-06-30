const API_URL = "https://script.google.com/macros/s/AKfycbxsHYfop671-Fb4GehXwx5XhfZguvlDZqvH2xCusPevwaggSRc3omhxittN7IQHPlC2/exec";

const memberId = localStorage.getItem("meteor_member_id");
const token = localStorage.getItem("meteor_token");

if (!memberId || !token) {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
  setGreeting();
  loadMemberInfo();
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
  fetch(API_URL, {
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
      document.getElementById("todayNews").textContent = result.message || "会員情報が見つかりません。";
      return;
    }

    document.getElementById("memberName").textContent = result.name || "会員";
    document.getElementById("memberType").textContent = result.memberType || "-";
    document.getElementById("expireDate").textContent = formatDate(result.expireDate);
    document.getElementById("pointBalance").textContent = formatPoint(result.points);
  })
  .catch(error => {
    console.error(error);
    document.getElementById("memberName").textContent = "通信エラー";
    document.getElementById("todayNews").textContent = "会員情報の取得に失敗しました。";
  });
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

function goHome() { window.location.href = "home.html"; }
function goQR() { window.location.href = "qr.html"; }
function goPoint() { window.location.href = "point.html"; }
function goEvent() { window.location.href = "event.html"; }
function goNews() { window.location.href = "news.html"; }
function goSettings() { window.location.href = "settings.html"; }

function logout() {
  localStorage.removeItem("meteor_token");
  localStorage.removeItem("meteor_member_id");
  window.location.href = "index.html";
}
