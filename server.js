const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { Readable } = require('stream');
const { v2: cloudinary } = require('cloudinary');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://abumafia0:abumafia0@abumafia.h1trttg.mongodb.net/uploadsx2?appName=abumafia';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || crypto.randomBytes(24).toString('hex');
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const storePath = path.join(dataDir, 'store.json');
const cloudinaryFolder = process.env.CLOUDINARY_FOLDER || 'scarlet-bite';
const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET)
);

if (cloudinaryEnabled) {
  cloudinary.config(
    process.env.CLOUDINARY_URL
      ? undefined
      : {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true,
        }
  );
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

const timestamps = { timestamps: true };

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    category: { type: String, default: 'Burger' },
    badge: { type: String, default: '' },
    image: { type: String, default: '' },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  timestamps
);

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    priceLabel: { type: String, default: '' },
    badge: { type: String, default: '' },
    image: { type: String, default: '' },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  timestamps
);

const orderSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    orderType: { type: String, enum: ['delivery', 'pickup'], required: true },
    items: [{ itemId: String, name: String, price: Number, qty: Number }],
    note: { type: String, default: '' },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['new', 'confirmed', 'preparing', 'on_the_way', 'completed', 'cancelled'],
      default: 'new',
    },
  },
  timestamps
);

const reservationSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    guests: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'approved', 'completed', 'cancelled'],
      default: 'new',
    },
  },
  timestamps
);

const applicationSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    purpose: { type: String, required: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'accepted', 'rejected'],
      default: 'new',
    },
  },
  timestamps
);

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  timestamps
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Service = mongoose.model('Service', serviceSchema);
const Order = mongoose.model('Order', orderSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Application = mongoose.model('Application', applicationSchema);
const Setting = mongoose.model('Setting', settingsSchema);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix = 'item') {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function mergeDeep(base, incoming) {
  if (Array.isArray(base)) {
    return Array.isArray(incoming) ? incoming : clone(base);
  }

  if (base && typeof base === 'object') {
    const result = { ...clone(base) };
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      return result;
    }
    Object.keys(incoming).forEach((key) => {
      if (!(key in base)) {
        result[key] = incoming[key];
        return;
      }
      result[key] = mergeDeep(base[key], incoming[key]);
    });
    return result;
  }

  return incoming === undefined ? base : incoming;
}

const defaultBranding = {
  brandName: 'Scarlet Bite',
  heroTitle: 'Fast foodni premium offline tajribaga aylantiradigan nuqta',
  heroSubtitle:
    "Order, reservation va biznes aloqasi bir tizimda ishlaydigan shahar fastfood loyihasi.",
  phone: '+998 90 123 45 67',
  address: 'Toshkent shahri, Premium Food Hall 7',
  telegram: 'https://t.me/yourbrand',
};

const defaultWebsiteContent = {
  home: {
    heroEyebrow: 'Offline biznes uchun premium web qobiq',
    storyEyebrow: 'Real loyiha hissi',
    storyTitle: "Landing ichida faqat banner emas, balki brend atmosferasi",
    storyText:
      "Siz so'raganidek sahifa alohida bloklarga bo'lindi: ishonch, jarayon, signature menu va offline biznesga mos CTA.",
    servicesEyebrow: 'Xizmatlar',
    servicesTitle: "Mahsulot bilan birga xizmatlar ham sotiladi",
    servicesText:
      "Delivery, pickup, reservation va catering kabi oqimlar fastfood nuqtasini oddiy menu emas, real biznes platformaga aylantiradi.",
    processEyebrow: 'Ish jarayoni',
    processTitle: "Mijoz ko'radigan jarayon lavhalari",
    processText:
      "Mahsulot qanday tayyorlanishi, qanday qadoqlanishi va qanday xizmat ko'rsatilishi landing ichida ko'rinib turadi.",
    menuEyebrow: 'Signature menu',
    menuTitle: "Landing ichida ham menu preview tayyor",
    testimonialsEyebrow: 'Mijoz ishonchi',
    testimonialsTitle: "Fastfood emas, tajriba sotilmoqda",
    ctaEyebrow: 'Keyingi qadam',
    ctaTitle: "Alohida sahifalarga hozir o'tish",
    ctaText:
      "Menu/order, reservation va biznes aloqa sahifalari endi tayyor oqim sifatida ishlaydi.",
    metrics: [
      { label: 'Oylik order oqimi', value: 12000, suffix: '+', prefix: '', description: "Sayt va offline nuqtalar uchun bitta conversion markazi." },
      { label: 'Mijoz ratingi', value: 49, suffix: '', prefix: '4.', description: "Tajriba, servis va issiq mahsulot sifatli fastfood sifatida ko'rinadi." },
      { label: "Bronga tayyor stol", value: 18, suffix: '+', prefix: '', description: "Tadbir, uchrashuv yoki oilaviy kechki ovqat uchun alohida oqim." },
    ],
  },
  booking: {
    heroEyebrow: 'Reservation flow',
    heroTitle: "Dine-in va uchrashuvlar uchun alohida bron sahifasi",
    heroSubtitle:
      "Offline biznes uchun stol bron qilish alohida yo'nalishda bo'lishi kerak. Shu sabab bu sahifa buyurtmadan mustaqil, toza va maqsadga yo'naltirilgan.",
    formTitle: 'Bron yuborish',
    formText: "Sana, vaqt va mehmonlar sonini qoldiring. Admin panel orqali holat tasdiqlanadi.",
    useCasesTitle: 'Use cases',
  },
  contact: {
    heroEyebrow: 'Business contact',
    heroTitle: "Hamkorlik, catering va aloqani alohida oqim qildik",
    heroSubtitle:
      "Offline fastfood biznesida faqat buyurtma emas, filiallar, tadbirlar va sheriklik so'rovlari ham muhim.",
    formTitle: "So'rov yuborish",
    formText: "Hamkorlik, catering, franchise yoki maxsus tadbir bo'yicha so'rovni shu yerdan qabul qilasiz.",
  },
};

defaultWebsiteContent.home.features = [
  {
    label: '01 · Story-led intro',
    title: 'Bir qarashda premium',
    description:
      "Hero, sahifa kompozitsiyasi va rang palitrasi fastfoodni oddiy kiosk emas, kuchli nuqta sifatida ko'rsatadi.",
  },
  {
    label: '02 · Separate pages',
    title: "Funksiyalar ajratildi",
    description:
      "Menu/order, bron va aloqa so'rovlari alohida sahifalarda ishlaydi, shu sabab foydalanuvchi chalkashmaydi.",
  },
  {
    label: '03 · Offline-business fit',
    title: 'Salon va delivery birga',
    description:
      "Sayt delivery, pickup, reservation va hamkorlik kabi real biznes ssenariylarini birlashtiradi.",
  },
];

defaultWebsiteContent.home.process = [
  {
    step: '01 · Grill',
    title: 'Issiq batch va tez tayyorlash',
    description:
      "Rush paytida ham servis yo'qolmaydigan, ekranda sotiladigan tayyorlash kayfiyati.",
    image: 'grill',
  },
  {
    step: '02 · Pack',
    title: 'Signature mahsulotni taqdim etish',
    description:
      "Mahsulot ko'rinishi sahifa ichida premium ko'rinishni ushlab turadi va savatga qo'shishga undaydi.",
    image: 'menu',
  },
  {
    step: '03 · Serve',
    title: "Zal, uchrashuv va oila oqimi",
    description:
      "Dine-in jarayoni ko'rinishi reservation bo'limini tabiiy ravishda sotadi.",
    image: 'dining',
  },
];

defaultWebsiteContent.home.testimonials = [
  {
    quote:
      "Dine-in bron va order sahifasi alohida bo'lgani uchun mijoz qaysi oqimda ekanini tez tushunadi.",
    author: 'Brand owner',
    meta: 'Conversion focus',
  },
  {
    quote:
      "Landingdagi rasmli jarayon bloklari offline nuqtani ishonchliroq ko'rsatadi va reklama sahifasi kabi ko'rinmaydi.",
    author: 'Creative direction',
    meta: 'Visual trust',
  },
  {
    quote:
      "Menu qidiruvi, bron formasi va aloqa sohasi ajralgani kundalik ishlatishda ancha qulay bo'ladi.",
    author: 'Operations view',
    meta: 'Real business flow',
  },
];

defaultWebsiteContent.booking.stats = [
  { label: 'Shift format', value: 'Lunch / evening' },
  { label: 'Group size', value: '1-20 guest' },
  { label: 'Admin flow', value: 'Status control' },
];

defaultWebsiteContent.booking.useCases = [
  {
    title: "Tug'ilgan kun va kichik tadbirlar",
    description: "Oila yoki yaqin doira uchun oldindan tayyorlanadigan joylashuv.",
  },
  {
    title: 'Business meeting va team lunch',
    description: "Tez ovqatlanish bilan birga qulay uchrashuv muhiti ham saqlanadi.",
  },
  {
    title: 'Weekend family table',
    description: "Oldindan bron qilingan stol navbat muammosini keskin kamaytiradi.",
  },
];

defaultWebsiteContent.contact.contactCards = [
  { label: 'Telefon', value: '+998 90 123 45 67' },
  { label: 'Lokatsiya', value: 'Toshkent shahri, Premium Food Hall 7' },
  { label: 'Telegram', value: '@brand' },
];

defaultWebsiteContent.contact.branches = [
  {
    label: 'Yunusobod',
    title: 'Lunch rush nuqtasi',
    description: "10:00 - 23:00 oralig'ida pickup va delivery oqimi yuqori bo'lgan filial.",
  },
  {
    label: 'Chilonzor',
    title: 'Family box hub',
    description: "Kechki pik vaqt uchun oilaviy combo va reservation oqimiga mos keladi.",
  },
  {
    label: 'Markaz',
    title: 'Business meeting spot',
    description:
      "Tadbir, uchrashuv va hamkorlik muzokaralari uchun kuchli lokatsiya.",
  },
];

const defaultMenu = [
  {
    _id: createId('menu'),
    name: 'Imperial Red Burger',
    description: 'Ikki qavat mol goshti, cheddar, karamellashgan piyoz va signature sous.',
    price: 49000,
    category: 'Burger',
    badge: 'Top seller',
    featured: true,
    active: true,
    image: '/assets/images/hero-burger.jpg',
  },
  {
    _id: createId('menu'),
    name: 'Volcano Chicken',
    description: 'Achchiq tovuq filesi, fresh salat va yumshoq bulochka bilan.',
    price: 43000,
    category: 'Chicken',
    badge: 'Hot',
    featured: true,
    active: true,
    image: '/assets/images/grill-scene.jpg',
  },
  {
    _id: createId('menu'),
    name: 'Royal Combo',
    description: 'Burger, fri va ichimlikdan iborat tushlik oqimi uchun tayyor combo.',
    price: 67000,
    category: 'Combo',
    badge: 'Combo',
    featured: true,
    active: true,
    image: '/assets/images/menu-burger.jpg',
  },
  {
    _id: createId('menu'),
    name: 'Cheese Fries',
    description: 'Qarsildoq kartoshka, eritilgan pishloq va ziravorli finish.',
    price: 24000,
    category: 'Sides',
    badge: 'Snack',
    featured: false,
    active: true,
    image: '',
  },
  {
    _id: createId('menu'),
    name: 'Red Velvet Shake',
    description: 'Kremli desert ichimligi, signature sweet position.',
    price: 29000,
    category: 'Drinks',
    badge: 'Sweet',
    featured: false,
    active: true,
    image: '',
  },
  {
    _id: createId('menu'),
    name: 'Family Box',
    description: "4 burger, fri, nugget va ichimliklardan iborat oilaviy toplam.",
    price: 149000,
    category: 'Combo',
    badge: 'Family',
    featured: false,
    active: true,
    image: '/assets/images/dining-scene.jpg',
  },
];

const defaultServices = [
  {
    _id: createId('service'),
    name: 'Premium delivery',
    description:
      "Issiq qadoqlash, tez marshrut va call markaz bilan boshqariladigan delivery oqimi.",
    priceLabel: '30-45 min',
    badge: 'Delivery',
    image: '/assets/images/grill-scene.jpg',
    featured: true,
    active: true,
  },
  {
    _id: createId('service'),
    name: 'Pickup window',
    description: "Oldindan buyurtma berib, navbatsiz olib ketish uchun tez issue oynasi.",
    priceLabel: '12 min',
    badge: 'Pickup',
    image: '/assets/images/menu-burger.jpg',
    featured: true,
    active: true,
  },
  {
    _id: createId('service'),
    name: 'Catering va event',
    description:
      "Office lunch, tadbir va yopiq uchrashuvlar uchun moslashtiriladigan paketlar.",
    priceLabel: 'Custom',
    badge: 'Event',
    image: '/assets/images/dining-scene.jpg',
    featured: true,
    active: true,
  },
];

function buildDefaultStore() {
  return {
    branding: clone(defaultBranding),
    websiteContent: clone(defaultWebsiteContent),
    menu: clone(defaultMenu),
    services: clone(defaultServices),
    orders: [],
    reservations: [],
    applications: [],
  };
}

function normalizeRecords(records, fallback, prefix) {
  if (!Array.isArray(records) || !records.length) {
    return clone(fallback);
  }

  return records.map((record) => ({
    ...record,
    _id: record._id || createId(prefix),
  }));
}

function normalizeStore(store = {}) {
  const defaults = buildDefaultStore();

  return {
    branding: mergeDeep(defaults.branding, store.branding || {}),
    websiteContent: mergeDeep(defaults.websiteContent, store.websiteContent || {}),
    menu: normalizeRecords(store.menu, defaults.menu, 'menu'),
    services: normalizeRecords(store.services, defaults.services, 'service'),
    orders: normalizeRecords(store.orders, [], 'order'),
    reservations: normalizeRecords(store.reservations, [], 'reservation'),
    applications: normalizeRecords(store.applications, [], 'application'),
  };
}

let localStoreCache = null;

async function ensureLocalStore() {
  await fsp.mkdir(dataDir, { recursive: true });
  if (!fs.existsSync(storePath)) {
    const defaults = buildDefaultStore();
    await fsp.writeFile(storePath, JSON.stringify(defaults, null, 2), 'utf8');
    localStoreCache = defaults;
  }
}

async function readLocalStore() {
  if (localStoreCache) {
    return clone(localStoreCache);
  }

  await ensureLocalStore();
  const raw = await fsp.readFile(storePath, 'utf8');
  const store = normalizeStore(JSON.parse(raw));
  localStoreCache = store;
  await fsp.writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
  return clone(store);
}

async function writeLocalStore(store) {
  const normalized = normalizeStore(store);
  localStoreCache = normalized;
  await ensureLocalStore();
  await fsp.writeFile(storePath, JSON.stringify(normalized, null, 2), 'utf8');
  return clone(normalized);
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

async function seedDatabase() {
  if (!(await MenuItem.countDocuments())) {
    await MenuItem.insertMany(defaultMenu);
  }

  if (!(await Service.countDocuments())) {
    await Service.insertMany(defaultServices);
  }

  const branding = await Setting.findOne({ key: 'branding' });
  if (!branding) {
    await Setting.create({ key: 'branding', value: defaultBranding });
  }

  const websiteContent = await Setting.findOne({ key: 'websiteContent' });
  if (!websiteContent) {
    await Setting.create({ key: 'websiteContent', value: defaultWebsiteContent });
  }
}

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('MongoDB connected');
    await seedDatabase();
  })
  .catch((error) => console.error('MongoDB connection error:', error.message));

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sortByFeatured(items) {
  return [...items].sort((left, right) => {
    const featuredScore = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    if (featuredScore) return featuredScore;
    const rightDate = new Date(right.updatedAt || right.createdAt || 0).getTime();
    const leftDate = new Date(left.updatedAt || left.createdAt || 0).getTime();
    return rightDate - leftDate;
  });
}

function filterCatalog(items, query = {}, includeInactive = false) {
  const searchText = String(query.q || '').trim().toLowerCase();
  const category = String(query.category || '').trim().toLowerCase();
  const featured = String(query.featured || '').trim().toLowerCase();

  return sortByFeatured(items).filter((item) => {
    const active = item.active !== false;
    if (!includeInactive && !active) return false;

    const matchesCategory =
      !category ||
      category === 'all' ||
      String(item.category || item.badge || '').toLowerCase() === category;
    const matchesFeatured = featured !== 'true' || item.featured === true;
    const haystack = [item.name, item.description, item.category, item.badge, item.priceLabel]
      .join(' ')
      .toLowerCase();
    const matchesSearch = !searchText || haystack.includes(searchText);
    return matchesCategory && matchesFeatured && matchesSearch;
  });
}

function sanitizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return fallback;
}

function sanitizeMenuPayload(payload = {}) {
  return {
    name: String(payload.name || '').trim(),
    description: String(payload.description || '').trim(),
    price: Number(payload.price || 0),
    category: String(payload.category || 'Burger').trim() || 'Burger',
    badge: String(payload.badge || '').trim(),
    image: String(payload.image || '').trim(),
    active: sanitizeBoolean(payload.active, true),
    featured: sanitizeBoolean(payload.featured, false),
  };
}

function sanitizeServicePayload(payload = {}) {
  return {
    name: String(payload.name || '').trim(),
    description: String(payload.description || '').trim(),
    priceLabel: String(payload.priceLabel || '').trim(),
    badge: String(payload.badge || '').trim(),
    image: String(payload.image || '').trim(),
    active: sanitizeBoolean(payload.active, true),
    featured: sanitizeBoolean(payload.featured, false),
  };
}

function validateMenuPayload(payload) {
  if (!payload.name) {
    throw new Error('Mahsulot nomi majburiy');
  }
  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    throw new Error("Mahsulot narxi to'g'ri kiritilmagan");
  }
}

function validateServicePayload(payload) {
  if (!payload.name) {
    throw new Error('Xizmat nomi majburiy');
  }
}

async function getSettingValue(key, fallback) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    return clone(store[key] || fallback);
  }

  try {
    const setting = await Setting.findOne({ key });
    return mergeDeep(fallback, setting?.value || {});
  } catch {
    return clone(fallback);
  }
}

async function setSettingValue(key, value) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    store[key] = value;
    await writeLocalStore(store);
    return value;
  }

  const setting = await Setting.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true }
  );
  return setting.value;
}

async function getBrandingConfig() {
  return getSettingValue('branding', defaultBranding);
}

async function getWebsiteContentConfig() {
  return getSettingValue('websiteContent', defaultWebsiteContent);
}

async function getMenuCatalog(query = {}, includeInactive = false) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    return filterCatalog(store.menu, query, includeInactive);
  }

  const dbQuery = includeInactive ? {} : { active: true };
  if (query.category && query.category !== 'all') {
    dbQuery.category = new RegExp(`^${escapeRegex(String(query.category))}$`, 'i');
  }
  if (query.featured === 'true') {
    dbQuery.featured = true;
  }
  if (query.q) {
    const search = new RegExp(escapeRegex(String(query.q)), 'i');
    dbQuery.$or = [
      { name: search },
      { description: search },
      { category: search },
      { badge: search },
    ];
  }
  return MenuItem.find(dbQuery).sort({ featured: -1, createdAt: -1 });
}

async function getServicesCatalog(query = {}, includeInactive = false) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    return filterCatalog(store.services, query, includeInactive);
  }

  const dbQuery = includeInactive ? {} : { active: true };
  if (query.featured === 'true') {
    dbQuery.featured = true;
  }
  if (query.q) {
    const search = new RegExp(escapeRegex(String(query.q)), 'i');
    dbQuery.$or = [
      { name: search },
      { description: search },
      { priceLabel: search },
      { badge: search },
    ];
  }
  return Service.find(dbQuery).sort({ featured: -1, createdAt: -1 });
}

async function createMenuRecord(payload) {
  const record = sanitizeMenuPayload(payload);
  validateMenuPayload(record);

  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    const doc = {
      ...record,
      _id: createId('menu'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.menu.unshift(doc);
    await writeLocalStore(store);
    return doc;
  }

  return MenuItem.create(record);
}

async function updateMenuRecord(id, payload) {
  const record = sanitizeMenuPayload(payload);
  validateMenuPayload(record);

  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    const index = store.menu.findIndex((item) => item._id === id);
    if (index === -1) throw new Error('Mahsulot topilmadi');
    store.menu[index] = {
      ...store.menu[index],
      ...record,
      updatedAt: new Date().toISOString(),
    };
    await writeLocalStore(store);
    return store.menu[index];
  }

  const doc = await MenuItem.findByIdAndUpdate(id, record, { new: true });
  if (!doc) throw new Error('Mahsulot topilmadi');
  return doc;
}

async function deleteMenuRecord(id) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    store.menu = store.menu.filter((item) => item._id !== id);
    await writeLocalStore(store);
    return;
  }
  await MenuItem.findByIdAndDelete(id);
}

async function createServiceRecord(payload) {
  const record = sanitizeServicePayload(payload);
  validateServicePayload(record);

  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    const doc = {
      ...record,
      _id: createId('service'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.services.unshift(doc);
    await writeLocalStore(store);
    return doc;
  }

  return Service.create(record);
}

async function updateServiceRecord(id, payload) {
  const record = sanitizeServicePayload(payload);
  validateServicePayload(record);

  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    const index = store.services.findIndex((item) => item._id === id);
    if (index === -1) throw new Error('Xizmat topilmadi');
    store.services[index] = {
      ...store.services[index],
      ...record,
      updatedAt: new Date().toISOString(),
    };
    await writeLocalStore(store);
    return store.services[index];
  }

  const doc = await Service.findByIdAndUpdate(id, record, { new: true });
  if (!doc) throw new Error('Xizmat topilmadi');
  return doc;
}

async function deleteServiceRecord(id) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    store.services = store.services.filter((item) => item._id !== id);
    await writeLocalStore(store);
    return;
  }
  await Service.findByIdAndDelete(id);
}

async function getHistoryByDevice(deviceId) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    return {
      orders: store.orders.filter((item) => item.deviceId === deviceId).slice(-10).reverse(),
      reservations: store.reservations.filter((item) => item.deviceId === deviceId).slice(-10).reverse(),
      applications: store.applications.filter((item) => item.deviceId === deviceId).slice(-10).reverse(),
    };
  }

  const [orders, reservations, applications] = await Promise.all([
    Order.find({ deviceId }).sort({ createdAt: -1 }).limit(10),
    Reservation.find({ deviceId }).sort({ createdAt: -1 }).limit(10),
    Application.find({ deviceId }).sort({ createdAt: -1 }).limit(10),
  ]);
  return { orders, reservations, applications };
}

async function createOrderRecord(payload) {
  const safeItems = payload.items.map((item) => ({
    itemId: item.itemId,
    name: item.name,
    price: Number(item.price),
    qty: Math.max(1, Number(item.qty || 1)),
  }));
  const total = safeItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    const order = {
      _id: createId('order'),
      deviceId: payload.deviceId,
      customerName: payload.customerName,
      phone: payload.phone,
      address: payload.address || '',
      orderType: payload.orderType,
      items: safeItems,
      note: payload.note || '',
      total,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.orders.unshift(order);
    await writeLocalStore(store);
    return order;
  }

  return Order.create({
    ...payload,
    items: safeItems,
    total,
  });
}

async function createReservationRecord(payload) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    const reservation = {
      _id: createId('reservation'),
      ...payload,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.reservations.unshift(reservation);
    await writeLocalStore(store);
    return reservation;
  }

  return Reservation.create(payload);
}

async function createApplicationRecord(payload) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    const application = {
      _id: createId('application'),
      ...payload,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.applications.unshift(application);
    await writeLocalStore(store);
    return application;
  }

  return Application.create(payload);
}

async function updateStatusRecord(type, id, status) {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    const collectionMap = { order: 'orders', reservation: 'reservations', application: 'applications' };
    const collection = collectionMap[type];
    const index = store[collection].findIndex((item) => item._id === id);
    if (index === -1) throw new Error("Yozuv topilmadi");
    store[collection][index].status = status;
    store[collection][index].updatedAt = new Date().toISOString();
    await writeLocalStore(store);
    return store[collection][index];
  }

  if (type === 'order') {
    return Order.findByIdAndUpdate(id, { status }, { new: true });
  }
  if (type === 'reservation') {
    return Reservation.findByIdAndUpdate(id, { status }, { new: true });
  }
  return Application.findByIdAndUpdate(id, { status }, { new: true });
}

async function getDashboardData() {
  if (!isDatabaseReady()) {
    const store = await readLocalStore();
    const stats = {
      orderCount: store.orders.length,
      reservationCount: store.reservations.length,
      applicationCount: store.applications.length,
      serviceCount: store.services.length,
      productCount: store.menu.length,
      revenue: store.orders
        .filter((entry) => entry.status !== 'cancelled')
        .reduce((sum, entry) => sum + Number(entry.total || 0), 0),
    };

    return {
      stats,
      orders: store.orders.slice(0, 100),
      reservations: store.reservations.slice(0, 100),
      applications: store.applications.slice(0, 100),
      menu: sortByFeatured(store.menu),
      services: sortByFeatured(store.services),
      branding: store.branding,
      websiteContent: store.websiteContent,
    };
  }

  const [orders, reservations, applications, menu, services, branding, websiteContent] =
    await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(100),
      Reservation.find().sort({ createdAt: -1 }).limit(100),
      Application.find().sort({ createdAt: -1 }).limit(100),
      MenuItem.find().sort({ featured: -1, createdAt: -1 }),
      Service.find().sort({ featured: -1, createdAt: -1 }),
      Setting.findOne({ key: 'branding' }),
      Setting.findOne({ key: 'websiteContent' }),
    ]);

  return {
    stats: {
      orderCount: orders.length,
      reservationCount: reservations.length,
      applicationCount: applications.length,
      serviceCount: services.length,
      productCount: menu.length,
      revenue: orders
        .filter((entry) => entry.status !== 'cancelled')
        .reduce((sum, entry) => sum + entry.total, 0),
    },
    orders,
    reservations,
    applications,
    menu,
    services,
    branding: branding?.value || defaultBranding,
    websiteContent: websiteContent?.value || defaultWebsiteContent,
  };
}

function sanitizePublicId(filename = 'asset') {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function uploadToCloudinary(file, folder = 'website') {
  if (!cloudinaryEnabled) {
    throw new Error("Cloudinary sozlanmagan. Env ga CLOUDINARY_* qiymatlarini qo'shing.");
  }

  const publicId = `${sanitizePublicId(path.parse(file.originalname).name || 'asset')}-${Date.now()}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${cloudinaryFolder}/${folder}`,
        public_id: publicId,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
}

function auth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: "Admin ruxsati yo'q" });
  }
  next();
}

app.get('/api/config', async (_req, res) => {
  res.json({
    success: true,
    adminHint: 'Admin parol environment orqali boshqariladi',
    branding: await getBrandingConfig(),
    websiteContent: await getWebsiteContentConfig(),
    cloudinaryEnabled,
  });
});

app.get('/api/menu', async (req, res, next) => {
  try {
    const items = await getMenuCatalog(req.query);
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

app.get('/api/services', async (req, res, next) => {
  try {
    const items = await getServicesCatalog(req.query);
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

app.get('/api/my-history/:deviceId', async (req, res, next) => {
  try {
    const history = await getHistoryByDevice(req.params.deviceId);
    res.json({ success: true, ...history });
  } catch (error) {
    next(error);
  }
});

app.post('/api/orders', async (req, res, next) => {
  try {
    const { deviceId, customerName, phone, orderType, items } = req.body;
    if (!deviceId || !customerName || !phone || !orderType || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, message: "Buyurtma ma'lumotlari to'liq emas" });
    }

    const order = await createOrderRecord(req.body);
    res.json({ success: true, message: 'Buyurtma qabul qilindi', order });
  } catch (error) {
    next(error);
  }
});

app.post('/api/reservations', async (req, res, next) => {
  try {
    const { deviceId, fullName, phone, guests, date, time } = req.body;
    if (!deviceId || !fullName || !phone || !guests || !date || !time) {
      return res.status(400).json({ success: false, message: "Bron ma'lumotlari to'liq emas" });
    }

    const reservation = await createReservationRecord(req.body);
    res.json({ success: true, message: 'Bron qabul qilindi', reservation });
  } catch (error) {
    next(error);
  }
});

app.post('/api/applications', async (req, res, next) => {
  try {
    const { deviceId, fullName, phone, purpose } = req.body;
    if (!deviceId || !fullName || !phone || !purpose) {
      return res.status(400).json({ success: false, message: "So'rov ma'lumotlari yetarli emas" });
    }

    const application = await createApplicationRecord(req.body);
    res.json({ success: true, message: "So'rov yuborildi", application });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/login', (req, res) => {
  try {
    if (req.body.password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: "Parol noto'g'ri" });
    }
    res.json({ success: true, token: ADMIN_TOKEN });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/dashboard', auth, async (_req, res, next) => {
  try {
    const data = await getDashboardData();
    res.json({
      success: true,
      ...data,
      cloudinary: { enabled: cloudinaryEnabled, folder: cloudinaryFolder },
      persistence: isDatabaseReady() ? 'mongodb' : 'local-store',
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/uploads', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Yuklash uchun fayl tanlanmagan' });
    }

    const result = await uploadToCloudinary(req.file, req.body.folder || 'website');
    res.json({
      success: true,
      message: 'Rasm Cloudinary ga yuklandi',
      asset: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/menu', auth, async (req, res, next) => {
  try {
    const doc = await createMenuRecord(req.body);
    res.json({ success: true, message: "Mahsulot qo'shildi", doc });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/menu/:id', auth, async (req, res, next) => {
  try {
    const doc = await updateMenuRecord(req.params.id, req.body);
    res.json({ success: true, message: 'Mahsulot yangilandi', doc });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/menu/:id', auth, async (req, res, next) => {
  try {
    await deleteMenuRecord(req.params.id);
    res.json({ success: true, message: "Mahsulot o'chirildi" });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/services', auth, async (req, res, next) => {
  try {
    const doc = await createServiceRecord(req.body);
    res.json({ success: true, message: "Xizmat qo'shildi", doc });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/services/:id', auth, async (req, res, next) => {
  try {
    const doc = await updateServiceRecord(req.params.id, req.body);
    res.json({ success: true, message: 'Xizmat yangilandi', doc });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/services/:id', auth, async (req, res, next) => {
  try {
    await deleteServiceRecord(req.params.id);
    res.json({ success: true, message: "Xizmat o'chirildi" });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/orders/:id', auth, async (req, res, next) => {
  try {
    const order = await updateStatusRecord('order', req.params.id, req.body.status);
    res.json({ success: true, message: 'Buyurtma statusi yangilandi', order });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/reservations/:id', auth, async (req, res, next) => {
  try {
    const reservation = await updateStatusRecord('reservation', req.params.id, req.body.status);
    res.json({ success: true, message: 'Bron statusi yangilandi', reservation });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/applications/:id', auth, async (req, res, next) => {
  try {
    const application = await updateStatusRecord('application', req.params.id, req.body.status);
    res.json({ success: true, message: "So'rov statusi yangilandi", application });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/branding', auth, async (req, res, next) => {
  try {
    const branding = mergeDeep(defaultBranding, req.body || {});
    const saved = await setSettingValue('branding', branding);
    res.json({ success: true, message: 'Branding saqlandi', branding: saved });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/site-content', auth, async (req, res, next) => {
  try {
    const content = mergeDeep(defaultWebsiteContent, req.body || {});
    const saved = await setSettingValue('websiteContent', content);
    res.json({ success: true, message: 'Sayt kontenti saqlandi', websiteContent: saved });
  } catch (error) {
    next(error);
  }
});

const pageRoutes = {
  '/': 'index.html',
  '/menu': 'menu.html',
  '/booking': 'booking.html',
  '/contact': 'contact.html',
  '/admin': 'admin.html',
};

Object.entries(pageRoutes).forEach(([route, fileName]) => {
  app.get(route, (_req, res) => {
    res.sendFile(path.join(publicDir, fileName));
  });
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled server error:', error);
  const message =
    error && typeof error.message === 'string' && error.message
      ? error.message
      : 'Server xatoligi yuz berdi';
  res.status(500).json({ success: false, message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin token: ${ADMIN_TOKEN}`);
});
