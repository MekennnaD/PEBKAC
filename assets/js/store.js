/* PEBKAC — persistence.
 *
 * localStorage only. No account, no server, no sync, nothing to log into.
 * That is deliberate: every auth step is another place to bounce off.
 *
 * Settings written here override PEBKAC.PLAN, so the UI can change the plan
 * without anyone editing a file. plan.js remains the defaults.
 */
(function () {
  'use strict';

  var NS = 'pebkac.v1.';

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(NS + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value));
      return true;
    } catch (e) {
      // Quota or private-mode failure. Losing progress silently is worse than
      // saying so, but a thrown error mid-click is worse still.
      console.warn('PEBKAC could not save:', e);
      return false;
    }
  }

  var Store = {

    /* ---- confidence: { topicId: 0|1|2|3 } ---- */
    confidence: function (topicId) {
      if (topicId === undefined) return read('confidence', {});
      var all = read('confidence', {});
      return all[topicId] || 0;
    },

    setConfidence: function (topicId, value) {
      var all = read('confidence', {});
      if (value === 0) delete all[topicId];
      else all[topicId] = value;
      write('confidence', all);
      return value;
    },

    /* ---- settings: overrides on top of PEBKAC.PLAN ---- */
    settings: function () {
      var defaults = {
        hoursPerWeek: PEBKAC.PLAN.hoursPerWeek,
        deadline: PEBKAC.PLAN.deadline,
        deadlineWhat: PEBKAC.PLAN.deadlineWhat,
        deadlineMeans: PEBKAC.PLAN.deadlineMeans,
        route: PEBKAC.PLAN.route,
        sessionMinutes: PEBKAC.PLAN.sessionMinutes,
        alsoDoingFirst: PEBKAC.PLAN.alsoDoingFirst,
        theme: 'light',
      };
      var saved = read('settings', {});
      for (var k in saved) {
        if (saved[k] !== null && saved[k] !== undefined) defaults[k] = saved[k];
      }
      return defaults;
    },

    setSetting: function (key, value) {
      var saved = read('settings', {});
      saved[key] = value;
      write('settings', saved);
      return value;
    },

    /* ---- parked thoughts: the intrusive-thought escape hatch ----
     * Mid-session, an unrelated urgent-feeling thought arrives. Writing it
     * down and returning is the cheapest way to not lose the session. */
    parked: function () { return read('parked', []); },

    park: function (text) {
      var list = read('parked', []);
      list.unshift({ text: text, at: new Date().toISOString() });
      write('parked', list.slice(0, 100));
      return list;
    },

    unpark: function (index) {
      var list = read('parked', []);
      list.splice(index, 1);
      write('parked', list);
      return list;
    },

    /* ---- session log: minutes actually done ---- */
    log: function () { return read('log', []); },

    logSession: function (topicId, minutes) {
      var list = read('log', []);
      list.unshift({ topicId: topicId, minutes: minutes, at: new Date().toISOString() });
      write('log', list.slice(0, 500));
      return list;
    },

    /* Minutes logged in the last `days` days. Used for pace, never for guilt. */
    minutesSince: function (days) {
      var cutoff = Date.now() - days * 86400000;
      return this.log().reduce(function (sum, entry) {
        return new Date(entry.at).getTime() >= cutoff ? sum + entry.minutes : sum;
      }, 0);
    },

    /* Distinct days with any logged session, for a non-punitive streak count. */
    activeDays: function (days) {
      var cutoff = Date.now() - days * 86400000;
      var seen = {};
      this.log().forEach(function (entry) {
        var t = new Date(entry.at);
        if (t.getTime() >= cutoff) seen[t.toDateString()] = true;
      });
      return Object.keys(seen).length;
    },

    exportAll: function () {
      return JSON.stringify({
        confidence: read('confidence', {}),
        settings: read('settings', {}),
        parked: read('parked', []),
        log: read('log', []),
        exportedAt: new Date().toISOString(),
      }, null, 2);
    },
  };

  window.PEBKAC.Store = Store;
})();
