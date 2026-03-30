import {
  applyBranding,
  escapeHtml,
  fetchJSON,
  getDeviceId,
  getSceneImage,
  initRevealAnimations,
  loadSiteConfig,
  mountSiteShell,
  serializeForm,
  showToast,
} from "./site.js";

function setTitle(node, text, highlight) {
  if (!node) return;
  const safe = escapeHtml(text || "");
  if (!highlight) {
    node.textContent = text || "";
    return;
  }
  node.innerHTML = safe.replace(new RegExp(`(${highlight})`, "i"), "<span>$1</span>");
}

function renderStats(items = []) {
  const grid = document.getElementById("bookingStatsGrid");
  if (!grid) return;
  grid.innerHTML = items
    .map(
      (item) => `
        <div class="stat-card">
          <div class="small-copy">${escapeHtml(item.label || "")}</div>
          <strong>${escapeHtml(item.value || "")}</strong>
        </div>
      `
    )
    .join("");
}

function renderUseCases(items = []) {
  const wrap = document.getElementById("bookingUseCases");
  if (!wrap) return;
  wrap.innerHTML = items
    .map(
      (item) => `
        <div class="service-item">
          <strong>${escapeHtml(item.title || "")}</strong>
          <p class="card-copy">${escapeHtml(item.description || "")}</p>
        </div>
      `
    )
    .join("");
}

async function init() {
  mountSiteShell("booking");

  const { branding, websiteContent } = await loadSiteConfig();
  applyBranding(branding);

  const booking = websiteContent.booking;
  document.getElementById("bookingHeroEyebrow").textContent = booking.heroEyebrow;
  setTitle(document.getElementById("bookingHeroTitle"), booking.heroTitle, "alohida bron sahifasi");
  document.getElementById("bookingHeroSubtitle").textContent = booking.heroSubtitle;
  document.getElementById("bookingUseCasesTitle").textContent = booking.useCasesTitle;
  document.getElementById("bookingFormTitle").textContent = booking.formTitle;
  document.getElementById("bookingFormText").textContent = booking.formText;

  renderStats(booking.stats || []);
  renderUseCases(booking.useCases || []);

  document.getElementById("bookingHeroImage").src = getSceneImage("interior");
  document.getElementById("loungeImage").src = getSceneImage("terrace");
  document.getElementById("dinnerImage").src = getSceneImage("dining");

  const reservationForm = document.getElementById("reservationForm");
  reservationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = serializeForm(reservationForm);
    payload.deviceId = getDeviceId();

    try {
      await fetchJSON("/api/reservations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      reservationForm.reset();
      showToast("Bron qabul qilindi.");
    } catch (error) {
      showToast(error.message);
    }
  });

  initRevealAnimations();
}

init().catch((error) => {
  showToast(error.message);
});
