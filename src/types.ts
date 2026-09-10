export interface SessionOffering {
  id: string;
  title: string;
  category: 'in-person' | 'findom' | 'chastity' | 'custom-media' | 'virtual';
  price: number;
  duration: string;
  description: string;
  prerequisites: string[];
  features: string[];
  popular?: boolean;
  image?: string;
}

export interface CodexRule {
  id: string;
  title: string;
  category: 'etiquette' | 'tribute' | 'sessions' | 'boundaries';
  summary: string;
  fullDetails: string;
  mandatory: boolean;
}

export interface AudioTeaser {
  id: string;
  title: string;
  duration: string;
  category: string;
  synthFrequency: number;
  description: string;
}

export interface TributeItem {
  id: string;
  name: string;
  category: string;
  price: number;
  linkText: string;
  description: string;
  urgency?: 'high' | 'medium' | 'low';
}

export interface DevotionLog {
  id: string;
  devoteeName: string;
  amount: number;
  timestamp: string;
  message: string;
  badge?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'aria';
  text: string;
  timestamp: string;
}

export interface BookingFormState {
  devoteeTitle: string;
  email: string;
  telegramOrX: string;
  sessionType: string;
  preferredDate: string;
  tributeAmount: number;
  addOns: string[];
  protocolAccepted: boolean;
  customNotes: string;
}

export interface PromoBannerClip {
  id: string;
  title: string;
  google_drive_link?: string;
  video_url: string;
  thumbnail_url?: string;
  text_overlay?: string;
  announcement_badge?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface PromoBannerConfig {
  global_text_overlay: string;
  rotation_interval_sec: number;
  clips: PromoBannerClip[];
}
