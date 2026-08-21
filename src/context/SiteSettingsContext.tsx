import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SOCIAL_LINKS } from '../data/collectionData';

export interface CentralSiteSettings {
  // Payment & Social Channels
  throne_link: string;
  twitter_link: string;
  telegram_link: string;
  tipfunder_link: string;
  
  // Profile & Visual Assets
  creator_name: string;
  about_text: string;
  avatar_url: string;
  about_photos: string[];

  // Aliases for compatibility
  throne: string;
  x: string;
  telegram: string;
  tipfunder: string;
  name: string;
  bio: string;
  avatar: string;
  gallery: string[];
}

export interface PaymentSettings {
  tipfunder: string;
  throne: string;
  telegram: string;
  x: string;
  throne_link?: string;
  twitter_link?: string;
  telegram_link?: string;
  tipfunder_link?: string;
}

export interface CreatorProfile {
  name: string;
  avatar: string;
  bio: string;
  gallery: string[];
  about_text?: string;
  avatar_url?: string;
  about_photos?: string[];
}

interface SiteSettingsContextType {
  siteSettings: CentralSiteSettings;
  paymentSettings: PaymentSettings;
  creatorProfile: CreatorProfile;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSiteSettings: (newSettings: Partial<CentralSiteSettings>) => Promise<boolean>;
  updatePaymentSettings: (newSettings: Partial<PaymentSettings>) => Promise<boolean>;
  updateCreatorProfile: (newProfile: Partial<CreatorProfile>) => Promise<boolean>;
}

const defaultCentralSettings: CentralSiteSettings = {
  throne_link: SOCIAL_LINKS.throne || "",
  twitter_link: SOCIAL_LINKS.x || "",
  telegram_link: SOCIAL_LINKS.telegram || "",
  tipfunder_link: SOCIAL_LINKS.tipfunder || "",
  creator_name: "Queen Milana",
  about_text: "Welkom in het officiële VIP heiligdom van Queen Milana. Exclusieve archieven, transacties en live stream autorisaties verlopen via gecentraliseerde beveiligingskanalen.",
  avatar_url: "",
  about_photos: [],

  // Aliases
  throne: SOCIAL_LINKS.throne || "",
  x: SOCIAL_LINKS.x || "",
  telegram: SOCIAL_LINKS.telegram || "",
  tipfunder: SOCIAL_LINKS.tipfunder || "",
  name: "Queen Milana",
  bio: "Welkom in het officiële VIP heiligdom van Queen Milana. Exclusieve archieven, transacties en live stream autorisaties verlopen via gecentraliseerde beveiligingskanalen.",
  avatar: "",
  gallery: []
};

const defaultPaymentSettings: PaymentSettings = {
  tipfunder: defaultCentralSettings.tipfunder_link,
  throne: defaultCentralSettings.throne_link,
  telegram: defaultCentralSettings.telegram_link,
  x: defaultCentralSettings.twitter_link,
  throne_link: defaultCentralSettings.throne_link,
  twitter_link: defaultCentralSettings.twitter_link,
  telegram_link: defaultCentralSettings.telegram_link,
  tipfunder_link: defaultCentralSettings.tipfunder_link
};

const defaultCreatorProfile: CreatorProfile = {
  name: defaultCentralSettings.creator_name,
  avatar: defaultCentralSettings.avatar_url,
  bio: defaultCentralSettings.about_text,
  gallery: defaultCentralSettings.about_photos,
  about_text: defaultCentralSettings.about_text,
  avatar_url: defaultCentralSettings.avatar_url,
  about_photos: defaultCentralSettings.about_photos
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  siteSettings: defaultCentralSettings,
  paymentSettings: defaultPaymentSettings,
  creatorProfile: defaultCreatorProfile,
  isLoading: false,
  refreshSettings: async () => {},
  updateSiteSettings: async () => false,
  updatePaymentSettings: async () => false,
  updateCreatorProfile: async () => false
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<CentralSiteSettings>(() => {
    try {
      const saved = localStorage.getItem('goddess_central_settings');
      if (saved) return { ...defaultCentralSettings, ...JSON.parse(saved) };
    } catch (e) {}
    return defaultCentralSettings;
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const [payRes, profRes, siteRes] = await Promise.all([
        fetch('/api/payment-settings'),
        fetch('/api/creator-profile'),
        fetch('/api/site-settings')
      ]);

      let merged: Partial<CentralSiteSettings> = {};

      if (siteRes.ok) {
        const siteData = await siteRes.json();
        if (siteData && typeof siteData === 'object') {
          merged = { ...merged, ...siteData };
        }
      }

      if (payRes.ok) {
        const payData = await payRes.json();
        if (payData) {
          merged.throne_link = payData.throne_link || payData.throne || merged.throne_link;
          merged.twitter_link = payData.twitter_link || payData.x || merged.twitter_link;
          merged.telegram_link = payData.telegram_link || payData.telegram || merged.telegram_link;
          merged.tipfunder_link = payData.tipfunder_link || payData.tipfunder || merged.tipfunder_link;
          merged.throne = merged.throne_link;
          merged.x = merged.twitter_link;
          merged.telegram = merged.telegram_link;
          merged.tipfunder = merged.tipfunder_link;
        }
      }

      if (profRes.ok) {
        const profData = await profRes.json();
        if (profData) {
          merged.creator_name = profData.name || merged.creator_name;
          merged.about_text = profData.bio || profData.about_text || merged.about_text;
          merged.avatar_url = profData.avatar || profData.avatar_url || merged.avatar_url;
          merged.about_photos = Array.isArray(profData.gallery) ? profData.gallery : (Array.isArray(profData.about_photos) ? profData.about_photos : merged.about_photos);
          merged.name = merged.creator_name;
          merged.bio = merged.about_text;
          merged.avatar = merged.avatar_url;
          merged.gallery = merged.about_photos;
        }
      }

      if (Object.keys(merged).length > 0) {
        setSiteSettings(prev => {
          const next = { ...prev, ...merged };
          try { localStorage.setItem('goddess_central_settings', JSON.stringify(next)); } catch (e) {}
          return next;
        });
      }
    } catch (err) {
      console.warn('[SETTINGS LOAD NOTICE]:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSiteSettings = async (newSettings: Partial<CentralSiteSettings>): Promise<boolean> => {
    const throne = newSettings.throne_link ?? newSettings.throne ?? siteSettings.throne_link;
    const x = newSettings.twitter_link ?? newSettings.x ?? siteSettings.twitter_link;
    const telegram = newSettings.telegram_link ?? newSettings.telegram ?? siteSettings.telegram_link;
    const tipfunder = newSettings.tipfunder_link ?? newSettings.tipfunder ?? siteSettings.tipfunder_link;
    const name = newSettings.creator_name ?? newSettings.name ?? siteSettings.creator_name;
    const bio = newSettings.about_text ?? newSettings.bio ?? siteSettings.about_text;
    const avatar = newSettings.avatar_url ?? newSettings.avatar ?? siteSettings.avatar_url;
    const gallery = newSettings.about_photos ?? newSettings.gallery ?? siteSettings.about_photos;

    const normalized: CentralSiteSettings = {
      ...siteSettings,
      ...newSettings,
      throne_link: throne,
      throne: throne,
      twitter_link: x,
      x: x,
      telegram_link: telegram,
      telegram: telegram,
      tipfunder_link: tipfunder,
      tipfunder: tipfunder,
      creator_name: name,
      name: name,
      about_text: bio,
      bio: bio,
      avatar_url: avatar,
      avatar: avatar,
      about_photos: gallery,
      gallery: gallery
    };

    setSiteSettings(normalized);
    try { localStorage.setItem('goddess_central_settings', JSON.stringify(normalized)); } catch (e) {}

    try {
      await Promise.all([
        fetch('/api/site-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalized)
        }),
        fetch('/api/payment-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            throne,
            x,
            telegram,
            tipfunder,
            throne_link: throne,
            twitter_link: x,
            telegram_link: telegram,
            tipfunder_link: tipfunder
          })
        }),
        fetch('/api/creator-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            bio,
            avatar,
            gallery,
            about_text: bio,
            avatar_url: avatar,
            about_photos: gallery
          })
        })
      ]);
      return true;
    } catch (e) {
      return false;
    }
  };

  const updatePaymentSettings = async (newSettings: Partial<PaymentSettings>): Promise<boolean> => {
    return updateSiteSettings({
      throne_link: newSettings.throne_link ?? newSettings.throne,
      twitter_link: newSettings.twitter_link ?? newSettings.x,
      telegram_link: newSettings.telegram_link ?? newSettings.telegram,
      tipfunder_link: newSettings.tipfunder_link ?? newSettings.tipfunder
    });
  };

  const updateCreatorProfile = async (newProfile: Partial<CreatorProfile>): Promise<boolean> => {
    return updateSiteSettings({
      creator_name: newProfile.name,
      about_text: newProfile.about_text ?? newProfile.bio,
      avatar_url: newProfile.avatar_url ?? newProfile.avatar,
      about_photos: newProfile.about_photos ?? newProfile.gallery
    });
  };

  const paymentSettings: PaymentSettings = {
    tipfunder: siteSettings.tipfunder_link,
    throne: siteSettings.throne_link,
    telegram: siteSettings.telegram_link,
    x: siteSettings.twitter_link,
    throne_link: siteSettings.throne_link,
    twitter_link: siteSettings.twitter_link,
    telegram_link: siteSettings.telegram_link,
    tipfunder_link: siteSettings.tipfunder_link
  };

  const creatorProfile: CreatorProfile = {
    name: siteSettings.creator_name || 'Queen Milana',
    avatar: siteSettings.avatar_url,
    bio: siteSettings.about_text,
    gallery: siteSettings.about_photos,
    about_text: siteSettings.about_text,
    avatar_url: siteSettings.avatar_url,
    about_photos: siteSettings.about_photos
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        siteSettings,
        paymentSettings,
        creatorProfile,
        isLoading,
        refreshSettings,
        updateSiteSettings,
        updatePaymentSettings,
        updateCreatorProfile
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
