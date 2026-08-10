/* PEBKAC — the parts that are not certifications.
 *
 * Languages and the reading thread. These have no exam date, which makes them
 * the first thing to evaporate when the certs get loud. They live on their own
 * pages so that evaporating is at least visible.
 *
 * Hour estimates are US Foreign Service Institute figures for English speakers
 * reaching Professional Working Proficiency. They assume intensive classroom
 * instruction, so treat them as relative difficulty rather than a countdown —
 * the ratio between them is the honest part.
 */
window.PEBKAC = window.PEBKAC || {};

PEBKAC.LANGUAGES = [
  {
    name: 'Mandarin Chinese',
    native: '中文',
    focus: true,
    critter: 'husky',
    fsi: 'Category IV — roughly 2,200 class hours',
    why: 'The designated focus, and the hardest thing on this page. Worth knowing that up front rather than discovering it at month four.',
    shape: [
      'Tones are the part that does not transfer. Four of them, and they change meaning outright — this is the single thing to get a real teacher or a tone-drilling app for early, because self-taught tone habits are painful to undo.',
      'Characters are a separate skill from speaking. You can hold a conversation while being functionally illiterate, and many learners deliberately split the two rather than doing both at once.',
      'Grammar is genuinely easier than the Romance languages: no conjugation, no gender, no plurals, no tenses in the European sense.',
    ],
    floor: 'Ten minutes of tone drills or spaced-repetition characters. Small enough that a bad day cannot break the streak.',
  },
  {
    name: 'Spanish',
    native: 'Español',
    critter: 'corgi',
    fsi: 'Category I — roughly 600–750 class hours',
    why: 'The cheapest fluency available to an English speaker, and the most immediately usable in the US.',
    shape: [
      'Roughly a third of the effort of Mandarin or Arabic for the same proficiency level. If the goal is to actually reach conversational in one language, this is the one that gets there first.',
      'Pronunciation is almost entirely regular — what is written is what is said.',
      'The difficulty curve is back-loaded: the subjunctive and the past tenses are where people stall, not the early material.',
    ],
    floor: 'One short conversation or a page of reading. Comprehensible input beats grammar drills at this stage.',
  },
  {
    name: 'Arabic',
    native: 'العربية',
    critter: 'calico',
    fsi: 'Category IV — roughly 2,200 class hours',
    why: 'Comparable in difficulty to Mandarin, and structurally the most different from English on this list.',
    shape: [
      'The first decision is which Arabic. Modern Standard Arabic is the written and formal register but is not what anyone speaks at home; the dialects (Egyptian, Levantine, Gulf) differ enough to be near-separate languages. Choosing wrong wastes a lot of time.',
      'The script is genuinely learnable in a couple of weeks — it is the root-and-pattern morphology underneath that takes the years.',
      'Short vowels are usually unwritten, so reading assumes you already know the word.',
    ],
    floor: 'Script practice, or fifteen minutes of listening to the dialect you picked.',
  },
  {
    name: 'French',
    native: 'Français',
    critter: 'tabby',
    fsi: 'Category I — roughly 600–750 class hours',
    why: 'The other cheap one, and the one with the largest reading payoff — much of the philosophy on your other page was written in it.',
    shape: [
      'Reading comes very early: English borrowed so heavily that written French is partly guessable from day one.',
      'Listening is the disproportionate difficulty. Words run together and a lot of written letters are silent, so the gap between "can read it" and "can hear it" is wider than in Spanish.',
    ],
    floor: 'Fifteen minutes of listening specifically — reading will look after itself.',
  },
];

PEBKAC.LANGUAGE_NOTE =
  'Four languages at once is four times the way to feel behind. The FSI numbers above are the argument for sequencing: Spanish or French to actually reach conversational and find out what your learning process is like, then Mandarin as the long project with that experience behind you. Mandarin first is possible, but it is the steepest slope with the least feedback, which is the hardest combination to sustain.';

/* --------------------------------------------------------------------------
 * The reading thread. Filed under "philosophy" because that is what you called
 * it, though most of it is closer to psychology and rhetoric.
 */
PEBKAC.PHILOSOPHY = [
  {
    name: 'The brain',
    critter: 'calico',
    question: 'Why does knowing what to do have so little to do with doing it?',
    why: 'The most directly useful thread on this page, given the rest of this site exists to work around executive function rather than through it.',
    threads: [
      'Executive function as a set of separable capacities — working memory, inhibition, task-switching — rather than a single quantity of willpower. This reframing does most of the practical work: it turns "I am lazy" into "the initiation step is expensive", which is a solvable problem.',
      'Motivation-as-interest rather than motivation-as-importance. Brains prone to this pattern reliably engage with novelty, urgency, challenge and interest, and reliably do not engage with abstract long-term importance — which is exactly what a certification is.',
      'The testing effect and spaced repetition: retrieving something is what stores it, not re-reading it. Your instinct to drill questions was right about the mechanism.',
    ],
    tension: 'Be sceptical of anything that promises a system will fix this. Every system works during the honeymoon. The question worth asking of any technique is what happens on week three, and most writing on the subject never gets there.',
  },
  {
    name: 'Public speaking',
    critter: 'shepherd',
    question: 'What actually makes someone persuasive, as opposed to merely correct?',
    why: 'The skill with the highest ratio of career effect to time invested, and the one most technical people skip.',
    threads: [
      'Aristotle\'s three appeals — ethos, pathos, logos — are two and a half thousand years old and still the most useful framework available. Most bad technical talks are all logos.',
      'Structure over content: audiences retain shape, not detail. What you cut is doing more work than what you add.',
      'The physiological layer — that the fear response is nearly universal, does not go away with expertise, and is mostly managed by preparation and repetition rather than by confidence.',
    ],
    tension: 'The uncomfortable part of rhetoric is that it is genuinely neutral. The same techniques that make a true argument land make a false one land, which is precisely why Plato distrusted the whole enterprise. Worth sitting with rather than resolving.',
  },
  {
    name: 'Motivation',
    critter: 'pug',
    question: 'Where does wanting to do something actually come from?',
    why: 'A hundred-odd hours on exams you did not choose makes this a practical question rather than an abstract one.',
    threads: [
      'Self-determination theory (Deci and Ryan): intrinsic motivation rests on autonomy, competence and relatedness. Its most cited finding is the overjustification effect — external rewards can measurably reduce interest in something you already enjoyed.',
      'Applied here: an assigned certification is low on autonomy by construction. The available lever is reclaiming some — choosing the route, the order, the pace — which is a large part of what this site is for.',
      'Intrinsic and extrinsic are not a hierarchy. Doing something for money is not a failure state, and a lot of writing on motivation is quietly moralising about that.',
    ],
    tension: 'Much of the popular literature here overstates how replicable the underlying studies are. Read it as a useful vocabulary for noticing your own patterns, not as physics.',
  },
  {
    name: 'Drive and determination',
    critter: 'siamese',
    question: 'Is persistence a trait you have, or a circumstance you arrange?',
    why: 'The thread most likely to be handed to you as advice, and the one most worth being suspicious of.',
    threads: [
      'Angela Duckworth\'s grit — passion and perseverance for long-term goals — is the famous version, and it is worth reading first-hand rather than through the summaries.',
      'Then read the criticism, which is substantial: meta-analyses have found grit predicts performance considerably less well than the popular account claims, and that it overlaps so heavily with conscientiousness it may not be a distinct thing at all.',
      'The structural counter-argument: persistence is often environmental rather than personal. People described as determined frequently had conditions that made continuing cheaper — support, slack, fewer competing demands. That reframing matters if you have been told you lack discipline.',
    ],
    tension: 'This is the thread where the philosophy is real. If determination is a virtue, failing to persist is a moral failure. If it is mostly circumstance, it is a design problem. Which you believe changes what you do next — and neither answer is fully supported by the evidence.',
  },
];
