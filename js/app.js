/**
 * app.js — التطبيق الرئيسي (Main Application Controller)
 * 
 * هذا الملف هو قلب التطبيق، يتحكم في كل شيء:
 * - تحميل البيانات من JSON
 * - إدارة الحالة (State Management)
 * - التنقل بين أقسام الصفحة
 * - التحكم في النافذة المنبثقة (Modal)
 * 
 * 🏗 هيكلة قابلة للتوسع:
 * - استبدل loadJSON() بـ fetch() من API لاحقاً
 * - استخدم LocalStorage هنا للتخزين المؤقت
 */

/* =========================================================
   Google Sheets URL — غيّر الرابط برابط الـ CSV المنشور
   =========================================================
   انشر ملف Google Sheet كـ CSV:
   File > Share > Publish to web > Entire Document > CSV
   ========================================================= */
const SHEET_URL = ""; // اتركه فارغاً لاستخدام data.json محلياً

/* =========================================================
   Google Form URL — للإحصائيات (تسجيل النقرات)
   =========================================================
   أنشئ Google Form: حقل واحد "car_name" (نص قصير)
   ثم انسخ رابط الإرسال الخاص بالنموذج
   ========================================================= */
const ANALYTICS_FORM_URL = ""; // اتركه فارغاً لتعطيل الإحصائيات

const CarRentalApp = {

  /* ========== الحالة (State) ========== */
  state: {
    cars: [],
    company: {
      name: "TNG Drive",
      tagline: "كراء سيارات في طنجة",
      phone: "212709497098",
      whatsapp: "212709497098",
      email: "pimo1999loko@gmail.com",
      address: "شارع محمد السادس، طنجة، المغرب",
      workingHours: "08:00 - 22:00",
      instagram: "https://www.instagram.com/tng_drive"
    },
    testimonials: [],
    currentFilter: 'all',
    bookingStep: 1,
    selectedCarId: null,
    isModalOpen: false
  },

  /* ========== دالة البدء (Initialization) ========== */

  /**
   * بدء التطبيق — تُستدعى عند تحميل الصفحة
   */
  async init() {
    try {
      await this.loadData();
      this.injectCarSchema(this.state.cars);
      this.renderApp();
      this.bindEvents();
      this.initSmoothScroll();
      console.log('✅ TNG Drive — التطبيق يعمل بنجاح');
      console.log('📊 اكتب CarRentalApp.showStats() لعرض الإحصائيات');
    } catch (error) {
      console.error('❌ فشل تحميل التطبيق:', error);
      document.getElementById('app').innerHTML = `
        <div class="error-screen">
          <h2>عذراً، حدث خطأ في تحميل الصفحة</h2>
          <p>الرجاء تحديث الصفحة أو المحاولة لاحقاً</p>
          <button onclick="location.reload()">تحديث الصفحة</button>
        </div>
      `;
    }
  },

  /**
   * تحميل البيانات — من Google Sheets (CSV) أو data.json
   * 
   * 🚀 احترافية مجانية:
   * املأ SHEET_URL أعلاه برابط CSV من Google Sheets
   * لتعديل السيارات من هاتفك دون لمس الكود
   */
  async loadData() {
    let cars = [];

    // 1. الأولوية القصوى: إعدادات الأدمن من localStorage
    const savedSettings = localStorage.getItem('tngdrive_admin_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.name) {
          this.state.company = { ...this.state.company, ...parsed };
          console.log('✅ تم تحميل الإعدادات من لوحة التحكم');
        }
      } catch (e) {
        console.warn('⚠️ فشل تحميل إعدادات الأدمن');
      }
    }

    // 1. بيانات الأدمن من localStorage
    const adminData = localStorage.getItem('tngdrive_admin_data');
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        if (parsed.length > 0) {
          cars = parsed;
          console.log(`✅ تم تحميل ${cars.length} سيارة من لوحة التحكم`);
        }
      } catch (e) {
        console.warn('⚠️ فشل تحميل بيانات الأدمن');
      }
    }

    // 2. Google Sheets (إذا تم تفعيله)
    if (cars.length === 0 && SHEET_URL && typeof PapaParse !== 'undefined') {
      try {
        const res = await fetch(SHEET_URL);
        const csv = await res.text();
        const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

        const today = new Date().toISOString().split('T')[0];

        cars = parsed.data
          .filter(row => {
            if (row.active !== "TRUE" || !row.name) return false;
            if (row.booked_until && row.booked_until >= today) return false;
            return true;
          })
          .map(row => ({
            id: row.id || `car-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            brand: (row.name || '').split(' ')[0] || row.name,
            model: (row.name || '').split(' ').slice(1).join(' ') || '',
            year: new Date().getFullYear(),
            category: 'economy',
            transmission: 'Automatic',
            fuel: (row.specs || '').includes('Diesel') ? 'Diesel' : 'Gasoline',
            seats: 5,
            doors: 4,
            pricePerDay: parseInt(row.price) || 200,
            currency: 'MAD',
            image: row.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80',
            features: (row.specs || '').split(',').map(s => s.trim()),
            bookedUntil: row.booked_until || '',
            available: true,
            promo: false
          }));

        console.log(`✅ تم تحميل ${cars.length} سيارة من Google Sheets`);
      } catch (e) {
        console.warn('⚠️ فشل تحميل Google Sheets, نستخدم data.json');
      }
    }

    // 3. fallback إلى الملف المحلي data.json
    if (cars.length === 0) {
      const res = await fetch('js/data.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cars = data.cars;
      this.state.company = { ...this.state.company, ...data.company };
      this.state.testimonials = data.testimonials || [];
    }

    this.state.cars = cars;

    // تخزين عام للمكونات الأخرى
    window.__CARS_DATA__ = cars;
    window.__COMPANY_DATA__ = this.state.company;
  },

  /* ========== السيو المتقدم (SEO) ========== */

  /**
   * إضافة Schema للسيارات برمجياً (ItemList + Product)
   */
  injectCarSchema(cars) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": cars.map((car, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": `${car.brand} ${car.model}`,
          "description": `كراء سيارة ${car.brand} ${car.model} موديل ${car.year} في طنجة بأفضل سعر.`,
          "image": car.image,
          "offers": {
            "@type": "Offer",
            "priceCurrency": car.currency,
            "price": car.pricePerDay,
            "availability": car.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }
      }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  },

  /* ========== نظام الإحصائيات (Analytics) ========== */

  /**
   * تسجيل نقرة على سيارة — تخزين محلي + إرسال إلى Google Form
   */
  trackClick(carId) {
    const car = this.state.cars.find(c => c.id === carId);
    if (!car) return;

    const carName = `${car.brand} ${car.model}`;

    // تخزين محلي (localStorage)
    const stats = this.getLocalStats();
    stats[carId] = stats[carId] || { name: carName, clicks: 0 };
    stats[carId].clicks += 1;
    stats[carId].lastClick = new Date().toISOString();
    localStorage.setItem('tngdrive_stats', JSON.stringify(stats));

    // إرسال إلى Google Form (إذا تم تعيين الرابط)
    if (ANALYTICS_FORM_URL) {
      try {
        const formData = new FormData();
        formData.append('car_name', carName);
        navigator.sendBeacon(ANALYTICS_FORM_URL, formData);
      } catch (e) {
        console.warn('⚠️ فشل إرسال الإحصائية');
      }
    }
  },

  /**
   * قراءة الإحصائيات من localStorage
   */
  getLocalStats() {
    try {
      return JSON.parse(localStorage.getItem('tngdrive_stats')) || {};
    } catch {
      return {};
    }
  },

  /**
   * عرض الإحصائيات في Console (للمالك)
   */
  showStats() {
    const stats = this.getLocalStats();
    const sorted = Object.entries(stats).sort((a, b) => b[1].clicks - a[1].clicks);
    console.log('📊 إحصائيات TNG Drive:');
    console.log('═══════════════════════');
    sorted.forEach(([id, data]) => {
      console.log(`  ${data.name}: ${data.clicks} نقرة`);
    });
    console.log('═══════════════════════');
    return sorted;
  },

  /* ========== التصيير (Rendering) ========== */

  /**
   * تصيير التطبيق بالكامل
   */
  renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = this.buildLayout();
    this.renderCarsSection();
    this.renderTestimonials();
    this.renderFooter();
  },

  /**
   * بناء هيكل الصفحة الأساسي
   */
  buildLayout() {
    const { company } = this.state;
    return `
      ${this.buildNavbar(company)}
      ${this.buildHero(company)}
      ${this.buildBanner(company)}
      <main>
        ${this.buildCarsSection()}
        ${this.buildHowItWorks()}
        ${this.buildTestimonialsSection()}
        ${this.buildContactSection(company)}
      </main>
      ${CarRentalComponents.createBookingModal()}
      <a href="https://wa.me/${company.whatsapp}" target="_blank" class="whatsapp-float" aria-label="واتساب">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
      <div id="toastContainer"></div>
    `;
  },

  /* ========== أقسام الصفحة (Sections) ========== */

  /**
   * الشريط العلوي (Navbar)
   */
  buildNavbar(company) {
    return `
      <nav class="navbar" id="navbar">
        <div class="container">
          <a href="#" class="nav-logo">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
              <circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>
            </svg>
            <span class="logo-text">${company.name}</span>
          </a>
          <div class="nav-links" id="navLinks">
            <a href="#cars" class="nav-link">السيارات</a>
            <a href="#how-it-works" class="nav-link">كيف نعمل</a>
            <a href="#testimonials" class="nav-link">آراء العملاء</a>
            <a href="#contact" class="nav-link">اتصل بنا</a>
          </div>
          <button class="nav-toggle" id="navToggle" aria-label="القائمة">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    `;
  },

  /**
   * قسم الترحيب (Hero)
   */
  buildHero(company) {
    return `
      <section class="hero" id="hero">
        <div class="hero-overlay"></div>
        <div class="hero-bg"></div>
        <div class="container hero-content">
          <div class="hero-text">
            <span class="hero-badge">— وكالة كراء سيارات فاخرة</span>
            <h1 class="hero-title">${company.tagline}<br>بأعلى معايير <span class="text-accent">الرفاهية</span></h1>
            <p class="hero-desc">أفضل السيارات الفاخرة بأفضل الأسعار. خدمة 24/7، توصيل واستلام مجاني، وتأمين شامل.</p>
            <div class="hero-actions">
              <a href="#cars" class="btn-primary btn-lg">
                استعرض السيارات
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
              <a href="#contact" class="btn-outline btn-lg">تواصل معنا</a>
            </div>
          </div>
          <div class="hero-stats">
            <div class="stat-item"><span class="stat-num">50+</span><span class="stat-label">سيارة فاخرة</span></div>
            <div class="stat-item"><span class="stat-num">1000+</span><span class="stat-label">عميل سعيد</span></div>
            <div class="stat-item"><span class="stat-num">4.9</span><span class="stat-label">تقييم</span></div>
          </div>
        </div>
      </section>
    `;
  },

  /**
   * البانر الإعلاني
   */
  buildBanner(company) {
    if (!company.banner_enabled) return '';
    return `
      <section class="promo-banner" style="background: ${company.banner_bg || 'linear-gradient(135deg, #1a1a2e, #c8a45c)'}">
        <div class="container promo-banner-content">
          <div class="promo-banner-text">
            <h2 class="promo-banner-title">${company.banner_title || ''}</h2>
            <p class="promo-banner-desc">${company.banner_desc || ''}</p>
          </div>
          ${company.banner_btn_text ? `
            <a href="${company.banner_btn_link || '#cars'}" class="promo-banner-btn">
              ${company.banner_btn_text}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          ` : ''}
        </div>
      </section>
    `;
  },

  /**
   * قسم السيارات (مع الفلاتر)
   */
  buildCarsSection() {
    return `
      <section class="section cars-section" id="cars">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">أسطولنا</span>
            <h2 class="section-title">اختر سيارتك المناسبة</h2>
            <p class="section-desc">نوفر لك أفضل السيارات الفاخرة والاقتصادية بأحدث الموديلات</p>
          </div>
          <div class="filters-wrapper" id="filtersWrapper"></div>
          <div class="cars-grid" id="carsGrid"></div>
        </div>
      </section>
    `;
  },

  /**
   * تصيير السيارات مع الفلاتر
   */
  renderCarsSection() {
    const filtersEl = document.getElementById('filtersWrapper');
    const gridEl = document.getElementById('carsGrid');
    if (!filtersEl || !gridEl) return;

    filtersEl.innerHTML = CarRentalComponents.createFilters(this.state.currentFilter);
    gridEl.innerHTML = CarRentalComponents.createCarsGrid(this.state.cars, this.state.currentFilter);
  },

  /**
   * قسم "كيف نعمل"
   */
  buildHowItWorks() {
    return `
      <section class="section how-section" id="how-it-works">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">الخطوات</span>
            <h2 class="section-title">كيف يعمل الحجز؟</h2>
            <p class="section-desc">ثلاث خطوات بسيطة لتحصل على سيارتك</p>
          </div>
          <div class="steps-grid">
            <div class="how-card">
              <div class="how-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              </div>
              <h3>اختر سيارتك</h3>
              <p>تصفح أسطولنا المتنوع واختر السيارة التي تناسب ذوقك واحتياجاتك</p>
            </div>
            <div class="how-card">
              <div class="how-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3>احجز عبر واتساب</h3>
              <p>املأ البيانات وسنرسل طلبك مباشرة عبر واتساب لفريق الحجوزات</p>
            </div>
            <div class="how-card">
              <div class="how-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3>استلم وانطلق</h3>
              <p>نوصل لك السيارة أينما كنت، أو تفضل باستلامها من أقرب فرع لنا</p>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  /**
   * قسم آراء العملاء
   */
  buildTestimonialsSection() {
    return `
      <section class="section testimonials-section" id="testimonials">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">آراء العملاء</span>
            <h2 class="section-title">ماذا قالوا عنا</h2>
          </div>
          <div class="testimonials-grid" id="testimonialsGrid"></div>
        </div>
      </section>
    `;
  },

  renderTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;
    grid.innerHTML = this.state.testimonials
      .map(t => CarRentalComponents.createTestimonialCard(t))
      .join('');
  },

  /**
   * قسم الاتصال
   */
  buildContactSection(company) {
    return `
      <section class="section contact-section" id="contact">
        <div class="container">
          <div class="section-header">
            <span class="section-badge">اتصل بنا</span>
            <h2 class="section-title">نحن هنا لخدمتك</h2>
          </div>
          <div class="contact-grid">
            <div class="contact-info">
              <div class="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div><span class="contact-label">الهاتف</span><span class="contact-value">${company.phone}</span></div>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <div><span class="contact-label">البريد</span><span class="contact-value">${company.email}</span></div>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div><span class="contact-label">العنوان</span><span class="contact-value">${company.address}</span></div>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div><span class="contact-label">ساعات العمل</span><span class="contact-value">${company.workingHours}</span></div>
              </div>
              <div style="display:flex;gap:12px;margin-top:1rem;flex-wrap:wrap">
                <a href="https://wa.me/${company.whatsapp}" target="_blank" class="btn-whatsapp btn-lg" style="text-decoration:none;display:inline-flex">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  واتساب
                </a>
                ${company.instagram ? `
                <a href="${company.instagram}" target="_blank" class="btn-outline btn-lg" style="text-decoration:none;display:inline-flex">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>
                  إنستغرام
                </a>
                ` : ''}
              </div>
            </div>
            <div class="contact-map">
              <div class="map-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <p>${company.address}</p>
                <span>— ${company.name} —</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  /**
   * التذييل (Footer)
   */
  renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
      <div class="container footer-content">
        <div class="footer-brand">
          <span class="footer-logo">${this.state.company.name}</span>
          <p>${this.state.company.tagline}</p>
        </div>
        <div class="footer-links">
          <a href="#cars">السيارات</a>
          <a href="#how-it-works">كيف نعمل</a>
          <a href="#testimonials">آراء العملاء</a>
          <a href="#contact">اتصل بنا</a>
        </div>
        <div class="footer-copy">
          © ${new Date().getFullYear()} ${this.state.company.name}. جميع الحقوق محفوظة.
        </div>
      </div>
    `;
    document.querySelector('main').after(footer);
  },

  /* ========== الفلاتر (Filters) ========== */

  /**
   * تصفية السيارات حسب التصنيف
   * @param {string} filter - 'all', 'luxury', 'suv', 'sport', 'economy'
   */
  filterCars(filter) {
    this.state.currentFilter = filter;

    // تحديث الأزرار
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(`'${filter}'`));
    });

    // تحديث الشبكة
    const grid = document.getElementById('carsGrid');
    if (grid) {
      grid.innerHTML = CarRentalComponents.createCarsGrid(this.state.cars, filter);
    }
  },

  /* ========== النافذة المنبثقة (Modal) ========== */

  /**
   * فتح نافذة الحجز
   * @param {string} carId - معرف السيارة
   */
  openBookingModal(carId) {
    this.state.isModalOpen = true;
    this.state.selectedCarId = carId;
    this.state.bookingStep = 1;

    // تسجيل النقرة في الإحصائيات
    this.trackClick(carId);

    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // بدء عرض الخطوة الأولى
    this.renderBookingStep();
  },

  /**
   * إغلاق نافذة الحجز
   */
  closeModal() {
    this.state.isModalOpen = false;
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  /**
   * التنقل بين خطوات الحجز
   * @param {number} step - رقم الخطوة (1-3)
   */
  goToStep(step) {
    this.state.bookingStep = step;
    this.renderBookingStep();
  },

  /**
   * تصيير خطوة الحجز الحالية
   */
  renderBookingStep() {
    const stepperEl = document.getElementById('bookingStepper');
    const contentEl = document.getElementById('bookingContent');

    if (!stepperEl || !contentEl) return;

    stepperEl.innerHTML = CarRentalComponents.createBookingStepper(this.state.bookingStep);

    switch (this.state.bookingStep) {
      case 1:
        contentEl.innerHTML = CarRentalComponents.createStep1(this.state.selectedCarId);
        break;
      case 2:
        contentEl.innerHTML = CarRentalComponents.createStep2();
        break;
      case 3:
        contentEl.innerHTML = CarRentalComponents.createStep3();
        break;
    }
  },

  /**
   * إرسال الحجز عبر واتساب
   */
  submitBooking() {
    CarRentalBooking.submitBooking();
  },

  /* ========== الأحداث (Events) ========== */

  /**
   * ربط الأحداث (Event Listeners)
   */
  bindEvents() {
    // Navbar toggle للجوال
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }

    // إغلاق القائمة عند النقر على رابط
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks?.classList.remove('active');
      });
    });

    // تغيير لون الـ Navbar عند التمرير
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      }
    });
  },

  /**
   * التمرير السلس (Smooth Scroll)
   */
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

/* ========== بدء التطبيق عند تحميل الصفحة ========== */
document.addEventListener('DOMContentLoaded', () => CarRentalApp.init());
