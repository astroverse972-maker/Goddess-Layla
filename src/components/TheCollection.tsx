import React, { useState, useEffect, useRef } from 'react';
import { Lock, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CollectionItem } from '../data/collectionData';

interface TheCollectionProps {
  items: CollectionItem[];
  searchQuery: string;
  onSelectItem: (item: CollectionItem) => void;
  lang?: 'fr' | 'en';
}

const VideoCard: React.FC<{
  item: CollectionItem;
  title: string;
  category: string;
  onSelectItem: (item: CollectionItem) => void;
}> = ({ item, title, category, onSelectItem }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Frames array for the static JPG slideshow:
  // Prefer explicit previewImages array; fallback to thumbnail and variations
  const frames = (item.previewImages && item.previewImages.length > 0)
    ? item.previewImages
    : [item.thumbnailUrl];

  useEffect(() => {
    if (isHovered && frames.length > 1) {
      // Cycle through static JPG preview frames every 750ms
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
      }, 750);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCurrentFrameIndex(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isHovered, frames.length]);

  const activeImage = frames[currentFrameIndex] || item.thumbnailUrl;

  return (
    <div
      onClick={() => onSelectItem(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => {
        // Allow brief display before opening on tap
        setTimeout(() => setIsHovered(false), 1500);
      }}
      className="group bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col justify-between select-none"
    >
      {/* Media Static JPG Thumbnail & Slideshow Container (STRICTLY STATIC JPG IMAGES, NO LIVE VIDEO) */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-neutral-900 rounded-t-2xl sm:rounded-t-3xl">
        
        {/* Active Static JPG Image or Fallback */}
        {activeImage ? (
          <img
            key={activeImage}
            src={activeImage}
            alt={title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered ? 'scale-105 brightness-105' : 'scale-100 brightness-95'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
            <Lock className="w-10 h-10 text-neutral-700" />
          </div>
        )}

        {/* Frame Progress Indicator Bars (Shows when hovering / cycling through static JPG frames) */}
        {frames.length > 1 && (
          <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 z-20 transition-opacity duration-300">
            {frames.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  idx === currentFrameIndex
                    ? 'bg-white shadow-sm'
                    : 'bg-white/30 backdrop-blur-xs'
                }`}
              />
            ))}
          </div>
        )}

        {/* Locked Badge Top Left */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md border border-white/20 z-10">
          <Lock className="w-3 h-3 text-white" />
          <span>Locked Preview</span>
        </div>

        {/* Slideshow Active Badge (Top Right when hovering) */}
        {isHovered && frames.length > 1 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 border border-white/20 animate-fade-in z-10">
            <ImageIcon className="w-3 h-3 text-white" />
            <span>Frame {currentFrameIndex + 1}/{frames.length}</span>
          </div>
        )}

        {/* Duration Badge Bottom Right */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-xs font-bold tracking-wide z-10">
          {item.duration}
        </div>

        {/* Bottom Hover Hint */}
        <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-gray-300 text-[10px] font-medium tracking-wide flex items-center gap-1 transition-opacity duration-300 z-10 ${
          isHovered ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
        }`}>
          <Sparkles className="w-3 h-3 text-white" />
          <span>Static preview slideshow</span>
        </div>
      </div>

      {/* Text Info Below Thumbnail */}
      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-black bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            {category}
          </span>
          <h3 className="mt-2.5 font-sans font-bold text-base sm:text-lg text-black group-hover:text-gray-700 transition-colors leading-snug line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Footer Line: Preview & Lock Price */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium text-xs flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Preview slideshow active</span>
          </span>

          <div className="flex items-center gap-1.5 font-extrabold text-black bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            <Lock className="w-3.5 h-3.5 text-black" />
            <span>{item.price.toFixed(2)} €</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export const TheCollection: React.FC<TheCollectionProps> = ({
  items,
  searchQuery,
  onSelectItem,
}) => {
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const title = item.titleEn || item.title;
    const cat = item.categoryEn || item.category;
    const desc = item.descriptionEn || item.description;
    return (
      title.toLowerCase().includes(query) ||
      cat.toLowerCase().includes(query) ||
      desc.toLowerCase().includes(query) ||
      item.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  return (
    <section id="collection" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
        <div className="space-y-1">
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
            My Videos
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            Locked previews — Unlock via Throne or TipFunder
          </p>
        </div>
        {searchQuery && (
          <span className="text-xs font-medium text-black bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            Results for "{searchQuery}"
          </span>
        )}
      </div>

      {/* 2-Column Collection Card Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredItems.map((item) => {
            const title = item.titleEn || item.title;
            const category = item.categoryEn || item.category;

            return (
              <VideoCard
                key={item.id}
                item={item}
                title={title}
                category={category}
                onSelectItem={onSelectItem}
              />
            );
          })}
        </div>
      ) : searchQuery ? (
        <div className="py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-600 text-base font-medium">
            No videos found matching "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="py-20 text-center bg-gray-50/80 rounded-3xl border border-dashed border-gray-200/80 p-8 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-black text-white flex items-center justify-center shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-black">
            Exclusive Sanctuary Collection
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
            Exclusive sessions will be uploaded here directly by Goddess Milana. Check back soon or visit the VIP sanctuary.
          </p>
        </div>
      )}

    </section>
  );
};
