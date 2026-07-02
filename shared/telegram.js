/**
 * TG — Telegram Web App SDK wrapper.
 * Telegram tashqarisida (oddiy brauzerda) xatosiz no-op bo'lib ishlaydi.
 * Sahifada telegram-web-app.js dan KEYIN ulanishi kerak, lekin usiz ham ishlaydi.
 */
(function () {
  var tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;

  window.TG = {
    /** Raw SDK obyekti (yoki null). */
    app: tg,

    /** Telegram ichida ochilganmi. */
    isTelegram: !!(tg && tg.initData),

    /** ready() + expand() — har sahifada chaqiriladi. */
    init: function () {
      if (!tg) return;
      try { tg.ready(); } catch (e) {}
      try { tg.expand(); } catch (e) {}
    },

    /** Telegram user ID (string) yoki 'local'. */
    userId: function () {
      try {
        var u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
        return u && u.id ? String(u.id) : 'local';
      } catch (e) { return 'local'; }
    },

    /**
     * Haptic feedback.
     * type: 'success' | 'error' | 'warning' (notification)
     *       'light' | 'medium' | 'heavy' | 'rigid' | 'soft' (impact)
     */
    haptic: function (type) {
      if (!tg || !tg.HapticFeedback) return;
      try {
        if (type === 'success' || type === 'error' || type === 'warning') {
          tg.HapticFeedback.notificationOccurred(type);
        } else {
          tg.HapticFeedback.impactOccurred(type || 'light');
        }
      } catch (e) {}
    },

    /** 'dark' | 'light' | null (Telegram tashqarisida). */
    colorScheme: function () {
      return (tg && tg.colorScheme) ? tg.colorScheme : null;
    },

    /** Telegram theme o'zgarganda callback. */
    onThemeChanged: function (cb) {
      if (!tg || !tg.onEvent) return;
      try { tg.onEvent('themeChanged', cb); } catch (e) {}
    }
  };

  window.TG.init();
})();
