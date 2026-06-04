/**
 * TabManager — manages tab switching with automatic timer cleanup.
 * Use instead of raw showTab() to prevent timer leaks across tabs.
 */
class TabManager {
  constructor() {
    this._beforeSwitch = [];
  }

  /** Register a callback that runs before every tab switch. */
  onBeforeSwitch(fn) {
    this._beforeSwitch.push(fn);
  }

  /** Switch to a panel by ID, running all cleanup hooks first. */
  switchTo(id) {
    this._beforeSwitch.forEach(function (fn) { fn(id); });
    document.querySelectorAll('.game-panel').forEach(function (p) {
      p.classList.remove('active');
    });
    document.getElementById('panel-' + id).classList.add('active');
  }
}
