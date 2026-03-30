const cartStorageKey = "scarlet_cart";
const deviceStorageKey = "scarlet_device_id";

const navItems = [
  { key: "home", label: "Asosiy", href: "/" },
  { key: "menu", label: "Menu", href: "/menu" },
  { key: "booking", label: "Bron", href: "/booking" },
  { key: "contact", label: "Aloqa", href: "/contact" },
  { key: "admin", label: "Admin", href: "/admin" },
];

const defaultBranding = {
  brandName: "Scarlet Bite",
  heroTitle: "Fast foodni premium offline tajribaga aylantiradigan nuqta",
  heroSubtitle:
    "Issiq burgerlar, tez servis, zal band qilish va biznes so'rovlar bir tizimda ishlaydigan shahar fastfood loyihasi.",
  phone: "+998 90 123 45 67",
  address: "Toshkent shahri, Premium Food Hall 7",
  telegram: "https://t.me/yourbrand",
};

const sceneImages = {
  hero: "/assets/images/hero-burger.jpg",
  menu: "/assets/images/menu-burger.jpg",
  grill: "/assets/images/grill-scene.jpg",
  dining: "/assets/images/dining-scene.jpg",
  interior: "/assets/images/restaurant-interior.jpg",
  terrace: "/assets/images/kitchen-team.jpg",
};

const categoryArtwork = {
  burger: "/assets/images/menu-burger.jpg",
  chicken: "/assets/images/grill-scene.jpg",
  combo: "/assets/images/hero-burger.jpg",
};

const moneyFormatter = new Intl.NumberFormat("uz-UZ");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function createPoster(category, accentLabel) {
  const safeCategory = escapeHtml(category || "Signature");
  const safeAccent = escapeHtml(accentLabel || "Fresh batch");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2d1b16" />
          <stop offset="55%" stop-color="#d84a24" />
          <stop offset="100%" stop-color="#f1b763" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" rx="48" fill="url(#bg)" />
      <circle cx="120" cy="120" r="78" fill="rgba(255,255,255,0.09)" />
      <circle cx="690" cy="118" r="42" fill="rgba(255,255,255,0.16)" />
      <circle cx="690" cy="470" r="112" fill="rgba(17,12,10,0.2)" />
      <path d="M90 420 C240 290, 460 290, 650 430" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="26" stroke-linecap="round" />
      <text x="72" y="410" fill="#fffaf5" font-family="Arial, sans-serif" font-size="72" font-weight="700">${safeCategory}</text>
      <text x="74" y="475" fill="rgba(255,250,245,0.82)" font-family="Arial, sans-serif" font-size="30">${safeAccent}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeBranding(branding = {}) {
  return {
    ...defaultBranding,
    ...branding,
  };
}

function isImageUrl(value) {
  if (!value || typeof value !== "string") return false;
  return (
    /^https?:\/\//i.test(value) ||
    value.startsWith("/") ||
    /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value)
  );
}

export function formatMoney(value) {
  return `${moneyFormatter.format(Number(value || 0))} so'm`;
}

export function getSceneImage(name) {
  return sceneImages[name] || sceneImages.hero;
}

export function resolveMenuMedia(item = {}) {
  const category = String(item.category || "Signature").toLowerCase();
  if (isImageUrl(item.image)) {
    return { src: item.image, label: "" };
  }

  const label = item.image && !isImageUrl(item.image) && item.image.length <= 6 ? item.image : "";
  const src =
    categoryArtwork[category] ||
    createPoster(item.category || "Signature", item.badge || "Fresh batch");

  return { src, label };
}

export function getDeviceId() {
  let deviceId = localStorage.getItem(deviceStorageKey);
  if (!deviceId) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      deviceId = `device-${crypto.randomUUID()}`;
    } else {
      deviceId = `device-${Math.random().toString(16).slice(2)}-${Date.now()}`;
    }
    localStorage.setItem(deviceStorageKey, deviceId);
  }
  return deviceId;
}

export function readCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function cartTotals(cart = readCart()) {
  return cart.reduce(
    (summary, item) => {
      const qty = Math.max(1, Number(item.qty || 1));
      const price = Number(item.price || 0);
      summary.count += qty;
      summary.total += qty * price;
      return summary;
    },
    { count: 0, total: 0 }
  );
}

function updateCartIndicators(cart = readCart()) {
  const totals = cartTotals(cart);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(totals.count);
  });
}

export function writeCart(cart) {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  updateCartIndicators(cart);
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: { cart } }));
}

export function addItemToCart(item) {
  const cart = readCart();
  const itemId = item._id || item.itemId || item.name;
  const existing = cart.find((entry) => entry.itemId === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      itemId,
      name: item.name,
      price: Number(item.price || 0),
      qty: 1,
    });
  }
  writeCart(cart);
  return cart;
}

export function changeCartItem(itemId, delta) {
  const cart = readCart();
  const entry = cart.find((item) => item.itemId === itemId);
  if (!entry) return cart;
  entry.qty += delta;
  const nextCart = cart.filter((item) => item.qty > 0);
  writeCart(nextCart);
  return nextCart;
}

export function clearCart() {
  writeCart([]);
}

export async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Server bilan ulanishda xatolik yuz berdi.");
  }

  return data;
}

export async function loadBranding() {
  try {
    const data = await fetchJSON("/api/config");
    return normalizeBranding(data.branding);
  } catch {
    return normalizeBranding();
  }
}

export async function loadMenu(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, value);
    }
  });
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const data = await fetchJSON(`/api/menu${suffix}`);
  return Array.isArray(data.items) ? data.items : [];
}

export function applyBranding(branding) {
  const merged = normalizeBranding(branding);

  document.querySelectorAll('[data-brand="name"]').forEach((node) => {
    node.textContent = merged.brandName;
  });

  document.querySelectorAll('[data-brand="phone"]').forEach((node) => {
    node.textContent = merged.phone;
  });

  document.querySelectorAll('[data-brand="address"]').forEach((node) => {
    node.textContent = merged.address;
  });

  document.querySelectorAll('[data-brand-link="phone"]').forEach((node) => {
    node.setAttribute("href", `tel:${merged.phone.replace(/\s+/g, "")}`);
  });

  document.querySelectorAll('[data-brand-link="telegram"]').forEach((node) => {
    node.setAttribute("href", merged.telegram || defaultBranding.telegram);
  });

  return merged;
}

function ensureToast() {
  if (document.getElementById("siteToast")) return;
  const toast = document.createElement("div");
  toast.id = "siteToast";
  toast.className = "site-toast";
  document.body.appendChild(toast);
}

export function showToast(message) {
  ensureToast();
  const toast = document.getElementById("siteToast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function footerLinksMarkup() {
  return navItems
    .filter((item) => item.key !== "admin")
    .map(
      (item) => `
        <a href="${item.href}">${item.label}</a>
      `
    )
    .join("");
}

export function mountSiteShell(currentPage) {
  const header = document.getElementById("siteHeader");
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <div class="topbar">
        <a class="brand" href="/">
          <div class="brand-mark">SB</div>
          <div class="brand-copy">
            <strong data-brand="name">Scarlet Bite</strong>
            <span>Premium fastfood and dine-in flow</span>
          </div>
        </a>
        <nav class="site-nav" aria-label="Main navigation">
          ${navItems
            .map(
              (item) => `
                <a href="${item.href}" class="${currentPage === item.key ? "active" : ""} ${item.key === "menu" ? "cart-link" : ""}">
                  ${item.label}
                  ${item.key === "menu" ? '<span class="cart-count" data-cart-count>0</span>' : ""}
                </a>
              `
            )
            .join("")}
        </nav>
        <div class="header-actions">
          <a class="button-secondary" data-brand-link="phone" href="tel:+998901234567">Call</a>
          <a class="button" data-brand-link="telegram" href="https://t.me/yourbrand" target="_blank" rel="noreferrer">Telegram</a>
        </div>
      </div>
    `;
  }

  const footer = document.getElementById("siteFooter");
  if (footer) {
    footer.className = "site-footer reveal";
    footer.innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <strong data-brand="name">Scarlet Bite</strong>
          <p>Offline fastfood biznesi uchun issiq buyurtma oqimi, bron va hamkorlikni bitta saytda jamlaydigan premium ko'rinish.</p>
          <div class="inline-stack">
            <a class="button-secondary" href="/menu">Menu va order</a>
            <a class="button-link" href="/booking">Bron qilish</a>
          </div>
        </div>
        <div>
          <div class="badge-soft">Navigation</div>
          <div class="footer-links" style="margin-top:16px;">
            ${footerLinksMarkup()}
          </div>
        </div>
        <div>
          <div class="badge-soft">Kontakt</div>
          <div class="footer-links" style="margin-top:16px;">
            <a data-brand-link="phone" href="tel:+998901234567"><span data-brand="phone">+998 90 123 45 67</span></a>
            <a href="/contact"><span data-brand="address">Toshkent shahri, Premium Food Hall 7</span></a>
            <a data-brand-link="telegram" href="https://t.me/yourbrand" target="_blank" rel="noreferrer">Telegram kanal</a>
            <a href="/admin">Admin panel</a>
          </div>
        </div>
      </div>
    `;
  }

  ensureToast();
  updateCartIndicators();

  window.addEventListener("storage", () => updateCartIndicators());
  window.addEventListener("cart:updated", (event) => updateCartIndicators(event.detail.cart));
}

export function initRevealAnimations() {
  const nodes = [...document.querySelectorAll(".reveal")];
  nodes.forEach((node, index) => {
    node.style.setProperty("--reveal-delay", `${Math.min(index * 35, 180)}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -48px 0px",
    }
  );

  nodes.forEach((node) => observer.observe(node));
}

export function initCountUp() {
  const numbers = [...document.querySelectorAll("[data-countup]")];
  if (!numbers.length) return;

  const animate = (node) => {
    const target = Number(node.getAttribute("data-countup") || 0);
    const suffix = node.getAttribute("data-suffix") || "";
    const prefix = node.getAttribute("data-prefix") || "";
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      node.textContent = `${prefix}${moneyFormatter.format(value)}${suffix}`;
      if (progress < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    numbers.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  numbers.forEach((node) => observer.observe(node));
}

export function serializeForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function toggleDeliveryAddress(selectNode, addressNode) {
  const sync = () => {
    const delivery = selectNode.value === "delivery";
    addressNode.required = delivery;
    addressNode.placeholder = delivery
      ? "Manzil yoki orientir"
      : "Pickup uchun ixtiyoriy";
  };
  selectNode.addEventListener("change", sync);
  sync();
}

export function renderMenuCard(item, options = {}) {
  const {
    actionLabel = "Savatga qo'shish",
    action = "button",
    href = "/menu",
    showCategory = true,
  } = options;

  const media = resolveMenuMedia(item);
  const badge = escapeHtml(item.badge || "Chef pick");
  const category = escapeHtml(item.category || "Signature");
  const title = escapeHtml(item.name || "Signature item");
  const description = escapeHtml(
    item.description || "Issiq holda tayyorlanadigan signature pozitsiya."
  );
  const actionMarkup =
    action === "button"
      ? `<button class="button" type="button" data-add-item="${escapeHtml(
          item._id || item.name || ""
        )}">${escapeHtml(actionLabel)}</button>`
      : `<a class="button-secondary" href="${href}">${escapeHtml(actionLabel)}</a>`;

  return `
    <article class="menu-card reveal">
      <div class="menu-media">
        <img src="${media.src}" alt="${title}" loading="lazy" />
        <span class="menu-badge">${badge}</span>
      </div>
      <div class="menu-body">
        <div class="menu-topline">
          <div>
            ${showCategory ? `<div class="menu-category">${category}</div>` : ""}
            <h3>${title}</h3>
          </div>
          <div class="price-tag">${formatMoney(item.price)}</div>
        </div>
        <p class="card-copy">${description}</p>
        <div class="menu-footer">
          <div class="small-copy">Issiq servis · 15-20 min tayyor</div>
          ${actionMarkup}
        </div>
      </div>
    </article>
  `;
}

export function findMenuItemById(items, itemId) {
  return items.find((item) => String(item._id || item.name) === String(itemId));
}

export function highlightHeroText(text) {
  const safeText = escapeHtml(text || defaultBranding.heroTitle);
  return safeText.replace(
    /(premium|fast food|offline|tajriba|issiq|tez)/gi,
    "<span>$1</span>"
  );
}

export function getCurrentCartItemsLabel(cart = readCart()) {
  const total = cartTotals(cart).count;
  return total ? `${total} ta mahsulot tayyor` : "Savat hozircha bo'sh";
}
