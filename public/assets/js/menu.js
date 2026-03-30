import {
  addItemToCart,
  applyBranding,
  cartTotals,
  changeCartItem,
  clearCart,
  fetchJSON,
  findMenuItemById,
  formatMoney,
  getCurrentCartItemsLabel,
  getDeviceId,
  getSceneImage,
  initRevealAnimations,
  loadBranding,
  loadMenu,
  mountSiteShell,
  readCart,
  renderMenuCard,
  serializeForm,
  showToast,
  toggleDeliveryAddress,
} from "./site.js";

const state = {
  items: [],
  category: "all",
  query: "",
};

function filteredItems() {
  return state.items.filter((item) => {
    const matchesCategory =
      state.category === "all" || String(item.category || "").toLowerCase() === state.category;
    const needle = state.query.trim().toLowerCase();
    const haystack = [item.name, item.description, item.category, item.badge]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !needle || haystack.includes(needle);
    return matchesCategory && matchesQuery;
  });
}

function renderFilters() {
  const categoryWrap = document.getElementById("categoryChips");
  if (!categoryWrap) return;

  const categories = [
    "all",
    ...new Set(state.items.map((item) => String(item.category || "").toLowerCase()).filter(Boolean)),
  ];

  categoryWrap.innerHTML = categories
    .map((category) => {
      const active = category === state.category ? "is-active" : "";
      const label = category === "all" ? "Hammasi" : category[0].toUpperCase() + category.slice(1);
      return `<button class="chip ${active}" type="button" data-category="${category}">${label}</button>`;
    })
    .join("");
}

function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  const count = document.getElementById("catalogCount");
  if (!grid) return;

  const items = filteredItems();
  if (count) count.textContent = `${items.length} ta pozitsiya`;

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state reveal">
        <strong>Natija topilmadi</strong>
        <p class="card-copy">Qidiruvni soddalashtiring yoki boshqa kategoriya tanlang.</p>
      </div>
    `;
    initRevealAnimations();
    return;
  }

  grid.innerHTML = items.map((item) => renderMenuCard(item)).join("");
  initRevealAnimations();
}

function renderCart() {
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  const cartLabel = document.getElementById("cartLabel");
  const cart = readCart();

  if (cartLabel) cartLabel.textContent = getCurrentCartItemsLabel(cart);
  if (cartTotal) cartTotal.textContent = formatMoney(cartTotals(cart).total);

  if (!cartList) return;

  if (!cart.length) {
    cartList.innerHTML = `
      <div class="empty-state">
        <strong>Savat bo'sh</strong>
        <p class="card-copy">Chap tomondagi menu kartalaridan mahsulot tanlang.</p>
      </div>
    `;
    return;
  }

  cartList.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-item-top">
            <div>
              <strong>${item.name}</strong>
              <div class="small-copy">${formatMoney(item.price)} · ${item.qty} ta</div>
            </div>
            <div class="qty-control">
              <button class="icon-button" type="button" data-qty-action="minus" data-item-id="${item.itemId}">-</button>
              <strong>${item.qty}</strong>
              <button class="icon-button" type="button" data-qty-action="plus" data-item-id="${item.itemId}">+</button>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

async function submitOrder(form) {
  const cart = readCart();
  if (!cart.length) {
    showToast("Avval kamida bitta mahsulot qo'shing.");
    return;
  }

  const payload = serializeForm(form);
  payload.deviceId = getDeviceId();
  payload.items = cart;

  await fetchJSON("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  form.reset();
  clearCart();
  renderCart();
  showToast("Buyurtma qabul qilindi.");
}

async function init() {
  mountSiteShell("menu");

  const [branding, items] = await Promise.all([loadBranding(), loadMenu()]);
  applyBranding(branding);
  state.items = items;

  const heroImage = document.getElementById("menuHeroImage");
  if (heroImage) heroImage.src = getSceneImage("menu");

  renderFilters();
  renderCatalog();
  renderCart();

  const searchInput = document.getElementById("menuSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      renderCatalog();
    });
  }

  const categoryChips = document.getElementById("categoryChips");
  if (categoryChips) {
    categoryChips.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.category = button.getAttribute("data-category");
      renderFilters();
      renderCatalog();
    });
  }

  const catalogGrid = document.getElementById("catalogGrid");
  if (catalogGrid) {
    catalogGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-item]");
      if (!button) return;
      const item = findMenuItemById(state.items, button.getAttribute("data-add-item"));
      if (!item) return;
      addItemToCart(item);
      renderCart();
      showToast(`${item.name} savatga qo'shildi.`);
    });
  }

  const cartList = document.getElementById("cartList");
  if (cartList) {
    cartList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-qty-action]");
      if (!button) return;
      const delta = button.getAttribute("data-qty-action") === "plus" ? 1 : -1;
      changeCartItem(button.getAttribute("data-item-id"), delta);
      renderCart();
    });
  }

  const clearButton = document.getElementById("clearCart");
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      clearCart();
      renderCart();
      showToast("Savat tozalandi.");
    });
  }

  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    toggleDeliveryAddress(orderForm.elements.orderType, orderForm.elements.address);
    orderForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitOrder(orderForm);
      } catch (error) {
        showToast(error.message);
      }
    });
  }

  window.addEventListener("cart:updated", renderCart);
  initRevealAnimations();
}

init().catch((error) => {
  showToast(error.message);
});
