import {
  applyBranding,
  getSceneImage,
  highlightHeroText,
  initCountUp,
  initRevealAnimations,
  loadBranding,
  loadMenu,
  mountSiteShell,
  renderMenuCard,
  showToast,
} from "./site.js";

function renderPreview(items) {
  const previewGrid = document.getElementById("previewGrid");
  const countBadge = document.getElementById("catalogCount");
  if (!previewGrid) return;

  if (countBadge) {
    countBadge.textContent = `${Math.min(items.length, 3)} ta tanlangan pozitsiya`;
  }

  if (!items.length) {
    previewGrid.innerHTML = `
      <div class="content-card reveal">
        <h3>Menu ulanishi kutilyapti</h3>
        <p class="card-copy">Server qaytishi bilan signature pozitsiyalar shu yerda ko'rinadi. Hozircha asosiy menu sahifasi tayyor holatda qoladi.</p>
      </div>
    `;
    return;
  }

  previewGrid.innerHTML = items
    .slice(0, 3)
    .map((item) =>
      renderMenuCard(item, {
        action: "link",
        actionLabel: "To'liq menu",
        href: "/menu",
      })
    )
    .join("");
}

async function init() {
  mountSiteShell("home");

  const [branding, menu] = await Promise.all([loadBranding(), loadMenu()]);
  const appliedBranding = applyBranding(branding);

  const heroTitle = document.getElementById("heroTitle");
  if (heroTitle) heroTitle.innerHTML = highlightHeroText(appliedBranding.heroTitle);

  const heroSubtitle = document.getElementById("heroSubtitle");
  if (heroSubtitle) heroSubtitle.textContent = appliedBranding.heroSubtitle;

  const heroImage = document.getElementById("heroImage");
  if (heroImage) heroImage.src = getSceneImage("hero");

  const heroSecondary = document.getElementById("heroSecondary");
  if (heroSecondary) heroSecondary.src = getSceneImage("interior");

  const storyImage = document.getElementById("storyImage");
  if (storyImage) storyImage.src = getSceneImage("terrace");

  const processImages = {
    processPrep: getSceneImage("grill"),
    processPack: getSceneImage("menu"),
    processServe: getSceneImage("dining"),
  };

  Object.entries(processImages).forEach(([id, src]) => {
    const image = document.getElementById(id);
    if (image) image.src = src;
  });

  renderPreview(menu.filter((item) => item.featured).length ? menu.filter((item) => item.featured) : menu);

  initRevealAnimations();
  initCountUp();
}

init().catch((error) => {
  showToast(error.message);
});
