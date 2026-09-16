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

