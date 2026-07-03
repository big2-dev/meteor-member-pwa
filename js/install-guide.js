let deferredPrompt = null;

const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = /android/i.test(navigator.userAgent);

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallGuide("android");
});

window.addEventListener("appinstalled", () => {
  localStorage.setItem("meteoAppInstalled", "true");
  closeInstallGuide();
});

window.addEventListener("load", () => {
  if (isStandalone) return;
  if (localStorage.getItem("meteoInstallGuideClosed") === "true") return;
  if (localStorage.getItem("meteoAppInstalled") === "true") return;

  setTimeout(() => {
    if (isIOS) showInstallGuide("ios");
  }, 1200);
});

function showInstallGuide(type) {
  if (document.getElementById("installGuide")) return;

  const isAndroidGuide = type === "android";

  const guide = document.createElement("div");
  guide.id = "installGuide";
  guide.className = "install-guide";

  guide.innerHTML = `
    <div class="install-guide-card">
      <button class="install-guide-close" onclick="closeInstallGuide()">×</button>

      <img src="images/icon-192.png" alt="METEO" class="install-guide-icon">

      <h2>METEOをアプリとして使えます</h2>

      <p class="install-guide-text">
        ホーム画面に追加すると、次回からすぐに会員証を開けます。
      </p>

      ${
        isAndroidGuide
          ? `<button class="install-guide-main" onclick="installMeteoApp()">インストールする</button>`
          : `
            <div class="ios-steps">
              <p>iPhoneの場合</p>
              <ol>
                <li>画面下の共有ボタンをタップ</li>
                <li>「ホーム画面に追加」を選択</li>
                <li>「追加」をタップ</li>
              </ol>
            </div>
          `
      }

      <button class="install-guide-sub" onclick="closeInstallGuide()">
        今は表示しない
      </button>
    </div>
  `;

  document.body.appendChild(guide);
}

async function installMeteoApp() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;

  deferredPrompt = null;
  localStorage.setItem("meteoAppInstalled", "true");
  closeInstallGuide();
}

function closeInstallGuide() {
  localStorage.setItem("meteoInstallGuideClosed", "true");

  const guide = document.getElementById("installGuide");
  if (guide) guide.remove();
}