import React from 'react';
import { CheckCircle2, ExternalLink, Lock, Play, Send, Crown, Gift, CreditCard } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface HeroProps {
  onJoinLive: () => void;
  lang?: 'fr' | 'en';
  liveState?: {
    isLive: boolean;
    title: string;
    description: string;
    price: string;
    streamUrl: string;
  };
}

export const Hero: React.FC<HeroProps> = ({ onJoinLive, liveState }) => {
  const isLive = liveState?.isLive ?? false;
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();

  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Queen Milana';
  const avatarUrl = siteSettings.avatar_url || creatorProfile.avatar;
  const telegramLink = siteSettings.telegram_link || paymentSettings.telegram;
  const throneLink = siteSettings.throne_link || paymentSettings.throne;
  const tipfunderLink = siteSettings.tipfunder_link || paymentSettings.tipfunder;
  const streamUrl = liveState?.streamUrl;

  return (
    <section id="hero" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 space-y-6 font-sans">
      
      {/* 1. TOP SECTION: Live Card */}
      <div 
        onClick={onJoinLive}
        className="group relative w-full h-[340px] sm:h-[400px] rounded-3xl overflow-hidden cursor-pointer border border-gray-200/80 shadow-md flex flex-col items-center justify-center text-center p-6 bg-radial from-gray-900 via-black to-black transition-all duration-500"
      >
        {/* Background Looping Preview (only if streamUrl is present) */}
        {streamUrl ? (
          <VideoPlayer
            src={streamUrl}
            autoPlay
            loop
            muted
            controls={false}
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 grayscale-[15%] group-hover:scale-105 transition-transform duration-1000 pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-black pointer-events-none flex items-center justify-center opacity-70">
            <div className="w-96 h-96 rounded-full bg-white/5 blur-3xl animate-pulse" />
          </div>
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-500"></div>

        {/* Hero Card Inner Content */}
        <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto space-y-4">
          
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider shadow-md">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-black animate-ping' : 'bg-gray-400'}`}></span>
            <span>
              {isLive ? 'LIVE STREAM VIP' : 'OFFLINE ARCHIVES'}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
            {isLive ? `${creatorName} is Live` : creatorName}
          </h1>

          <p className="text-gray-200 text-xs sm:text-sm font-medium max-w-md">
            {isLive
              ? (liveState?.description || 'Exclusive VIP live stream access')
              : `${creatorName} • Official VIP Sanctuary`}
          </p>

          {/* Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoinLive();
            }}
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-bold shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isLive ? (
              <>
                <Lock className="w-4 h-4 text-black" />
                <span>Join Live ({liveState?.price || '20.00 €'})</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-black fill-current" />
                <span>Watch Me Live</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* 2. SECOND SECTION: Profile Card */}
      <div className="w-full bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
        
        {/* Left Side: Image + Queen Milana Profile */}
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
                <span>Telegram: <a href={telegramLink} target="_blank" rel="noreferrer" className="underline hover:text-black">VIP Sanctuary</a></span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 font-medium">
                Official VIP Sanctuary
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
              <span>Throne Direct</span>
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
              <span>TipFunder Tribute</span>
            </a>
          )}
        </div>

      </div>

    </section>
  );
};

export default Hero;
