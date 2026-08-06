import React from 'react';
import { CheckCircle2, ExternalLink, Lock, Play, Send } from 'lucide-react';
import { AVATAR_IMG, LIVE_PREVIEW_VIDEO, LIVE_PREVIEW_IMG, SOCIAL_LINKS } from '../data/collectionData';
import { VideoPlayer } from './VideoPlayer';

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

  return (
    <section id="hero" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 space-y-6 font-sans">
      
      {/* 1. TOP SECTION: Live Card */}
      <div 
        onClick={onJoinLive}
        className="group relative w-full h-[340px] sm:h-[400px] rounded-3xl overflow-hidden cursor-pointer border border-gray-200/80 shadow-md flex flex-col items-center justify-center text-center p-6 bg-black transition-all duration-500"
      >
        {/* Background Looping Preview */}
        <VideoPlayer
          src={liveState?.streamUrl || LIVE_PREVIEW_VIDEO}
          poster={LIVE_PREVIEW_IMG}
          autoPlay
          loop
          muted
          controls={false}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 grayscale-[15%] group-hover:scale-105 transition-transform duration-1000 pointer-events-none"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-500"></div>

        {/* Hero Card Inner Content */}
        <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto space-y-4">
          
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider shadow-md">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-600 animate-ping' : 'bg-gray-400'}`}></span>
            <span>
              {isLive ? 'LIVE STREAM VIP' : 'OFFLINE'}
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
            {isLive ? 'Goddess Layla is Live' : 'Goddess Lay👸🏻'}
          </h1>

          <p className="text-gray-200 text-xs sm:text-sm font-medium max-w-md">
            {isLive
              ? (liveState?.description || 'Exclusive access to live stream VIP')
              : 'Goddess Lay👸🏻 • Telegram: laylathebest'}
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
                <span>View Stream / Live Status</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* 2. SECOND SECTION: Profile Card */}
      <div className="w-full bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
        
        {/* Left Side: Image + Goddess Lay Profile */}
        <div className="flex items-center gap-4 sm:gap-5 text-center sm:text-left">
          
          {/* Avatar Image */}
          <div className="relative shrink-0">
            <img
              src={AVATAR_IMG}
              alt="Goddess Lay👸🏻"
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-gray-300 shadow-xs"
            />
          </div>

          {/* Title & Telegram */}
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
                Goddess Lay👸🏻
              </h2>
              <CheckCircle2 className="w-4 h-4 text-black fill-gray-100" />
            </div>

            <p className="text-xs sm:text-sm font-bold tracking-tight text-gray-800 leading-snug flex items-center justify-center sm:justify-start gap-1">
              <Send className="w-3.5 h-3.5 text-sky-600 inline" />
              <span>Telegram: <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="underline hover:text-sky-600">laylathebest</a></span>
            </p>
          </div>

        </div>

        {/* Right Side: Official TipFunder Button */}
        <div className="shrink-0 flex items-center gap-2">
          <a
            href={SOCIAL_LINKS.tipfunder}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 text-xs font-semibold tracking-tight transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <span>TipFunder Payment</span>
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </a>
        </div>

      </div>

    </section>
  );
};
