/**
 * ScoreManager — localStorage wrapper for persisting scores.
 * All keys are prefixed with "brain_" to avoid collisions.
 */
const ScoreManager = {
  /**
   * Save a score value under the given game key.
   * Only saves if the new value is higher than the stored one.
   */
  saveIfBetter(key, val) {
    var prev = this.load(key);
    if (prev !== null && Number(prev) >= val) return false;
    localStorage.setItem('brain_' + key, String(val));
    return true;
  },

  /** Load a stored score (returns null if none). */
  load(key) {
    return localStorage.getItem('brain_' + key);
  },

  /** RECORDS entries shared with index.html's RECORDS object. */
  getRecordEntries: function () {
    return {
      'brain_game.html': { key: 'brain_best', fmt: function (v) { return v + ' pts'; } },
    };
  },
};
