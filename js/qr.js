document.addEventListener("DOMContentLoaded", () => {
  const memberId = localStorage.getItem("meteor_member_id");
  const token = localStorage.getItem("meteor_token");

  if (!memberId || !token) {
    alert("ログイン情報が見つかりません。再度ログインしてください。");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("memberNo").textContent = memberId;
  document.getElementById("memberName").textContent = "会員様";
  document.getElementById("memberType").textContent = "会員";
  document.getElementById("expiryDate").textContent = "確認中";

  const qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&data=" +
    encodeURIComponent(memberId);

  document.getElementById("qrImage").src = qrUrl;
});