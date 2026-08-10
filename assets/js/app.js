/* PEBKAC — application.
 *
 * Design rules this file is trying to hold to. The whole point is a planner
 * that still gets opened on a bad day, so every rule below is about lowering
 * the cost of starting rather than about tracking more:
 *
 *   1. The home screen shows exactly ONE thing to do. No menu of options at
 *      the moment of starting — choosing is the expensive step, not doing.
 *   2. Nothing is ever "overdue" in red. The plan recalculates instead.
 *      Punishment mechanics get sites closed and never reopened.
 *   3. Progress is four states, not a checkbox, so partial work registers.
 *   4. Every write is immediate. There is no save button to forget.
 */
(function () {
  'use strict';

  var Store = PEBKAC.Store;
  var CERTS = PEBKAC.CERTS;
  var ROUTES = PEBKAC.ROUTES;

  var state = { view: 'now', open: {} };
  var timer = null;

  /* ------------------------------------------------------------- helpers -- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* A bare 'YYYY-MM-DD' parses as UTC midnight, which renders as the previous
   * day anywhere west of Greenwich — so a 31 October deadline displayed as
   * 30 October. Date-only strings are local dates and get built as such. */
  function parseDate(value) {
    if (value instanceof Date) return value;
    var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
    return parts
      ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
      : new Date(value);
  }

  function daysUntil(value) {
    if (!value) return null;
    return Math.ceil((parseDate(value).getTime() - Date.now()) / 86400000);
  }

  function fmtDate(d) {
    return parseDate(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  /* Round to one decimal, but drop a trailing .0 — "4 hours" reads better
   * than "4.0 hours" on a card you look at every day. */
  function num(n) {
    var r = Math.round(n * 10) / 10;
    return String(r);
  }

  /* --------------------------------------------------------------- model -- */

  function topicsOf(examCode) {
    var exam = CERTS[examCode];
    if (!exam || !exam.domains) return [];
    var out = [];
    exam.domains.forEach(function (domain) {
      domain.topics.forEach(function (topic) {
        out.push({ exam: exam, domain: domain, topic: topic });
      });
    });
    return out;
  }

  /* The full working order: the chosen Windows Server route plus everything in
   * `alsoDoing`. Routes describe only the AZ-800/801/802 fork, so anything that
   * lives outside it (DP-700) has to be stitched in here or it never reaches
   * "Right now", the timeline, or the pace maths. */
  function routeExamCodes(routeId) {
    var route = ROUTES.filter(function (r) { return r.id === routeId; })[0];
    if (!route) return [];
    var extra = PEBKAC.PLAN.alsoDoing || [];
    return Store.settings().alsoDoingFirst
      ? extra.concat(route.exams)
      : route.exams.concat(extra);
  }

  function routeTopics(routeId) {
    var out = [];
    routeExamCodes(routeId).forEach(function (code) { out = out.concat(topicsOf(code)); });
    return out;
  }

  /* Hours still owed on a topic, scaled by how far along it already is. */
  function remainingHours(topic) {
    var conf = Store.confidence(topic.id);
    return topic.hours * (3 - conf) / 3;
  }

  function examStats(examCode) {
    var rows = topicsOf(examCode);
    var total = 0, done = 0, maxConf = 0, gained = 0;
    rows.forEach(function (row) {
      var conf = Store.confidence(row.topic.id);
      total += row.topic.hours;
      done += row.topic.hours * conf / 3;
      maxConf += 3;
      gained += conf;
    });
    return {
      totalHours: total,
      doneHours: done,
      remainingHours: total - done,
      percent: maxConf ? Math.round(gained / maxConf * 100) : 0,
      topicCount: rows.length,
    };
  }

  function routeStats(routeId) {
    var route = ROUTES.filter(function (r) { return r.id === routeId; })[0];
    if (!route) return null;

    var settings = Store.settings();

    /* Kept apart on purpose. The route comparison is only meaningful on the
     * Windows Server exams — DP-700 costs the same whichever fork you take, so
     * folding it in would flatten the difference between the three routes.
     * Scheduling and pace, on the other hand, have to count everything. */
    var core = 0, coreRemaining = 0;
    route.exams.forEach(function (code) {
      var s = examStats(code);
      core += s.totalHours;
      coreRemaining += s.remainingHours;
    });

    var extra = 0, extraRemaining = 0;
    (PEBKAC.PLAN.alsoDoing || []).forEach(function (code) {
      var s = examStats(code);
      extra += s.totalHours;
      extraRemaining += s.remainingHours;
    });

    var total = core + extra;
    var remaining = coreRemaining + extraRemaining;

    /* The binding date is whichever comes first: your own deadline, or the
     * exam's retirement cliff. A route can be killed by either. */
    var dates = [];
    if (settings.deadline) dates.push(parseDate(settings.deadline).getTime());
    if (route.hardStop) dates.push(parseDate(route.hardStop).getTime());
    var binding = dates.length ? new Date(Math.min.apply(null, dates)) : null;
    var bindingIsHardStop = !!(route.hardStop && binding &&
      parseDate(route.hardStop).getTime() === binding.getTime());

    var days = binding ? daysUntil(binding.toISOString()) : null;
    var weeks = days !== null ? Math.max(days / 7, 0.1) : null;

    return {
      route: route,
      totalHours: total,
      remainingHours: remaining,
      coreRemaining: coreRemaining,
      extraRemaining: extraRemaining,
      extraCodes: PEBKAC.PLAN.alsoDoing || [],
      binding: binding,
      bindingIsHardStop: bindingIsHardStop,
      daysLeft: days,
      /* Kept separate because a route can have two dates working on it: your
       * deadline, and a retirement cliff partway through. */
      deadlineDays: settings.deadline ? daysUntil(settings.deadline) : null,
      cliffDays: route.hardStop ? daysUntil(route.hardStop) : null,
      /* Route comparison uses core only; everything else uses the total. */
      coreRequiredPerWeek: weeks ? coreRemaining / weeks : null,
      coreRequiredPerDay: days && days > 0 ? coreRemaining / days : null,
      requiredPerWeek: weeks ? remaining / weeks : null,
      requiredPerDay: days && days > 0 ? remaining / days : null,
      budgetPerWeek: settings.hoursPerWeek,
      /* Weeks the plan needs at your stated pace, ignoring the deadline. */
      weeksAtCurrentPace: settings.hoursPerWeek > 0 ? remaining / settings.hoursPerWeek : null,
      coreWeeksAtCurrentPace: settings.hoursPerWeek > 0 ? coreRemaining / settings.hoursPerWeek : null,
      feasible: weeks ? (remaining / weeks) <= settings.hoursPerWeek : null,
      coreFeasible: weeks ? (coreRemaining / weeks) <= settings.hoursPerWeek : null,
    };
  }

  /* Can this route actually deliver by the deadline?
   *
   * Three separate ways to fail, and they are not interchangeable:
   *   1. Not enough hours in the days remaining.
   *   2. A retirement cliff partway through that the exams must clear first.
   *   3. A beta exam whose result is not released on any known date — which
   *      no amount of studying fixes.
   *
   * (3) is the one worth separating out, because effort cannot solve it and a
   * plan that quietly folds it into "hours needed" is lying by omission. */
  function routeVerdict(routeId) {
    var stats = routeStats(routeId);
    var settings = Store.settings();
    if (!stats || stats.deadlineDays === null) return null;

    var days = stats.deadlineDays;
    var totalRemaining = stats.coreRemaining + stats.extraRemaining;
    var needPerWeek = days > 0 ? totalRemaining / (days / 7) : Infinity;
    var needPerDay = days > 0 ? totalRemaining / days : Infinity;

    /* A beta exam cannot be relied on to produce a credential by a fixed date. */
    var betaExam = stats.route.exams.filter(function (code) {
      return CERTS[code] && CERTS[code].status === 'beta';
    })[0];
    var betaBlocks = betaExam && settings.deadlineMeans === 'certified';

    /* Where a cliff lands before the deadline, the core exams get squeezed
     * into the shorter window and only the extras get the full run. */
    var cliffSqueeze = null;
    if (stats.cliffDays !== null && stats.cliffDays < days && stats.cliffDays > 0) {
      cliffSqueeze = {
        days: stats.cliffDays,
        perDay: stats.coreRemaining / stats.cliffDays,
        perWeek: stats.coreRemaining / (stats.cliffDays / 7),
      };
    }

    /* Bands are deliberately pessimistic at the top. Twenty-five hours a week
     * on top of a job is not "achievable with effort", it is a second job, and
     * calling it achievable is how a plan gets agreed to and then abandoned. */
    var tone, headline;
    if (betaBlocks) {
      tone = 'warn';
      headline = 'Cannot guarantee a credential by the date';
    } else if (needPerWeek <= settings.hoursPerWeek) {
      tone = 'ok';
      headline = 'Fits inside your current hours';
    } else if (needPerWeek <= 18) {
      tone = 'ok';
      headline = 'Realistic, but the hours have to go up';
    } else if (needPerWeek <= 28) {
      tone = 'warn';
      headline = 'Only if this becomes the main thing you do';
    } else {
      tone = 'warn';
      headline = 'Not realistically available';
    }

    return {
      stats: stats, tone: tone, headline: headline,
      needPerWeek: needPerWeek, needPerDay: needPerDay,
      betaExam: betaExam, betaBlocks: betaBlocks, cliffSqueeze: cliffSqueeze,
      totalRemaining: totalRemaining,
    };
  }

  /* The single next thing.
   *
   * Sweeps by confidence level, then in order within a level: everything
   * untouched gets a first pass before anything gets a second. Two reasons,
   * and the first one is a bug fix.
   *
   * Marking a topic "read it" has to visibly move you on. A strictly linear
   * walk that only skips topics rated 3 parks you on the same card until you
   * claim mastery of it, which makes the move-on button look broken and
   * quietly punishes honest self-rating — exactly the thing this site is
   * supposed to avoid.
   *
   * Second, breadth-then-depth is better exam prep than finishing one topic at
   * a time: you find out early what you already know, and repeat exposure
   * spaced across the material beats one long block on each. */
  function firstAtLowestLevel(rows) {
    for (var level = 0; level < 3; level++) {
      for (var i = 0; i < rows.length; i++) {
        if (Store.confidence(rows[i].topic.id) === level) return rows[i];
      }
    }
    return null;
  }

  function nextTopic() {
    var settings = Store.settings();

    /* An explicit focus wins. Falls through once that exam is finished rather
     * than dead-ending on it. */
    if (settings.focusExam) {
      var picked = firstAtLowestLevel(topicsOf(settings.focusExam));
      if (picked) return picked;
    }

    if (!settings.route) return null;
    return firstAtLowestLevel(routeTopics(settings.route));
  }

  /* Exams you can actually start today.
   *
   * Anything in `alsoDoing` is available immediately — DP-700 has no
   * relationship to the AZ-800/801/802 fork, so gating it behind that decision
   * was just a way to make "I want to do some work" impossible on a day when
   * the decision felt too big. The Windows Server exams stay gated because
   * until you pick a route, nobody knows which one you would be studying. */
  function availableExams() {
    var settings = Store.settings();
    var codes = (PEBKAC.PLAN.alsoDoing || []).slice();
    if (settings.route) {
      codes = routeExamCodes(settings.route).filter(function (c, i, a) {
        return a.indexOf(c) === i;
      });
    }
    return codes;
  }

  /* Small, low-prominence, and only shown when there is a real choice — a
   * switcher on the home screen is one decision away from being the menu this
   * page exists to avoid. */
  function focusSwitcher(currentCode) {
    var codes = availableExams();
    if (codes.length < 2) return '';

    /* Current exam first, then the alternatives — otherwise plan order can
     * render "Working on switch to AZ-802 · DP-700", which parses as nonsense. */
    var others = codes.filter(function (code) { return code !== currentCode; });

    return '<p class="focus">Working on <strong>' + esc(currentCode) + '</strong>' +
      (others.length
        ? ' · ' + others.map(function (code) {
            return '<button class="linkish" data-action="focus" data-exam="' + esc(code) + '">switch to ' + esc(code) + '</button>';
          }).join(' · ')
        : '') +
      '</p>';
  }

  /* Pack remaining topics into weeks at the current budget. Topics split
   * across a week boundary rather than being bumped, so a big topic never
   * creates a phantom idle week. */
  function schedule(routeId) {
    var settings = Store.settings();
    var budget = Math.max(settings.hoursPerWeek, 1);
    var weeks = [];
    var current = { items: [], hours: 0 };

    routeTopics(routeId).forEach(function (row) {
      var left = remainingHours(row.topic);
      if (left <= 0) return;
      var whole = left;

      while (left > 0.001) {
        var space = budget - current.hours;
        var take = Math.min(space, left);
        current.items.push({
          row: row,
          hours: take,
          partial: take < whole - 0.001,
        });
        current.hours += take;
        left -= take;

        if (current.hours >= budget - 0.001) {
          weeks.push(current);
          current = { items: [], hours: 0 };
        }
      }
    });

    if (current.items.length) weeks.push(current);
    return weeks;
  }

  /* ---------------------------------------------------------- components -- */

  function bar(percent, klass) {
    return '<div class="bar ' + (klass || '') + '"><span style="width:' + percent + '%"></span></div>';
  }

  function confidenceControl(topicId) {
    var current = Store.confidence(topicId);
    return '<div class="conf" role="group" aria-label="Confidence">' +
      PEBKAC.CONFIDENCE.map(function (level) {
        return '<button type="button" class="conf-btn' + (current === level.value ? ' on' : '') +
          '" data-action="conf" data-topic="' + esc(topicId) + '" data-value="' + level.value +
          '" title="' + esc(level.label) + '" aria-pressed="' + (current === level.value) + '">' +
          esc(level.short) + '</button>';
      }).join('') +
      '</div>';
  }

  function retirementBanner(exam) {
    if (exam.status !== 'retiring') return '';
    var days = daysUntil(exam.retiresOn);
    var tone = days < 60 ? 'warn' : 'muted';
    return '<p class="pill ' + tone + '">Retires ' + esc(exam.retiresLabel) +
      ' — ' + plural(days, 'day') + ' left</p>';
  }

  /* ---------------------------------------------------------- view: now --- */

  function viewNow() {
    var settings = Store.settings();

    var next = nextTopic();

    if (!next && !settings.route) {
      var startable = (PEBKAC.PLAN.alsoDoing || []);
      return '<section class="card lead">' +
        '<div class="card-head">' + PEBKAC.critter('calico', { size: 'lg', tint: 'lilac', bob: true }) +
          '<h2>Pick a route first</h2></div>' +
        '<p>The Windows Server exams need that decision before anything can be scheduled — until you choose, nobody knows whether you are studying AZ-800 and AZ-801 or AZ-802.</p>' +
        '<p><button class="primary" data-action="nav" data-view="decision">Show me the three options</button></p>' +
        (startable.length
          ? '<hr class="rule">' +
            '<p><strong>' + esc(startable.join(' and ')) + '</strong> does not depend on that decision at all. ' +
            'If today is a day for doing work rather than making choices, start there.</p>' +
            '<p>' + startable.map(function (code) {
              return '<button class="primary" data-action="focus" data-exam="' + esc(code) + '">Work on ' + esc(code) + ' now</button>';
            }).join(' ') + '</p>'
          : '') +
        '</section>' + viewDecisionSummary();
    }

    if (!next) {
      return '<section class="card lead">' +
        '<div class="card-head">' + PEBKAC.critter('shepherd', { size: 'lg', tint: 'peach', bob: true }) +
          '<h2>Nothing left on this route.</h2></div>' +
        '<p>Every topic is marked <em>Did it cold</em>. Either you are ready, or the confidence ratings are optimistic — both are worth knowing.</p>' +
        '<p><button data-action="nav" data-view="objectives">Review the ratings</button></p></section>';
    }

    var conf = Store.confidence(next.topic.id);
    var verb = conf === 0 ? 'Start' : 'Continue';

    /* The critter is keyed to the topic, so it changes when you move on —
     * a small, free "you got somewhere" signal that costs no extra reading. */
    var buddy = PEBKAC.critterNames[next.topic.id.length % PEBKAC.critterNames.length];
    var running = timer && timer.running();

    var html = '<section class="card now">' +
      '<div class="now-head">' +
        '<div>' +
          '<p class="eyebrow">' + esc(next.exam.code) + ' · ' + esc(next.domain.name) + '</p>' +
          '<h2>' + esc(next.topic.name) + '</h2>' +
        '</div>' +
        PEBKAC.critter(running ? 'corgi' : buddy, { size: 'lg', seed: next.topic.id, bob: running }) +
      '</div>' +
      focusSwitcher(next.exam.code) +
      '<p class="meta">' + esc(next.domain.weight) + ' of the exam · about ' +
        plural(next.topic.hours, 'hour') + ' total · currently <strong>' +
        esc(PEBKAC.CONFIDENCE[conf].label) + '</strong></p>' +

      '<div id="timer-slot">' + timerControls(next.topic.id, verb) + '</div>' +

      '<details class="skills"' + (state.open.nowSkills ? ' open' : '') + ' data-remember="nowSkills">' +
        '<summary>What this actually covers (' + next.topic.skills.length + ')</summary>' +
        '<ul>' + next.topic.skills.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '</details>' +

      '<p class="links">' +
        (next.exam.links.studyGuide ? '<a href="' + next.exam.links.studyGuide + '" target="_blank" rel="noopener">Study guide</a>' : '') +
        (next.exam.links.extra ? '<a href="' + next.exam.links.extra + '" target="_blank" rel="noopener">Docs</a>' : '') +
        (next.exam.links.practice ? '<a href="' + next.exam.links.practice + '" target="_blank" rel="noopener">Practice questions</a>' : '') +
      '</p>' +

      '<p class="after">' +
        '<button class="primary" data-action="conf" data-topic="' + esc(next.topic.id) + '" data-value="' + Math.min(conf + 1, 3) + '">' +
          (conf === 0 ? 'Read it — move on'
            : conf === 1 ? 'I could explain this — move on'
            : 'I can do this cold — done with it') + '</button> ' +
        '<button data-action="conf" data-topic="' + esc(next.topic.id) + '" data-value="3">Skip — I already know this</button>' +
      '</p>' +
      '</section>';

    return html + parkPanel() + paceStrip();
  }

  function timerControls(topicId, verb) {
    var settings = Store.settings();
    if (timer && timer.running()) {
      return '<div class="timer live">' +
        '<span class="clock" id="clock">' + PEBKAC.Timer.format(timer.remaining) + '</span>' +
        '<button data-action="bank">Stop &amp; keep the time</button>' +
        '</div>';
    }
    return '<div class="timer">' +
      '<button class="primary big" data-action="start" data-minutes="' + settings.sessionMinutes + '" data-topic="' + esc(topicId) + '">' +
        esc(verb) + ' — ' + settings.sessionMinutes + ' min</button>' +
      '<button data-action="start" data-minutes="' + PEBKAC.PLAN.shortSessionMinutes + '" data-topic="' + esc(topicId) + '">' +
        'Just ' + PEBKAC.PLAN.shortSessionMinutes + ' minutes</button>' +
      '</div>';
  }

  function parkPanel() {
    var items = Store.parked();
    return '<section class="card quiet">' +
      '<div class="card-head">' + PEBKAC.critter('dachshund', { size: 'md', tint: 'mint' }) +
        '<h3>Park a thought</h3></div>' +
      '<p class="meta">Something unrelated just became urgent. Hand it over and keep going.</p>' +
      '<form data-action="park-form"><input type="text" id="park-input" placeholder="the thing that just barged in" autocomplete="off"><button type="submit">Park</button></form>' +
      (items.length
        ? '<ul class="parked">' + items.map(function (item, i) {
            return '<li><span>' + esc(item.text) + '</span><button data-action="unpark" data-index="' + i + '" title="Clear">×</button></li>';
          }).join('') + '</ul>'
        : '') +
      '</section>';
  }

  function paceStrip() {
    var settings = Store.settings();
    var stats = routeStats(settings.route);
    if (!stats) return '';

    var thisWeek = Math.round(Store.minutesSince(7) / 6) / 10;
    var days = Store.activeDays(7);

    var line;
    if (!settings.deadline && !stats.route.hardStop) {
      line = 'No deadline set. ' + num(stats.remainingHours) + ' hours of material left — about ' +
        plural(Math.ceil(stats.weeksAtCurrentPace), 'week') + ' at ' + stats.budgetPerWeek + 'h/week.';
    } else if (stats.daysLeft <= 0) {
      line = 'The binding date has passed. Worth re-picking a route.';
    } else {
      line = num(stats.remainingHours) + ' hours left · ' + plural(stats.daysLeft, 'day') +
        ' to ' + fmtDate(stats.binding) + ' · needs ' + num(stats.requiredPerWeek) + 'h/week';
    }

    return '<section class="card strip">' +
      '<p>' + esc(line) + '</p>' +
      '<p class="meta">Last 7 days: ' + num(thisWeek) + ' hours across ' + plural(days, 'day') +
      '. <a href="#timeline" data-action="nav" data-view="timeline">See the week-by-week</a></p>' +
      '</section>';
  }

  /* ----------------------------------------------------- view: decision --- */

  function viewDecision() {
    var settings = Store.settings();
    return '<section class="card lead">' +
      '<h2>Three routes. They are not equivalent.</h2>' +
      '<p>AZ-800 and AZ-801 retire <strong>30 September 2026</strong>. AZ-802 replaces both, but it is still a <strong>beta exam</strong>, which means results are held until it goes GA. The numbers below use your real progress and your stated ' +
      settings.hoursPerWeek + ' hours a week.</p>' +
      '<p class="meta">This fork is only about the Windows Server exam, so the headline figures compare Windows Server hours. ' +
      esc((PEBKAC.PLAN.alsoDoing || []).join(' + ')) +
      ' costs the same whichever branch you take and is listed separately on each card — it is still in the timeline and still in Right now.</p>' +
      (settings.deadline
        ? '<p class="meta">Measuring against your deadline: <strong>' + fmtDate(settings.deadline) + '</strong>' +
          (settings.deadlineWhat ? ' — ' + esc(settings.deadlineWhat) : '') + '</p>'
        : '<p class="pill warn">No deadline set yet. Add it in Settings and these numbers get much sharper.</p>') +
      '</section>' + viewDecisionSummary();
  }

  function viewDecisionSummary() {
    var settings = Store.settings();

    return '<div class="routes">' + ROUTES.map(function (route) {
      var stats = routeStats(route.id);
      var chosen = settings.route === route.id;

      var verdict = '';
      if (stats.daysLeft !== null && stats.daysLeft > 0) {
        var tone = stats.coreFeasible ? 'ok' : 'warn';
        verdict = '<p class="pill ' + tone + '">' +
          num(stats.coreRequiredPerWeek) + ' h/week needed (' + num(stats.coreRequiredPerDay) +
          ' h/day, every day) · you have ' + stats.budgetPerWeek + ' h/week' +
          '</p>';
        if (stats.bindingIsHardStop) {
          verdict += '<p class="meta">Bound by the retirement cliff, not your deadline: ' +
            plural(stats.daysLeft, 'day') + ' left.</p>';
        }
      } else if (stats.coreWeeksAtCurrentPace) {
        verdict = '<p class="pill ok">About ' + plural(Math.ceil(stats.coreWeeksAtCurrentPace), 'week') +
          ' at ' + stats.budgetPerWeek + ' h/week</p>';
      }

      /* Stated once per card so the DP-700 load never silently disappears
       * from the decision, even though it does not vary between routes. */
      if (stats.extraRemaining > 0) {
        verdict += '<p class="meta">Then ' + esc(stats.extraCodes.join(' + ')) + ' on top: ' +
          num(stats.extraRemaining) + ' hours, about ' +
          plural(Math.ceil(stats.extraRemaining / stats.budgetPerWeek), 'week') + ' more.</p>';
      }

      /* The deadline verdict — everything, not just the Windows Server half. */
      var v = routeVerdict(route.id);
      if (v) {
        verdict += '<div class="verdictbox ' + v.tone + '">' +
          '<p class="vhead">' + esc(v.headline) + '</p>' +
          '<p class="meta">Everything by ' + fmtDate(settings.deadline) + ': ' +
            num(v.totalRemaining) + ' hours in ' + plural(v.stats.deadlineDays, 'day') +
            ' — <strong>' + num(v.needPerWeek) + ' h/week</strong> (' + num(v.needPerDay) + ' h/day).</p>';

        if (v.cliffSqueeze) {
          verdict += '<p class="meta">And the Windows Server half is not spread over that: it has to clear ' +
            '30 September, which is ' + plural(v.cliffSqueeze.days, 'day') + ' — ' +
            num(v.cliffSqueeze.perWeek) + ' h/week (' + num(v.cliffSqueeze.perDay) + ' h/day) on its own.</p>';
        }

        if (v.betaBlocks) {
          verdict += '<p class="meta">' + esc(v.betaExam) + ' is a beta exam. You can sit it before the date; ' +
            'the score is held until it goes GA, and Microsoft has not published when that is. ' +
            'The studying is fine — it is the certificate that will not arrive on schedule.</p>';
        }

        verdict += '</div>';
      }

      var faces = { sprint: 'pug', beta: 'beagle', wait: 'calico' };

      return '<section class="card route' + (chosen ? ' chosen' : '') + '">' +
        '<div class="card-head">' + PEBKAC.critter(faces[route.id] || 'corgi', { size: 'md', seed: route.id }) +
          '<h3>' + esc(route.name) + '</h3></div>' +
        '<p class="meta">' + route.exams.map(esc).join(' + ') + ' → ' + esc(route.earns) + '</p>' +
        '<p class="meta">' + num(stats.coreRemaining) + ' hours of Windows Server material left</p>' +
        verdict +
        '<ul class="pros">' + route.pros.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
        '<ul class="cons">' + route.cons.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
        '<p class="verdict">' + esc(route.verdict) + '</p>' +
        '<p>' + (chosen
          ? '<span class="pill ok">This is your route</span>'
          : '<button class="primary" data-action="choose-route" data-route="' + esc(route.id) + '">Take this route</button>') +
        '</p>' +
        '</section>';
    }).join('') + '</div>';
  }

  /* --------------------------------------------------------- view: path --- */

  function viewPath() {
    var career = PEBKAC.CAREER;

    var exams = ['AZ-800', 'AZ-801', 'AZ-802', 'DP-700'].map(function (code) {
      var exam = CERTS[code];
      var stats = examStats(code);
      var badge = exam.status === 'beta' ? '<span class="pill warn">Beta</span>'
        : exam.status === 'retiring' ? '<span class="pill warn">Retiring</span>'
        : '<span class="pill ok">Active</span>';

      var face = exam.status === 'beta' ? 'beagle' : exam.status === 'retiring' ? 'siamese' : 'corgi';

      return '<section class="card">' +
        '<div class="card-head">' + PEBKAC.critter(face, { size: 'md', seed: code }) +
          '<h3>' + esc(exam.code) + ' ' + badge + '</h3></div>' +
        '<p class="meta">' + esc(exam.title) + '</p>' +
        '<p class="meta">Earns: ' + esc(exam.cert) + '</p>' +
        retirementBanner(exam) +
        '<p>' + esc(exam.why) + '</p>' +
        (exam.betaCaveats
          ? '<ul class="cons">' + exam.betaCaveats.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>'
          : '') +
        '<p class="meta">' + stats.topicCount + ' topics · ' + num(stats.totalHours) + ' estimated hours · objectives as of ' +
          fmtDate(exam.skillsUpdated) + '</p>' +
        bar(stats.percent) +
        '<p class="meta">' + stats.percent + '% rated</p>' +
        '</section>';
    }).join('');

    return '<section class="card lead">' +
      '<h2>' + esc(career.headline) + '</h2>' +
      career.reading.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '<h3>Worth answering at some point</h3>' +
      '<ul>' + career.nextQuestions.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul>' +
      '</section>' +
      '<div class="grid">' + exams + '</div>' +
      '<section class="card quiet">' +
        '<h3>On question banks</h3>' +
        '<p>Drilling questions before you understand the material is not the mistake — retrieval practice genuinely works, and it is why that habit stuck. The sourcing is the problem: sites that publish leaked live exam items put your certification at risk, because using them breaches the agreement you accept at the testing centre.</p>' +
        '<p>These are the equivalents that carry no such risk:</p>' +
        '<ul>' + PEBKAC.PRACTICE_SOURCES.map(function (s) {
          return '<li><a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.name) + '</a> — ' + esc(s.note) + '</li>';
        }).join('') + '</ul>' +
      '</section>';
  }

  /* ----------------------------------------------------- view: timeline --- */

  function viewTimeline() {
    var settings = Store.settings();
    if (!settings.route) {
      return '<section class="card lead"><h2>No route chosen yet</h2>' +
        '<p><button class="primary" data-action="nav" data-view="decision">Choose one</button></p></section>';
    }

    var stats = routeStats(settings.route);
    var weeks = schedule(settings.route);

    if (!weeks.length) {
      return '<section class="card lead"><h2>Nothing left to schedule.</h2></section>';
    }

    var start = new Date();
    var header = '<section class="card lead">' +
      '<h2>' + plural(weeks.length, 'week') + ' at ' + settings.hoursPerWeek + ' hours a week</h2>' +
      '<p>Finishing around <strong>' + fmtDate(new Date(start.getTime() + weeks.length * 7 * 86400000)) + '</strong>.</p>';

    if (stats.binding && stats.daysLeft > 0) {
      var slackWeeks = (stats.daysLeft / 7) - weeks.length;
      if (slackWeeks >= 0) {
        header += '<p class="pill ok">That lands about ' + plural(Math.floor(slackWeeks), 'week') +
          ' before ' + fmtDate(stats.binding) + '.</p>';
      } else {
        header += '<p class="pill warn">That is about ' + plural(Math.ceil(-slackWeeks), 'week') +
          ' past ' + fmtDate(stats.binding) + '. Either the hours go up to ' +
          num(stats.requiredPerWeek) + '/week, or the date moves. Both are fine answers.</p>';
      }
    }
    header += '<p class="meta">Recalculated every time you rate a topic. Falling behind changes the plan, not your standing.</p></section>';

    /* You asked for a two-week cadence. It cannot be a certification every two
     * weeks — AZ-802 alone is ~112 hours, which is eleven weeks at your budget,
     * and no amount of arranging changes that. But the *rhythm* is the useful
     * part of that request, so weeks are grouped into two-week sprints with a
     * concrete finish line on each. Something completes every fortnight. */
    var cadence = PEBKAC.PLAN.cadenceWeeks || 2;
    var sprints = [];
    for (var w = 0; w < weeks.length; w += cadence) {
      sprints.push(weeks.slice(w, w + cadence));
    }

    var body = sprints.map(function (group, s) {
      var firstWeek = s * cadence;
      var from = new Date(start.getTime() + firstWeek * 7 * 86400000);
      var to = new Date(start.getTime() + (firstWeek + group.length) * 7 * 86400000);

      var seen = {};
      var items = [];
      group.forEach(function (week) {
        week.items.forEach(function (item) {
          var key = item.row.topic.id;
          if (seen[key]) return;
          seen[key] = true;
          items.push({ label: item.row.exam.code + ' · ' + item.row.topic.name, partial: item.partial });
        });
      });

      /* The finish line for the sprint: the last thing that fully completes. */
      var closing = items.filter(function (i) { return !i.partial; }).slice(-1)[0];

      return '<section class="card week">' +
        '<h3>' + PEBKAC.critter(PEBKAC.critterNames[s % PEBKAC.critterNames.length], { size: 'sm', seed: 'sprint' + s }) +
          'Sprint ' + (s + 1) + ' <span class="meta">' + fmtDate(from) + ' – ' + fmtDate(to) + '</span></h3>' +
        '<ul>' + items.map(function (i) {
          return '<li>' + esc(i.label) + (i.partial ? ' <span class="meta">(continues)</span>' : '') + '</li>';
        }).join('') + '</ul>' +
        (closing ? '<p class="pill ok">Done by the end: ' + esc(closing.label.split(' · ')[1]) + '</p>' : '') +
        '</section>';
    }).join('');

    return header + '<div class="grid">' + body + '</div>';
  }

  /* --------------------------------------------------- view: objectives --- */

  function viewObjectives() {
    var settings = Store.settings();
    var codes = settings.route
      ? routeExamCodes(settings.route)
      : ['AZ-802'].concat(PEBKAC.PLAN.alsoDoing || []);

    /* De-duplicate while keeping order. */
    codes = codes.filter(function (c, i) { return codes.indexOf(c) === i; });

    return codes.map(function (code) {
      var exam = CERTS[code];
      var stats = examStats(code);

      var domains = exam.domains.map(function (domain) {
        var topics = domain.topics.map(function (topic) {
          var conf = Store.confidence(topic.id);
          return '<li class="topic' + (conf === 3 ? ' done' : '') + '">' +
            '<div class="topic-head">' +
              '<span class="topic-name">' + esc(topic.name) + '</span>' +
              confidenceControl(topic.id) +
            '</div>' +
            '<details><summary class="meta">' + plural(topic.skills.length, 'skill') + ' · ' +
              plural(topic.hours, 'hour') +
              (topic.droppedInAz802 ? ' · <span class="pill warn inline">not in AZ-802</span>' : '') +
              '</summary>' +
              '<ul class="skills-list">' + topic.skills.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
            '</details>' +
            '</li>';
        }).join('');

        return '<div class="domain">' +
          '<h4>' + esc(domain.name) + ' <span class="meta">' + esc(domain.weight) + '</span>' +
          (domain.droppedInAz802 ? ' <span class="pill warn inline">gone in AZ-802</span>' : '') + '</h4>' +
          '<ul class="topics">' + topics + '</ul>' +
          '</div>';
      }).join('');

      return '<section class="card">' +
        '<h2>' + esc(exam.code) + ' <span class="meta">' + esc(exam.title) + '</span></h2>' +
        retirementBanner(exam) +
        bar(stats.percent) +
        '<p class="meta">' + stats.percent + '% rated · ' + num(stats.remainingHours) + ' of ' +
          num(stats.totalHours) + ' hours left</p>' +
        domains +
        '</section>';
    }).join('');
  }

  /* ------------------------------------------------------ view: explore --- */

  function viewExplore() {
    var cards = PEBKAC.EXPLORE.map(function (item) {
      var body;

      if (item.pending) {
        body = '<p>' + esc(item.what) + '</p>' +
          '<p class="meta">' + esc(item.fit) + '</p>' +
          '<ul class="candidates">' + item.candidates.map(function (c) {
            return '<li><strong>' + esc(c.code) + '</strong> — ' + esc(c.name) +
              ' <span class="meta">(' + esc(c.issuer) + ')</span><br><span class="meta">' + esc(c.note) + '</span></li>';
          }).join('') + '</ul>';
      } else {
        body = '<p class="meta">' + esc(item.format) + '</p>' +
          '<p class="meta">' + esc(item.cost) + '</p>' +
          '<p>' + esc(item.what) + '</p>' +
          '<h4>How it sits against your current path</h4>' +
          '<p>' + esc(item.fit) + '</p>' +
          '<details><summary class="meta">' + plural(item.domains.length, 'domain') + '</summary>' +
            '<ul class="skills-list">' + item.domains.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' +
          '</details>';
      }

      return '<section class="card">' +
        '<div class="card-head">' + PEBKAC.critter(item.critter, { size: 'md', seed: item.code }) +
          '<h3>' + esc(item.code) + '</h3></div>' +
        '<p class="meta">' + esc(item.name) + (item.pending ? '' : ' · ' + esc(item.issuer) + ' · ' + esc(item.level)) + '</p>' +
        body +
        (item.watch && item.watch.length
          ? '<h4>Worth knowing first</h4><ul class="cons">' +
            item.watch.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>'
          : '') +
        (item.links && item.links.length
          ? '<p class="links">' + item.links.map(function (l) {
              return '<a href="' + l.url + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>';
            }).join('') + '</p>'
          : '') +
        '</section>';
    }).join('');

    return '<section class="card lead">' +
      '<div class="card-head">' + PEBKAC.critter('shepherd', { size: 'lg', tint: 'lilac', bob: true }) +
        '<h2>Things you are not committed to</h2></div>' +
      '<p>Nothing on this page touches the plan. It is not in the timeline, it does not appear in Right now, and it adds zero hours to any figure elsewhere on the site.</p>' +
      '<p>That is deliberate. A maybe sitting next to a commitment turns the commitment into a maybe, and then the plan stops meaning anything. When one of these graduates from interesting to decided, it moves — until then it lives here.</p>' +
      '</section>' +
      '<div class="grid">' + cards + '</div>' +
      '<section class="card quiet">' +
        '<h3>A pattern worth noticing</h3>' +
        '<p>Two of these are security credentials and one is a second cloud — and none of them are on your current path, which is Windows Server administration plus Fabric data engineering. That is not a problem, but it is information: everything you picked out for yourself leans security, and nothing you were assigned does.</p>' +
        '<p>That is a real signal about what you actually want, and it is worth raising rather than treating as a hobby. The cheapest version of that conversation is asking whether a security credential could count toward the same development goal the assigned ones are serving.</p>' +
      '</section>';
  }

  /* -------------------------------------------------------- view: later --- */

  /* -------------------------------------------------------- view: goals --- */

  function viewGoals() {
    var settings = Store.settings();
    var inPlan = settings.route ? routeExamCodes(settings.route) : [];

    var cards = Object.keys(PEBKAC.GOALS).map(function (code) {
      var goal = PEBKAC.GOALS[code];
      var exam = CERTS[code];
      var active = inPlan.indexOf(code) !== -1;

      return '<section class="card' + (active ? ' chosen' : '') + '">' +
        '<div class="card-head">' + PEBKAC.critter(goal.critter, { size: 'md', seed: code }) +
          '<h3>' + esc(code) + '</h3></div>' +
        '<p class="meta">' + esc(exam.title) + '</p>' +
        '<p><span class="pill ' + (active ? 'ok' : 'muted') + '">' + esc(goal.mandate) + '</span>' +
          (active ? ' <span class="pill ok">in your plan</span>' : '') + '</p>' +

        '<h4>Why this one</h4><p>' + esc(goal.why) + '</p>' +
        '<h4>What it gets you</h4><p>' + esc(goal.benefit) + '</p>' +

        '<h4>What people report</h4>' +
        '<ul class="pros">' + goal.themes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +

        '<h4>Money</h4>' +
        '<p class="meta">' + esc(goal.salary.role) + '</p>' +
        '<p class="salary">' + esc(goal.salary.band) + '</p>' +
        '<p class="meta">Typically ' + esc(goal.salary.typical) + '.</p>' +
        '<p class="meta">' + esc(goal.salary.note) + '</p>' +
        '<p class="links">' + goal.salary.sources.map(function (s) {
          return '<a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>';
        }).join('') + '</p>' +
        '</section>';
    }).join('');

    return '<section class="card lead">' +
      '<div class="card-head">' + PEBKAC.critter('shepherd', { size: 'lg', tint: 'butter', bob: true }) +
        '<h2>Why any of this</h2></div>' +
      '<p>The page to open when the studying stops making sense — which it will, somewhere around week four, and that is the normal place for it to happen rather than a sign anything is wrong.</p>' +
      '<p>Three of these were assigned rather than chosen. That is worth naming plainly, because a goal set by someone else is a different kind of thing to hold on to than one you picked, and pretending otherwise is how motivation quietly leaks.</p>' +
      '</section>' +
      '<div class="grid">' + cards + '</div>' +
      '<section class="card quiet">' +
        '<h3>Read the numbers carefully</h3>' +
        '<ul class="cons">' + PEBKAC.GOALS_CAVEATS.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
      '</section>';
  }

  /* ---------------------------------------------------- view: languages --- */

  function viewLanguages() {
    var cards = PEBKAC.LANGUAGES.map(function (lang) {
      return '<section class="card' + (lang.focus ? ' chosen' : '') + '">' +
        '<div class="card-head">' + PEBKAC.critter(lang.critter, { size: 'md', seed: lang.name }) +
          '<h3>' + esc(lang.name) + ' <span class="meta">' + esc(lang.native) + '</span></h3></div>' +
        (lang.focus ? '<p><span class="pill ok">your focus</span></p>' : '') +
        '<p class="pill muted">' + esc(lang.fsi) + '</p>' +
        '<p>' + esc(lang.why) + '</p>' +
        '<h4>What you are actually signing up for</h4>' +
        '<ul class="pros">' + lang.shape.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
        '<h4>Daily floor</h4><p class="meta">' + esc(lang.floor) + '</p>' +
        '</section>';
    }).join('');

    return '<section class="card lead">' +
      '<div class="card-head">' + PEBKAC.critter('husky', { size: 'lg', tint: 'mint', bob: true }) +
        '<h2>Languages</h2></div>' +
      '<p>' + esc(PEBKAC.LANGUAGE_NOTE) + '</p>' +
      '<p class="meta">Hour figures are US Foreign Service Institute estimates for English speakers reaching professional working proficiency, under intensive instruction. The absolute numbers will not match your life; the ratios between them will.</p>' +
      '</section>' +
      '<div class="grid">' + cards + '</div>';
  }

  /* --------------------------------------------------- view: philosophy --- */

  function viewPhilosophy() {
    var cards = PEBKAC.PHILOSOPHY.map(function (thread) {
      return '<section class="card">' +
        '<div class="card-head">' + PEBKAC.critter(thread.critter, { size: 'md', seed: thread.name }) +
          '<h3>' + esc(thread.name) + '</h3></div>' +
        '<p class="question">' + esc(thread.question) + '</p>' +
        '<p>' + esc(thread.why) + '</p>' +
        '<h4>Threads to pull</h4>' +
        '<ul class="pros">' + thread.threads.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<h4>Where it gets uncomfortable</h4>' +
        '<p class="verdict">' + esc(thread.tension) + '</p>' +
        '</section>';
    }).join('');

    return '<section class="card lead">' +
      '<div class="card-head">' + PEBKAC.critter('calico', { size: 'lg', tint: 'lilac', bob: true }) +
        '<h2>Philosophy</h2></div>' +
      '<p>Mostly psychology and rhetoric rather than philosophy proper — but the label is yours and the questions underneath are real ones.</p>' +
      '<p>Each thread carries a tension at the end on purpose. A reading list where everything agrees is not a reading list, it is a sales pitch, and three of these four topics have a large industry built on selling them to you.</p>' +
      '</section>' +
      '<div class="grid">' + cards + '</div>';
  }


  /* ----------------------------------------------------- view: settings --- */

  function viewSettings() {
    var settings = Store.settings();
    return '<section class="card lead">' +
      '<h2>Settings</h2>' +

      '<label>Hours a week you can genuinely give this' +
        '<input type="number" min="1" max="60" step="1" value="' + settings.hoursPerWeek + '" data-setting="hoursPerWeek">' +
      '</label>' +
      '<p class="meta">Pick the number for a bad week, not a good one. Every figure on this site derives from it.</p>' +

      '<label>Deadline' +
        '<input type="date" value="' + (settings.deadline || '') + '" data-setting="deadline">' +
      '</label>' +
      '<label>What is the deadline for?' +
        '<input type="text" value="' + esc(settings.deadlineWhat || '') + '" data-setting="deadlineWhat" placeholder="who is expecting what, and when">' +
      '</label>' +

      '<label>By the deadline, what has to be true?' +
        '<select data-setting="deadlineMeans">' +
          '<option value="certified"' + (settings.deadlineMeans === 'certified' ? ' selected' : '') +
            '>Certified — credential in hand</option>' +
          '<option value="sat"' + (settings.deadlineMeans === 'sat' ? ' selected' : '') +
            '>Exams sat — results whenever they land</option>' +
        '</select>' +
      '</label>' +
      '<p class="meta">This is the difference between AZ-802 being your best option and being unavailable. Beta scores are held until the exam goes GA, so "certified by a date" rules it out and "sat by a date" does not.</p>' +

      '<label>Focus session length (minutes)' +
        '<input type="number" min="5" max="90" step="5" value="' + settings.sessionMinutes + '" data-setting="sessionMinutes">' +
      '</label>' +

      '<h3>Route</h3>' +
      '<p class="meta">Currently: <strong>' + esc(settings.route || 'not chosen') + '</strong>. ' +
        '<a href="#decision" data-action="nav" data-view="decision">Change it</a></p>' +

      '<h3>Current focus</h3>' +
      '<p class="meta">"Right now" is drawing from <strong>' +
        esc(settings.focusExam || 'the route order') + '</strong>.' +
        (settings.focusExam
          ? ' <button class="linkish" data-action="focus" data-exam="">Follow the route order instead</button>'
          : '') +
      '</p>' +

      '<h3>Study order</h3>' +
      '<p class="meta">Your route covers the Windows Server exam. ' +
        esc((PEBKAC.PLAN.alsoDoing || []).join(' + ')) +
        ' sits outside that fork and runs ' + (settings.alsoDoingFirst ? 'first' : 'after') + '.</p>' +
      '<label class="inline-check"><input type="checkbox" data-setting="alsoDoingFirst"' +
        (settings.alsoDoingFirst ? ' checked' : '') + '> Do ' +
        esc((PEBKAC.PLAN.alsoDoing || []).join(' + ')) + ' first instead</label>' +
      '<p class="meta">Worth flipping only if the data work has the earlier deadline — the Windows Server side is the one with a retirement cliff on it.</p>' +

      '<h3>Your data</h3>' +
      '<p class="meta">Everything lives in this browser only — no account, nothing sent anywhere. Clearing site data wipes it, so export if it matters.</p>' +
      '<p><button data-action="export">Export a backup</button></p>' +
      '</section>';
  }

  /* ---------------------------------------------------------------- shell -- */

  var VIEWS = {
    now: { label: 'Right now', render: viewNow },
    decision: { label: 'The decision', render: viewDecision },
    path: { label: 'The path', render: viewPath },
    timeline: { label: 'Timeline', render: viewTimeline },
    objectives: { label: 'Objectives', render: viewObjectives },
    goals: { label: 'Why', render: viewGoals },
    languages: { label: 'Languages', render: viewLanguages },
    philosophy: { label: 'Philosophy', render: viewPhilosophy },
    explore: { label: 'Explore', render: viewExplore },
    settings: { label: 'Settings', render: viewSettings },
  };

  function render() {
    var settings = Store.settings();

    document.getElementById('nav').innerHTML = Object.keys(VIEWS).map(function (key) {
      return '<button class="' + (state.view === key ? 'on' : '') + '" data-action="nav" data-view="' + key + '">' +
        esc(VIEWS[key].label) + '</button>';
    }).join('');

    document.getElementById('main').innerHTML = VIEWS[state.view].render();

    /* A route that has already hit its cliff is the one thing worth
     * interrupting for, wherever you are on the site. */
    var alert = document.getElementById('alert');
    var az800 = daysUntil(CERTS['AZ-800'].retiresOn);
    if (!settings.route && az800 > 0) {
      alert.innerHTML = '<p><strong>' + plural(az800, 'day') + '</strong> until AZ-800 and AZ-801 retire. ' +
        'That constrains one of your three options. <button data-action="nav" data-view="decision">Decide</button></p>';
      alert.hidden = false;
    } else {
      alert.hidden = true;
    }
  }

  function tickClock(remaining) {
    var clock = document.getElementById('clock');
    if (clock) clock.textContent = PEBKAC.Timer.format(remaining);
  }

  /* --------------------------------------------------------------- events -- */

  document.addEventListener('click', function (event) {
    var el = event.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    if (action === 'nav') {
      event.preventDefault();
      state.view = el.getAttribute('data-view');
      location.hash = state.view;
      render();

    } else if (action === 'conf') {
      Store.setConfidence(el.getAttribute('data-topic'), Number(el.getAttribute('data-value')));
      render();

    } else if (action === 'focus') {
      Store.setSetting('focusExam', el.getAttribute('data-exam') || null);
      state.view = 'now';
      location.hash = 'now';
      render();

    } else if (action === 'choose-route') {
      Store.setSetting('route', el.getAttribute('data-route'));
      state.view = 'now';
      location.hash = 'now';
      render();

    } else if (action === 'start') {
      timer.start(Number(el.getAttribute('data-minutes')), el.getAttribute('data-topic'));
      render();

    } else if (action === 'bank') {
      timer.bank();
      render();

    } else if (action === 'unpark') {
      Store.unpark(Number(el.getAttribute('data-index')));
      render();

    } else if (action === 'theme') {
      var next = Store.settings().theme === 'dark' ? 'light' : 'dark';
      Store.setSetting('theme', next);
      applyTheme();

    } else if (action === 'export') {
      var blob = new Blob([Store.exportAll()], { type: 'application/json' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'pebkac-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      link.click();
      URL.revokeObjectURL(link.href);
    }
  });

  document.addEventListener('submit', function (event) {
    if (event.target.getAttribute('data-action') !== 'park-form') return;
    event.preventDefault();
    var input = document.getElementById('park-input');
    var text = input.value.trim();
    if (!text) return;
    Store.park(text);
    render();
  });

  document.addEventListener('change', function (event) {
    var key = event.target.getAttribute('data-setting');
    if (!key) return;
    var value;
    if (event.target.type === 'checkbox') value = event.target.checked;
    else if (event.target.type === 'number') value = Number(event.target.value);
    else value = event.target.value === '' ? null : event.target.value;
    Store.setSetting(key, value);
    render();
  });

  /* Remember which disclosure triangles were open across re-renders — having
   * them snap shut on every click is its own small punishment. */
  document.addEventListener('toggle', function (event) {
    var key = event.target.getAttribute('data-remember');
    if (key) state.open[key] = event.target.open;
  }, true);

  window.addEventListener('hashchange', function () {
    var view = location.hash.slice(1);
    if (VIEWS[view]) { state.view = view; render(); }
  });

  /* ----------------------------------------------------------------- init -- */

  timer = new PEBKAC.Timer({
    onTick: tickClock,
    onDone: function () { render(); },
  });

  /* Light is the default regardless of OS setting — the whole look is built
   * around the pastel palette, and inheriting a dark system preference meant
   * never actually seeing it. Dark stays available, just opt-in. */
  function applyTheme() {
    var theme = Store.settings().theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme').textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  applyTheme();

  document.getElementById('mascot').innerHTML =
    PEBKAC.critter('corgi', { size: 'md', tint: 'blossom', bob: true });

  document.getElementById('footer-critters').innerHTML =
    ['corgi', 'tabby', 'shepherd', 'husky', 'pug', 'beagle', 'siamese', 'calico', 'dachshund']
      .map(function (name) { return PEBKAC.critter(name, { size: 'sm', seed: name }); })
      .join('');

  var initial = location.hash.slice(1);
  state.view = VIEWS[initial] ? initial : 'now';
  render();
})();
