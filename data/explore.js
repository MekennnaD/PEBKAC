/* PEBKAC — exploration options.
 *
 * Deliberately NOT part of the plan. Nothing in this file touches the route,
 * the timeline, "Right now", or the hours maths. It is a shortlist to think
 * about, kept somewhere other than the thing you are actually committed to.
 *
 * That separation is the whole point: a maybe sitting next to a commitment
 * makes the commitment negotiable, and the plan stops meaning anything.
 */
window.PEBKAC = window.PEBKAC || {};

PEBKAC.EXPLORE = [
  {
    code: 'CC',
    name: 'Certified in Cybersecurity',
    issuer: 'ISC2',
    level: 'Entry',
    critter: 'corgi',
    format: '100 multiple choice · 2 hours · 700/1000 to pass',
    cost: '$199 exam + $50 annual maintenance fee',
    domains: [
      'Security Principles',
      'Business Continuity, Disaster Recovery & Incident Response',
      'Access Controls Concepts',
      'Network Security',
      'Security Operations',
    ],
    what: 'ISC2\'s entry-level security credential. Genuinely foundational — no experience requirement, and it exists to get people into the field rather than to prove seniority.',
    fit: 'The cheapest way to find out whether security is a direction you want, rather than a topic you find interesting. It overlaps the security half of AZ-802 (hardening, access control, monitoring), so some of that studying counts twice.',
    watch: [
      'The free "One Million Certified in Cybersecurity" programme closed to new enrolments on 20 May 2026. If you already hold an unexpired exam code from it, it is valid until 31 December 2026 — worth checking before paying $199.',
      'It is a foundation cert. It will not, on its own, move you into a security role.',
    ],
    links: [
      { label: 'ISC2 CC', url: 'https://www.isc2.org/certifications/cc' },
    ],
  },

  {
    code: 'CISSO',
    name: 'Certified Information Systems Security Officer',
    issuer: 'Mile2',
    level: 'Mid / management',
    critter: 'tabby',
    format: '100 multiple choice · 2 hours · 70% to pass · 19 modules',
    cost: 'Varies by bundle — Mile2 sells exam-only and course-plus-exam combos',
    domains: [
      'Risk management, including quantitative analysis (ALE / SLE / ARO)',
      'Access control models (Bell-LaPadula, Clark-Wilson, RBAC, ABAC)',
      'Cryptography — symmetric, asymmetric, PKI',
      'Network security — firewalls, DMZ, VPNs',
      'BCP / DR — BIA, MTD, RTO, RPO',
      'Security management, law and ethics',
    ],
    what: 'Mile2\'s security-management credential, aligned to NIST and the NICE framework and listed in the CISA/NICCS training catalogue. Covers roughly CISSP-shaped territory at a lower price and a lower bar.',
    fit: 'The management-and-governance angle rather than the hands-on one. Notably, the BCP/DR and risk material here overlaps the AZ-801 content that AZ-802 drops — so if you go the AZ-802 route, this is where that knowledge would come back.',
    watch: [
      'Recognition is the real question. CISSP (ISC2) is the credential most job listings and HR filters actually name; CISSO is far less known outside the organisations that already use Mile2.',
      'Before spending anything, check whether whoever suggested it will accept it — or whether they meant CISSP.',
    ],
    links: [
      { label: 'Mile2 CISSO', url: 'https://mile2.com/product/cisso-exam-combo/' },
      { label: 'CISA / NICCS catalogue entry', url: 'https://niccs.cisa.gov/training/catalog/mile2/cisso-certified-information-systems-security-officer' },
    ],
  },

  {
    code: 'SAA-C03',
    name: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    level: 'Associate',
    critter: 'husky',
    format: '65 questions · 130 minutes · 720/1000 to pass',
    cost: '$150',
    domains: [
      'Design Secure Architectures (30%)',
      'Design Resilient Architectures (26%)',
      'Design High-Performing Architectures (24%)',
      'Design Cost-Optimized Architectures (20%)',
    ],
    what: 'The most widely recognised associate-level cloud credential there is. Design-focused rather than button-clicking: it asks which service fits a requirement and what the trade-off costs.',
    fit: 'This is the other cloud. Your current path is Microsoft end to end — Windows Server, Azure Arc, Fabric — and AWS is the largest provider by market share, so holding both is what makes someone genuinely portable rather than tied to one vendor\'s stack.',
    watch: [
      'The concepts transfer more than the names do. Knowing Azure networking and identity makes the AWS equivalents much faster to learn, but every service has a different name and different defaults, and the exam tests the names.',
      'Sequencing matters more than usual here. AZ-802 plus DP-700 plus a second cloud is three directions at once — this is the one to start after something else finishes, not alongside it.',
      'If you want the cheaper way in first, AWS Certified Cloud Practitioner (CLF-C02) is the foundational tier and costs $100.',
    ],
    links: [
      { label: 'AWS SAA overview', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
      { label: 'Official exam guide (SAA-C03)', url: 'https://docs.aws.amazon.com/aws-certification/latest/examguides/solutions-architect-associate-03.html' },
    ],
  },
];
