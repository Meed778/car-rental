/**
 * components.js — Car Rental UI Components
 * 
 * نظام المكونات (Components System):
 * - كل دالة مسؤولة عن جزء واحد من الواجهة
 * - يمكنك تعديل أو استبدال أي مكون دون التأثير على الباقي
 * - هذا يسهل عملية التطوير والصيانة مستقبلاً
 */

const CarRentalComponents = {

  /**
   * إنشاء بطاقة سيارة (Car Card)
   * @param {Object} car - بيانات السيارة من ملف JSON
   * @returns {string} HTML string
   */
  createCarCard(car) {
    const promoBadge = car.promo
      ? `<span class="promo-badge">عرض خاص</span>`
      : '';

    const featuresHTML = car.features
      .map(f => `<li class="feature-item"><svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>${f}</li>`)
      .join('');

    return `
      <div class="car-card" data-car-id="${car.id}">
        ${promoBadge}
        <div class="car-image-wrapper">
          <img 
            src="${car.image}" 
            alt="${car.brand} ${car.model}" 
            class="car-image"
            loading="lazy"
            onerror="this.src='https://via.placeholder.com/600x400/1a1a2e/eee?text=Premium+Drive'"
          />
        </div>
        <div class="car-details">
          <div class="car-header">
            <h3 class="car-title">${car.brand} ${car.model}</h3>
            <span class="car-year">${car.year}</span>
          </div>
          <div class="car-specs">
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>${car.transmission}</span>
            </div>
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>${car.seats} مقاعد</span>
            </div>
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>${car.fuel}</span>
            </div>
            <div class="spec-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              <span>${car.doors} أبواب</span>
            </div>
          </div>
          <ul class="features-list">${featuresHTML}</ul>
          <div class="car-footer">
            <div class="price-section">
              <span class="price-amount">${car.pricePerDay.toLocaleString()}</span>
              <span class="price-currency">${car.currency}</span>
              <span class="price-unit">/اليوم</span>
            </div>
            <button class="btn-book" onclick="CarRentalApp.openBookingModal('${car.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              احجز الآن
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * إنشاء قسم عرض السيارات (Cars Grid Section)
   * @param {Array} cars - مصفوفة السيارات
   * @param {string} filter - الفلتر المطبق (اختياري)
   * @returns {string} HTML string
   */
  createCarsGrid(cars, filter = 'all') {
    const filtered = filter === 'all' 
      ? cars 
      : cars.filter(c => c.category === filter);

    if (filtered.length === 0) {
      return `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>لا توجد سيارات متاحة حالياً في هذا التصنيف</p>
        </div>
      `;
    }

    return filtered.map(car => this.createCarCard(car)).join('');
  },

  /**
   * إنشاء الفلاتر (Filter Buttons)
   * @param {string} active - الفلتر النشط حالياً
   * @returns {string} HTML string
   */
  createFilters(active = 'all') {
    const filters = [
      { key: 'all', label: 'الكل' },
      { key: 'luxury', label: 'فاخرة' },
      { key: 'suv', label: 'SUV' },
      { key: 'sport', label: 'رياضية' },
      { key: 'economy', label: 'اقتصادية' }
    ];

    return filters.map(f => `
      <button class="filter-btn ${active === f.key ? 'active' : ''}"
              onclick="CarRentalApp.filterCars('${f.key}')">
        ${f.label}
      </button>
    `).join('');
  },

  /**
   * إنشاء شريط التقدم (Stepper) لنموذج الحجز
   * @param {number} currentStep - الخطوة الحالية (1-3)
   * @returns {string} HTML string
   */
  createBookingStepper(currentStep) {
    const steps = [
      { num: 1, label: 'اختيار السيارة' },
      { num: 2, label: 'معلومات الحجز' },
      { num: 3, label: 'تأكيد' }
    ];

    return `
      <div class="booking-stepper">
        ${steps.map((s, i) => {
          const state = s.num < currentStep ? 'completed' : s.num === currentStep ? 'active' : '';
          return `
            <div class="step ${state}">
              <div class="step-circle">${s.num < currentStep ? '✓' : s.num}</div>
              <span class="step-label">${s.label}</span>
            </div>
            ${i < steps.length - 1 ? '<div class="step-line"></div>' : ''}
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * إنشاء شريط التقييم بالنجوم
   * @param {number} rating - عدد النجوم (1-5)
   * @returns {string} HTML string
   */
  createStars(rating) {
    return Array(5).fill(0).map((_, i) => `
      <svg class="star ${i < rating ? 'filled' : ''}" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    `).join('');
  },

  /**
   * إنشاء بطاقة شهادة (Testimonial Card)
   * @param {Object} testimonial - بيانات الشهادة
   * @returns {string} HTML string
   */
  createTestimonialCard(testimonial) {
    return `
      <div class="testimonial-card">
        <div class="testimonial-stars">${this.createStars(testimonial.rating)}</div>
        <p class="testimonial-text">"${testimonial.text}"</p>
        <div class="testimonial-author">
          <div class="author-avatar">${testimonial.name.charAt(0)}</div>
          <span class="author-name">${testimonial.name}</span>
        </div>
      </div>
    `;
  },

  /**
   * إنشاء نافذة الحجز المنبثقة (Booking Modal)
   * @param {Object|null} car - السيارة المحددة (null إذا لم يتم الاختيار بعد)
   * @returns {string} HTML string
   */
  createBookingModal(car = null) {
    const carOptions = window.__CARS_DATA__
      ? window.__CARS_DATA__.map(c => `
        <option value="${c.id}" ${car && car.id === c.id ? 'selected' : ''}>
          ${c.brand} ${c.model} — ${c.pricePerDay.toLocaleString()} ${c.currency}/اليوم
        </option>
      `).join('')
      : '<option>...جاري تحميل السيارات</option>';

    return `
      <div class="modal-overlay" id="bookingModal" onclick="if(event.target===this)CarRentalApp.closeModal()">
        <div class="modal-container">
          <button class="modal-close" onclick="CarRentalApp.closeModal()">&times;</button>
          <div id="bookingStepper"></div>
          <div id="bookingContent"></div>
        </div>
      </div>
    `;
  },

  /**
   * الخطوة 1: اختيار السيارة والتواريخ
   */
  createStep1(carId) {
    const car = window.__CARS_DATA__?.find(c => c.id === carId);
    return `
      <div class="step-content">
        <h3 class="step-title">اختر سيارتك وحدد التواريخ</h3>
        <div class="form-group">
          <label class="form-label">السيارة</label>
          <select class="form-select" id="bookingCar">
            ${window.__CARS_DATA__.map(c => `
              <option value="${c.id}" ${car && car.id === c.id ? 'selected' : ''}>
                ${c.brand} ${c.model} — ${c.pricePerDay.toLocaleString()} ${c.currency}/اليوم
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">تاريخ البداية</label>
            <input type="date" class="form-input" id="bookingStart" min="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label class="form-label">تاريخ النهاية</label>
            <input type="date" class="form-input" id="bookingEnd" min="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <button class="btn-primary" onclick="CarRentalApp.goToStep(2)">
          التالي — معلومات العميل
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    `;
  },

  /**
   * الخطوة 2: معلومات العميل
   */
  createStep2() {
    return `
      <div class="step-content">
        <h3 class="step-title">معلومات العميل</h3>
        <div class="form-group">
          <label class="form-label">الاسم الكامل</label>
          <input type="text" class="form-input" id="clientName" placeholder="أدخل اسمك الكامل" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">رقم الهاتف</label>
            <input type="tel" class="form-input" id="clientPhone" placeholder="06xxxxxxxx" required>
          </div>
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني</label>
            <input type="email" class="form-input" id="clientEmail" placeholder="example@email.com">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">ملاحظات إضافية</label>
          <textarea class="form-textarea" id="clientNotes" rows="3" placeholder="أي متطلبات خاصة..."></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" onclick="CarRentalApp.goToStep(1)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            السابق
          </button>
          <button class="btn-primary" onclick="CarRentalApp.goToStep(3)">
            التالي — المراجعة
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * الخطوة 3: مراجعة الطلب وإرسال واتساب
   */
  createStep3() {
    const car = this._getSelectedCar();
    const startDate = document.getElementById('bookingStart')?.value || '';
    const endDate = document.getElementById('bookingEnd')?.value || '';
    const name = document.getElementById('clientName')?.value || '';
    const phone = document.getElementById('clientPhone')?.value || '';
    const email = document.getElementById('clientEmail')?.value || '';
    const notes = document.getElementById('clientNotes')?.value || '';

    const days = this._calculateDays(startDate, endDate);
    const total = car ? car.pricePerDay * days : 0;

    return `
      <div class="step-content">
        <h3 class="step-title">مراجعة طلب الحجز</h3>
        <div class="summary-box">
          <div class="summary-row">
            <span class="summary-label">السيارة:</span>
            <span class="summary-value">${car ? `${car.brand} ${car.model} ${car.year}` : '---'}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">تاريخ البداية:</span>
            <span class="summary-value">${startDate || '---'}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">تاريخ النهاية:</span>
            <span class="summary-value">${endDate || '---'}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">المدة:</span>
            <span class="summary-value">${days} يوم</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row">
            <span class="summary-label">الاسم:</span>
            <span class="summary-value">${name || '---'}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">الهاتف:</span>
            <span class="summary-value">${phone || '---'}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">البريد:</span>
            <span class="summary-value">${email || '---'}</span>
          </div>
          ${notes ? `<div class="summary-row"><span class="summary-label">ملاحظات:</span><span class="summary-value">${notes}</span></div>` : ''}
          <div class="summary-divider"></div>
          <div class="summary-row total-row">
            <span class="summary-label">الإجمالي التقريبي:</span>
            <span class="summary-value total-value">${total.toLocaleString()} ${car ? car.currency : 'MAD'}</span>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" onclick="CarRentalApp.goToStep(2)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            تعديل
          </button>
          <button class="btn-whatsapp" onclick="CarRentalApp.submitBooking()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            أرسل الطلب عبر واتساب
          </button>
        </div>
      </div>
    `;
  },

  /* ========== Helper Methods ========== */

  _getSelectedCar() {
    const select = document.getElementById('bookingCar');
    return select ? window.__CARS_DATA__?.find(c => c.id === select.value) : null;
  },

  _calculateDays(start, end) {
    if (!start || !end) return 1;
    const s = new Date(start), e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  },

  /* ========== مستقبلاً: هنا يمكن إضافة مكونات إضافية ========== */

  /**
   * [مستقبلاً] مكون إحصائيات Google Analytics
   * للتتبع: ضع كود GA هنا واستدعه في app.js
   */
  // initGoogleAnalytics() { /* كود Google Analytics */ },

  /**
   * [مستقبلاً] مكون تحسين محركات البحث (SEO)
   * أضف structured data (JSON-LD) هنا
   */
  // initSEO() { /* كود SEO */ },

  /**
   * [مستقبلاً] مكون الدفع الإلكتروني
   * يمكن ربطه بـ Stripe أو PayPal لاحقاً
   */
  // createPaymentModal() { /* كود الدفع */ }
};
