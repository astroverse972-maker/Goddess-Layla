export interface CollectionItem {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
  price: number;
  previewUrl: string;
  thumbnailUrl: string;
  previewImages?: string[];
  duration: string;
  description: string;
  descriptionEn: string;
  tags: string[];
  videoStoragePath?: string;
  video_storage_path?: string;
}

export const AVATAR_IMG = '';
export const LIVE_PREVIEW_VIDEO = '';
export const LIVE_PREVIEW_IMG = '';

export const GALLERY_SLIDES: string[] = [];

export const SOCIAL_LINKS = {
  x: '',
  tipfunder: '',
  throne: '',
  telegram: ''
};

export const COLLECTION_ITEMS: CollectionItem[] = [];

