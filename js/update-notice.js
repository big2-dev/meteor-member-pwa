let newWorker = null;
let refreshing = false;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const registration = await navigator.serviceWorker.register("./sw.js");

    if (registration.waiting) {
      newWorker = registration.waiting;
      showUpdateNotice();
    }

    registration.addEventListener("updatefound", () => {
      newWorker = registration.installing;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          showUpdateNotice();
        }
      });
    });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

function showUpdateNotice() {
  if (document.getElementById("updateNotice")) return;

  const notice = document.createElement("div");
  notice.id = "updateNotice";
  notice.className = "update-notice";

  notice.innerHTML = `
    <div class="update-notice-card">
      <img src="images/icon-192.png" alt="METEO">

      <h2>新しいバージョンがあります</h2>
      <p>
        より快適にご利用いただくため、<br>
        アプリを更新してください。
      </p>

      <button onclick="updateMeteoApp()">更新する</button>
    </div>
  `;

  document.body.appendChild(notice);
}

function updateMeteoApp() {
  if (!newWorker) return;
  newWorker.postMessage({ type: "SKIP_WAITING" });
}