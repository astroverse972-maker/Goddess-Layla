import React, { useState, useEffect, useRef } from 'react';
import { extractGoogleDriveId } from '../utils/sanitizeMedia';

export const DEFAULT_BANNER_WORDS: string[] = [
  'Welcome',
  'Watch the Latest',
  'New This Week',
  "See What's New"
];

interface VideoWallpaperItem {
  id: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  googleDriveId?: string | null;
}

const FALLBACK_WALLPAPERS: VideoWallpaperItem[] = [
  {
    id: 'fb-1',
    videoUrl: 'https://i.imgur.com/m0CSW44.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'fb-2',
    videoUrl: 'https://i.imgur.com/gK9qN2p.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'fb-3',
    videoUrl: 'https://i.imgur.com/m0CSW44.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'fb-4',
    videoUrl: 'https://i.imgur.com/gK9qN2p.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop'
  }
];

interface PromoBannerProps {
  onOpenShop?: () => void;
  words?: string[];
  lang?: 'fr' | 'en';
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  onOpenShop,
  words = DEFAULT_BANNER_WORDS
}) => {
  const [wallpaperVideos, setWallpaperVideos] = useState<VideoWallpaperItem[]>(FALLBACK_WALLPAPERS);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [isWordFading, setIsWordFading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch up to 4 most recent video previews from custom-media and promo-banner endpoints
  useEffect(() => {
    let isMounted = true;

    async function loadRecentVideoPreviews() {
      try {
        const foundVideos: VideoWallpaperItem[] = [];

        // 1. Fetch from custom-media (latest creator uploads)
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
              foundVideos.push({
                id: item.id || `custom-${foundVideos.length}`,
                videoUrl: !gDrive && rawUrl ? rawUrl : undefined,
                thumbnailUrl: item.thumbnailUrl,
                googleDriveId: gDrive
              });
            }
            if (foundVideos.length >= 4) break;
          }
        }

        // 2. Supplement from promo-banner if fewer than 4 videos found
        if (foundVideos.length < 4) {
          const promoRes = await fetch('/api/promo-banner');
          if (promoRes.ok) {
            const promoData = await promoRes.json();
            if (promoData && Array.isArray(promoData.clips)) {
              for (const clip of promoData.clips) {
                if (clip.is_active === false) continue;
                const gDrive = extractGoogleDriveId(clip.google_drive_link || clip.video_url);
                foundVideos.push({
                  id: clip.id || `promo-${foundVideos.length}`,
                  videoUrl: !gDrive && clip.video_url ? clip.video_url : undefined,
                  thumbnailUrl: clip.thumbnail_url,
                  googleDriveId: gDrive
                });
                if (foundVideos.length >= 4) break;
              }
            }
          }
        }

        // 3. Fallback fill to always ensure exactly 4 video panels
        if (foundVideos.length < 4) {
          for (let i = foundVideos.length; i < 4; i++) {
            foundVideos.push(FALLBACK_WALLPAPERS[i % FALLBACK_WALLPAPERS.length]);
          }
        }

        if (isMounted && foundVideos.length >= 4) {
          setWallpaperVideos(foundVideos.slice(0, 4));
        }
      } catch (err) {
        // Retain fallback wallpapers on network error
      }
    }

    loadRecentVideoPreviews();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sequential full-bleed video progression: advance to next video
  const advanceToNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % wallpaperVideos.length);
  };

  // Fallback timer: advances video every 8s if onEnded does not trigger (e.g. iframe, image, or stalled video)
  useEffect(() => {
    const timer = setInterval(() => {
      advanceToNextVideo();
    }, 8000);

    return () => clearInterval(timer);
  }, [wallpaperVideos.length]);

  // Play current video whenever currentVideoIndex updates
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideoIndex]);

  // Single button label rotating cycle
  const wordList = words && words.length > 0 ? words : DEFAULT_BANNER_WORDS;

  useEffect(() => {
    if (wordList.length <= 1) return;

    const interval = setInterval(() => {
      setIsWordFading(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % wordList.length);
        setIsWordFading(false);
      }, 300);
    }, 3200);

    return () => clearInterval(interval);
  }, [wordList.length]);

  // Universal navigation action: clicking the button scrolls to the latest videos section
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

  const currentVideo = wallpaperVideos[currentVideoIndex % wallpaperVideos.length] || FALLBACK_WALLPAPERS[0];
  const activeLabel = wordList[currentWordIndex % wordList.length] || wordList[0];

  return (
    <div
      id="promo-wallpaper-banner"
      className="relative w-full h-[260px] sm:h-[320px] md:h-[360px] rounded-3xl overflow-hidden border border-neutral-800/80 bg-neutral-950 shadow-2xl select-none"
    >
      {/* 1. Full-bleed Sequential Video Wallpaper: 1 video at a time, looping to next video upon finish */}
      <div className="absolute inset-0 w-full h-full bg-black overflow-hidden pointer-events-none">
        {currentVideo.googleDriveId ? (
          <iframe
            key={currentVideo.id}
            src={`https://drive.google.com/file/d/${currentVideo.googleDriveId}/preview`}
            title="Video preview"
            allow="autoplay; fullscreen"
            className="w-full h-full border-0 pointer-events-none scale-110 object-cover opacity-85"
          />
        ) : currentVideo.videoUrl ? (
          <video
            ref={videoRef}
            key={currentVideo.id}
            src={currentVideo.videoUrl}
            poster={currentVideo.thumbnailUrl}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={advanceToNextVideo}
            className="w-full h-full object-cover pointer-events-none opacity-85 transition-opacity duration-700"
          />
        ) : currentVideo.thumbnailUrl ? (
          <img
            key={currentVideo.id}
            src={currentVideo.thumbnailUrl}
            alt="Video preview thumbnail"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover pointer-events-none opacity-85 transition-opacity duration-700"
          />
        ) : (
          <div className="w-full h-full bg-neutral-950" />
        )}
      </div>

      {/* 2. Dark Overlay: 60% black for a moodier background and enhanced contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.60)' }}
      />

      {/* 3. Foreground: Centered Single Darker Glass Action Button with cross-fading word */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          onClick={handleNavigateToVideos}
          style={{
            background: 'linear-gradient(to bottom, rgba(20, 20, 20, 0.55), rgba(10, 10, 10, 0.35))',
            backdropFilter: 'blur(20px) saturate(130%)',
            WebkitBackdropFilter: 'blur(20px) saturate(130%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.18)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
            borderRadius: '9999px',
          }}
          className="group inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 cursor-pointer select-none text-white min-w-[200px] sm:min-w-[240px] transition-all duration-300"
        >
          {/* Single line rotating word with soft cross-fade */}
          <span
            className={`transition-opacity duration-300 ease-in-out text-center select-none text-[16px] sm:text-[18px] font-bold text-white tracking-tight leading-none ${
              isWordFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {activeLabel}
          </span>
        </button>
      </div>
    </div>
  );
};


