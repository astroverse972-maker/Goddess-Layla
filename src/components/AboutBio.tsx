import React, { useState, useEffect } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Gift, Send, Crown, CreditCard } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getSupabaseClient } from '../lib/supabaseClient';

interface AboutBioProps {
  lang?: 'fr' | 'en';
}

export const AboutBio: React.FC<AboutBioProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();
  const [supabasePhotos, setSupabasePhotos] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadLuziaPhotos() {
      // 1. Try server endpoint first
      try {
        const res = await fetch('/api/luzia-photos');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.photos) && data.photos.length > 0 && isMounted) {
            setSupabasePhotos(data.photos);
            return;
          }
        }
      } catch (e) {
        // Fall back to client-side storage query
      }

      // 2. Direct client-side Supabase Storage lookup
      try {
        const sb = getSupabaseClient();
        if (!sb) return;

        for (const bucket of ['luzia', 'Luzia']) {
          for (const folder of ['Luzia Pic', 'luzia pic']) {
            const { data, error } = await sb.storage.from(bucket).list(folder, {
              limit: 100,
              sortBy: { column: 'name', order: 'asc' }
            });

            if (!error && Array.isArray(data) && data.length > 0) {
              const imageFiles = data.filter(
                (f) => f.name && !f.name.startsWith('.') && !f.name.endsWith('/')
              );

              if (imageFiles.length > 0) {
                const urls = imageFiles.map((f) => {
                  const { data: pubData } = sb.storage
                    .from(bucket)
                    .getPublicUrl(`${folder}/${f.name}`);
                  return pubData.publicUrl;
                });

                if (isMounted && urls.length > 0) {
                  setSupabasePhotos(urls);
                  return;
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not load photos from Supabase Storage luzia/Luzia Pic:', err);
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

  const gallerySlides = supabasePhotos.length > 0 ? supabasePhotos : fallbackSlides;

  const nextSlide = () => {
    if (gallerySlides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % gallerySlides.length);
    }
  };

  const prevSlide = () => {
    if (gallerySlides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + gallerySlides.length) % gallerySlides.length);
    }
  };

  useEffect(() => {
    if (gallerySlides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [gallerySlides.length]);

  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Goddess Luzia';
  const bioText = siteSettings.about_text || creatorProfile.bio || 'Welkom op de officiële website van Goddess Luzia. Bekijk video\'s, teasers en bestel content veilig via Throne of TipFunder.';
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

        {/* Right Column: Interactive Gallery */}
        <div className="w-full">
          {gallerySlides.length > 0 ? (
            <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full rounded-3xl overflow-hidden border border-gray-200 shadow-md group bg-neutral-900">
              <img
                src={gallerySlides[currentSlide]}
                alt={`${creatorName} Portrait`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Slide Navigation Buttons */}
              {gallerySlides.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevSlide();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextSlide();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md">
                    {gallerySlides.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          idx === currentSlide ? 'bg-white w-3' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="aspect-[4/5] sm:aspect-[3/4] w-full rounded-3xl bg-neutral-950 border border-neutral-800 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-neutral-900 border border-white/20 flex items-center justify-center text-white">
                <Crown className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-serif text-white">
                  {creatorName}
                </h3>
                <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest">
                  Official Website
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </section>
  );
};

export default AboutBio;
