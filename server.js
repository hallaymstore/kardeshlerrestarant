const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://abumafia0:abumafia0@abumafia.h1trttg.mongodb.net/uploadsx2?appName=abumafia';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || crypto.randomBytes(24).toString('hex');
const publicDir = path.join(__dirname, 'public');

app.use(express.json({ limit: '2mb' }));
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

const orderSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    orderType: { type: String, enum: ['delivery', 'pickup'], required: true },
    items: [
      {
        itemId: String,
        name: String,
        price: Number,
        qty: Number,
      },
    ],
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
const Order = mongoose.model('Order', orderSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Application = mongoose.model('Application', applicationSchema);
const Setting = mongoose.model('Setting', settingsSchema);

const defaultBranding = {
  brandName: 'Scarlet Bite',
  heroTitle: 'Fast foodni premium offline tajribaga aylantiradigan nuqta',
  heroSubtitle:
    "Order, reservation va biznes aloqasi bir tizimda ishlaydigan shahar fastfood loyihasi.",
  phone: '+998 90 123 45 67',
  address: 'Toshkent shahri, Premium Food Hall 7',
  telegram: 'https://t.me/yourbrand',
};

const defaultMenu = [
  {
    name: 'Imperial Red Burger',
    description: 'Ikki qavat mol goshti, cheddar, karamellashgan piyoz va signature sous.',
    price: 49000,
    category: 'Burger',
    badge: 'Top seller',
    featured: true,
    image: '/assets/images/hero-burger.jpg',
  },
  {
    name: 'Volcano Chicken',
    description: 'Achchiq tovuq filesi, fresh salat va yumshoq bulochka bilan.',
    price: 43000,
    category: 'Chicken',
    badge: 'Hot',
    featured: true,
    image: '/assets/images/grill-scene.jpg',
  },
  {
    name: 'Royal Combo',
    description: 'Burger, fri va ichimlikdan iborat tushlik oqimi uchun tayyor combo.',
    price: 67000,
    category: 'Combo',
    badge: 'Combo',
    featured: true,
    image: '/assets/images/menu-burger.jpg',
  },
  {
    name: 'Cheese Fries',
    description: 'Qarsildoq kartoshka, eritilgan pishloq va ziravorli finish.',
    price: 24000,
    category: 'Sides',
    badge: 'Snack',
    image: '',
  },
  {
    name: 'Red Velvet Shake',
    description: 'Kremli dessert ichimligi, signature sweet position.',
    price: 29000,
    category: 'Drinks',
    badge: 'Sweet',
    image: '',
  },
  {
    name: 'Family Box',
    description: '4 burger, fri, nugget va ichimliklardan iborat oilaviy toplam.',
    price: 149000,
    category: 'Combo',
    badge: 'Family',
    image: '/assets/images/dining-scene.jpg',
  },
];

async function seedData() {
  const count = await MenuItem.countDocuments();
  if (!count) {
    await MenuItem.insertMany(defaultMenu);
  }

  const branding = await Setting.findOne({ key: 'branding' });
  if (!branding) {
    await Setting.create({
      key: 'branding',
      value: defaultBranding,
    });
  }
}

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('MongoDB connected');
    await seedData();
  })
  .catch((error) => console.error('MongoDB connection error:', error.message));

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

function filterMenuItems(items, query = {}) {
  const searchText = String(query.q || '').trim().toLowerCase();
  const category = String(query.category || '').trim().toLowerCase();
  const featured = String(query.featured || '').trim().toLowerCase();

  return items.filter((item) => {
    const matchesCategory = !category || category === 'all' || String(item.category || '').toLowerCase() === category;
    const matchesFeatured = featured !== 'true' || item.featured === true;
    const haystack = [item.name, item.description, item.category, item.badge].join(' ').toLowerCase();
    const matchesSearch = !searchText || haystack.includes(searchText);
    return matchesCategory && matchesFeatured && matchesSearch;
  });
}

async function getBrandingConfig() {
  if (!isDatabaseReady()) {
    return defaultBranding;
  }

  try {
    const branding = await Setting.findOne({ key: 'branding' });
    return branding?.value || defaultBranding;
  } catch {
    return defaultBranding;
  }
}

async function getMenuCatalog(query = {}) {
  if (!isDatabaseReady()) {
    return filterMenuItems(defaultMenu, query);
  }

  const dbQuery = { active: true };
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

  try {
    return await MenuItem.find(dbQuery).sort({ featured: -1, createdAt: -1 });
  } catch {
    return filterMenuItems(defaultMenu, query);
  }
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
  });
});

app.get('/api/menu', async (req, res) => {
  const items = await getMenuCatalog(req.query);
  res.json({ success: true, items });
});

app.get('/api/my-history/:deviceId', async (req, res) => {
  if (!isDatabaseReady()) {
    return res.json({ success: true, orders: [], reservations: [], applications: [] });
  }

  const { deviceId } = req.params;
  const [orders, reservations, applications] = await Promise.all([
    Order.find({ deviceId }).sort({ createdAt: -1 }).limit(10),
    Reservation.find({ deviceId }).sort({ createdAt: -1 }).limit(10),
    Application.find({ deviceId }).sort({ createdAt: -1 }).limit(10),
  ]);
  res.json({ success: true, orders, reservations, applications });
});

app.post('/api/orders', async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q. Order vaqtincha demo rejimida." });
    }

    const { deviceId, customerName, phone, address, orderType, items, note } = req.body;
    if (!deviceId || !customerName || !phone || !orderType || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, message: "Buyurtma ma'lumotlari to'liq emas" });
    }

    const safeItems = items.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      price: Number(item.price),
      qty: Math.max(1, Number(item.qty || 1)),
    }));

    const total = safeItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const order = await Order.create({
      deviceId,
      customerName,
      phone,
      address,
      orderType,
      items: safeItems,
      total,
      note,
    });
    res.json({ success: true, message: 'Buyurtma qabul qilindi', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q. Bron vaqtincha qabul qilinmayapti." });
    }

    const { deviceId, fullName, phone, guests, date, time, notes } = req.body;
    if (!deviceId || !fullName || !phone || !guests || !date || !time) {
      return res.status(400).json({ success: false, message: "Bron ma'lumotlari to'liq emas" });
    }

    const reservation = await Reservation.create({
      deviceId,
      fullName,
      phone,
      guests,
      date,
      time,
      notes,
    });
    res.json({ success: true, message: 'Bron qabul qilindi', reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q. So'rov vaqtincha qabul qilinmayapti." });
    }

    const { deviceId, fullName, phone, purpose, message } = req.body;
    if (!deviceId || !fullName || !phone || !purpose) {
      return res.status(400).json({ success: false, message: "So'rov ma'lumotlari yetarli emas" });
    }

    const application = await Application.create({
      deviceId,
      fullName,
      phone,
      purpose,
      message,
    });
    res.json({ success: true, message: "So'rov yuborildi", application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/login', (req, res) => {
  if (req.body.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Parol noto'g'ri" });
  }
  res.json({ success: true, token: ADMIN_TOKEN });
});

app.get('/api/admin/dashboard', auth, async (_req, res) => {
  if (!isDatabaseReady()) {
    return res.json({
      success: true,
      stats: { orderCount: 0, reservationCount: 0, applicationCount: 0, revenue: 0 },
      orders: [],
      reservations: [],
      applications: [],
      menu: defaultMenu,
      branding: defaultBranding,
    });
  }

  const [orders, reservations, applications, menu, branding] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(100),
    Reservation.find().sort({ createdAt: -1 }).limit(100),
    Application.find().sort({ createdAt: -1 }).limit(100),
    MenuItem.find().sort({ createdAt: -1 }),
    Setting.findOne({ key: 'branding' }),
  ]);

  const stats = {
    orderCount: orders.length,
    reservationCount: reservations.length,
    applicationCount: applications.length,
    revenue: orders
      .filter((entry) => entry.status !== 'cancelled')
      .reduce((sum, entry) => sum + entry.total, 0),
  };

  res.json({ success: true, stats, orders, reservations, applications, menu, branding: branding?.value || {} });
});

app.post('/api/admin/menu', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q" });
    }
    const doc = await MenuItem.create(req.body);
    res.json({ success: true, message: "Mahsulot qo'shildi", doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/menu/:id', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q" });
    }
    const doc = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Mahsulot yangilandi', doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/menu/:id', auth, async (req, res) => {
  try {
    if (!isDatabaseReady()) {
      return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q" });
    }
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Mahsulot o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/orders/:id', auth, async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q" });
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json({ success: true, message: 'Buyurtma statusi yangilandi', order });
});

app.put('/api/admin/reservations/:id', auth, async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q" });
  }
  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json({ success: true, message: 'Bron statusi yangilandi', reservation });
});

app.put('/api/admin/applications/:id', auth, async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q" });
  }
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json({ success: true, message: "So'rov statusi yangilandi", application });
});

app.put('/api/admin/branding', auth, async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ success: false, message: "Bazaga ulanish yo'q" });
  }
  const branding = await Setting.findOneAndUpdate(
    { key: 'branding' },
    { value: req.body || {} },
    { new: true, upsert: true }
  );
  res.json({ success: true, message: 'Branding saqlandi', branding: branding.value });
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin token: ${ADMIN_TOKEN}`);
});
