import type { SocialLink, Experience, Investment, WritingEntry, Section } from '../types'

export const SITE = {
  name: 'Jason Meng',
  tagline: 'Building distribution for tokenized assets',
  bio: 'This is my corner of the internet.',
  location: 'Vancouver, Canada',
  email: 'jasonczmeng@gmail.com',
  education: {
    school: 'University of British Columbia',
    degree: 'Symbolic Systems',
  },
  aboutParagraphs: [
    "I work at the intersection of distribution, technology, and tokenized finance.",
    "My career has taken me from enterprise cloud at Microsoft, through social media analytics at Hootsuite, into the crypto ecosystem at Nansen and LayerZero, and now to Plume — where I'm driving institutional adoption of tokenized assets at scale.",
    "I studied Symbolic Systems at UBC, which gave me a framework for thinking about human-computer interaction, logic, and meaning. It's the thread that ties all my work together.",
  ],
} as const

export const SECTIONS: Section[] = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'investments', label: 'Investments' },
  { id: 'writing', label: 'Writing' },
  { id: 'contact', label: 'Contact' },
]

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Email', url: 'mailto:jasonczmeng@gmail.com', icon: 'mail' },
  { label: 'GitHub', url: 'https://github.com/jasonczmeng', icon: 'github' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jasonczmeng/', icon: 'linkedin' },
  { label: 'X', url: 'https://x.com/menciusxbt', icon: 'twitter' },
]

export const EXPERIENCES: Experience[] = [
  {
    company: 'Plume',
    role: 'Business Development',
    period: '2024 — Present',
    startYear: 2024,
    endYear: null,
    description: 'Driving institutional and broad adoption for tokenized assets at scale. True Crypto 0-1.',
    tags: ['RWA', 'Web3', 'BD'],
  },
  {
    company: 'LayerZero',
    role: 'Business Development',
    period: '2023 — 2024',
    startYear: 2023,
    endYear: 2024,
    description: 'Interop and crypto for enterprise and capital markets. Learned about institutional adoption.',
    tags: ['Interop', 'Enterprise', 'BD'],
  },
  {
    company: 'Nansen',
    role: 'Growth',
    period: '2022 — 2023',
    startYear: 2022,
    endYear: 2023,
    description: 'Investment grade analytics and data-driven insights. Learned about crypto ecosystem.',
    tags: ['Analytics', 'Data', 'Growth'],
  },
  {
    company: 'Hootsuite',
    role: 'Customer Success',
    period: '2021 — 2022',
    startYear: 2021,
    endYear: 2022,
    description: 'Enterprise social media management. Learned about digital brand impact at scale.',
    tags: ['SaaS', 'Enterprise', 'CS'],
  },
  {
    company: 'Microsoft',
    role: 'Sales',
    period: '2019 — 2021',
    startYear: 2019,
    endYear: 2021,
    description: 'Solutions specialist on cloud and hardware platforms. Learned the importance of channel distribution.',
    tags: ['Cloud', 'Enterprise', 'Sales'],
  },
]

export const INVESTMENTS: Investment[] = [
  {
    company: 'Apptronik Systems',
    url: 'https://apptronik.com/',
    category: ['Humanoid Robotics', 'AI'],
    stage: 'Series A',
  },
  {
    company: 'Mecka AI',
    url: 'https://mecka.ai/',
    category: ['Humanoid Robotics', 'AI'],
    stage: 'Pre-Seed',
  },
  {
    company: 'Solera Markets',
    url: 'https://solera.market/',
    category: ['Crypto', 'Lending', 'RWA'],
    stage: 'Early',
  },
]

export const WRITING: WritingEntry[] = [
  {
    type: 'tweet',
    title: 'On Tokenized Asset Distribution',
    excerpt: 'Thoughts on how distribution will define the next era of tokenized assets and why institutional adoption is the unlock...',
    url: 'https://x.com/menciusxbt',
    date: '2024',
    platform: 'x',
  },
  {
    type: 'article',
    title: 'The Future of RWA Infrastructure',
    excerpt: 'A deep dive into what it takes to build real-world asset infrastructure that institutions actually want to use...',
    url: 'https://x.com/menciusxbt',
    date: '2024',
    platform: 'x',
  },
  {
    type: 'tweet',
    title: 'Crypto x Enterprise Lessons',
    excerpt: 'After 3 years in crypto BD, here are the biggest lessons on bridging enterprise and decentralized systems...',
    url: 'https://x.com/menciusxbt',
    date: '2024',
    platform: 'x',
  },
]

export const MARQUEE_WORDS = [
  'WEB3',
  'DISTRIBUTION',
  'TOKENIZED ASSETS',
  'BUSINESS DEVELOPMENT',
  'BUILDER',
  'RWA',
  'INSTITUTIONAL ADOPTION',
]
