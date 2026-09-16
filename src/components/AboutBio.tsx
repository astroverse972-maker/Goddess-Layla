import React, { useState, useEffect } from 'react';
import { ExternalLink, Gift, Send, Crown, CreditCard } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getSupabaseClient } from '../lib/supabaseClient';

interface AboutBioProps {
  lang?: 'fr' | 'en';
}

const isValidAboutPhoto = (url: string) => {
  if (!url || typeof url !== 'string') return false;
  // Explicitly exclude the profile avatar portrait from the about gallery
  if (url.includes('ifABElLS_400x400.jpg')) return false;

  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  const videoExts = [
    '.mp4',
    '.mov',
    '.webm',
    '.m4v',
    '.avi',
    '.mkv',
    '.wmv',
    '.flv',
    '.3gp',
    '.quicktime'
  ];
  if (videoExts.some((ext) => cleanUrl.endsWith(ext))) return false;
  const nonMediaExts = ['.pdf', '.zip', '.tar', '.gz', '.json', '.txt', '.doc', '.docx'];
  if (nonMediaExts.some((ext) => cleanUrl.endsWith(ext))) return false;
  return true;
};

export const AboutBio: React.FC<AboutBioProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();
  const [supabasePhotos, setSupabasePhotos] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadLuziaPhotos() {
      // 1. Try server endpoint first (pulls from Luzia/Luzia Pic)
      try {
        const res = await fetch('/api/luzia-photos');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.photos) && data.photos.length > 0 && isMounted) {
            const valid = data.photos.filter(isValidAboutPhoto);
            if (valid.length > 0) {
              setSupabasePhotos(valid);
              return;
            }
          }
        }
      } catch (e) {
        // Fall back to client-side storage query
      }

      // 2. Direct client-side Supabase Storage lookup
      try {
        const sb = getSupabaseClient();
        if (!sb) return;

        for (const bucket of ['Luzia', 'luzia']) {
          for (const folder of ['Luzia Pic', 'luzia pic', 'Luzia%20Pic']) {
            const { data, error } = await sb.storage.from(bucket).list(folder, {
              limit: 100,
              sortBy: { column: 'name', order: 'asc' }
            });

            if (!error && Array.isArray(data) && data.length > 0) {
              const imageFiles = data.filter(
                (f) =>
                  f.name &&
                  !f.name.startsWith('.') &&
                  !f.name.endsWith('/') &&
                  isValidAboutPhoto(f.name)
              );

              if (imageFiles.length > 0) {
                const urls = imageFiles.map((f) => {
                  const { data: pubData } = sb.storage
                    .from(bucket)
                    .getPublicUrl(`${folder}/${f.name}`);
                  return pubData.publicUrl;
                });

                if (isMounted && urls.length > 0) {
                  setSupabasePhotos(urls.filter(isValidAboutPhoto));
                  return;
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not load photos from Supabase Storage Luzia/Luzia Pic:', err);
      }
    }

    loadLuziaPhotos();

    return () => {
      isMounted = false;
    };
  }, []);

  const fallbackSlides = Array.isArray(siteSettings.about_photos) && siteSettings.about_photos.length > 0
    ? siteSettings.about_photos.filter(Boolean)
    : (Array.isArray(creatorProfile.gallery) ? creatorProfile.gallery.filter(Boolean) : []);

  const rawGallerySlides = supabasePhotos.length > 0 ? supabasePhotos : fallbackSlides;
  const gallerySlides = rawGallerySlides.filter(isValidAboutPhoto);

  // Preload all gallery images in browser cache so crossfades are seamless without pop-in
  useEffect(() => {
    gallerySlides.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [gallerySlides]);

  // Auto-advance every 5.5 seconds with seamless looping
  useEffect(() => {
    if (gallerySlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((curr) => {
        const next = (curr + 1) % gallerySlides.length;
        setPrevSlide(curr);
        setIsCrossfading(false);
        return next;
      });
    }, 5500);

    return () => clearInterval(interval);
  }, [gallerySlides.length]);

  // Handle smooth 1.4s crossfade
  useEffect(() => {
    if (prevSlide !== null) {
      const animFrame = requestAnimationFrame(() => {
        setIsCrossfading(true);
      });
      const timer = setTimeout(() => {
        setPrevSlide(null);
        setIsCrossfading(false);
      }, 1400);

      return () => {
        cancelAnimationFrame(animFrame);
        clearTimeout(timer);
      };
    }
  }, [prevSlide, currentSlide]);

  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Goddess Luzia';
  const bioText = siteSettings.about_text || creatorProfile.bio || 'Welkom op de officiële website van Goddess Luzia. Bekijk video\'s en bestel content veilig via Throne of TipFunder.';
  const throneLink = siteSettings.throne_link || paymentSettings.throne;
  const tipfunderLink = siteSettings.tipfunder_link || paymentSettings.tipfunder;
  const xLink = siteSettings.twitter_link || paymentSettings.x;
  const telegramLink = siteSettings.telegram_link || paymentSettings.telegram;

  return (
    <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-200/80 font-sans">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
        
        {/* Left Column: Bio Information & Official Links */}
        <div className="space-y-4">
          
          <div className="space-y-1.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black bg-gray-100 px-3 py-1 rounded-full border border-gray-200 inline-block">
              About
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight leading-tight">
              {creatorName}
            </h2>
            {telegramLink && (
              <div className="flex items-center gap-2 text-sm sm:text-base text-gray-800 font-semibold">
                <Send className="w-4 h-4 text-black" />
                <span>
                  Telegram:{' '}
                  <a href={telegramLink} target="_blank" rel="noreferrer" className="underline hover:text-black">
                    Telegram Channel
                  </a>
                </span>
              </div>
            )}
          </div>

          {/* Bio Card */}
          <div className="p-4 sm:p-6 bg-gray-50/90 text-black rounded-2xl sm:rounded-3xl border border-gray-200/80 space-y-3 shadow-xs">
            
            <div className="text-sm sm:text-base font-bold tracking-tight text-black flex items-center gap-2">
              <span>About {creatorName}</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-line">
              {bioText}
            </p>

            {(tipfunderLink || throneLink || xLink || telegramLink) && (
              <div className="pt-2 border-t border-gray-200/80 text-xs text-gray-800 space-y-1">
                <p className="font-bold text-black">
                  Official Channels & Platforms:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                  {throneLink && (
                    <li>
                      Throne:{' '}
                      <a href={throneLink} target="_blank" rel="noreferrer" className="underline font-semibold">
                        Wishlist & Gifts
                      </a>
                    </li>
                  )}
                  {tipfunderLink && (
                    <li>
                      TipFunder:{' '}
                      <a href={tipfunderLink} target="_blank" rel="noreferrer" className="underline font-semibold">
                        Tips & Support
                      </a>
                    </li>
                  )}
                  {xLink && (
                    <li>
                      X (Twitter):{' '}
                      <a href={xLink} target="_blank" rel="noreferrer" className="underline font-semibold">
                        Official X Profile
                      </a>
                    </li>
                  )}
                  {telegramLink && (
                    <li>
                      Telegram:{' '}
                      <a href={telegramLink} target="_blank" rel="noreferrer" className="underline font-semibold">
                        Telegram Channel
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

          </div>

          {/* Official Action Buttons */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            {throneLink && (
              <a
                href={throneLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 font-bold text-xs transition-transform active:scale-95 flex items-center gap-1.5 shadow-xs"
              >
                <Gift className="w-3.5 h-3.5 text-white" />
                <span>Throne Wishlist</span>
                <ExternalLink className="w-3.5 h-3.5 text-white" />
              </a>
            )}

            {tipfunderLink && (
              <a
                href={tipfunderLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-full bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 font-bold text-xs transition-transform active:scale-95 flex items-center gap-1.5 shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-black" />
                <span>TipFunder Payment</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>
            )}
          </div>

        </div>

        {/* Right Column: Natural Resolution Photo Slideshow (No container background, no blur, no letterbox) */}
        <div className="w-full flex items-center justify-center">
          {gallerySlides.length > 0 ? (
            <div className="relative inline-flex items-center justify-center select-none">
              {/* Current foreground photo in document flow: sizes container to match each photo exactly */}
              <img
                key={gallerySlides[currentSlide]}
                src={gallerySlides[currentSlide]}
                alt={`${creatorName} Portrait`}
                referrerPolicy="no-referrer"
                loading="eager"
                className={`max-h-[70vh] sm:max-h-[580px] lg:max-h-[640px] max-w-full w-auto h-auto object-contain rounded-2xl block transition-opacity duration-[1400ms] ease-in-out ${
                  isCrossfading || prevSlide === null ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Outgoing photo dissolving away gently */}
              {prevSlide !== null && gallerySlides[prevSlide] && (
                <img
                  key={gallerySlides[prevSlide]}
                  src={gallerySlides[prevSlide]}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 m-auto max-h-full max-w-full w-auto h-auto object-contain rounded-2xl pointer-events-none transition-opacity duration-[1400ms] ease-in-out ${
                    isCrossfading ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              )}
            </div>
          ) : (
            <div className="w-full flex items-center justify-center p-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-black">
                <Crown className="w-8 h-8" />
              </div>
            </div>
          )}
        </div>

      </div>

    </section>
  );
};

export default AboutBio;
