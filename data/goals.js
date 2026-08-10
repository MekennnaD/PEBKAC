/* PEBKAC — why you are doing any of this.
 *
 * The page you open when the studying stops making sense.
 *
 * Salary figures are aggregator and survey data, cited inline. Treat them as
 * a rough band, not a promise: they are US national, self-reported, and a
 * certification correlates with higher pay largely because of who tends to
 * hold one. The cert is not the cause. Anyone quoting you a single number for
 * "what this cert pays" is selling a training course.
 */
window.PEBKAC = window.PEBKAC || {};

PEBKAC.GOALS = {
  'AZ-800': {
    mandate: 'Assigned',
    critter: 'siamese',
    why: 'Assigned rather than chosen. That is a real reason, and it outranks the others — but it retires on 30 September 2026, which means the instruction is now partly out of date.',
    benefit: 'Half of the Windows Server Hybrid Administrator Associate credential. The material itself — AD DS, Hyper-V, DNS/DHCP, storage, Azure Arc — is the daily substance of infrastructure work and does not go stale when the exam does.',
    themes: [
      'Widely described as broad rather than deep: a lot of surface area, few trick questions.',
      'The hybrid and Azure Arc material is what people report being least prepared for, because it is the newest part.',
      'Hands-on lab time is the repeatedly cited differentiator over reading alone.',
    ],
    salary: {
      role: 'Windows Server / Azure Administrator (US)',
      band: '$88,000 – $161,000',
      typical: 'around $110,000',
      note: 'Closest available proxy — most survey data groups Windows Server administration under Azure or systems administration rather than tracking it separately.',
      sources: [
        { label: 'ZipRecruiter — Azure Administrator', url: 'https://www.ziprecruiter.com/Salaries/Microsoft-Azure-Administrator-Salary' },
        { label: 'PayScale — Systems Administrator, Azure skills', url: 'https://www.payscale.com/research/US/Job=Systems_Administrator/Salary/2e39ae7e/Microsoft-Azure' },
      ],
    },
  },

  'AZ-801': {
    mandate: 'Assigned',
    critter: 'calico',
    why: 'The other half of the same assigned credential. Same retirement date, same caveat.',
    benefit: 'Security hardening, failover clustering, disaster recovery and migration. Roughly half of this content is dropped from AZ-802 — which makes it the more durable knowledge, not the less, because it is the part nobody will be able to assume you have.',
    themes: [
      'Consistently reported as the harder of the pair, with the migration and clustering sections carrying the most weight.',
      'The BCP/DR vocabulary here (BIA, MTD, RTO, RPO) reappears almost verbatim in security-management certifications like CISSO.',
    ],
    salary: {
      role: 'Windows Server / Azure Administrator (US)',
      band: '$88,000 – $161,000',
      typical: 'around $110,000',
      note: 'Same band as AZ-800 — they are two halves of one credential, not two separate market signals.',
      sources: [
        { label: 'ZipRecruiter — Azure Administrator', url: 'https://www.ziprecruiter.com/Salaries/Microsoft-Azure-Administrator-Salary' },
      ],
    },
  },

  'AZ-802': {
    mandate: 'Assigned, by substitution',
    critter: 'shepherd',
    why: 'Not what was assigned, but what the assigned exams turned into. Worth raising explicitly with whoever set the requirement — "the exams you listed retire on 30 September and are replaced by AZ-802" is a useful sentence to have said out loud, and it is the kind of thing that reads well.',
    benefit: 'One exam instead of two, for a credential that is not being phased out. Heavier on Azure Arc, Azure Update Manager and modern security baselines (OSConfig, SMB over QUIC, Entra Password Protection) — which is where the actual job is going.',
    themes: [
      'Too new for a body of community experience to exist. That is genuinely a downside: you would be among the first, without the usual pool of "here is what surprised me" posts to learn from.',
      'Sitting a beta exam is itself uncommon and mildly interesting to talk about in an interview.',
    ],
    salary: {
      role: 'Windows Server / Azure Administrator (US)',
      band: '$88,000 – $161,000',
      typical: 'around $110,000',
      note: 'Reported figures also suggest pairing an administrator credential with a security one correlates with a meaningful step up — which is the argument for CC or CISSO later, rather than a second cloud.',
      sources: [
        { label: 'ZipRecruiter — Azure Administrator', url: 'https://www.ziprecruiter.com/Salaries/Microsoft-Azure-Administrator-Salary' },
      ],
    },
  },

  'DP-700': {
    mandate: 'Assigned',
    critter: 'husky',
    why: 'Also assigned, and the one that points somewhere different from the rest. This is the data engineering direction, not the infrastructure one.',
    benefit: 'Fabric is Microsoft\'s current strategic bet for analytics, and the credential is new enough that holding it is still unusual. Of everything on your list, this is the one with the widest gap between what it costs you and what it signals.',
    themes: [
      'Reported as genuinely hands-on: the exam assumes you have built pipelines, not just read about them.',
      'The prerequisite that catches people is not Fabric — it is the SQL, PySpark and KQL underneath it.',
    ],
    salary: {
      role: 'Azure Data Engineer (US)',
      band: '$114,000 – $171,000',
      typical: '$132,000 – $194,000 between the 25th and 75th percentiles; Glassdoor puts the average near $159,000',
      note: 'Consistently the highest-paid role of the four, by a clear margin. Worth weighing against the fact that it is also the least connected to the infrastructure track.',
      sources: [
        { label: 'Glassdoor — Azure Data Engineer', url: 'https://www.glassdoor.com/Salaries/azure-data-engineer-salary-SRCH_KO0,19.htm' },
        { label: 'PayScale — Data Engineer, Azure skills', url: 'https://www.payscale.com/research/US/Job=Data_Engineer/Salary/8052fb9c/Microsoft-Azure' },
      ],
    },
  },
};

/* The honest framing that belongs on the same page as the salary bands. */
PEBKAC.GOALS_CAVEATS = [
  'These are US national figures from salary aggregators, which are self-reported and skew toward people willing to report. Your metro area moves them more than any certification will.',
  'Certifications correlate with higher pay; they rarely cause it. The people who hold them tend to be the people who also have the experience, and the experience is doing most of the work.',
  'Where a certification does pay directly is in filters: getting past an HR screen, meeting a contract requirement, or satisfying a partner-status quota at your employer. Those are concrete and worth asking about explicitly — including whether the company covers the exam fee and a retake.',
];
