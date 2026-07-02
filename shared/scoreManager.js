/**
 * ScoreManager — yagona score saqlash + streak + eski kalitlardan migratsiya.
 *
 * Yagona format (CLAUDE.md): { game, score, user_id, timestamp }
 * localStorage kalitlari:
 *   bg_scores   — massiv (yagona formatdagi yozuvlar)
 *   bg_streak   — { count, last: 'YYYY-MM-DD' }
 *   bg_migrated — migratsiya bajarilgan flag
 * Eski kalitlar (pt_best va h.k.) O'CHIRILMAYDI — faqat o'qiladi.
 *
 * Eski API (saveIfBetter/load/getRecordEntries) saqlanadi — brain_game.html ishlatadi.
 */
/* v1.1 */
const ScoreManager = {

  // ================= O'yinlar reestri =================
  // dir: 'max' — katta yaxshi, 'min' — kichik yaxshi (vaqt/ms)
  GAMES: {
    piano_tiles:     { file: 'piano_tiles.html',     dir: 'max', legacy: ['pt_best'],          fmt: function (v) { return Number(v).toFixed(2) + ' t/s'; } },
    schulte_table:   { file: 'schulte_table.html',   dir: 'min', legacy: ['schulte_best_0'],   fmt: function (v) { return v + ' s'; } },
    colors_game:     { file: 'colors_game.html',     dir: 'max', legacy: ['colors_best'],      fmt: function (v) { return v + ''; } },
    math_game:       { file: 'math_game.html',       dir: 'max', legacy: ['math_best_score'],  fmt: function (v) { return v + ''; } },
    iq_game:         { file: 'iq_game.html',         dir: 'max', legacy: ['iq_best'],          fmt: function (v) { return v + ''; } },
    pattern_game:    { file: 'pattern_game.html',    dir: 'max', legacy: ['pattern_best'],     fmt: function (v) { return v + ''; } },
    fly_game:        { file: 'fly_game.html',        dir: 'max', legacy: ['fly_best'],         fmt: function (v) { return v + ''; } },
    reaction_time:   { file: 'reaction_time.html',   dir: 'min', legacy: ['reaction_best'],    fmt: function (v) { return v + ' ms'; } },
    sequence_memory: { file: 'sequence_memory.html', dir: 'max', legacy: ['sequence_best'],    fmt: function (v) { return v + ''; } },
    mental_math:     { file: 'mental_math.html',     dir: 'max', legacy: ['mental_best_score'],fmt: function (v) { return v + ''; } },
    brain_game:      { file: 'brain_game.html',      dir: 'max', legacy: ['brain_best'],       fmt: function (v) { return v + ' pts'; } },
    nback:           { file: 'nback.html',           dir: 'max', legacy: ['nback_best_n'],     fmt: function (v) { return 'N=' + v; } },
    chess:           { file: 'chess.html',           dir: 'max', legacy: [],                   fmt: function (v) { return v + ''; } },
    checkers:        { file: 'checkers.html',        dir: 'max', legacy: ['checkers_best'],    fmt: function (v) { return v + ''; } }
  },

  // ================= Ichki yordamchilar =================
  _todayStr: function (d) {
    d = d || new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  },

  _readJSON: function (key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },

  _writeJSON: function (key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  },

  _userId: function () {
    return (window.TG && TG.userId) ? TG.userId() : 'local';
  },

  // ================= Yagona format: yozish/o'qish =================
  /** Barcha yozuvlar (migratsiya avtomatik ishga tushadi). */
  getScores: function () {
    this.migrate();
    var arr = this._readJSON('bg_scores', []);
    return Array.isArray(arr) ? arr : [];
  },

  /**
   * O'yin natijasini yozish. Har o'yin tugaganda chaqiriladi.
   * @returns {{best:number, isNewBest:boolean, streak:number}}
   */
  record: function (game, score) {
    score = Number(score);
    if (!game || isNaN(score)) return { best: 0, isNewBest: false, streak: this.getStreak().count };
    var scores = this.getScores();
    var prevBest = this.best(game);
    scores.push({ game: game, score: score, user_id: this._userId(), timestamp: Date.now() });
    if (scores.length > 1000) scores = scores.slice(scores.length - 1000); // cheksiz o'sishdan saqlash
    this._writeJSON('bg_scores', scores);
    var st = this._touchStreak();
    var dir = (this.GAMES[game] || {}).dir || 'max';
    var isNewBest = prevBest === null || (dir === 'max' ? score > prevBest : score < prevBest);
    return { best: isNewBest ? score : prevBest, isNewBest: isNewBest, streak: st.count };
  },

  /** O'yin bo'yicha eng yaxshi natija (null = hali yo'q). */
  best: function (game) {
    var dir = (this.GAMES[game] || {}).dir || 'max';
    var vals = this.getScores().filter(function (s) { return s.game === game; }).map(function (s) { return Number(s.score); });
    if (!vals.length) return null;
    return dir === 'max' ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
  },

  /** Formatlangan best ('—' agar yo'q). */
  bestFmt: function (game) {
    var b = this.best(game);
    if (b === null) return '—';
    var g = this.GAMES[game];
    return g && g.fmt ? g.fmt(b) : String(b);
  },

  // ================= Streak =================
  /**
   * Joriy streak. Agar kecha ham, bugun ham o'ynalmagan bo'lsa — 0.
   * @returns {{count:number, last:string|null, playedToday:boolean}}
   */
  getStreak: function () {
    var st = this._readJSON('bg_streak', { count: 0, last: null });
    if (!st || typeof st.count !== 'number') st = { count: 0, last: null };
    var today = this._todayStr();
    var yest = this._todayStr(new Date(Date.now() - 86400000));
    if (st.last !== today && st.last !== yest) {
      return { count: 0, last: st.last, playedToday: false };
    }
    return { count: st.count, last: st.last, playedToday: st.last === today };
  },

  /** Score yozilganda streak'ni yangilash (kuniga 1 marta oshadi). */
  _touchStreak: function () {
    var st = this._readJSON('bg_streak', { count: 0, last: null });
    if (!st || typeof st.count !== 'number') st = { count: 0, last: null };
    var today = this._todayStr();
    if (st.last === today) return st; // bugun allaqachon hisoblangan
    var yest = this._todayStr(new Date(Date.now() - 86400000));
    st.count = (st.last === yest) ? st.count + 1 : 1;
    st.last = today;
    this._writeJSON('bg_streak', st);
    return st;
  },

  /** O'ynalgan noyob kunlar soni. */
  playedDays: function () {
    var self = this;
    var days = {};
    this.getScores().forEach(function (s) {
      if (s.timestamp) days[self._todayStr(new Date(s.timestamp))] = 1;
    });
    return Object.keys(days).length;
  },

  // ================= Migratsiya =================
  /** Eski kalitlarni bg_scores'ga bir marta ko'chirish (eski kalitlar o'chirilmaydi). */
  migrate: function () {
    try {
      if (localStorage.getItem('bg_migrated')) return;
    } catch (e) { return; }
    var scores = this._readJSON('bg_scores', []);
    if (!Array.isArray(scores)) scores = [];
    var uid = this._userId();
    var now = Date.now();
    var games = this.GAMES;
    Object.keys(games).forEach(function (game) {
      (games[game].legacy || []).forEach(function (key) {
        var raw = null;
        try { raw = localStorage.getItem(key); } catch (e) {}
        if (raw === null || raw === '') return;
        var val = parseFloat(raw);
        if (isNaN(val)) return;
        var exists = scores.some(function (s) { return s.game === game && Number(s.score) === val; });
        if (!exists) scores.push({ game: game, score: val, user_id: uid, timestamp: now, migrated: true });
      });
    });
    this._writeJSON('bg_scores', scores);
    try { localStorage.setItem('bg_migrated', '1'); } catch (e) {}
  },

  // ================= Eski API (brain_game.html uchun) =================
  /** Eski uslub: 'brain_' prefiksli kalitga faqat yaxshiroq bo'lsa yozish. */
  saveIfBetter: function (key, val) {
    var prev = this.load(key);
    if (prev !== null && Number(prev) >= val) return false;
    try { localStorage.setItem('brain_' + key, String(val)); } catch (e) {}
    return true;
  },

  /** Eski uslub: 'brain_' prefiksli kalitni o'qish. */
  load: function (key) {
    try { return localStorage.getItem('brain_' + key); } catch (e) { return null; }
  },

  /** index.html RECORDS bilan umumiy yozuvlar. */
  getRecordEntries: function () {
    return {
      'brain_game.html': { key: 'brain_best', fmt: function (v) { return v + ' pts'; } }
    };
  }
};
