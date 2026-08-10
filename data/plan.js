/* PEBKAC — your plan, not the exam catalogue.
 *
 * This is the file to edit when life changes. Everything the site says about
 * pace, pressure and "what now" is computed from here plus the hour estimates
 * in certs.js. Nothing else needs touching.
 */
window.PEBKAC = window.PEBKAC || {};

PEBKAC.PLAN = {

  /* Hours you can realistically put in per week. Be honest and slightly
   * pessimistic — a plan built on a fantasy number fails silently. */
  hoursPerWeek: 10,

  /* The one number that changes every recommendation on this site. */
  deadline: '2026-10-31',
  deadlineWhat: 'All of them done by 31 October 2026',

  /* This distinction decides whether the plan is merely hard or actually
   * impossible, so it is a setting rather than an assumption.
   *
   *   'certified' — a credential in hand by the date. Rules out any beta
   *                 exam, because beta scores are held until the exam goes
   *                 GA and that date is not published.
   *   'sat'       — exams taken by the date, results whenever they land.
   *                 Beta is fine under this reading.
   */
  deadlineMeans: 'certified',

  /* Which route you're committing to. Set to a route id below once decided.
   * null = the Decision card stays pinned to the top of the site. */
  route: null,

  /* Exams outside the Windows Server fork. The routes only describe the
   * AZ-800/801/802 decision, but these still have to be studied, scheduled and
   * surfaced by "Right now" — otherwise they quietly fall off the plan.
   * Order matters: this is the sequence you work through. */
  alsoDoing: ['DP-700'],

  /* DP-700 has no retirement pressure on it, so it runs after the Windows
   * Server exam by default. Flip to true to lead with it instead. */
  alsoDoingFirst: false,

  /* A certification every two weeks is not available at this scale: AZ-802
   * alone is roughly 112 hours of material, which is eleven weeks at ten hours
   * a week, and DP-700 is another seventy. A plan promising a cert a fortnight
   * is one you fail against for reasons baked in before you start — the
   * specific failure mode this whole site exists to avoid.
   *
   * What IS available is the rhythm. The timeline groups into two-week
   * sprints, each with something that genuinely finishes at the end of it.
   * You get the cadence and the regular sense of completion; the thing that
   * completes is a domain rather than a certification. */
  cadenceWeeks: 2,

  /* Focus session length in minutes. 25 is the default; 10 exists because a
   * 10-minute session you actually start beats a 50-minute one you don't. */
  sessionMinutes: 25,
  shortSessionMinutes: 10,
};

/* ---------------------------------------------------------------- routes ---
 * The fork you're standing at. Costs are computed from certs.js at runtime,
 * so these stay honest if you retune the hour estimates.
 */
PEBKAC.ROUTES = [
  {
    id: 'sprint',
    name: 'Sprint the retiring pair',
    exams: ['AZ-800', 'AZ-801'],
    hardStop: '2026-09-30T17:00:00-06:00',
    earns: 'Windows Server Hybrid Administrator Associate',
    pros: [
      'Real score the moment you finish — no waiting on beta scoring.',
      'Free official practice assessments exist for both exams.',
      'Full Microsoft Learn training catalogue and years of community material.',
    ],
    cons: [
      'Two exams, hard-stopped 30 September 2026. Miss it and the work is stranded.',
      'By far the largest total study load of the three routes.',
      'The credential you earn is the one being renamed and phased out.',
    ],
    verdict: 'Only viable if you already know most of this material. Check the hours-per-day figure below before committing.',
  },
  {
    id: 'beta',
    name: 'Take AZ-802 now, while it is in beta',
    exams: ['AZ-802'],
    earns: 'Windows Server Administrator Associate',
    pros: [
      'One exam instead of two, and a much smaller syllabus.',
      'Beta sittings are usually discounted.',
      'No retirement cliff — this is the path that survives.',
    ],
    cons: [
      'Scores are held until after the exam leaves beta. No result on exam day.',
      'No practice assessment exists yet.',
      'No official training built for it yet — you study AZ-800/801 material and accept the delta.',
    ],
    verdict: 'Good if your deadline is about doing the work, bad if your deadline is about holding a certificate on a date.',
  },
  {
    id: 'wait',
    name: 'Study now, sit AZ-802 after it goes GA',
    exams: ['AZ-802'],
    earns: 'Windows Server Administrator Associate',
    pros: [
      'Same small syllabus, but with immediate scoring when you sit it.',
      'Practice assessments should exist by then (Microsoft: usually within 8 weeks of GA).',
      'Study starts today regardless — the AZ-800/801 material overlaps heavily.',
    ],
    cons: [
      'GA date is not published. You are planning around an unknown.',
      'Longest calendar time to a credential in hand.',
    ],
    verdict: 'The low-stress default. Start on AZ-802 objectives now; decide when to book once GA is announced.',
  },
];

/* ------------------------------------------------------------- direction ---
 * Where these certs actually point. Kept short on purpose — this is a compass,
 * not a life plan, and a wall of text here never gets read twice.
 */
PEBKAC.CAREER = {
  headline: 'Hybrid infrastructure administration, with a data-platform second act.',
  reading: [
    'AZ-800/801/802 are the on-premises-meets-Azure track: Active Directory, Hyper-V, storage, DNS/DHCP, and increasingly Azure Arc as the bridge. This is the skill set that keeps existing estates running rather than greenfield cloud work.',
    'DP-700 sits somewhere else entirely — Fabric, lakehouses, pipelines, streaming. It is a data engineering credential, not an infrastructure one.',
    'Holding both is an unusual and defensible combination: the person who can run the estate AND move its data. It reads as platform engineer or infrastructure-leaning data engineer rather than either pure role.',
  ],
  nextQuestions: [
    'Is DP-700 part of the same requirement, or a separate interest? That changes whether it is a priority or a hobby.',
    'Do you want to end up closer to the servers or closer to the data? You do not have to answer yet, but the answer changes what comes after these.',
  ],
};

/* -------------------------------------------------------------- practice ---
 * On memorising question banks: the instinct is sound — retrieval practice
 * beats re-reading, and that is well established. The sourcing is the problem.
 * Third-party "dump" sites publish leaked live items; using them breaches the
 * exam agreement you sign at the testing centre and is grounds for revoking
 * certifications and banning candidates. The tool below is for questions you
 * own: the official practice assessments, your own notes, lab mistakes.
 */
PEBKAC.PRACTICE_SOURCES = [
  { name: 'AZ-800 official practice assessment (free)', url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-800/practice/assessment?assessment-type=practice&assessmentId=67', note: 'Closest existing practice material to AZ-802.' },
  { name: 'AZ-801 official practice assessment (free)', url: 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-801/practice/assessment?assessment-type=practice&assessmentId=68', note: 'Covers the security and monitoring half AZ-802 keeps.' },
  { name: 'Exam sandbox — the real UI, no score', url: 'https://aka.ms/examdemo', note: 'Removes a whole category of exam-day surprise. Twenty minutes, once.' },
  { name: 'Request accommodations', url: 'https://learn.microsoft.com/en-us/credentials/certifications/request-accommodations', note: 'Extra time and other adjustments are available and routine to request. Worth doing early — it is not a last-minute process.' },
];
