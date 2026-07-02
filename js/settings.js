function goContact() {
  window.location.href = "contact.html";
}

function openTerms() {
  alert(
    "利用規約\n\n" +
    "現在準備中です。"
  );
}

function openPrivacy() {
  alert(
    "プライバシーポリシー\n\n" +
    "現在準備中です。"
  );
}

function openAbout() {
  alert(
    "METEO公式会員PWA\n\n" +
    "Version 1.1\n\n" +
    "メテオゴルフ会員向け公式アプリです。"
  );
}

function logoutConfirm() {
  if (!confirm("ログアウトしますか？")) {
    return;
  }

  localStorage.removeItem("meteor_token");
  localStorage.removeItem("meteor_member_id");
  localStorage.removeItem("meteor_member_cache");
  localStorage.removeItem("meteor_point_cache");

  window.location.href = "index.html";
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

function goContact() {
  window.location.href = "contact.html";
}

function goAbout() {
  window.location.href = "about.html";
}

function goTerms() {
  window.location.href = "terms.html";
}

function goPrivacy() {
  window.location.href = "privacy.html";
}

function openWebsite() {
  window.location.href = "https://meteo-sportsplaza.com/golf";
}
