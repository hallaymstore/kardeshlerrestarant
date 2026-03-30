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
  mountSiteShell("contact");

  const branding = await loadBranding();
  applyBranding(branding);

  const heroImage = document.getElementById("contactHeroImage");
  if (heroImage) heroImage.src = getSceneImage("terrace");

  const branchImage = document.getElementById("branchImage");
  if (branchImage) branchImage.src = getSceneImage("interior");

  const form = document.getElementById("applicationForm");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = serializeForm(form);
      payload.deviceId = getDeviceId();

      try {
        await fetchJSON("/api/applications", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        form.reset();
        showToast("So'rov yuborildi.");
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
