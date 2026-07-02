/**
 * Theme — dark mode boshqaruvi.
 * Manba tartibi: qo'lda tanlov (localStorage 'bg_theme') > Telegram colorScheme > light.
 * Dark holatda <html> ga data-theme="dark" atributi qo'yiladi;
 * har sahifa o'z CSS'ida [data-theme="dark"] selektorlari bilan moslashadi.
 * shared/telegram.js dan KEYIN ulanishi kerak (usiz ham ishlaydi).
 */
(function () {
  var KEY = 'bg_theme';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function isDark() {
    var s = stored();
    if (s === 'dark') return true;
    if (s === 'light') return false;
    // qo'lda tanlanmagan — Telegram theme'ga ergashamiz
    return !!(window.TG && TG.colorScheme() === 'dark');
  }

  function apply() {
    var dark = isDark();
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    return dark;
  }

  window.Theme = {
    isDark: isDark,
    apply: apply,
    /** Qo'lda almashtirish — tanlov saqlanadi. Yangi holatni (dark?) qaytaradi. */
    toggle: function () {
      try { localStorage.setItem(KEY, isDark() ? 'light' : 'dark'); } catch (e) {}
      return apply();
    }
  };

  apply();
  if (window.TG) {
    TG.onThemeChanged(function () {
      if (!stored()) apply(); // faqat avto rejimda ergashamiz
    });
  }
})();
