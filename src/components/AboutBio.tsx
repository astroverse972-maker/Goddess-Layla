import React, { useState, useEffect } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Gift, Send } from 'lucide-react';
import { SOCIAL_LINKS, GALLERY_SLIDES } from '../data/collectionData';

interface AboutBioProps {
  lang?: 'fr' | 'en';
}

export const AboutBio: React.FC<AboutBioProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % GALLERY_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + GALLERY_SLIDES.length) % GALLERY_SLIDES.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-200/80 font-sans">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
        
        {/* Left Column: Bio Information & Official Links */}
        <div className="space-y-4">
          
          <div className="space-y-1.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black bg-gray-100 px-3 py-1 rounded-full border border-gray-200 inline-block">
              About Me
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight leading-tight">
              Goddess Lay👸🏻
            </h2>
            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-800 font-semibold">
              <Send className="w-4 h-4 text-sky-600" />
              <span>Telegram: <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="underline hover:text-sky-600">laylathebest</a></span>
            </div>
          </div>

          {/* Interactive Bio Card */}
          <div className="p-4 sm:p-6 bg-gray-50/90 text-black rounded-2xl sm:rounded-3xl border border-gray-200/80 space-y-3 shadow-xs">
            
            <div className="text-sm sm:text-base font-bold tracking-tight text-black flex items-center gap-2">
              <span>TipFunder (Only Official Payment Method)</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
              Welcome to my official VIP sanctuary. Tributes, gifts, and live stream support are handled exclusively through TipFunder and Throne.
            </p>

            <div className="pt-2 border-t border-gray-200/80 text-xs text-gray-800 space-y-1">
              <p className="font-bold text-black">
                Official Channels & Platforms:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-0.5 text-xs">
                <li>TipFunder: <a href={SOCIAL_LINKS.tipfunder} target="_blank" rel="noreferrer" className="underline font-semibold">TipFunder / Geldherrinlay9</a></li>
                <li>Throne Wishlist: <a href={SOCIAL_LINKS.throne} target="_blank" rel="noreferrer" className="underline font-semibold">Throne / geldherrinlayla</a></li>
                <li>X (Twitter): <a href={SOCIAL_LINKS.x} target="_blank" rel="noreferrer" className="underline font-semibold">@Geldherrinlay9</a></li>
                <li>Telegram: <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="underline font-semibold">@laylathebest</a></li>
              </ul>
            </div>

          </div>

          {/* Official Action Buttons */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <a
              href={SOCIAL_LINKS.tipfunder}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 font-bold text-xs transition-transform active:scale-95 flex items-center gap-1.5 shadow-xs"
            >
              <span>TipFunder Payment</span>
              <ExternalLink className="w-3.5 h-3.5 text-white" />
            </a>

            <a
              href={SOCIAL_LINKS.throne}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 font-bold text-xs transition-transform active:scale-95 flex items-center gap-1.5 shadow-xs"
            >
              <Gift className="w-3.5 h-3.5 text-black" />
              <span>Throne Wishlist</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>

            <a
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 font-bold text-xs transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>X @Geldherrinlay9</span>
            </a>

            <a
              href={SOCIAL_LINKS.telegram}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full bg-sky-600 text-white hover:bg-sky-700 font-bold text-xs transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>Telegram @laylathebest</span>
            </a>
          </div>

        </div>

        {/* Right Column: Interactive Photo Slideshow */}
        <div className="relative w-full group">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 bg-black aspect-[3/4] transition-all">
            
            {/* Slide Image */}
            <img
              src={GALLERY_SLIDES[currentSlide]}
              alt={`Goddess Layla slide ${currentSlide + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-all duration-700"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Left Nav Button */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
              title="Previous Photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Nav Button */}
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
              title="Next Photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Indicators Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
              {GALLERY_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            {/* Top Right Tag */}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold tracking-wider border border-white/20">
              {currentSlide + 1} / {GALLERY_SLIDES.length}
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};
