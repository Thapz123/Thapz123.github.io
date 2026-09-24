// All of the site's copy lives here. Edit this file to update the portfolio.

export const site = {
  name: 'Thapelo Sebolai',
  firstName: 'Thapelo',
  lastName: 'Sebolai',
  role: 'Senior Software Engineer',
  tagline: 'Senior software engineer building distributed systems, ML infrastructure and revenue-critical platforms.',
  location: 'New York City',
  origin: 'Johannesburg',
  resume: '/Resume_2026.pdf',
  links: {
    linkedin: 'https://www.linkedin.com/in/thapelo-sebolai/',
    github: 'https://github.com/Thapz123',
  },
};

export const about =
  'I’m a New York-based engineer from Johannesburg, South Africa, with six years of building backend systems, ML pipelines and payment infrastructure at Meta and Superscript. I studied Computer Science at Stanford with a concentration in Artificial Intelligence. When I’m not shipping code, I’m usually making music.';

export const skills = [
  'Python', 'TypeScript', 'Hack', 'SQL', 'React', 'PyTorch', 'Distributed Systems',
  'REST APIs', 'Payment Infrastructure', 'Data Pipelines', 'Audio Feature Extraction',
  'AWS', 'PostgreSQL', 'MongoDB', 'Datadog',
];

type Job = {
  company: string;
  role: string;
  period: string;
  place: string;
  note: string;
  groups: { title?: string; points: string[] }[];
};

export const experience: Job[] = [
  {
    company: 'Superscript',
    role: 'Senior Software Engineer, Pricing Engineering',
    period: '2025-2026',
    place: 'New York City',
    note: 'Healthcare payments',
    groups: [{ points: [
      'Scaled a claims reconciliation platform processing 800K+ healthcare claims daily, keeping pricing models, payer adjudications and internal ledgers in financial parity for 300+ practices.',
      'Designed deterministic claims-matching algorithms across EHR, payer remittance and ledger data, cutting unreconciled claims from thousands to fewer than 50.',
      'Built payment integrations across multiple EHRs, enabling embedded healthcare payments and contributing to a 2× increase in annual contracted revenue.',
    ] }],
  },
  {
    company: 'Meta',
    role: 'Software Engineer',
    period: '2020-2025',
    place: 'San Francisco → New York City',
    note: 'Backend systems, ML & product infrastructure',
    groups: [
      {
        title: 'Music Partner Experience',
        points: [
          'Built backend licensing infrastructure for multi-track audio on Instagram, with real-time rights validation across millions of users.',
          'As the team’s Music ML subject-matter expert, built ML pipelines that improved beat and BPM detection by 30% and expanded rhythm and genre coverage to 99.9%.',
          'Unified Facebook and Instagram audio muting, replacing full-video takedowns with audio-only muting and growing Reels music adoption.',
          'Led a multi-quarter consolidation of Meta’s media rights-checking and attribute systems into one backend.',
        ],
      },
      {
        title: 'Ads Manager · Product Infrastructure',
        points: [
          'Designed reusable React and Hack frameworks that let partner teams rapidly build integrations across advertiser workflows.',
          'Built data pipelines, scalable APIs and management UIs for advertiser configuration, streamlining onboarding and reducing churn.',
        ],
      },
    ],
  },
  {
    company: 'Slack',
    role: 'Software Engineer Intern',
    period: '2019',
    place: 'San Francisco',
    note: 'Platform & API security',
    groups: [{ points: [
      'Introduced granular bot permissioning, hardening API security and enabling deprecation of broad legacy scopes.',
    ] }],
  },
];

export const offClock = [
  { title: 'Producing', text: 'Making beats in Ableton and playing in jazz ensembles.' },
  { title: 'Reading', text: 'Books steeped in fantastical gryphons and wizards.' },
  { title: 'Muay Thai', text: 'Polishing roundhouse kicks at the gym.' },
  { title: 'Thrifting', text: 'Always hunting for the next fashion piece.' },
];

export const education = {
  school: 'Stanford University',
  degree: 'B.S. Computer Science, Artificial Intelligence concentration',
  period: '2016-2020',
};

export const spokenLanguages = ['English', 'Afrikaans', 'French'];
