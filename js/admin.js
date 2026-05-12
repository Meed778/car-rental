const ADMIN_PASSWORD = "mohamedberak1999";
const ADMIN_STORAGE_KEY = "tngdrive_admin_data";
const ADMIN_SETTINGS_KEY = "tngdrive_admin_settings";

const AdminApp = {
  isAuthenticated: false,
  editingCarId: null,
  currentTab: "cars",

  init() {
    this.checkAuth();
    window.addEventListener("hashchange", () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash;
    if (hash === "#admin") {
      this.showAdminPanel();
    } else if (hash === "#admin-login") {
      this.showLogin();
    }
  },

  checkAuth() {
    this.isAuthenticated = sessionStorage.getItem("tngdrive_admin_auth") === "true";
  },

  showLogin() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="admin-login-wrapper">
        <div class="admin-login-card">
          <div class="admin-login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 class="admin-login-title">لوحة التحكم</h2>
          <p class="admin-login-desc">يرجى إدخال كلمة المرور للدخول</p>
          <div class="admin-login-form">
            <input type="password" class="form-input" id="adminPasswordInput" placeholder="كلمة المرور" style="text-align:center;font-size:1.1rem">
            <div id="adminLoginError" style="color:#ef4444;font-size:0.85rem;text-align:center;display:none">كلمة المرور غير صحيحة</div>
            <button class="btn-primary" id="adminLoginBtn" style="width:100%;justify-content:center;margin-top:8px" onclick="AdminApp.login()">دخول</button>
          </div>
          <a href="#" class="admin-back-link" onclick="window.location.hash=''">← الرجوع للرئيسية</a>
        </div>
      </div>
    `;
    document.getElementById("adminPasswordInput").addEventListener("keydown", e => {
      if (e.key === "Enter") AdminApp.login();
    });
  },

  login() {
    const pw = document.getElementById("adminPasswordInput").value;
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("tngdrive_admin_auth", "true");
      this.isAuthenticated = true;
      window.location.hash = "admin";
    } else {
      const err = document.getElementById("adminLoginError");
      if (err) err.style.display = "block";
    }
  },

  logout() {
    sessionStorage.removeItem("tngdrive_admin_auth");
    this.isAuthenticated = false;
    window.location.hash = "";
    window.location.reload();
  },

  showAdminPanel() {
    if (!this.isAuthenticated) {
      window.location.hash = "admin-login";
      return;
    }

    document.getElementById("app").innerHTML = `
      <div class="admin-panel">
        <nav class="admin-nav">
          <div class="container" style="display:flex;justify-content:space-between;align-items:center">
            <h2 style="color:var(--white);font-size:1.1rem">لوحة التحكم — TNG Drive</h2>
            <div style="display:flex;gap:12px">
              <a href="#" class="admin-nav-link" onclick="window.location.hash=''">عرض الموقع</a>
              <button class="admin-nav-link" onclick="AdminApp.logout()" style="color:#ef4444">تسجيل خروج</button>
            </div>
          </div>
        </nav>
        <div class="container" style="padding-top:100px">
          <div class="admin-tabs">
            <button class="admin-tab ${this.currentTab === 'cars' ? 'active' : ''}" onclick="AdminApp.switchTab('cars')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>
              السيارات
            </button>
            <button class="admin-tab ${this.currentTab === 'settings' ? 'active' : ''}" onclick="AdminApp.switchTab('settings')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              الإعدادات
            </button>
          </div>
          <div id="adminTabContent"></div>
        </div>
      </div>
      <div class="modal-overlay" id="adminCarModal" onclick="if(event.target===this)AdminApp.closeCarForm()">
        <div class="modal-container" style="max-width:700px">
          <button class="modal-close" onclick="AdminApp.closeCarForm()">&times;</button>
          <div id="adminCarFormContent"></div>
        </div>
      </div>
    `;
    this.renderTabContent();
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll(".admin-tab").forEach(t => t.classList.toggle("active", t.textContent.includes(tab === "cars" ? "السيارات" : "الإعدادات")));
    this.renderTabContent();
  },

  renderTabContent() {
    if (this.currentTab === "cars") {
      document.getElementById("adminTabContent").innerHTML = `
        <div class="admin-toolbar">
          <h3 class="section-title" style="margin-bottom:0">إدارة السيارات</h3>
          <button class="btn-primary" onclick="AdminApp.showCarForm()">+ إضافة سيارة</button>
        </div>
        <div id="adminCarsList"></div>
      `;
      this.renderCarsList();
    } else if (this.currentTab === "settings") {
      this.renderSettings();
    }
  },

  /* ========== Cars Management ========== */

  getCars() {
    try { const stored = localStorage.getItem(ADMIN_STORAGE_KEY); return stored ? JSON.parse(stored) : []; }
    catch { return []; }
  },

  saveCars(cars) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(cars));
    window.__CARS_DATA__ = cars;
  },

  renderCarsList() {
    const container = document.getElementById("adminCarsList");
    const cars = this.getCars();

    if (cars.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:60px 20px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>
          <p style="color:var(--gray-400);margin-top:12px">لا توجد سيارات مضافة بعد</p>
          <p style="color:var(--gray-500);font-size:0.85rem">السيارات المعروضة حالياً من ملف data.json</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="admin-table">
        <div class="admin-table-header"><span>الصورة</span><span>الموديل</span><span>الفئة</span><span>السعر</span><span>متاحة</span><span>إجراءات</span></div>
        ${cars.map(car => `
          <div class="admin-table-row">
            <div>${car.image && car.image.startsWith("data:") ? `<img src="${car.image}" alt="${car.brand}" class="admin-thumb">` : `<div class="admin-thumb admin-thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`}</div>
            <span class="admin-car-name">${car.brand} ${car.model} (${car.year})</span>
            <span class="admin-badge category">${car.category}</span>
            <span style="color:var(--primary);font-weight:600">${car.pricePerDay} ${car.currency}</span>
            <span class="admin-badge ${car.available ? 'available' : 'unavailable'}">${car.available ? 'نعم' : 'لا'}</span>
            <div class="admin-actions">
              <button class="admin-btn-icon edit" onclick="AdminApp.editCar('${car.id}')" title="تعديل"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="admin-btn-icon delete" onclick="AdminApp.deleteCar('${car.id}')" title="حذف"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  showCarForm(carData) {
    const modal = document.getElementById("adminCarModal");
    if (!modal) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    const isEdit = !!carData;
    const car = carData || { id: "car-" + Date.now(), brand: "", model: "", year: new Date().getFullYear(), category: "economy", transmission: "Automatic", fuel: "Gasoline", seats: 5, doors: 4, pricePerDay: "", currency: "MAD", image: "", features: [], available: true, promo: false };
    this.editingCarId = isEdit ? car.id : null;

    document.getElementById("adminCarFormContent").innerHTML = `
      <h3 class="step-title">${isEdit ? 'تعديل السيارة' : 'إضافة سيارة جديدة'}</h3>
      <div class="admin-form-grid">
        <div class="form-group"><label class="form-label">العلامة التجارية</label><input type="text" class="form-input" id="af_brand" value="${car.brand}" placeholder="مثال: Mercedes-Benz"></div>
        <div class="form-group"><label class="form-label">الموديل</label><input type="text" class="form-input" id="af_model" value="${car.model}" placeholder="مثال: C300 AMG"></div>
        <div class="form-group"><label class="form-label">السنة</label><input type="number" class="form-input" id="af_year" value="${car.year}"></div>
        <div class="form-group"><label class="form-label">الفئة</label><select class="form-select" id="af_category">${["luxury","suv","sport","economy"].map(c => `<option value="${c}" ${car.category === c ? 'selected' : ''}>${({luxury:"فاخرة",suv:"SUV",sport:"رياضية",economy:"اقتصادية"})[c]}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">ناقل الحركة</label><select class="form-select" id="af_transmission"><option value="Automatic" ${car.transmission === 'Automatic' ? 'selected' : ''}>أوتوماتيك</option><option value="Manual" ${car.transmission === 'Manual' ? 'selected' : ''}>يدوي</option></select></div>
        <div class="form-group"><label class="form-label">الوقود</label><select class="form-select" id="af_fuel"><option value="Gasoline" ${car.fuel === 'Gasoline' ? 'selected' : ''}>بنزين</option><option value="Diesel" ${car.fuel === 'Diesel' ? 'selected' : ''}>ديزل</option><option value="Hybrid" ${car.fuel === 'Hybrid' ? 'selected' : ''}>هايبرد</option><option value="Electric" ${car.fuel === 'Electric' ? 'selected' : ''}>كهربائي</option></select></div>
        <div class="form-group"><label class="form-label">عدد المقاعد</label><input type="number" class="form-input" id="af_seats" value="${car.seats}" min="2" max="9"></div>
        <div class="form-group"><label class="form-label">عدد الأبواب</label><input type="number" class="form-input" id="af_doors" value="${car.doors}" min="2" max="6"></div>
        <div class="form-group"><label class="form-label">السعر لليوم</label><input type="number" class="form-input" id="af_price" value="${car.pricePerDay}" placeholder="مثال: 850"></div>
        <div class="form-group"><label class="form-label">العملة</label><select class="form-select" id="af_currency"><option value="MAD" ${car.currency === 'MAD' ? 'selected' : ''}>درهم (MAD)</option><option value="EUR" ${car.currency === 'EUR' ? 'selected' : ''}>يورو (EUR)</option><option value="USD" ${car.currency === 'USD' ? 'selected' : ''}>دولار (USD)</option></select></div>
        <div class="form-group"><label class="form-label">المميزات (واحد بكل سطر)</label><textarea class="form-textarea" id="af_features" rows="4" placeholder="Apple CarPlay&#10;سقف بانورامي&#10;مقاعد جلد">${car.features.join("\n")}</textarea></div>
        <div class="form-group" style="grid-column:span 2">
          <label class="form-label">صورة السيارة</label>
          <div class="admin-upload-area" id="adminUploadArea">
            <input type="file" accept="image/*" id="af_imageInput" style="display:none">
            <div id="adminUploadPlaceholder" style="${car.image && !car.image.startsWith('data:') ? 'display:none' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;opacity:0.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p style="color:var(--gray-400);margin-top:8px">اختر صورة من جهازك</p><span style="color:var(--gray-500);font-size:0.8rem">تنسيق JPG, PNG, WebP</span></div>
            <div id="adminUploadPreview" style="${car.image && car.image.startsWith('data:') ? '' : 'display:none'};position:relative"><img id="af_imagePreview" src="${car.image && car.image.startsWith('data:') ? car.image : ''}" style="max-height:200px;border-radius:8px"><button type="button" onclick="AdminApp.removeUploadedImage()" style="position:absolute;top:-8px;left:-8px;width:28px;height:28px;border-radius:50%;background:#ef4444;color:#fff;display:flex;align-items:center;justify-content:center;font-size:1rem">&times;</button></div>
          </div>
          <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap">
            <label class="btn-secondary" style="cursor:pointer;padding:8px 16px;font-size:0.85rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> رفع صورة<input type="file" accept="image/*" onchange="AdminApp.handleImageUpload(event)" style="display:none"></label>
            <button type="button" class="btn-secondary" style="padding:8px 16px;font-size:0.85rem" onclick="AdminApp.useUrlImage()">استخدام رابط URL</button>
          </div>
          <input type="text" class="form-input" id="af_imageUrl" placeholder="أو الصق رابط الصورة هنا..." style="margin-top:8px;display:none">
        </div>
        <div class="form-group" style="grid-column:span 2">
          <div style="display:flex;gap:20px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="af_available" ${car.available ? 'checked' : ''}><span style="color:var(--gray-300)">متاحة للحجز</span></label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="af_promo" ${car.promo ? 'checked' : ''}><span style="color:var(--gray-300)">عرض خاص</span></label>
          </div>
        </div>
      </div>
      <div class="form-actions" style="margin-top:24px"><button class="btn-secondary" onclick="AdminApp.closeCarForm()">إلغاء</button><button class="btn-primary" onclick="AdminApp.saveCar()">${isEdit ? 'حفظ التعديلات' : 'إضافة السيارة'}</button></div>
    `;

    document.getElementById("adminUploadArea").addEventListener("click", () => document.getElementById("af_imageInput").click());
    document.getElementById("af_imageInput").addEventListener("change", (e) => AdminApp.handleImageUpload(e));
  },

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("حجم الصورة كبير جداً. الرجاء اختيار صورة أقل من 5 ميجابايت"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("adminUploadPlaceholder").style.display = "none";
      const preview = document.getElementById("adminUploadPreview");
      preview.style.display = "block";
      document.getElementById("af_imagePreview").src = e.target.result;
      document.getElementById("af_imagePreview").dataset.base64 = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  removeUploadedImage() {
    document.getElementById("adminUploadPlaceholder").style.display = "block";
    document.getElementById("adminUploadPreview").style.display = "none";
    document.getElementById("af_imagePreview").src = "";
    delete document.getElementById("af_imagePreview").dataset.base64;
  },

  useUrlImage() { const input = document.getElementById("af_imageUrl"); input.style.display = input.style.display === "none" ? "block" : "none"; if (input.style.display === "block") input.focus(); },

  saveCar() {
    const imgPreview = document.getElementById("af_imagePreview");
    const image = imgPreview?.dataset?.base64 || document.getElementById("af_imageUrl")?.value?.trim() || "";
    const features = document.getElementById("af_features").value.split("\n").map(f => f.trim()).filter(f => f);

    const car = {
      id: this.editingCarId || "car-" + Date.now(),
      brand: document.getElementById("af_brand").value.trim(),
      model: document.getElementById("af_model").value.trim(),
      year: parseInt(document.getElementById("af_year").value) || new Date().getFullYear(),
      category: document.getElementById("af_category").value,
      transmission: document.getElementById("af_transmission").value,
      fuel: document.getElementById("af_fuel").value,
      seats: parseInt(document.getElementById("af_seats").value) || 5,
      doors: parseInt(document.getElementById("af_doors").value) || 4,
      pricePerDay: parseInt(document.getElementById("af_price").value) || 0,
      currency: document.getElementById("af_currency").value,
      image, features,
      available: document.getElementById("af_available").checked,
      promo: document.getElementById("af_promo").checked
    };

    if (!car.brand || !car.model || car.pricePerDay <= 0) { alert("يرجى ملء الحقول الأساسية: العلامة التجارية، الموديل، والسعر"); return; }

    let cars = this.getCars();
    if (this.editingCarId) { const idx = cars.findIndex(c => c.id === this.editingCarId); if (idx !== -1) cars[idx] = car; }
    else { cars.push(car); }

    this.saveCars(cars);
    this.closeCarForm();
    this.renderCarsList();
  },

  editCar(carId) { const car = this.getCars().find(c => c.id === carId); if (car) this.showCarForm(car); },

  deleteCar(carId) {
    if (!confirm("هل أنت متأكد من حذف هذه السيارة؟")) return;
    const cars = this.getCars().filter(c => c.id !== carId);
    this.saveCars(cars);
    this.renderCarsList();
  },

  closeCarForm() { const modal = document.getElementById("adminCarModal"); if (modal) modal.classList.remove("active"); document.body.style.overflow = ""; this.editingCarId = null; },

  /* ========== Settings Management ========== */

  getDefaultSettings() {
    return {
      name: "TNG Drive",
      tagline: "كراء سيارات في طنجة",
      phone: "212709497098",
      whatsapp: "212709497098",
      email: "pimo1999loko@gmail.com",
      instagram: "https://www.instagram.com/tng_drive",
      address: "شارع محمد السادس، طنجة، المغرب",
      workingHours: "08:00 - 22:00",
      banner_enabled: true,
      banner_title: "تخفيضات الصيف 🎉",
      banner_desc: "احجز الآن واحصل على خصم 20% على جميع السيارات الفاخرة. عرض لفترة محدودة!",
      banner_btn_text: "استعرض العروض",
      banner_btn_link: "#cars",
      banner_bg: "linear-gradient(135deg, #1a1a2e, #c8a45c)"
    };
  },

  getSettings() {
    try { const stored = localStorage.getItem(ADMIN_SETTINGS_KEY); return stored ? { ...this.getDefaultSettings(), ...JSON.parse(stored) } : this.getDefaultSettings(); }
    catch { return this.getDefaultSettings(); }
  },

  saveSettings(settings) {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    window.__COMPANY_DATA__ = settings;
  },

  renderSettings() {
    const s = this.getSettings();
    document.getElementById("adminTabContent").innerHTML = `
      <h3 class="section-title" style="margin-bottom:24px">إعدادات الموقع</h3>
      <div class="admin-settings-card">
        <div class="admin-form-grid">
          <div class="form-group"><label class="form-label">اسم الشركة</label><input type="text" class="form-input" id="as_name" value="${s.name}"></div>
          <div class="form-group"><label class="form-label">الشعار</label><input type="text" class="form-input" id="as_tagline" value="${s.tagline}"></div>
          <div class="form-group"><label class="form-label">رقم الهاتف</label><input type="text" class="form-input" id="as_phone" value="${s.phone}" dir="ltr"></div>
          <div class="form-group"><label class="form-label">رقم واتساب</label><input type="text" class="form-input" id="as_whatsapp" value="${s.whatsapp}" dir="ltr"></div>
          <div class="form-group"><label class="form-label">البريد الإلكتروني</label><input type="email" class="form-input" id="as_email" value="${s.email}" dir="ltr"></div>
          <div class="form-group"><label class="form-label">رابط إنستغرام</label><input type="url" class="form-input" id="as_instagram" value="${s.instagram}" dir="ltr"></div>
          <div class="form-group" style="grid-column:span 2"><label class="form-label">العنوان</label><input type="text" class="form-input" id="as_address" value="${s.address}"></div>
          <div class="form-group" style="grid-column:span 2"><label class="form-label">ساعات العمل</label><input type="text" class="form-input" id="as_hours" value="${s.workingHours}"></div>
        </div>
        <h4 style="color:var(--white);margin:24px 0 16px;font-size:1.1rem">🏆 البانر الإعلاني</h4>
        <div class="admin-form-grid">
          <div class="form-group" style="grid-column:span 2">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="as_banner_enabled" ${s.banner_enabled ? 'checked' : ''}><span style="color:var(--gray-300)">تفعيل البانر</span></label>
          </div>
          <div class="form-group" style="grid-column:span 2"><label class="form-label">عنوان البانر</label><input type="text" class="form-input" id="as_banner_title" value="${s.banner_title}"></div>
          <div class="form-group" style="grid-column:span 2"><label class="form-label">وصف البانر</label><textarea class="form-textarea" id="as_banner_desc" rows="2">${s.banner_desc}</textarea></div>
          <div class="form-group"><label class="form-label">نص الزر</label><input type="text" class="form-input" id="as_banner_btn_text" value="${s.banner_btn_text}"></div>
          <div class="form-group"><label class="form-label">رابط الزر</label><input type="text" class="form-input" id="as_banner_btn_link" value="${s.banner_btn_link}" dir="ltr"></div>
          <div class="form-group" style="grid-column:span 2"><label class="form-label">لون الخلفية (CSS)</label><input type="text" class="form-input" id="as_banner_bg" value="${s.banner_bg}" dir="ltr" placeholder="مثال: linear-gradient(...) أو #hex"></div>
        </div>
        <div style="margin-top:24px;display:flex;gap:12px">
          <button class="btn-primary" onclick="AdminApp.saveSettingsForm()" style="justify-content:center">💾 حفظ الإعدادات</button>
          <button class="btn-secondary" onclick="AdminApp.resetSettings()" style="justify-content:center">🔄 استعادة الإعدادات الافتراضية</button>
        </div>
        <div id="settingsSaveMsg" style="margin-top:12px;font-size:0.9rem;color:#22c55e;display:none">✅ تم حفظ الإعدادات بنجاح</div>
      </div>
    `;
  },

  saveSettingsForm() {
    const settings = {
      name: document.getElementById("as_name").value.trim(),
      tagline: document.getElementById("as_tagline").value.trim(),
      phone: document.getElementById("as_phone").value.trim(),
      whatsapp: document.getElementById("as_whatsapp").value.trim(),
      email: document.getElementById("as_email").value.trim(),
      instagram: document.getElementById("as_instagram").value.trim(),
      address: document.getElementById("as_address").value.trim(),
      workingHours: document.getElementById("as_hours").value.trim(),
      banner_enabled: document.getElementById("as_banner_enabled").checked,
      banner_title: document.getElementById("as_banner_title").value.trim(),
      banner_desc: document.getElementById("as_banner_desc").value.trim(),
      banner_btn_text: document.getElementById("as_banner_btn_text").value.trim(),
      banner_btn_link: document.getElementById("as_banner_btn_link").value.trim(),
      banner_bg: document.getElementById("as_banner_bg").value.trim()
    };

    this.saveSettings(settings);

    const msg = document.getElementById("settingsSaveMsg");
    if (msg) { msg.style.display = "block"; setTimeout(() => msg.style.display = "none", 3000); }
  },

  resetSettings() {
    if (!confirm("هل تريد استعادة الإعدادات الافتراضية؟")) return;
    localStorage.removeItem(ADMIN_SETTINGS_KEY);
    const def = this.getDefaultSettings();
    this.saveSettings(def);
    this.renderSettings();
  }
};

document.addEventListener("DOMContentLoaded", () => AdminApp.init());
