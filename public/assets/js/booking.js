import {
  applyBranding,
  fetchJSON,
  getDeviceId,
  getSceneImage,
  initRevealAnimations,
  loadBranding,
  mountSiteShell,
  serializeForm,
  showToast,
} from "./site.js";

async function init() {
  mountSiteShell("booking");

  const branding = await loadBranding();
  applyBranding(branding);

  const heroImage = document.getElementById("bookingHeroImage");
  if (heroImage) heroImage.src = getSceneImage("interior");

  const loungeImage = document.getElementById("loungeImage");
  if (loungeImage) loungeImage.src = getSceneImage("terrace");

  const dinnerImage = document.getElementById("dinnerImage");
  if (dinnerImage) dinnerImage.src = getSceneImage("dining");

  const reservationForm = document.getElementById("reservationForm");
  if (reservationForm) {
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
  }

  initRevealAnimations();
}

init().catch((error) => {
  showToast(error.message);
});
