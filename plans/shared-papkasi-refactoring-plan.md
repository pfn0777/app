# Refactoring Plan: Extract Shared Utilities into `shared/` Directory

## Overview

Extract four shared utility modules from the monolithic `brain_game.html` (1471 lines) into a `shared/` directory. Each utility fixes at least one of the 8 identified bugs. The project has no build system, so all files use plain ES5/ES6 compatible syntax loaded via `<script src="...">` tags.

---

## Files to Create

### 1. `shared/shuffle.js` -- Fisher-Yates Shuffle

**Fixes:** Bug #7 (biased `sort(() => Math.random() - 0.5)` in 3 places)

```
// shared/shuffle.js
// Fisher-Yates (Knuth) shuffle -- O(n), unbiased
function fisherYatesShuffle(arr) {
  var a = arr.slice(); // shallow copy, no mutation
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}
```

**Replaces in brain_game.html:**
- Line 1049: `[...opts].sort(() => Math.random() - 0.5)` becomes `fisherYatesShuffle(opts)`
- Line 1111: `[...emojis, ...emojis].sort(() => Math.random() - 0.5)` becomes `fisherYatesShuffle([...emojis, ...emojis])`
- Line 1431: `word.split('').sort(() => Math.random() - 0.5).join('')` becomes `fisherYatesShuffle(word.split('')).join('')`

**No dependencies.** Can be loaded first in the script sequence.

---

### 2. `shared/timerManager.js` -- Safe Timer Manager

**Fixes:**
- Bug #3 (reaction game: untracked setTimeout IDs cause stacked scheduleReact and double scoring)
- Bug #4 (tab switch does not clear game timers)
- Bug #8 (math timer floating-point drift is mitigated by track-and-kill pattern)

```
// shared/timerManager.js
// Tracked timeout/interval management with automatic cleanup

var TimerManager = (function () {
  var timeouts = {};
  var intervals = {};
  var nextId = 0;

  return {
    setTimeout: function (fn, delay, context) {
      var id = 't' + (nextId++);
      timeouts[id] = window.setTimeout(function () {
        delete timeouts[id];
        fn.call(context || null);
      }, delay);
      return id;
    },

    setInterval: function (fn, delay, context) {
      var id = 'i' + (nextId++);
      intervals[id] = window.setInterval(function () {
        fn.call(context || null);
      }, delay);
      return id;
    },

    clear: function (handle) {
      if (timeouts[handle]) { clearTimeout(timeouts[handle]); delete timeouts[handle]; }
      if (intervals[handle]) { clearInterval(intervals[handle]); delete intervals[handle]; }
    },

    clearAll: function () {
      var k;
      for (k in timeouts) { clearTimeout(timeouts[k]); delete timeouts[k]; }
      for (k in intervals) { clearInterval(intervals[k]); delete intervals[k]; }
    },

    count: function () {
      var n = 0, k;
      for (k in timeouts) n++;
      for (k in intervals) n++;
      return n;
    }
  };
})();
```

**Key decisions:**
- IIFE singleton avoids global namespace pollution beyond `TimerManager`.
- Returns string handles (e.g., `"t0"`, `"t1"`) not numeric IDs, preventing accidental mixing with raw setTimeout return values.
- Auto-deletes handles on fire so `clearAll` does not `clearTimeout` already-fired handles.
- The floating-point fix for bug #8: the math timer now uses `TimerManager.clearAll()` on tab switch, preventing stale intervals from accumulating. The existing 100ms interval and step logic is kept as-is -- the drift is negligible for a game timer, and the real bug was stale timers running after tab switch.

**Replaces in brain_game.html:**
- All `setInterval(...)` calls become `TimerManager.setInterval(...)`.
- All `setTimeout(...)` calls that affect game state become `TimerManager.setTimeout(...)`.
- DOM-only animation timeouts (seq-btn flash toggle, corpus pulse) stay as raw `setTimeout` -- they do not affect state or scores.
- `clearInterval(mathState.timer)`, `clearTimeout(reactState.timeout)`, `clearInterval(stroopState.timer)` become `TimerManager.clear(handle)`.

---

### 3. `shared/tabManager.js` -- Tab-Switch Cleanup Hook

**Fixes:** Bug #4 (tab switch does not clear game timers)

```
// shared/tabManager.js
// Depends on TimerManager

var TabManager = (function () {
  var beforeSwitch = [];

  return {
    onBeforeSwitch: function (fn) {
      beforeSwitch.push(fn);
    },

    switchTo: function (id) {
      // Run all game-specific cleanup hooks
      for (var i = 0; i < beforeSwitch.length; i++) {
        beforeSwitch[i]();
      }
      // Kill all tracked timers
      TimerManager.clearAll();
      // Switch the visible tab
      document.querySelectorAll('.game-panel').forEach(function (p) {
        p.classList.remove('active');
      });
      document.getElementById('panel-' + id).classList.add('active');
    }
  };
})();
```

**Replaces in brain_game.html:**
- Remove the `showTab` function entirely (lines 1010-1013).
- Replace all `onclick="showTab('...')"` attributes with `onclick="TabManager.switchTo('...')"`.
  - Tab bar buttons (7 places, lines 794-800).
  - Home game cards (6 places, lines 813-848).
- In `DOMContentLoaded` init, register cleanup callbacks:
  ```
  TabManager.onBeforeSwitch(function () {
    // Reset reaction state to prevent double-scoring
    reactState.active = false;
    reactState.waiting = false;
  });
  TabManager.onBeforeSwitch(function () {
    // Reset sequence input
    seqState.showing = false;
  });
  // Additional per-game cleanup as needed
  ```

---

### 4. `shared/scoreManager.js` -- localStorage Score Wrapper

**Fixes:** Bug #6 (no localStorage persistence for brain_game scores; missing data-record attribute for brain_game card in index.html)

```
// shared/scoreManager.js

var ScoreManager = (function () {
  return {
    save: function (key, value, storeIfHigher) {
      if (storeIfHigher !== false) storeIfHigher = true;
      var prev = localStorage.getItem(key);
      if (storeIfHigher && prev !== null) {
        var p = parseFloat(prev);
        if (!isNaN(p) && value <= p) return false;
      }
      localStorage.setItem(key, String(value));
      return true;
    },

    load: function (key) {
      return localStorage.getItem(key);
    },

    display: function (key, formatter, defaultStr) {
      var val = localStorage.getItem(key);
      if (val === null || val === '0') return defaultStr || '--';
      return (typeof formatter === 'function') ? formatter(val) : val;
    }
  };
})();
```

**How this fixes index.html:**

Currently index.html lines 284-288 have the brain_game card WITHOUT a data-record attribute:
```html
<a class="card card-14" href="brain_game.html">
  <span class="card-icon">...</span>
  <span class="card-name" data-key="brain_game"></span>
  <span class="card-record"></span>          <!-- MISSING data-record -->
</a>
```

After fix:
1. Add `data-record="brain_game.html"` to the `<span class="card-record">`.
2. Add RECORDS entry in index.html:
   ```js
   'brain_game.html': { key: 'brain_best', fmt: function(v) { return v + ' Ball'; } },
   ```
3. In brain_game.html, call `ScoreManager.save('brain_best', scores.total)` after every score update, or at minimum on game session end.

**Note on key collision:** `brain_best` does not conflict with any existing key in the RECORDS object or in any other game's localStorage usage.

---

## Files to Modify

### 5. `brain_game.html` -- Target of all changes

| Change Area | What to Do | Bug |
|---|---|---|
| `<head>` region | Add 4 script tags: shuffle.js, timerManager.js, tabManager.js, scoreManager.js | -- |
| Line 1079 | Fix `parseInt` to `parseInt` (lowercase i) | #1 |
| Lines 1010-1013 | Remove `showTab()` function entirely | #4 |
| 7 tab bar + 6 home card onclick handlers | Replace `showTab(...)` with `TabManager.switchTo(...)` | #4 |
| Line 1049 | `[...opts].sort(...)` to `fisherYatesShuffle(opts)` | #7 |
| Line 1111 | `[...emojis, ...emojis].sort(...)` to `fisherYatesShuffle([...emojis, ...emojis])` | #7 |
| Line 1431 | `word.split('').sort(...).join('')` to `fisherYatesShuffle(word.split('')).join('')` | #7 |
| Math timer (line 1065) | `setInterval` to `TimerManager.setInterval`; `clearInterval` calls to `TimerManager.clear` | #4, #8 |
| Reaction timeout (line 1274) | `setTimeout` to `TimerManager.setTimeout`; store handle string | #3 |
| handleReact (line 1297) | `clearTimeout(reactState.timeout)` to `TimerManager.clear(reactState.timeout)` | #3 |
| Stroop timer (line 1212) | `setInterval` to `TimerManager.setInterval` | #4 |
| Sequence show loop (line 1348) | inner `setTimeout` to `TimerManager.setTimeout` | #2 |
| Memory flips (line 1158) | `setTimeout` in mismatch handler to `TimerManager.setTimeout` | #4 |
| DOMContentLoaded | Add TabManager.onBeforeSwitch registrations for each game | #4 |
| renderMemory() | Restructure to call once per match result, not twice | #5 |
| updateScores() or game-end | Add `ScoreManager.save('brain_best', scores.total)` | #6 |

**Guidance for which setTimeout calls to convert vs. leave as raw:**

Convert to TimerManager if the timer:
- Affects game state (score, level, next round)
- Can fire when the user switches tabs (causing corruption)
- Needs to be cancelable on tab switch

Leave as raw setTimeout if the timer:
- Only toggles a CSS class for animation (e.g., `.flash`, `.active` on corpus)
- Is a brief DOM visual effect that does not affect state
- Has no side effect if it fires after tab switch (the element just gets a class it does not show)

---

### 6. `index.html` -- Fix brain_game card integration

| Change Area | What to Do |
|---|---|
| Lines 284-288 | Add `data-record="brain_game.html"` to the card-record span |
| Lines 366-377 | Add `'brain_game.html': { key: 'brain_best', fmt: function(v) { return v + ' Ball'; } }` to RECORDS |

---

## Step-by-Step Implementation Order

### Phase 1: Create shared files (no breakage risk)

1. Create `shared/shuffle.js`
2. Create `shared/timerManager.js`
3. Create `shared/tabManager.js`
4. Create `shared/scoreManager.js`

### Phase 2: Wire up brain_game.html (fix bugs)

5. Add 4 `<script src="shared/...">` tags to the `<head>` of brain_game.html
6. Fix `parseInt` typo on line 1079 (single character change)
7. Remove `showTab()`; add TabManager.onBeforeSwitch hooks
8. Replace all `showTab(...)` calls with `TabManager.switchTo(...)` (13 call sites)
9. Convert all game-state timers to TimerManager calls
10. Replace 3 biased sort calls with fisherYatesShuffle
11. Fix memory renderMemory double-call by restructuring the match flow
12. Add ScoreManager.save for brain_best

### Phase 3: Fix index.html

13. Add `data-record` attribute to brain_game card
14. Add RECORDS entry

### Phase 4: Verification

15. Browser test: all 6 games load without console errors
16. Switch tabs mid-game: verify timers stop and no score corruption
17. Play through a full round of each game, verify scoring, timing, and no double-counting
18. Check localStorage: `localStorage.getItem('brain_best')` has a valid value
19. Open index.html: verify brain_game card shows the recorded score
20. Rapid-click test on reaction game: verify no double-scoring
21. Wrong-answer test on sequence game: verify no stacked timeouts

---

## Dependency Graph

```
shuffle.js         (no deps)
timerManager.js    (no deps)
tabManager.js      depends on TimerManager
scoreManager.js    (no deps)

brain_game.html    depends on all 4 shared files
index.html         depends on ScoreManager (indirectly, via localStorage keys matching)
```

Script load order in brain_game.html `<head>`:
```html
<script src="shared/shuffle.js"></script>
<script src="shared/timerManager.js"></script>
<script src="shared/tabManager.js"></script>
<script src="shared/scoreManager.js"></script>
```

---

## Potential Challenges

| Challenge | Mitigation |
|---|---|
| TimerManager wraps `setTimeout`, so `this` inside the callback could be `window` not the callee's context | The `context` parameter is passed through; or use arrow-function closures / `.bind(this)` |
| Large brain_game.html (1471 lines) -- edits risk missing a call site | Work one game sub-section at a time; grep for `setTimeout`/`setInterval`/`clearTimeout`/`clearInterval` after each section to catch remaining raw calls |
| Memory game double-render fix is a logic restructure, not a utility swap | Handle as a separate edit after the utility wiring is complete |
| TabManager.onBeforeSwitch callbacks could accumulate duplicates if DOMContentLoaded runs twice | Guard with a boolean flag, or clear the array at the start of the init function |
| Existing standalone games do not get converted | Explicit out-of-scope for this phase. A follow-up plan should address migrating common patterns across all 14 standalone files. |
