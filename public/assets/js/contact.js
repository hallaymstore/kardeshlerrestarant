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

function renderContactCards(items = []) {
  const grid = document.getElementById("contactCardsGrid");
  if (!grid) return;
  grid.innerHTML = items
    .map(
      (item) => `
        <div class="contact-card">
          <div class="small-copy">${escapeHtml(item.label || "")}</div>
          <strong>${escapeHtml(item.value || "")}</strong>
        </div>
      `
    )
    .join("");
}

function renderBranches(items = []) {
  const grid = document.getElementById("contactBranchesGrid");
  if (!grid) return;
  grid.innerHTML = items
    .map(
      (item) => `
        <article class="branch-card reveal">
          <div class="badge-soft">${escapeHtml(item.label || "")}</div>
          <h3 style="margin:16px 0 8px;">${escapeHtml(item.title || "")}</h3>
          <p class="card-copy">${escapeHtml(item.description || "")}</p>
        </article>
      `
    )
    .join("");
}

async function init() {
  mountSiteShell("contact");

  const { branding, websiteContent } = await loadSiteConfig();
  applyBranding(branding);

  const contact = websiteContent.contact;
  document.getElementById("contactHeroEyebrow").textContent = contact.heroEyebrow;
  setTitle(document.getElementById("contactHeroTitle"), contact.heroTitle, "alohida oqim");
  document.getElementById("contactHeroSubtitle").textContent = contact.heroSubtitle;
  document.getElementById("contactFormTitle").textContent = contact.formTitle;
  document.getElementById("contactFormText").textContent = contact.formText;

  renderContactCards(contact.contactCards || []);
  renderBranches(contact.branches || []);

  document.getElementById("contactHeroImage").src = getSceneImage("terrace");
  document.getElementById("branchImage").src = getSceneImage("interior");

  const form = document.getElementById("applicationForm");
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

  initRevealAnimations();
}

init().catch((error) => {
  showToast(error.message);
});
