/* PEBKAC — focus timer.
 *
 * Counts down, updates the tab title so it survives being tabbed away from,
 * and logs the minutes on completion. No alarm sound by default: a sudden
 * noise is startling enough to end the whole study session, not just the block.
 */
(function () {
  'use strict';

  function Timer(opts) {
    this.onTick = opts.onTick || function () {};
    this.onDone = opts.onDone || function () {};
    this.remaining = 0;
    this.total = 0;
    this.topicId = null;
    this.handle = null;
    this.baseTitle = document.title;
  }

  Timer.prototype.start = function (minutes, topicId) {
    this.stop(true);
    this.total = minutes * 60;
    this.remaining = this.total;
    this.topicId = topicId;
    var self = this;
    this.handle = setInterval(function () { self._tick(); }, 1000);
    this.onTick(this.remaining, this.total, true);
    return this;
  };

  Timer.prototype._tick = function () {
    this.remaining -= 1;

    if (this.remaining <= 0) {
      var minutes = Math.round(this.total / 60);
      var topicId = this.topicId;
      this.stop(true);
      document.title = 'Done — ' + this.baseTitle;
      PEBKAC.Store.logSession(topicId, minutes);
      this.onDone(minutes, topicId);
      return;
    }

    document.title = Timer.format(this.remaining) + ' — ' + this.baseTitle;
    this.onTick(this.remaining, this.total, true);
  };

  /* `silent` suppresses the onTick callback — used when restarting. */
  Timer.prototype.stop = function (silent) {
    if (this.handle) {
      clearInterval(this.handle);
      this.handle = null;
    }
    document.title = this.baseTitle;
    if (!silent) this.onTick(0, this.total, false);
    return this;
  };

  Timer.prototype.running = function () { return this.handle !== null; };

  /* Bank a partial session rather than losing it. Anything under a minute is
   * not worth recording; anything over it counts. */
  Timer.prototype.bank = function () {
    if (!this.running()) return 0;
    var elapsed = Math.round((this.total - this.remaining) / 60);
    var topicId = this.topicId;
    this.stop();
    if (elapsed >= 1) PEBKAC.Store.logSession(topicId, elapsed);
    return elapsed;
  };

  Timer.format = function (seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  };

  window.PEBKAC.Timer = Timer;
})();
