import React from 'react';
import { CheckCircle2, ExternalLink, Send, Crown, Gift, CreditCard } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { PromoBanner } from './PromoBanner';

interface HeroProps {
  onOpenShop?: () => void;
  lang?: 'fr' | 'en';
}

export const Hero: React.FC<HeroProps> = ({ onOpenShop, lang }) => {
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();

  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Goddess Luzia';
  const avatarUrl = siteSettings.avatar_url || creatorProfile.avatar || "https://pnpmpwkdlbbmsxqwwnjc.supabase.co/storage/v1/object/public/Luzia/Luzia%20Pic/ifABElLS_400x400.jpg";
  const telegramLink = siteSettings.telegram_link || paymentSettings.telegram;
  const throneLink = siteSettings.throne_link || paymentSettings.throne;
  const tipfunderLink = siteSettings.tipfunder_link || paymentSettings.tipfunder;

  return (
    <section id="hero" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 space-y-6 font-sans">
      
      {/* 1. TOP SECTION: Video Wallpaper Showcase & Navigation */}
      <PromoBanner onOpenShop={onOpenShop} lang={lang} />

      {/* 2. SECOND SECTION: Profile Card */}
      <div className="w-full bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
        
        {/* Left Side: Image + Goddess Luzia Profile */}
        <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left">
          
          {/* Avatar Image / Monogram Fallback */}
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={creatorName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-300 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-900 text-white flex flex-col items-center justify-center border border-gray-200 shadow-xs">
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
            )}
          </div>

          {/* Title & Telegram */}
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                {creatorName}
              </h2>
              <CheckCircle2 className="w-4 h-4 text-black fill-gray-100" />
            </div>

            {telegramLink ? (
              <p className="text-xs sm:text-sm font-bold tracking-tight text-gray-800 leading-snug flex items-center justify-center sm:justify-start gap-1">
                <Send className="w-3.5 h-3.5 text-black inline" />
                <span>Telegram: <a href={telegramLink} target="_blank" rel="noreferrer" className="underline hover:text-black">Channel</a></span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 font-medium">
                Official Channel
              </p>
            )}
          </div>

        </div>

        {/* Right Side: Action Buttons */}
        <div className="shrink-0 flex items-center gap-2 flex-wrap justify-center">
          {throneLink && (
            <a
              href={throneLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 text-xs font-semibold tracking-tight transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-white" />
              <span>Throne</span>
              <ExternalLink className="w-3.5 h-3.5 text-white" />
            </a>
          )}

          {tipfunderLink && (
            <a
              href={tipfunderLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-black text-xs font-semibold tracking-tight transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-black" />
              <span>TipFunder</span>
            </a>
          )}
        </div>

      </div>

    </section>
  );
};

export default Hero;
