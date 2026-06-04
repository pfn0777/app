/**
 * TimerManager — tracks all setTimeout/setInterval IDs so they can be
 * bulk-cleared on tab switch or cleanup, preventing timer leaks,
 * stacked timeouts, and stale callbacks on hidden panels.
 */
const TimerManager = {
  _timeouts: new Set(),
  _intervals: new Set(),

  setTimeout(fn, ms) {
    const id = setTimeout(() => {
      this._timeouts.delete(id);
      fn();
    }, ms);
    this._timeouts.add(id);
    return id;
  },

  setInterval(fn, ms) {
    const id = setInterval(fn, ms);
    this._intervals.add(id);
    return id;
  },

  clearTimeout(id) {
    clearTimeout(id);
    this._timeouts.delete(id);
  },

  clearInterval(id) {
    clearInterval(id);
    this._intervals.delete(id);
  },

  /** Clear all tracked timers at once (call on tab switch / cleanup). */
  clearAll() {
    this._timeouts.forEach(function (id) { clearTimeout(id); });
    this._intervals.forEach(function (id) { clearInterval(id); });
    this._timeouts.clear();
    this._intervals.clear();
  },
};
