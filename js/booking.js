/**
 * booking.js — نظام الحجز عبر واتساب
 * 
 * هذا الملف مسؤول عن تجميع بيانات الحجز وإرسالها عبر WhatsApp.
 * 
 * ملاحظة للترقية المستقبلية:
 * - لاستبدال واتساب بـ API احترافي، عدّل الدالة submitBooking()
 * - لربط قاعدة بيانات SQL، استبدل كل الدوال في هذا الملف
 * - الواجهة (UI) لن تتأثر لأنها منفصلة في components.js
 */

const CarRentalBooking = {

  /**
   * رقم واتساب الوكالة (مأخوذ من ملف JSON)
   * @returns {string}
   */
  getWhatsAppNumber() {
    const company = window.__COMPANY_DATA__;
    return company?.whatsapp || '212600000000';
  },

  /**
   * تجميع بيانات الحجز من النموذج
   * @returns {Object} bookingData
   */
  collectFormData() {
    const carSelect = document.getElementById('bookingCar');
    const selectedCar = carSelect 
      ? window.__CARS_DATA__?.find(c => c.id === carSelect.value) 
      : null;

    return {
      car: selectedCar ? `${selectedCar.brand} ${selectedCar.model} (${selectedCar.year})` : 'غير محدد',
      pricePerDay: selectedCar ? selectedCar.pricePerDay : 0,
      currency: selectedCar ? selectedCar.currency : 'MAD',
      startDate: document.getElementById('bookingStart')?.value || '',
      endDate: document.getElementById('bookingEnd')?.value || '',
      clientName: document.getElementById('clientName')?.value || '',
      clientPhone: document.getElementById('clientPhone')?.value || '',
      clientEmail: document.getElementById('clientEmail')?.value || '',
      notes: document.getElementById('clientNotes')?.value || ''
    };
  },

  /**
   * حساب المدة بالأيام
   * @param {string} start - تاريخ البداية
   * @param {string} end - تاريخ النهاية
   * @returns {number}
   */
  calculateDays(start, end) {
    if (!start || !end) return 1;
    const s = new Date(start), e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  },

  /**
   * إنشاء نص الرسالة المنسق لواتساب
   * @param {Object} data - بيانات الحجز
   * @returns {string} الرسالة كاملة
   */
  buildWhatsAppMessage(data) {
    const days = this.calculateDays(data.startDate, data.endDate);
    const total = data.pricePerDay * days;

    const lines = [
      '🚗 *طلب حجز سيارة جديد*',
      '',
      '──────────────────',
      '',
      `🚘 *السيارة:* ${data.car}`,
      `📅 *من:* ${data.startDate || 'غير محدد'}`,
      `📅 *إلى:* ${data.endDate || 'غير محدد'}`,
      `⏱ *المدة:* ${days} يوم`,
      `💰 *السعر:* ${data.pricePerDay.toLocaleString()} ${data.currency}/يوم`,
      `💵 *الإجمالي:* ${total.toLocaleString()} ${data.currency}`,
      '',
      '──────────────────',
      '',
      `👤 *الاسم:* ${data.clientName}`,
      `📞 *الهاتف:* ${data.clientPhone}`,
      `📧 *البريد:* ${data.clientEmail || '---'}`,
      ...(data.notes ? [`📝 *ملاحظات:* ${data.notes}`] : []),
      '',
      '──────────────────',
      '',
      '✅ *شكراً لتواصلك معنا*',
      '📌 _سيتم التواصل معك قريباً_'
    ];

    return lines.join('\n');
  },

  /**
   * إرسال الطلب عبر واتساب
   * تفتح محادثة واتساب في نافذة/تبويب جديد مع الرسالة جاهزة
   * 
   * @returns {boolean} تنجح دائماً (ترجع false فقط في حال الخطأ)
   */
  submitBooking() {
    const data = this.collectFormData();

    // التحقق من الحقول الإجبارية
    if (!data.clientName.trim()) {
      this._showError('الرجاء إدخال الاسم الكامل');
      return false;
    }
    if (!data.clientPhone.trim()) {
      this._showError('الرجاء إدخال رقم الهاتف');
      return false;
    }
    if (!data.startDate) {
      this._showError('الرجاء اختيار تاريخ البداية');
      return false;
    }
    if (!data.endDate) {
      this._showError('الرجاء اختيار تاريخ النهاية');
      return false;
    }

    const message = this.buildWhatsAppMessage(data);
    const phone = this.getWhatsAppNumber();
    const encoded = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phone}?text=${encoded}`;

    // فتح واتساب في نافذة جديدة
    window.open(whatsappURL, '_blank');

    // إظهار رسالة نجاح
    this._showSuccess();
    
    return true;
  },

  /**
   * عرض رسالة خطأ
   */
  _showError(msg) {
    const content = document.getElementById('bookingContent');
    if (!content) return;
    
    // إزالة أي رسائل خطأ سابقة
    const old = content.querySelector('.booking-alert');
    if (old) old.remove();

    const alert = document.createElement('div');
    alert.className = 'booking-alert error';
    alert.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <span>${msg}</span>
    `;
    content.prepend(alert);

    // إخفاء تلقائي بعد 4 ثوان
    setTimeout(() => alert.remove(), 4000);
  },

  /**
   * عرض رسالة نجاح بعد الإرسال
   */
  _showSuccess() {
    const content = document.getElementById('bookingContent');
    if (!content) return;

    content.innerHTML = `
      <div class="success-screen">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h3 class="success-title">تم إرسال طلبك بنجاح! 🎉</h3>
        <p class="success-text">
          سيتم فتح محادثة واتساب لإتمام الحجز.<br>
          فريقنا سيتواصل معك في أقرب وقت.
        </p>
        <button class="btn-secondary" onclick="CarRentalApp.closeModal()">
          العودة للصفحة الرئيسية
        </button>
      </div>
    `;
  }
};
