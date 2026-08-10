# PEBKAC

*Problem Exists Between Keyboard And Chair.*

A certification planner built around one constraint: it has to still get opened
on a bad day. Everything else is downstream of that.

**Open `index.html`.** Double-click it. No install, no build step, no server, no
account, no network. Progress lives in the browser's localStorage.

---

## What it does

| Screen | Purpose |
| --- | --- |
| **Right now** | One topic. One button. No menu at the moment of starting, because choosing is the expensive step. |
| **The decision** | Routes through the Windows Server retirement, costed against real hours and real progress. |
| **The path** | What the exams are, what they point at, and where the retirement cliffs sit. |
| **Timeline** | Two-week sprints, recomputed every time a topic is rated. |
| **Objectives** | Every exam objective, rated on a four-point scale. |
| **Why** | Reason, benefit, reported themes and cited salary bands per exam. |
| **Languages** | Mandarin, Spanish, Arabic, French, with FSI difficulty ratios. |
| **Philosophy** | Executive function, public speaking, motivation, determination. |
| **Explore** | Options that are not committed to, kept structurally out of the plan. |
| **Settings** | Hours per week, deadline, session length, theme, backup export. |

## The certification situation it encodes

- **AZ-800 and AZ-801 retire 30 September 2026, 5:00 PM CST.** Both are required
  for *Windows Server Hybrid Administrator Associate*. Passing only one before
  the date earns nothing.
- **AZ-802 replaces both** with a single exam, earning the renamed
  *Windows Server Administrator Associate*. Its scope is materially smaller —
  high availability, disaster recovery, migration, containers, IPAM,
  VPN/Remote Access and hybrid identity sync are all dropped.
- **AZ-802 is still in beta.** Scores are withheld until it goes GA, no practice
  assessment exists, and no official training has been built for it. A beta exam
  cannot deliver a credential by a fixed date, and the site reports that
  separately from the hours rather than folding it in.
- **DP-700** (Fabric Data Engineer Associate) is independent of all of the above
  and has no prerequisite exam.

The Decision screen turns that into arithmetic rather than vibes.

## Design decisions that are load-bearing

These are not style preferences. Changing them changes whether the tool works.

1. **One thing on the home screen.** A list of options at the moment of starting
   is a decision, and the decision is where it falls apart.
2. **Four-point confidence, not a checkbox.** Untouched → Read it → Explained it
   → Did it cold. Binary checkboxes make partial work register as zero, and work
   that registers as zero stops happening.
3. **Sweep by level, not by topic.** Everything gets a first pass before anything
   gets a second, so rating something honestly always moves you forward.
4. **Nothing is ever overdue.** Falling behind changes the plan, not your
   standing. Guilt mechanics get a tool closed once and never reopened.
5. **No save button.** Every interaction writes immediately.
6. **A 10-minute option next to the 25.** A short session that starts beats a
   long one that doesn't.
7. **Park a thought.** Somewhere to dump an intrusive urgent-feeling thought
   without leaving the session to act on it.
8. **No alarm sound.** A sudden noise ends the study session, not just the block.
   The tab title counts down instead.

## Editing it

Two data files, no code required:

- **`data/plan.js`** — hours per week, deadline, chosen route, cadence, session
  length, the route definitions and the career notes.
- **`data/certs.js`** — the exams. Objectives are transcribed verbatim from the
  official Microsoft Learn study guides, each carrying a `skillsUpdated` date.

The `hours` figure on each topic is the only input to the timeline maths. It is
an estimate, not a measurement — tune it against real pace and every projection
corrects itself.

**Do not invent objectives in `certs.js`.** When an exam updates, re-pull its
study guide and bump `skillsUpdated`.

## On question banks

Drilling questions before fully understanding the material is not the mistake —
retrieval practice works, and it is why that habit sticks. The sourcing is the
problem. Sites publishing leaked live exam items put the certification itself at
risk, because using them breaches the agreement accepted at the testing centre;
the penalty is revocation and a ban.

The legitimate equivalents are linked on **The path**: the free official practice
assessments for AZ-800 and AZ-801 (also the closest existing prep material for
AZ-802), and the exam sandbox.

Also linked there: **exam accommodations**. Extra time and other adjustments are
routine to request and worth starting early — it is not a last-minute process.

## Structure

```
index.html          entry point, plain script tags in load order
data/               certs, plan, goals, explore, growth — edit these
assets/js/          app, store, timer, critters
assets/css/         one stylesheet, light and dark themes
```

No modules, no bundler, no external requests — which is what makes opening the
file directly from disk work.

## Data

localStorage in one browser. No account, no sync, nothing leaves the machine.
Clearing site data wipes it — **Settings → Export a backup** writes a JSON file.
