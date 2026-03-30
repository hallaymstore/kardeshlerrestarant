import {
  applyBranding,
  escapeHtml,
  getSceneImage,
  highlightHeroText,
  initCountUp,
  initRevealAnimations,
  loadMenu,
  loadServices,
  loadSiteConfig,
  mountSiteShell,
  renderMenuCard,
  renderServiceCard,
  showToast,
} from "./site.js";

function setHighlightedTitle(element, text, target) {
  if (!element) return;
  if (!target) {
    element.textContent = text;
    return;
  }

  const safeText = escapeHtml(text);
  const regex = new RegExp(`(${target})`, "i");
  element.innerHTML = safeText.replace(regex, "<span>$1</span>");
}

function resolveScene(source) {
  if (!source) return getSceneImage("hero");
  return /^https?:\/\//i.test(source) || source.startsWith("/") ? source : getSceneImage(source);
}

function renderMetrics(items = []) {
  const grid = document.getElementById("metricsGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map(
      (item) => `
        <div class="metric-card reveal">
          <div class="small-copy">${escapeHtml(item.label || "")}</div>
          <strong class="metric-number" data-countup="${Number(item.value || 0)}" data-prefix="${escapeHtml(
            item.prefix || ""
          )}" data-suffix="${escapeHtml(item.suffix || "")}">0</strong>
          <p class="card-copy">${escapeHtml(item.description || "")}</p>
        </div>
      `
    )
    .join("");
}

function renderFeatures(items = []) {
  const grid = document.getElementById("featuresGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map(
      (item) => `
        <div class="feature-card reveal">
          <div class="badge-soft">${escapeHtml(item.label || "Feature")}</div>
          <h3>${escapeHtml(item.title || "")}</h3>
          <p class="card-copy">${escapeHtml(item.description || "")}</p>
        </div>
      `
    )
    .join("");
}

function renderProcess(items = []) {
  const grid = document.getElementById("processGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map(
      (item) => `
        <article class="process-card reveal">
          <div class="process-media">
            <img src="${resolveScene(item.image)}" alt="${escapeHtml(item.title || "Process scene")}" />
            <span class="process-step">${escapeHtml(item.step || "Step")}</span>
          </div>
          <div class="process-body">
            <h3>${escapeHtml(item.title || "")}</h3>
            <p class="card-copy">${escapeHtml(item.description || "")}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTestimonials(items = []) {
  const grid = document.getElementById("testimonialGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map(
      (item) => `
        <article class="quote-card reveal">
          <blockquote>"${escapeHtml(item.quote || "")}"</blockquote>
          <div class="quote-author">
            <span>${escapeHtml(item.author || "")}</span>
            <span>${escapeHtml(item.meta || "")}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPreview(items) {
  const previewGrid = document.getElementById("previewGrid");
  const countBadge = document.getElementById("catalogCount");
  if (!previewGrid) return;

  const picked = items.slice(0, 3);
  if (countBadge) {
    countBadge.textContent = `${picked.length} ta tanlangan pozitsiya`;
  }

  previewGrid.innerHTML = picked.length
    ? picked
        .map((item) =>
          renderMenuCard(item, {
            action: "link",
            actionLabel: "To'liq menu",
            href: "/menu",
          })
        )
        .join("")
    : `
        <div class="content-card reveal">
          <h3>Menu ulanishi kutilyapti</h3>
          <p class="card-copy">Server qaytishi bilan signature pozitsiyalar shu yerda ko'rinadi.</p>
        </div>
      `;
}

function renderServices(items) {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;

  grid.innerHTML = items.length
    ? items.slice(0, 3).map((item) => renderServiceCard(item)).join("")
    : `
        <div class="content-card reveal">
          <h3>Xizmatlar hali qo'shilmagan</h3>
          <p class="card-copy">Admin paneldan delivery, catering yoki boshqa xizmatlarni qo'shishingiz mumkin.</p>
        </div>
      `;
}

async function init() {
  mountSiteShell("home");

  const [{ branding, websiteContent }, menu, services] = await Promise.all([
    loadSiteConfig(),
    loadMenu(),
    loadServices(),
  ]);

  const appliedBranding = applyBranding(branding);
  const home = websiteContent.home;

  document.getElementById("homeHeroEyebrow").textContent = home.heroEyebrow;
  document.getElementById("heroTitle").innerHTML = highlightHeroText(appliedBranding.heroTitle);
  document.getElementById("heroSubtitle").textContent = appliedBranding.heroSubtitle;
  document.getElementById("homeStoryEyebrow").textContent = home.storyEyebrow;
  setHighlightedTitle(document.getElementById("homeStoryTitle"), home.storyTitle, "brend atmosferasi");
  document.getElementById("homeStoryText").textContent = home.storyText;
  document.getElementById("homeServicesEyebrow").textContent = home.servicesEyebrow;
  setHighlightedTitle(document.getElementById("homeServicesTitle"), home.servicesTitle, "xizmatlar");
  document.getElementById("homeServicesText").textContent = home.servicesText;
  document.getElementById("homeProcessEyebrow").textContent = home.processEyebrow;
  setHighlightedTitle(document.getElementById("homeProcessTitle"), home.processTitle, "jarayon lavhalari");
  document.getElementById("homeProcessText").textContent = home.processText;
  document.getElementById("homeMenuEyebrow").textContent = home.menuEyebrow;
  setHighlightedTitle(document.getElementById("homeMenuTitle"), home.menuTitle, "menu preview");
  document.getElementById("homeTestimonialsEyebrow").textContent = home.testimonialsEyebrow;
  setHighlightedTitle(document.getElementById("homeTestimonialsTitle"), home.testimonialsTitle, "tajriba");
  document.getElementById("homeCtaEyebrow").textContent = home.ctaEyebrow;
  setHighlightedTitle(document.getElementById("homeCtaTitle"), home.ctaTitle, "hozir o'tish");
  document.getElementById("homeCtaText").textContent = home.ctaText;

  document.getElementById("heroImage").src = getSceneImage("hero");
  document.getElementById("heroSecondary").src = getSceneImage("interior");
  document.getElementById("storyImage").src = getSceneImage("terrace");

  renderMetrics(home.metrics || []);
  renderFeatures(home.features || []);
  renderServices((services || []).filter((item) => item.active !== false));
  renderProcess(home.process || []);
  renderPreview(menu.filter((item) => item.featured).length ? menu.filter((item) => item.featured) : menu);
  renderTestimonials(home.testimonials || []);

  initRevealAnimations();
  initCountUp();
}

init().catch((error) => {
  showToast(error.message);
});
