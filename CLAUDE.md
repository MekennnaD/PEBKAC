# PEBKAC

Static site, no build step. Open `index.html` directly — plain `<script>` tags,
no modules, no `fetch`, no external requests, so `file://` works.

- `data/` — exam objectives, plan, goals, explore options, languages and
  philosophy. Edit these; they are the content.
- `assets/js/` — app logic, timer, storage, critters.
- `assets/css/` — one stylesheet, light default with an opt-in dark theme.

Progress lives in localStorage. No account, no server.

## Deploying

Hosted at https://mekennnad.github.io/PEBKAC/ via GitHub Pages from `main`,
root folder. Push to `main` and it rebuilds in a few minutes.

**Bump the cache-buster whenever a `.js` or `.css` file changes:**

```
sed -i 's/?v=[0-9]*/?v=NEXT/g' index.html
```

GitHub Pages serves everything with `Cache-Control: max-age=600`. Without the
bump, a browser can pair fresh HTML with ten-minute-stale JavaScript, which
breaks in ways that look like real bugs rather than caching.

## Rules for the content

**Never invent exam objectives in `data/certs.js`.** They are transcribed
verbatim from the official Microsoft Learn study guides. When an exam updates,
re-pull its study guide and bump `skillsUpdated` so a stale plan is visible.

The `hours` figure on each topic is the only input to the timeline maths. It is
an estimate, not a measurement.

**Do not add anything that scrapes or aggregates exam dumps.** Question banks
are for the user's own material and the official free practice assessments.

## Design rules that are load-bearing

Changing these changes whether the tool works, so they are not style choices:

1. One thing on the home screen. A menu at the moment of starting is a
   decision, and the decision is where it falls apart.
2. Four-point confidence, never a checkbox — partial work must register.
3. `nextTopic` sweeps by confidence level, not topic order, so rating something
   honestly always moves you forward.
4. Nothing is ever styled as overdue. Falling behind changes the plan, not the
   person.
5. No save button; every interaction writes immediately.
6. Anything with no hard dependency on the route decision must be startable
   without making that decision.
