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

const defaultWebsiteContent = {
  home: {
    heroEyebrow: "Offline biznes uchun premium web qobiq",
    storyEyebrow: "Real loyiha hissi",
    storyTitle: "Landing ichida faqat banner emas, balki brend atmosferasi",
    storyText:
      "Siz so'raganidek sahifa alohida bloklarga bo'lindi: ishonch, jarayon, signature menu va offline biznesga mos CTA.",
    servicesEyebrow: "Xizmatlar",
    servicesTitle: "Mahsulot bilan birga xizmatlar ham sotiladi",
    servicesText:
      "Delivery, pickup, reservation va catering kabi oqimlar fastfood nuqtasini oddiy menu emas, real biznes platformaga aylantiradi.",
    processEyebrow: "Ish jarayoni",
    processTitle: "Mijoz ko'radigan jarayon lavhalari",
    processText:
      "Mahsulot qanday tayyorlanishi, qanday qadoqlanishi va qanday xizmat ko'rsatilishi landing ichida ko'rinib turadi.",
    menuEyebrow: "Signature menu",
    menuTitle: "Landing ichida ham menu preview tayyor",
    testimonialsEyebrow: "Mijoz ishonchi",
    testimonialsTitle: "Fastfood emas, tajriba sotilmoqda",
    ctaEyebrow: "Keyingi qadam",
    ctaTitle: "Alohida sahifalarga hozir o'tish",
    ctaText:
      "Menu/order, reservation va biznes aloqa sahifalari endi tayyor oqim sifatida ishlaydi.",
    metrics: [
      { label: "Oylik order oqimi", value: 12000, suffix: "+", prefix: "", description: "Sayt va offline nuqtalar uchun bitta conversion markazi." },
      { label: "Mijoz ratingi", value: 49, suffix: "", prefix: "4.", description: "Tajriba, servis va issiq mahsulot sifatli fastfood sifatida ko'rinadi." },
      { label: "Bronga tayyor stol", value: 18, suffix: "+", prefix: "", description: "Tadbir, uchrashuv yoki oilaviy kechki ovqat uchun alohida oqim." },
    ],
    features: [
      { label: "01 · Story-led intro", title: "Bir qarashda premium", description: "Hero, sahifa kompozitsiyasi va rang palitrasi fastfoodni oddiy kiosk emas, kuchli nuqta sifatida ko'rsatadi." },
      { label: "02 · Separate pages", title: "Funksiyalar ajratildi", description: "Menu/order, bron va aloqa so'rovlari alohida sahifalarda ishlaydi, shu sabab foydalanuvchi chalkashmaydi." },
      { label: "03 · Offline-business fit", title: "Salon va delivery birga", description: "Sayt delivery, pickup, reservation va hamkorlik kabi real biznes ssenariylarini birlashtiradi." },
    ],
    process: [
      { step: "01 · Grill", title: "Issiq batch va tez tayyorlash", description: "Rush paytida ham servis yo'qolmaydigan, ekranda sotiladigan tayyorlash kayfiyati.", image: "grill" },
      { step: "02 · Pack", title: "Signature mahsulotni taqdim etish", description: "Mahsulot ko'rinishi sahifa ichida premium ko'rinishni ushlab turadi va savatga qo'shishga undaydi.", image: "menu" },
      { step: "03 · Serve", title: "Zal, uchrashuv va oila oqimi", description: "Dine-in jarayoni ko'rinishi reservation bo'limini tabiiy ravishda sotadi.", image: "dining" },
    ],
    testimonials: [
      { quote: "Dine-in bron va order sahifasi alohida bo'lgani uchun mijoz qaysi oqimda ekanini tez tushunadi.", author: "Brand owner", meta: "Conversion focus" },
      { quote: "Landingdagi rasmli jarayon bloklari offline nuqtani ishonchliroq ko'rsatadi va reklama sahifasi kabi ko'rinmaydi.", author: "Creative direction", meta: "Visual trust" },
      { quote: "Menu qidiruvi, bron formasi va aloqa sohasi ajralgani kundalik ishlatishda ancha qulay bo'ladi.", author: "Operations view", meta: "Real business flow" },
    ],
  },
  booking: {
    heroEyebrow: "Reservation flow",
    heroTitle: "Dine-in va uchrashuvlar uchun alohida bron sahifasi",
    heroSubtitle:
      "Offline biznes uchun stol bron qilish alohida yo'nalishda bo'lishi kerak. Shu sabab bu sahifa buyurtmadan mustaqil, toza va maqsadga yo'naltirilgan.",
    formTitle: "Bron yuborish",
    formText: "Sana, vaqt va mehmonlar sonini qoldiring. Admin panel orqali holat tasdiqlanadi.",
    useCasesTitle: "Use cases",
    stats: [
      { label: "Shift format", value: "Lunch / evening" },
      { label: "Group size", value: "1-20 guest" },
      { label: "Admin flow", value: "Status control" },
    ],
    useCases: [
      { title: "Tug'ilgan kun va kichik tadbirlar", description: "Oila yoki yaqin doira uchun oldindan tayyorlanadigan joylashuv." },
      { title: "Business meeting va team lunch", description: "Tez ovqatlanish bilan birga qulay uchrashuv muhiti ham saqlanadi." },
      { title: "Weekend family table", description: "Oldindan bron qilingan stol navbat muammosini keskin kamaytiradi." },
    ],
  },
  contact: {
    heroEyebrow: "Business contact",
    heroTitle: "Hamkorlik, catering va aloqani alohida oqim qildik",
    heroSubtitle:
      "Offline fastfood biznesida faqat buyurtma emas, filiallar, tadbirlar va sheriklik so'rovlari ham muhim.",
    formTitle: "So'rov yuborish",
    formText: "Hamkorlik, catering, franchise yoki maxsus tadbir bo'yicha so'rovni shu yerdan qabul qilasiz.",
    contactCards: [
      { label: "Telefon", value: "+998 90 123 45 67" },
      { label: "Lokatsiya", value: "Toshkent shahri, Premium Food Hall 7" },
      { label: "Telegram", value: "@brand" },
    ],
    branches: [
      { label: "Yunusobod", title: "Lunch rush nuqtasi", description: "10:00 - 23:00 oralig'ida pickup va delivery oqimi yuqori bo'lgan filial." },
      { label: "Chilonzor", title: "Family box hub", description: "Kechki pik vaqt uchun oilaviy combo va reservation oqimiga mos keladi." },
      { label: "Markaz", title: "Business meeting spot", description: "Tadbir, uchrashuv va hamkorlik muzokaralari uchun kuchli lokatsiya." },
    ],
  },
};

const defaultServices = [
  { name: "Premium delivery", description: "Issiq qadoqlash, tez marshrut va call markaz bilan boshqariladigan delivery oqimi.", priceLabel: "30-45 min", badge: "Delivery", image: "/assets/images/grill-scene.jpg", featured: true, active: true },
  { name: "Pickup window", description: "Oldindan buyurtma berib, navbatsiz olib ketish uchun tez issue oynasi.", priceLabel: "12 min", badge: "Pickup", image: "/assets/images/menu-burger.jpg", featured: true, active: true },
  { name: "Catering va event", description: "Office lunch, tadbir va yopiq uchrashuvlar uchun moslashtiriladigan paketlar.", priceLabel: "Custom", badge: "Event", image: "/assets/images/dining-scene.jpg", featured: true, active: true },
];

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

export function escapeHtml(value) {
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

function mergeContent(base, incoming) {
  if (Array.isArray(base)) {
    return Array.isArray(incoming) ? incoming : [...base];
  }

  if (base && typeof base === "object") {
    const result = { ...base };
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
      return result;
    }
    Object.keys(incoming).forEach((key) => {
      if (!(key in base)) {
        result[key] = incoming[key];
        return;
      }
      result[key] = mergeContent(base[key], incoming[key]);
    });
    return result;
  }

  return incoming === undefined ? base : incoming;
}

function normalizeWebsiteContent(content = {}) {
  return mergeContent(defaultWebsiteContent, content);
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

let siteConfigPromise = null;

export async function loadSiteConfig() {
  if (!siteConfigPromise) {
    siteConfigPromise = fetchJSON("/api/config")
      .then((data) => ({
        branding: normalizeBranding(data.branding),
        websiteContent: normalizeWebsiteContent(data.websiteContent),
        cloudinaryEnabled: Boolean(data.cloudinaryEnabled),
      }))
      .catch(() => ({
        branding: normalizeBranding(),
        websiteContent: normalizeWebsiteContent(),
        cloudinaryEnabled: false,
      }));
  }

  return siteConfigPromise;
}

export async function loadBranding() {
  const config = await loadSiteConfig();
  return config.branding;
}

export async function loadWebsiteContent() {
  const config = await loadSiteConfig();
  return config.websiteContent;
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

export async function loadServices(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, value);
    }
  });
  const suffix = query.toString() ? `?${query.toString()}` : "";
  try {
    const data = await fetchJSON(`/api/services${suffix}`);
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [...defaultServices];
  }
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

export function renderServiceCard(item = {}) {
  const media = resolveMenuMedia(item);
  const badge = escapeHtml(item.badge || "Service");
  const title = escapeHtml(item.name || "Xizmat");
  const description = escapeHtml(item.description || "Biznes xizmat tavsifi.");
  const priceLabel = escapeHtml(item.priceLabel || "Custom");

  return `
    <article class="menu-card reveal">
      <div class="menu-media">
        <img src="${media.src}" alt="${title}" loading="lazy" />
        <span class="menu-badge">${badge}</span>
      </div>
      <div class="menu-body">
        <div class="menu-topline">
          <div>
            <div class="menu-category">Service line</div>
            <h3>${title}</h3>
          </div>
          <div class="price-tag">${priceLabel}</div>
        </div>
        <p class="card-copy">${description}</p>
        <div class="menu-footer">
          <div class="small-copy">Offline business flow</div>
          <a class="button-secondary" href="/contact">So'rov yuborish</a>
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
