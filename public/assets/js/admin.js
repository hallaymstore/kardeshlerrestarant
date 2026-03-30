(() => {
  const state = {
    adminToken: localStorage.getItem("scarlet_admin_token") || "",
    dashboard: null,
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const fmtMoney = (value) => `${new Intl.NumberFormat("uz-UZ").format(Number(value || 0))} so'm`;

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

  function showToast(text) {
    const toast = $("#toast");
    toast.textContent = text;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  async function request(url, options = {}) {
    const headers = { "x-admin-token": state.adminToken, ...(options.headers || {}) };
    const config = {
      method: options.method || "GET",
      headers,
    };

    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
      config.body = options.body;
    } else if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "So'rov bajarilmadi");
    }

    return data;
  }

  function setLoggedIn(value) {
    $("#loginCard").classList.toggle("hidden", value);
    $("#dashboardWrap").classList.toggle("hidden", !value);
  }

  function setStatusBadges(payload) {
    $("#persistenceBadge").textContent = `Store: ${payload.persistence || "unknown"}`;
    $("#cloudinaryBadge").textContent = payload.cloudinary?.enabled
      ? `Cloudinary: ${payload.cloudinary.folder}`
      : "Cloudinary: ulanmagan";
  }

  function renderStats(stats = {}) {
    const entries = [
      ["Buyurtmalar", stats.orderCount],
      ["Bronlar", stats.reservationCount],
      ["So'rovlar", stats.applicationCount],
      ["Mahsulotlar", stats.productCount],
      ["Xizmatlar", stats.serviceCount],
      ["Aylanma", fmtMoney(stats.revenue)],
    ];

    $("#statsGrid").innerHTML = entries
      .map(
        ([label, value]) => `
          <div class="stat-box">
            <div class="muted-text">${escapeHtml(label)}</div>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `
      )
      .join("");
  }

  function statusSelect(current, options, type, id) {
    return `
      <select data-status-type="${type}" data-id="${id}">
        ${options
          .map(
            (option) => `
              <option value="${option}" ${option === current ? "selected" : ""}>${option}</option>
            `
          )
          .join("")}
      </select>
    `;
  }

  function renderTable(targetId, headers, rows) {
    const target = document.getElementById(targetId);
    target.innerHTML = `
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows.join("") || `<tr><td colspan="${headers.length}">Ma'lumot yo'q</td></tr>`}</tbody>
      </table>
    `;
  }

  function renderOrders(list = []) {
    renderTable(
      "ordersTable",
      ["Mijoz", "Mahsulotlar", "Jami", "Status", "Action"],
      list.map(
        (item) => `
          <tr>
            <td><strong>${escapeHtml(item.customerName)}</strong><div class="muted-text">${escapeHtml(item.phone)}<br>${escapeHtml(item.orderType)} ${item.address ? `- ${escapeHtml(item.address)}` : ""}</div></td>
            <td>${(item.items || []).map((entry) => `${escapeHtml(entry.name)} x ${entry.qty}`).join("<br>")}</td>
            <td><strong>${fmtMoney(item.total)}</strong></td>
            <td><span class="status-pill">${escapeHtml(item.status)}</span></td>
            <td>${statusSelect(item.status, ["new", "confirmed", "preparing", "on_the_way", "completed", "cancelled"], "order", item._id)}</td>
          </tr>
        `
      )
    );
  }

  function renderReservations(list = []) {
    renderTable(
      "reservationsTable",
      ["Mijoz", "Bron", "Izoh", "Status", "Action"],
      list.map(
        (item) => `
          <tr>
            <td><strong>${escapeHtml(item.fullName)}</strong><div class="muted-text">${escapeHtml(item.phone)}<br>${escapeHtml(item.guests)} mehmon</div></td>
            <td>${escapeHtml(item.date)} ${escapeHtml(item.time)}</td>
            <td>${escapeHtml(item.notes || "-")}</td>
            <td><span class="status-pill">${escapeHtml(item.status)}</span></td>
            <td>${statusSelect(item.status, ["new", "approved", "completed", "cancelled"], "reservation", item._id)}</td>
          </tr>
        `
      )
    );
  }

  function renderApplications(list = []) {
    renderTable(
      "applicationsTable",
      ["Mijoz", "Yo'nalish", "Xabar", "Status", "Action"],
      list.map(
        (item) => `
          <tr>
            <td><strong>${escapeHtml(item.fullName)}</strong><div class="muted-text">${escapeHtml(item.phone)}</div></td>
            <td>${escapeHtml(item.purpose)}</td>
            <td>${escapeHtml(item.message || "-")}</td>
            <td><span class="status-pill">${escapeHtml(item.status)}</span></td>
            <td>${statusSelect(item.status, ["new", "reviewed", "accepted", "rejected"], "application", item._id)}</td>
          </tr>
        `
      )
    );
  }

  function renderImagePreview(targetId, url) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.innerHTML = url
      ? `<img src="${escapeHtml(url)}" alt="Preview" />`
      : `<div class="muted-text">Preview bu yerda ko'rinadi</div>`;
  }

  function renderProductsList(list = []) {
    $("#productsList").innerHTML = list
      .map(
        (item) => `
          <article class="list-item">
            ${item.image ? `<img class="thumb" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />` : ""}
            <div class="list-head">
              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <div class="list-meta">${escapeHtml(item.category || "")} - ${fmtMoney(item.price)} - ${escapeHtml(item.badge || "badge yo'q")}</div>
              </div>
              <div class="list-actions">
                <button class="ghost-button" data-edit-product="${item._id}" type="button">Edit</button>
                <button class="danger-button" data-delete-product="${item._id}" type="button">Delete</button>
              </div>
            </div>
            <div class="muted-text">${escapeHtml(item.description || "")}</div>
          </article>
        `
      )
      .join("");
  }

  function renderServicesList(list = []) {
    $("#servicesList").innerHTML = list
      .map(
        (item) => `
          <article class="list-item">
            ${item.image ? `<img class="thumb" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />` : ""}
            <div class="list-head">
              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <div class="list-meta">${escapeHtml(item.badge || "service")} - ${escapeHtml(item.priceLabel || "Custom")}</div>
              </div>
              <div class="list-actions">
                <button class="ghost-button" data-edit-service="${item._id}" type="button">Edit</button>
                <button class="danger-button" data-delete-service="${item._id}" type="button">Delete</button>
              </div>
            </div>
            <div class="muted-text">${escapeHtml(item.description || "")}</div>
          </article>
        `
      )
      .join("");
  }

  function resetProductForm() {
    const form = $("#productForm");
    form.reset();
    form.elements.id.value = "";
    form.elements.active.checked = true;
    renderImagePreview("productImagePreview", "");
  }

  function resetServiceForm() {
    const form = $("#serviceForm");
    form.reset();
    form.elements.id.value = "";
    form.elements.active.checked = true;
    renderImagePreview("serviceImagePreview", "");
  }

  function fillProductForm(item) {
    const form = $("#productForm");
    form.elements.id.value = item._id || "";
    form.elements.name.value = item.name || "";
    form.elements.price.value = item.price || "";
    form.elements.category.value = item.category || "";
    form.elements.badge.value = item.badge || "";
    form.elements.description.value = item.description || "";
    form.elements.image.value = item.image || "";
    form.elements.featured.checked = Boolean(item.featured);
    form.elements.active.checked = item.active !== false;
    renderImagePreview("productImagePreview", item.image || "");
  }

  function fillServiceForm(item) {
    const form = $("#serviceForm");
    form.elements.id.value = item._id || "";
    form.elements.name.value = item.name || "";
    form.elements.priceLabel.value = item.priceLabel || "";
    form.elements.badge.value = item.badge || "";
    form.elements.description.value = item.description || "";
    form.elements.image.value = item.image || "";
    form.elements.featured.checked = Boolean(item.featured);
    form.elements.active.checked = item.active !== false;
    renderImagePreview("serviceImagePreview", item.image || "");
  }

  function formatJson(value) {
    return JSON.stringify(value || [], null, 2);
  }

  function populateBrandingForm(branding = {}) {
    const form = $("#brandingForm");
    Object.entries(branding).forEach(([key, value]) => {
      if (form.elements[key]) {
        form.elements[key].value = value || "";
      }
    });
  }

  function populateContentForm(content = {}) {
    const form = $("#contentForm");
    form.elements.homeHeroEyebrow.value = content.home?.heroEyebrow || "";
    form.elements.homeStoryEyebrow.value = content.home?.storyEyebrow || "";
    form.elements.homeServicesEyebrow.value = content.home?.servicesEyebrow || "";
    form.elements.homeProcessEyebrow.value = content.home?.processEyebrow || "";
    form.elements.homeMenuEyebrow.value = content.home?.menuEyebrow || "";
    form.elements.homeTestimonialsEyebrow.value = content.home?.testimonialsEyebrow || "";
    form.elements.homeCtaEyebrow.value = content.home?.ctaEyebrow || "";
    form.elements.homeStoryTitle.value = content.home?.storyTitle || "";
    form.elements.homeStoryText.value = content.home?.storyText || "";
    form.elements.homeServicesTitle.value = content.home?.servicesTitle || "";
    form.elements.homeServicesText.value = content.home?.servicesText || "";
    form.elements.homeProcessTitle.value = content.home?.processTitle || "";
    form.elements.homeProcessText.value = content.home?.processText || "";
    form.elements.homeMenuTitle.value = content.home?.menuTitle || "";
    form.elements.homeTestimonialsTitle.value = content.home?.testimonialsTitle || "";
    form.elements.homeCtaTitle.value = content.home?.ctaTitle || "";
    form.elements.homeCtaText.value = content.home?.ctaText || "";
    form.elements.homeMetricsJson.value = formatJson(content.home?.metrics);
    form.elements.homeFeaturesJson.value = formatJson(content.home?.features);
    form.elements.homeProcessJson.value = formatJson(content.home?.process);
    form.elements.homeTestimonialsJson.value = formatJson(content.home?.testimonials);

    form.elements.bookingHeroEyebrow.value = content.booking?.heroEyebrow || "";
    form.elements.bookingUseCasesTitle.value = content.booking?.useCasesTitle || "";
    form.elements.bookingHeroTitle.value = content.booking?.heroTitle || "";
    form.elements.bookingHeroSubtitle.value = content.booking?.heroSubtitle || "";
    form.elements.bookingFormTitle.value = content.booking?.formTitle || "";
    form.elements.bookingFormText.value = content.booking?.formText || "";
    form.elements.bookingStatsJson.value = formatJson(content.booking?.stats);
    form.elements.bookingUseCasesJson.value = formatJson(content.booking?.useCases);

    form.elements.contactHeroEyebrow.value = content.contact?.heroEyebrow || "";
    form.elements.contactHeroTitle.value = content.contact?.heroTitle || "";
    form.elements.contactHeroSubtitle.value = content.contact?.heroSubtitle || "";
    form.elements.contactFormTitle.value = content.contact?.formTitle || "";
    form.elements.contactFormText.value = content.contact?.formText || "";
    form.elements.contactCardsJson.value = formatJson(content.contact?.contactCards);
    form.elements.contactBranchesJson.value = formatJson(content.contact?.branches);
  }

  function parseJsonField(label, raw) {
    try {
      const parsed = JSON.parse(raw || "[]");
      if (!Array.isArray(parsed)) {
        throw new Error("Array bo'lishi kerak");
      }
      return parsed;
    } catch (error) {
      throw new Error(`${label} JSON noto'g'ri: ${error.message}`);
    }
  }

  function buildContentPayload() {
    const form = $("#contentForm");
    return {
      home: {
        heroEyebrow: form.elements.homeHeroEyebrow.value,
        storyEyebrow: form.elements.homeStoryEyebrow.value,
        storyTitle: form.elements.homeStoryTitle.value,
        storyText: form.elements.homeStoryText.value,
        servicesEyebrow: form.elements.homeServicesEyebrow.value,
        servicesTitle: form.elements.homeServicesTitle.value,
        servicesText: form.elements.homeServicesText.value,
        processEyebrow: form.elements.homeProcessEyebrow.value,
        processTitle: form.elements.homeProcessTitle.value,
        processText: form.elements.homeProcessText.value,
        menuEyebrow: form.elements.homeMenuEyebrow.value,
        menuTitle: form.elements.homeMenuTitle.value,
        testimonialsEyebrow: form.elements.homeTestimonialsEyebrow.value,
        testimonialsTitle: form.elements.homeTestimonialsTitle.value,
        ctaEyebrow: form.elements.homeCtaEyebrow.value,
        ctaTitle: form.elements.homeCtaTitle.value,
        ctaText: form.elements.homeCtaText.value,
        metrics: parseJsonField("Home metrics", form.elements.homeMetricsJson.value),
        features: parseJsonField("Home features", form.elements.homeFeaturesJson.value),
        process: parseJsonField("Home process", form.elements.homeProcessJson.value),
        testimonials: parseJsonField("Home testimonials", form.elements.homeTestimonialsJson.value),
      },
      booking: {
        heroEyebrow: form.elements.bookingHeroEyebrow.value,
        heroTitle: form.elements.bookingHeroTitle.value,
        heroSubtitle: form.elements.bookingHeroSubtitle.value,
        formTitle: form.elements.bookingFormTitle.value,
        formText: form.elements.bookingFormText.value,
        useCasesTitle: form.elements.bookingUseCasesTitle.value,
        stats: parseJsonField("Booking stats", form.elements.bookingStatsJson.value),
        useCases: parseJsonField("Booking use cases", form.elements.bookingUseCasesJson.value),
      },
      contact: {
        heroEyebrow: form.elements.contactHeroEyebrow.value,
        heroTitle: form.elements.contactHeroTitle.value,
        heroSubtitle: form.elements.contactHeroSubtitle.value,
        formTitle: form.elements.contactFormTitle.value,
        formText: form.elements.contactFormText.value,
        contactCards: parseJsonField("Contact cards", form.elements.contactCardsJson.value),
        branches: parseJsonField("Contact branches", form.elements.contactBranchesJson.value),
      },
    };
  }

  async function loadDashboard() {
    const data = await request("/api/admin/dashboard");
    state.dashboard = data;
    setStatusBadges(data);
    renderStats(data.stats);
    renderOrders(data.orders || []);
    renderReservations(data.reservations || []);
    renderApplications(data.applications || []);
    renderProductsList(data.menu || []);
    renderServicesList(data.services || []);
    populateBrandingForm(data.branding || {});
    populateContentForm(data.websiteContent || {});
  }

  async function updateStatus(type, id, status) {
    const routeMap = {
      order: `/api/admin/orders/${id}`,
      reservation: `/api/admin/reservations/${id}`,
      application: `/api/admin/applications/${id}`,
    };
    await request(routeMap[type], {
      method: "PUT",
      body: { status },
    });
    await loadDashboard();
    showToast("Status yangilandi.");
  }

  async function uploadImage(form, targetName, folder) {
    const file = form.elements.imageFile.files?.[0];
    if (!file) {
      throw new Error("Avval rasm faylini tanlang");
    }

    const payload = new FormData();
    payload.append("file", file);
    payload.append("folder", folder);
    const response = await request("/api/admin/uploads", {
      method: "POST",
      body: payload,
    });
    form.elements[targetName].value = response.asset.url;
    return response.asset.url;
  }

  function switchTab(tabName) {
    $$(".tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
    $$(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `panel-${tabName}`));
  }

  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const data = await request("/api/admin/login", {
        method: "POST",
        body: payload,
        headers: { "x-admin-token": "" },
      });
      state.adminToken = data.token;
      localStorage.setItem("scarlet_admin_token", data.token);
      setLoggedIn(true);
      await loadDashboard();
      showToast("Admin panelga kirildi.");
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("scarlet_admin_token");
    state.adminToken = "";
    state.dashboard = null;
    setLoggedIn(false);
    showToast("Chiqildi.");
  });

  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  $("#ordersTable").addEventListener("change", async (event) => {
    const select = event.target.closest("[data-status-type]");
    if (!select) return;
    try {
      await updateStatus(select.dataset.statusType, select.dataset.id, select.value);
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#reservationsTable").addEventListener("change", async (event) => {
    const select = event.target.closest("[data-status-type]");
    if (!select) return;
    try {
      await updateStatus(select.dataset.statusType, select.dataset.id, select.value);
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#applicationsTable").addEventListener("change", async (event) => {
    const select = event.target.closest("[data-status-type]");
    if (!select) return;
    try {
      await updateStatus(select.dataset.statusType, select.dataset.id, select.value);
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#resetProductForm").addEventListener("click", resetProductForm);
  $("#resetServiceForm").addEventListener("click", resetServiceForm);

  $("#productForm").elements.image.addEventListener("input", (event) => {
    renderImagePreview("productImagePreview", event.target.value);
  });

  $("#serviceForm").elements.image.addEventListener("input", (event) => {
    renderImagePreview("serviceImagePreview", event.target.value);
  });

  $$("[data-upload-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = button.dataset.uploadTarget;
      const form = target === "product" ? $("#productForm") : $("#serviceForm");
      const previewId = target === "product" ? "productImagePreview" : "serviceImagePreview";
      try {
        const imageUrl = await uploadImage(form, "image", target === "product" ? "products" : "services");
        renderImagePreview(previewId, imageUrl);
        showToast("Rasm yuklandi.");
      } catch (error) {
        showToast(error.message);
      }
    });
  });

  $("#productForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      name: form.elements.name.value,
      price: Number(form.elements.price.value),
      category: form.elements.category.value,
      badge: form.elements.badge.value,
      description: form.elements.description.value,
      image: form.elements.image.value,
      featured: form.elements.featured.checked,
      active: form.elements.active.checked,
    };

    try {
      const id = form.elements.id.value;
      await request(id ? `/api/admin/menu/${id}` : "/api/admin/menu", {
        method: id ? "PUT" : "POST",
        body: payload,
      });
      resetProductForm();
      await loadDashboard();
      showToast(id ? "Mahsulot yangilandi." : "Mahsulot qo'shildi.");
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#serviceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      name: form.elements.name.value,
      priceLabel: form.elements.priceLabel.value,
      badge: form.elements.badge.value,
      description: form.elements.description.value,
      image: form.elements.image.value,
      featured: form.elements.featured.checked,
      active: form.elements.active.checked,
    };

    try {
      const id = form.elements.id.value;
      await request(id ? `/api/admin/services/${id}` : "/api/admin/services", {
        method: id ? "PUT" : "POST",
        body: payload,
      });
      resetServiceForm();
      await loadDashboard();
      showToast(id ? "Xizmat yangilandi." : "Xizmat qo'shildi.");
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#productsList").addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-product]");
    if (editButton) {
      const item = (state.dashboard?.menu || []).find((entry) => entry._id === editButton.dataset.editProduct);
      if (item) fillProductForm(item);
      switchTab("products");
      return;
    }

    const deleteButton = event.target.closest("[data-delete-product]");
    if (!deleteButton) return;
    try {
      await request(`/api/admin/menu/${deleteButton.dataset.deleteProduct}`, {
        method: "DELETE",
      });
      await loadDashboard();
      showToast("Mahsulot o'chirildi.");
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#servicesList").addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-service]");
    if (editButton) {
      const item = (state.dashboard?.services || []).find((entry) => entry._id === editButton.dataset.editService);
      if (item) fillServiceForm(item);
      switchTab("services");
      return;
    }

    const deleteButton = event.target.closest("[data-delete-service]");
    if (!deleteButton) return;
    try {
      await request(`/api/admin/services/${deleteButton.dataset.deleteService}`, {
        method: "DELETE",
      });
      await loadDashboard();
      showToast("Xizmat o'chirildi.");
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#brandingForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await request("/api/admin/branding", {
        method: "PUT",
        body: payload,
      });
      await loadDashboard();
      showToast("Branding saqlandi.");
    } catch (error) {
      showToast(error.message);
    }
  });

  $("#contentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = buildContentPayload();
      await request("/api/admin/site-content", {
        method: "PUT",
        body: payload,
      });
      await loadDashboard();
      showToast("Website kontenti saqlandi.");
    } catch (error) {
      showToast(error.message);
    }
  });

  (async function init() {
    if (!state.adminToken) {
      setLoggedIn(false);
      return;
    }

    try {
      setLoggedIn(true);
      await loadDashboard();
    } catch (error) {
      localStorage.removeItem("scarlet_admin_token");
      state.adminToken = "";
      setLoggedIn(false);
      showToast(error.message);
    }
  })();
})();
