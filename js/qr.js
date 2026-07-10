const API_URL = "https://script.google.com/macros/s/AKfycbxsHYfop671-Fb4GehXwx5XhfZguvlDZqvH2xCusPevwaggSRc3omhxittN7IQHPlC2/exec";

const memberId = localStorage.getItem("meteor_member_id");
const token = localStorage.getItem("meteor_token");

document.addEventListener("DOMContentLoaded", () => {
  if (!memberId || !token) {
    alert("ログイン情報が見つかりません。再度ログインしてください。");
    window.location.href = "index.html";
    return;
  }

  loadCachedMemberInfo();
  createQRCode(memberId);
  loadMemberInfo();
});

function clearMemberInfo() {
  document.getElementById("memberNo").textContent = memberId || "確認中";
  document.getElementById("memberName").textContent = "確認中";
  document.getElementById("memberType").textContent = "確認中";

  const expiryElement = document.getElementById("expiryDate");
  if (expiryElement) {
    expiryElement.textContent = "確認中";
    expiryElement.classList.remove(
      "expiry-safe",
      "expiry-warning",
      "expiry-danger",
      "expiry-expired"
    );
  }
}

function createQRCode(value) {
  const qrArea = document.getElementById("qrImage");

  if (!qrArea) {
    console.error("QRコード表示領域が見つかりません。");
    return;
  }

  const qrValue = String(value || "").trim();

  qrArea.innerHTML = "";

  if (!qrValue) {
    qrArea.textContent = "QRコードを表示できません";
    return;
  }

  const qrImage = document.createElement("img");

  qrImage.src =
    `https://quickchart.io/qr?text=${encodeURIComponent(qrValue)}`;

  qrImage.alt = "会員証QRコード";
  qrImage.width = 250;
  qrImage.height = 250;
  qrImage.style.display = "block";
  qrImage.style.margin = "0 auto";

  qrImage.onerror = () => {
    qrArea.textContent = "QRコードを読み込めませんでした";
  };

  qrArea.appendChild(qrImage);
}

function loadMemberInfo() {
  const url = `${API_URL}?t=${Date.now()}`;

  fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      action: "getMemberInfo",
      memberId: memberId,
      token: token
    })
  })
    .then(response => response.json())
    .then(result => {
      if (!result.success) {
        clearMemberInfo();
        return;
      }

      const member = result.member || {};

      const cacheData = {
        memberNo: result.memberNo || member.memberNo || member.会員番号 || memberId,
        memberName: result.name || result.memberName || member.name || member.氏名 || "会員様",
        memberType: result.memberType || member.memberType || member.会員種別 || "会員",
        expireDate: result.expireDate || member.expireDate || member.有効期限 || ""
      };

      document.getElementById("memberNo").textContent = cacheData.memberNo;
      document.getElementById("memberName").textContent = cacheData.memberName;
      document.getElementById("memberType").textContent = cacheData.memberType;

      setExpireDisplay(cacheData.expireDate);

      localStorage.setItem(
        `meteor_member_cache_${memberId}`,
        JSON.stringify(cacheData)
      );
    })
    .catch(() => {
      clearMemberInfo();
    });
}

function loadCachedMemberInfo() {
  const cache = localStorage.getItem(`meteor_member_cache_${memberId}`);

  if (!cache) {
    clearMemberInfo();
    return;
  }

  try {
    const member = JSON.parse(cache);

    document.getElementById("memberNo").textContent = member.memberNo || memberId;
    document.getElementById("memberName").textContent = member.memberName || "会員様";
    document.getElementById("memberType").textContent = member.memberType || "会員";

    setExpireDisplay(member.expireDate);
  } catch (e) {
    clearMemberInfo();
  }
}



function setExpireDisplay(value) {
  const expiryElement = document.getElementById("expiryDate");

  if (!expiryElement) return;

  const formatted = formatDate(value);
  const diffDays = getDiffDays(value);

  expiryElement.classList.remove(
    "expiry-safe",
    "expiry-warning",
    "expiry-danger",
    "expiry-expired"
  );

  if (diffDays === null) {
    expiryElement.textContent = formatted;
    expiryElement.classList.add("expiry-safe");
    return;
  }

  if (diffDays < 0) {
    expiryElement.textContent = `期限切れ ${formatted}`;
    expiryElement.classList.add("expiry-expired", "expiry-danger");
    return;
  }

  expiryElement.textContent = formatted;

  if (diffDays <= 7) {
    expiryElement.classList.add("expiry-danger");
  } else if (diffDays <= 30) {
    expiryElement.classList.add("expiry-warning");
  } else {
    expiryElement.classList.add("expiry-safe");
  }
}

function getDiffDays(value) {
  if (!value) return null;

  const date = new Date(value);
  if (isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

function formatDate(value) {
  if (!value) return "確認中";

  const text = String(value).trim();

  if (text.includes("/")) return text;

  const date = new Date(text);
  if (isNaN(date.getTime())) return text;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}