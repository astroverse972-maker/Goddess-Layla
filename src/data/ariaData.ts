import { SessionOffering, CodexRule, AudioTeaser, TributeItem, DevotionLog } from '../types';

export const SESSION_OFFERINGS: SessionOffering[] = [
  {
    id: 's-in-person',
    title: 'Private In-Person Consultation & Session',
    category: 'in-person',
    price: 1200,
    duration: '120 Minutes',
    description: 'An exclusive, tailor-made private session in an atmosphere of unmatched dark luxury. Unfiltered presence, sensory protocol, and customized dominance.',
    prerequisites: ['Initial Tribute Paid ($250 Minimum)', 'The Codex Signed & Verified', 'Direct Identity Verification'],
    features: [
      'Private High-End Studio Sanctum',
      'Custom Sensory & Posture Protocol',
      'Formal Inspection & Guidance',
      'Exclusive After-Care Consultation'
    ],
    popular: true
  },
  {
    id: 's-findom',
    title: 'Financial Domination & Silent Tribute Tier',
    category: 'findom',
    price: 350,
    duration: 'Continuous / Monthly',
    description: 'Relinquish financial control to your Empress. Establish daily tribute routines, drain tasks, and financial submission protocols under strict oversight.',
    prerequisites: ['Minimum Initial Drain ($150)', 'Complete Budget Statement Disclosure'],
    features: [
      'Daily/Weekly Auto-Tribute Assignments',
      'Surrender Accounts & Wallet Lock Options',
      'Direct Telegram Priority Access',
      'Public or Anonymous Devotee Badge'
    ]
  },
  {
    id: 's-chastity',
    title: 'Absolute Chastity Management & Keyholding',
    category: 'chastity',
    price: 450,
    duration: '30 Days Lock Period',
    description: 'Surrender your key and physical desires to Maitresse Aria. Daily photo verification, task assignments, and strict release criteria.',
    prerequisites: ['Physical Lock Verification', 'The Codex Agreement', 'Daily Morning/Evening Check-in Duty'],
    features: [
      'Cryptographic Key Vaulting',
      'Daily Task & Inspection Quotas',
      'Denial & Tease Audio Assignments',
      'Release Approval or Lock Extension'
    ],
    popular: true
  },
  {
    id: 's-custom-audio',
    title: 'Custom Audio Voice Command & Hypnosis',
    category: 'custom-media',
    price: 200,
    duration: '10-15 Minutes Bespoke MP3',
    description: 'Bespoke high-fidelity voice recording produced specifically for your name, triggers, and psychological conditioning.',
    prerequisites: ['Detailed Preference Form Submission', 'Full Pre-Payment Tribute'],
    features: [
      '320kbps High-Fidelity Master File',
      'Bespoke Script Tailored to Your Triggers',
      'Subliminal Dark Binaural Audio Layers',
      'Lifetime Personal Vault Access'
    ]
  },
  {
    id: 's-virtual-worship',
    title: 'Virtual Live Worship & Command Session',
    category: 'virtual',
    price: 400,
    duration: '45 Minutes 1-on-1 Video',
    description: 'Direct high-definition encrypted live session. Posture command, task execution, verbal dominance, and inspection.',
    prerequisites: ['Camera & Mic Verification', 'Pre-Session Protocol Agreement'],
    features: [
      'End-to-End Encrypted Video Portal',
      'Real-Time Task Execution',
      'Post-Session Reflection Duty',
      'Instant Recording Access (Optional)'
    ]
  }
];

export const CODEX_RULES: CodexRule[] = [
  {
    id: 'rule-1',
    title: 'Addressing Maitresse Aria',
    category: 'etiquette',
    summary: 'Protocol regarding forms of address and respectful communication.',
    fullDetails: 'Every communication must begin with proper deferential titles: "Maitresse Aria", "My Empress", or "Mistress". Casual greetings like "Hey", "Hi", or "WYD" result in immediate permanent blocking.',
    mandatory: true
  },
  {
    id: 'rule-2',
    title: 'The Tribute Prerequisite',
    category: 'tribute',
    summary: 'Time and attention are premium assets requiring initial tribute.',
    fullDetails: 'Messages submitted without an accompanying tribute are disregarded. Tribute proves serious intent and respect for Maitresse Aria\'s time. Minimum consultation tribute is $100.',
    mandatory: true
  },
  {
    id: 'rule-3',
    title: 'Absolute Confidentiality & Consent',
    category: 'boundaries',
    summary: 'Privacy is paramount for both Empress and Devotee.',
    fullDetails: 'All session details, communication, audio orders, and identities remain strictly confidential under mutual non-disclosure. No unauthorized screenshots or leaks under any circumstance.',
    mandatory: true
  },
  {
    id: 'rule-4',
    title: 'Session Punctuality & Preparation',
    category: 'sessions',
    summary: 'Strict adherence to scheduled times and preparation protocols.',
    fullDetails: 'Devotees must be online or present 10 minutes prior to scheduled session time with all required items ready. Late arrival reduces session time without tribute refund.',
    mandatory: false
  }
];

export const AUDIO_TEASERS: AudioTeaser[] = [
  {
    id: 'aud-1',
    title: 'The Privilege of Obedience',
    duration: '1:45',
    category: 'Whisper & Hypnosis',
    synthFrequency: 220,
    description: 'An introductory velvet voice teaser exploring the serenity of surrender.'
  },
  {
    id: 'aud-2',
    title: 'Silent Tribute Protocol',
    duration: '2:10',
    category: 'Protocol Instruction',
    synthFrequency: 330,
    description: 'Direct commands detailing how a true devotee honors Maitresse Aria without speech.'
  },
  {
    id: 'aud-3',
    title: 'Chastity Verification Routine',
    duration: '1:15',
    category: 'Task Assignment',
    synthFrequency: 180,
    description: 'Inspection procedure and posture commands for locked submissives.'
  },
  {
    id: 'aud-4',
    title: 'The Financial Drain Ritual',
    duration: '2:40',
    category: 'Humiliation',
    synthFrequency: 290,
    description: 'High-contrast verbal dominance on the vanity of material wealth.'
  }
];

export const WISHLIST_ITEMS: TributeItem[] = [
  {
    id: 'w-1',
    name: 'Throne Crown & Silk Robe Collection',
    category: 'Wishlist',
    price: 450,
    linkText: 'Fulfill on Throne',
    description: 'Bespoke black silk kimono and obsidian crown for photoshoot set styling.',
    urgency: 'high'
  },
  {
    id: 'w-2',
    name: 'Sanctum Studio Lighting & Sound Upgrade',
    category: 'Wishlist',
    price: 850,
    linkText: 'Sponsor Studio Set',
    description: 'High-end studio microphones for custom binaural audio master recordings.',
    urgency: 'medium'
  },
  {
    id: 'w-3',
    name: 'Direct CashApp Drain / Coffee Tribute',
    category: 'Direct Tribute',
    price: 100,
    linkText: 'Send Instant Drain',
    description: 'Direct cash tribute for immediate recognition and priority chat evaluation.'
  },
  {
    id: 'w-4',
    name: 'Crypto Vault Tribute (BTC / ETH)',
    category: 'Crypto',
    price: 500,
    linkText: 'View Crypto Address',
    description: 'Anonymized high-value cryptocurrency tribute directly to Maitresse Aria\'s ledger.'
  }
];

export const DEVOTION_LOGS: DevotionLog[] = [
  {
    id: 'log-1',
    devoteeName: 'Submissive #4092 (Chastity Key)',
    amount: 500,
    timestamp: '2 Hours Ago',
    message: 'Grateful for 60 continuous days under lock. Thank you, Empress Aria.',
    badge: 'Chastity Devotee'
  },
  {
    id: 'log-2',
    devoteeName: 'Devotee Marcus G.',
    amount: 1200,
    timestamp: 'Yesterday',
    message: 'Tribute paid for private studio session. The Codex has been signed.',
    badge: 'High Tier Inquirer'
  },
  {
    id: 'log-3',
    devoteeName: 'Anonymous Drain #88',
    amount: 350,
    timestamp: '3 Days Ago',
    message: 'Silent Tribute sent as requested. No reply expected.',
    badge: 'Silent Drain'
  },
  {
    id: 'log-4',
    devoteeName: 'Devotee Julian V.',
    amount: 250,
    timestamp: '4 Days Ago',
    message: 'Custom audio order received. Her voice commands are transformative.',
    badge: 'Audio Collector'
  }
];

export const SOCIAL_LINKS = {
  x: 'https://x.com',
  instagram: 'https://instagram.com',
  throne: 'https://throne.com',
  fansly: 'https://fansly.com',
  loyalfans: 'https://loyalfans.com',
  telegram: 'https://t.me',
  discord: 'https://discord.gg',
  cashapp: '$MaitresseAria',
  email: 'inquiries@maitressearia.com'
};
