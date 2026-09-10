import { SessionOffering, CodexRule, AudioTeaser, TributeItem, DevotionLog } from '../types';

export const SESSION_OFFERINGS: SessionOffering[] = [
  {
    id: 's-in-person',
    title: 'Private In-Person Session',
    category: 'in-person',
    price: 1200,
    duration: '120 Minutes',
    description: 'A private one-on-one session customized to your preferences and boundaries in a discreet, upscale environment.',
    prerequisites: ['Deposit Required', 'Guidelines Agreement', 'Identity Verification'],
    features: [
      'Private Studio Space',
      'Customized Session Plan',
      'Safety & Consent Check',
      'Post-Session Debrief'
    ],
    popular: true
  },
  {
    id: 's-findom',
    title: 'Ongoing Support & Tipping',
    category: 'findom',
    price: 350,
    duration: 'Monthly / Flexible',
    description: 'Direct recurring support and personalized communication channel for regular supporters.',
    prerequisites: ['Initial Confirmation', 'Established Budget Agreement'],
    features: [
      'Regular Check-ins',
      'Flexible Contribution Options',
      'Priority Telegram Contact',
      'Supporter Acknowledgement'
    ]
  },
  {
    id: 's-chastity',
    title: 'Discipline & Coaching Program',
    category: 'chastity',
    price: 450,
    duration: '30-Day Program',
    description: 'Structured daily habits, task coaching, and accountability tracking over a full month.',
    prerequisites: ['Agreement to Rules', 'Daily Check-in Commitment'],
    features: [
      'Custom Routine Design',
      'Daily Check-in Schedule',
      'Progress Reviews',
      'Completion Milestone'
    ],
    popular: true
  },
  {
    id: 's-custom-audio',
    title: 'Custom Voice Audio Recording',
    category: 'custom-media',
    price: 200,
    duration: '10-15 Minutes Bespoke MP3',
    description: 'Custom high-quality audio file tailored to your personal preferences and topics of choice.',
    prerequisites: ['Preference Questionnaire', 'Full Payment Upfront'],
    features: [
      'High-Quality Studio Audio',
      'Custom Script & Topic',
      'Prompt Digital Delivery',
      'Permanent Personal Download'
    ]
  },
  {
    id: 's-virtual-worship',
    title: '1-on-1 Private Video Call',
    category: 'virtual',
    price: 400,
    duration: '45 Minutes Private Video Call',
    description: 'Direct high-definition private video session focused on personalized conversation and activities.',
    prerequisites: ['Camera & Mic Check', 'Session Guidelines Agreement'],
    features: [
      'Private Encrypted Video Room',
      'Interactive One-on-One Time',
      'Clear Boundaries & Safety',
      'Optional Call Summary'
    ]
  }
];

export const CODEX_RULES: CodexRule[] = [
  {
    id: 'rule-1',
    title: 'Respectful Communication',
    category: 'etiquette',
    summary: 'Clear, polite, and respectful communication is required at all times.',
    fullDetails: 'Please keep all messages polite, clear, and direct. Rude, demanding, or inappropriate messages without introduction will be ignored.',
    mandatory: true
  },
  {
    id: 'rule-2',
    title: 'Payment & Deposits',
    category: 'tribute',
    summary: 'All services and custom content require payment or deposit before delivery.',
    fullDetails: 'To respect scheduling and time commitment, orders and bookings must be confirmed with full payment or an agreed deposit.',
    mandatory: true
  },
  {
    id: 'rule-3',
    title: 'Confidentiality & Privacy',
    category: 'boundaries',
    summary: 'Both parties agree to strict mutual privacy and confidentiality.',
    fullDetails: 'All communications, video purchases, and session details are strictly confidential. Sharing, recording, or publishing content without explicit written consent is prohibited.',
    mandatory: true
  },
  {
    id: 'rule-4',
    title: 'Punctuality & Cancellation Policy',
    category: 'sessions',
    summary: 'Please be on time for scheduled sessions and appointments.',
    fullDetails: 'Please arrive or log in on time. Cancellations must be communicated at least 24 hours in advance to reschedule without penalty.',
    mandatory: false
  }
];

export const AUDIO_TEASERS: AudioTeaser[] = [
  {
    id: 'aud-1',
    title: 'Calm Introduction & Welcome',
    duration: '1:45',
    category: 'Audio Sample',
    synthFrequency: 220,
    description: 'A relaxing introductory audio sample showcasing voice tone and pacing.'
  },
  {
    id: 'aud-2',
    title: 'Guided Focus Routine',
    duration: '2:10',
    category: 'Instruction',
    synthFrequency: 330,
    description: 'A sample guided focus exercise with clear verbal instructions.'
  },
  {
    id: 'aud-3',
    title: 'Daily Routine Overview',
    duration: '1:15',
    category: 'Coaching',
    synthFrequency: 180,
    description: 'A brief preview of a structured daily accountability audio session.'
  },
  {
    id: 'aud-4',
    title: 'Evening Reflection Sample',
    duration: '2:40',
    category: 'Sample',
    synthFrequency: 290,
    description: 'An evening relaxation and mindfulness voice clip.'
  }
];

export const WISHLIST_ITEMS: TributeItem[] = [
  {
    id: 'w-1',
    name: 'Silk Robe & Outfit Wardrobe',
    category: 'Wishlist',
    price: 450,
    linkText: 'Send via Throne',
    description: 'Wardrobe and styling pieces for upcoming video shoots and photos.',
    urgency: 'high'
  },
  {
    id: 'w-2',
    name: 'Studio Lighting & Audio Equipment',
    category: 'Wishlist',
    price: 850,
    linkText: 'Support on Throne',
    description: 'High-end studio microphone and lighting for video and audio production.',
    urgency: 'medium'
  },
  {
    id: 'w-3',
    name: 'Tip via TipFunder',
    category: 'Direct Tip',
    price: 100,
    linkText: 'Send Tip',
    description: 'Direct tip to show support and appreciate new video releases.'
  },
  {
    id: 'w-4',
    name: 'Direct Support',
    category: 'Direct',
    price: 500,
    linkText: 'Support Directly',
    description: 'Direct contributions to fund future creative video projects.'
  }
];

export const DEVOTION_LOGS: DevotionLog[] = [
  {
    id: 'log-1',
    devoteeName: 'Supporter Alex',
    amount: 500,
    timestamp: '2 Hours Ago',
    message: 'Delighted with the coaching program progress. Thank you!',
    badge: 'Verified Member'
  },
  {
    id: 'log-2',
    devoteeName: 'Marcus G.',
    amount: 1200,
    timestamp: 'Yesterday',
    message: 'Private session confirmed. Looking forward to our appointment.',
    badge: 'Private Session'
  },
  {
    id: 'log-3',
    devoteeName: 'Anonymous Supporter',
    amount: 350,
    timestamp: '3 Days Ago',
    message: 'Monthly tip sent via TipFunder.',
    badge: 'Tip Supporter'
  },
  {
    id: 'log-4',
    devoteeName: 'Julian V.',
    amount: 250,
    timestamp: '4 Days Ago',
    message: 'Received the custom audio file today. Exceptional sound quality.',
    badge: 'Custom Order'
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
  cashapp: '$GoddessLuzia',
  email: 'contact@goddessluzia.com'
};
