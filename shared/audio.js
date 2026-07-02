/**
 * SoundFX — Web Audio API bilan sintez qilingan success/fail tovushlari.
 * Fayl yuklanmaydi; mute holati localStorage 'bg_sound' da ('off' = o'chiq).
 * AudioContext birinchi foydalanuvchi harakatida (lazy) yaratiladi.
 */
(function () {
  var KEY = 'bg_sound';
  var ctx = null;

  function enabled() {
    try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; }
  }

  function ac() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      } catch (e) { return null; }
    }
    if (ctx && ctx.state === 'suspended') {
      try { ctx.resume(); } catch (e) {}
    }
    return ctx;
  }

  /** Bitta nota: freq (Hz), dur (s), delay (s), type (osc turi). */
  function tone(freq, dur, delay, type) {
    var c = ac();
    if (!c) return;
    try {
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      var t = c.currentTime + (delay || 0);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    } catch (e) {}
  }

  window.SoundFX = {
    enabled: enabled,

    /** Mute'ni almashtirish; yangi holatni (yoqilganmi) qaytaradi. */
    toggle: function () {
      try { localStorage.setItem(KEY, enabled() ? 'off' : 'on'); } catch (e) {}
      return enabled();
    },

    /** G'alaba / to'g'ri javob: ko'tariluvchi mavor akkord. */
    success: function () {
      if (!enabled()) return;
      tone(523.25, 0.15, 0);      // C5
      tone(659.25, 0.15, 0.10);   // E5
      tone(783.99, 0.25, 0.20);   // G5
    },

    /** Xato / mag'lubiyat: pastga tushuvchi past tonlar. */
    fail: function () {
      if (!enabled()) return;
      tone(196.0, 0.20, 0, 'square');    // G3
      tone(146.83, 0.30, 0.15, 'square'); // D3
    },

    /** Yengil bosish tovushi (ixtiyoriy). */
    tap: function () {
      if (!enabled()) return;
      tone(440, 0.06, 0, 'triangle');
    }
  };
})();
