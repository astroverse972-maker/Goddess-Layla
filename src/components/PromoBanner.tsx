import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractGoogleDriveId } from '../utils/sanitizeMedia';

export const DEFAULT_BANNER_WORDS: string[] = [
  'Welcome',
  'Watch the Latest',
  'New This Week',
  "See What's New"
];

export interface PromoClipItem {
  id: string;
  title: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  googleDriveId?: string | null;
  textOverlay?: string;
  announcementBadge?: string;
}

const FALLBACK_CLIPS: PromoClipItem[] = [
  {
    id: 'fb-1',
    title: '',
    videoUrl: 'https://i.imgur.com/m0CSW44.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'fb-2',
    title: '',
    videoUrl: 'https://i.imgur.com/gK9qN2p.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'fb-3',
    title: '',
    videoUrl: 'https://i.imgur.com/m0CSW44.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'fb-4',
    title: '',
    videoUrl: 'https://i.imgur.com/gK9qN2p.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop'
  }
];

interface PromoBannerProps {
  onOpenShop?: () => void;
  words?: string[];
  lang?: 'fr' | 'en';
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onOpenShop, lang }) => {
  const [clips, setClips] = useState<PromoClipItem[]>(FALLBACK_CLIPS);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false);
  const [rotationIntervalSec, setRotationIntervalSec] = useState<number>(6);
  const [globalAnnouncement, setGlobalAnnouncement] = useState<string>('');
  const primaryVideoRef = useRef<HTMLVideoElement>(null);

  // Fetch rotating promotional clips and configuration from server
  useEffect(() => {
    let isMounted = true;

    async function loadPromoData() {
      try {
        const foundClips: PromoClipItem[] = [];

        // 1. Fetch promotional clips & configuration from /api/promo-banner
        const promoRes = await fetch('/api/promo-banner');
        if (promoRes.ok) {
          const promoData = await promoRes.json();
          if (promoData) {
            if (typeof promoData.rotation_interval_sec === 'number' && promoData.rotation_interval_sec >= 3) {
              setRotationIntervalSec(promoData.rotation_interval_sec);
            }
            if (promoData.global_text_overlay) {
              setGlobalAnnouncement(promoData.global_text_overlay);
            }
            if (Array.isArray(promoData.clips)) {
              for (const clip of promoData.clips) {
                if (clip.is_active === false) continue;
                const gDrive = extractGoogleDriveId(clip.google_drive_link || clip.video_url);
                foundClips.push({
                  id: clip.id || `promo-${foundClips.length}`,
                  title: typeof clip.title === 'string' ? clip.title.trim() : '',
                  videoUrl: !gDrive && clip.video_url ? clip.video_url : undefined,
                  thumbnailUrl: clip.thumbnail_url,
                  googleDriveId: gDrive,
                  textOverlay: clip.text_overlay || '',
                  announcementBadge: clip.announcement_badge || ''
                });
              }
            }
          }
        }

        // 2. Supplement from custom-media if fewer than 4 clips
        if (foundClips.length < 4) {
          const customRes = await fetch('/api/custom-media');
          if (customRes.ok) {
            const customData = await customRes.json();
            const items = Array.isArray(customData)
              ? customData
              : customData && Array.isArray(customData.media)
              ? customData.media
              : [];

            for (const item of items) {
              const rawUrl = item.previewUrl || item.videoStoragePath || '';
              const gDrive = extractGoogleDriveId(rawUrl || item.googleDriveLink);
              if (rawUrl || gDrive || item.thumbnailUrl) {
                foundClips.push({
                  id: item.id || `custom-${foundClips.length}`,
                  title: typeof item.title === 'string' ? item.title.trim() : '',
                  videoUrl: !gDrive && rawUrl ? rawUrl : undefined,
                  thumbnailUrl: item.thumbnailUrl,
                  googleDriveId: gDrive,
                  textOverlay: '',
                  announcementBadge: ''
                });
              }
              if (foundClips.length >= 4) break;
            }
          }
        }

        // 3. Fallback fill to guarantee at least 4 items
        if (foundClips.length < 4) {
          for (let i = foundClips.length; i < 4; i++) {
            foundClips.push(FALLBACK_CLIPS[i % FALLBACK_CLIPS.length]);
          }
        }

        if (isMounted && foundClips.length > 0) {
          setClips(foundClips);
        }
      } catch (err) {
        // Retain fallback clips on network error
      }
    }

    loadPromoData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Advance to the next promotional clip with a gentle crossfade
  const advanceToNextClip = useCallback(() => {
    if (clips.length <= 1) return;
    setCurrentIdx((curr) => {
      setPrevIdx(curr);
      setIsCrossfading(false);
      return (curr + 1) % clips.length;
    });
  }, [clips.length]);

  // Handle crossfade completion after ~1.3 seconds
  useEffect(() => {
    if (prevIdx !== null) {
      const raf = requestAnimationFrame(() => {
        setIsCrossfading(true);
      });
      const timer = setTimeout(() => {
        setPrevIdx(null);
        setIsCrossfading(false);
      }, 1350);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [prevIdx]);

  // Silent automatic rotation timer (no visible bars, dots, or countdowns)
  useEffect(() => {
    if (clips.length <= 1) return;
    const intervalMs = Math.max(4000, rotationIntervalSec * 1000);
    const timer = setInterval(() => {
      advanceToNextClip();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [clips.length, rotationIntervalSec, advanceToNextClip]);

  // Action handler: scrolls to collection or triggers onOpenShop
  const handleNavigateToVideos = () => {
    if (onOpenShop) {
      onOpenShop();
      return;
    }
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentClip = clips[currentIdx] || FALLBACK_CLIPS[0];
  const outgoingClip = prevIdx !== null ? clips[prevIdx] : null;
  const currentTitle = typeof currentClip?.title === 'string' ? currentClip.title.trim() : '';

  // Quiet announcement beneath banner: only shows global announcement if set
  const activeAnnouncement = globalAnnouncement || '';

  const renderMedia = (clip: PromoClipItem, isPrimary: boolean) => {
    if (clip.googleDriveId) {
      return (
        <iframe
          key={clip.id}
          src={`https://drive.google.com/file/d/${clip.googleDriveId}/preview`}
          title={clip.title}
          allow="autoplay; fullscreen"
          className="w-full h-full border-0 pointer-events-none scale-105 object-cover"
        />
      );
    }
    if (clip.videoUrl) {
      return (
        <video
          ref={isPrimary ? primaryVideoRef : undefined}
          key={clip.id}
          src={clip.videoUrl}
          poster={clip.thumbnailUrl}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          onEnded={advanceToNextClip}
          className="w-full h-full object-cover pointer-events-none"
        />
      );
    }
    if (clip.thumbnailUrl) {
      return (
        <img
          key={clip.id}
          src={clip.thumbnailUrl}
          alt={clip.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover pointer-events-none"
        />
      );
    }
    return <div className="w-full h-full bg-neutral-950" />;
  };

  return (
    <div id="promo-wallpaper-banner" className="w-full select-none font-sans">
      {/* 1. Cinematic Banner Canvas (No buttons, no badges, no progress bar, no glassmorphism) */}
      <div
        onClick={handleNavigateToVideos}
        className="group relative w-full h-[280px] sm:h-[360px] md:h-[420px] lg:h-[460px] rounded-3xl overflow-hidden bg-neutral-950 cursor-pointer shadow-sm transition-all duration-300"
      >
        {/* Layer A: Active Incoming Clip */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-[1300ms] ease-in-out ${
            prevIdx === null || isCrossfading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {renderMedia(currentClip, true)}
        </div>

        {/* Layer B: Outgoing Clip (smoothly dissolves away) */}
        {outgoingClip && (
          <div
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-[1300ms] ease-in-out ${
              isCrossfading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {renderMedia(outgoingClip, false)}
          </div>
        )}

        {/* Subtle, soft cinematic vignette in the lower third for effortless typographic contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5 pointer-events-none" />

        {/* Lower Third Typography: Elegant, refined title with calm reveal and exit animations */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 pointer-events-none z-10">
          <div className="max-w-3xl min-h-[2.5rem] sm:min-h-[3.25rem] flex items-end">
            <AnimatePresence mode="wait">
              {currentTitle ? (
                <motion.h2
                  key={currentClip.id || `promo-clip-${currentIdx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.75,
                      ease: [0.25, 0.1, 0.25, 1]
                    }
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                    transition: {
                      duration: 0.55,
                      ease: [0.25, 0.1, 0.25, 1]
                    }
                  }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.08em] sm:tracking-[0.1em] text-white/95 leading-tight select-none drop-shadow-sm"
                >
                  {currentTitle}
                </motion.h2>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. Space Beneath the Banner: Minimal, elegant "Watch the Latest" text link & quiet announcement */}
      <div className="pt-3.5 pb-1 px-1 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Quiet, refined announcement text (plain text, no colored badge or pill shape) */}
        <div className="text-xs sm:text-sm text-neutral-500 font-light tracking-wide min-h-[20px]">
          {activeAnnouncement ? (
            <span className="transition-opacity duration-700 ease-in-out">
              {activeAnnouncement}
            </span>
          ) : null}
        </div>

        {/* Minimal, elegant "Watch the Latest" text link with thin font and subtle animated underline/arrow */}
        <button
          type="button"
          onClick={handleNavigateToVideos}
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-light tracking-widest uppercase text-neutral-900 hover:text-neutral-500 transition-colors duration-300 cursor-pointer select-none"
        >
          <span className="relative pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-neutral-900 group-hover:after:w-full after:transition-all after:duration-300">
            {lang === 'fr' ? 'Voir les Nouveautés' : 'Watch the Latest'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[1.25] text-neutral-900 group-hover:text-neutral-500 group-hover:translate-x-1 transition-all duration-300" />
        </button>
      </div>
    </div>
  );
};
