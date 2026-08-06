import React, { useRef } from 'react';
import { Lock, Play } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      onClick={() => onSelectItem(item)}
      className="group bg-white border border-gray-200/80 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Media Video Thumbnail Container */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black rounded-t-2xl sm:rounded-t-3xl">
        <video
          ref={videoRef}
          poster={item.thumbnailUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
        >
          <source src={item.previewUrl} type="video/mp4" referrerPolicy="no-referrer" />
          <source src={`https://i.imgur.com/${item.thumbnailUrl.split('/').pop()?.replace('.jpg', '')}.mp4`} type="video/mp4" referrerPolicy="no-referrer" />
        </video>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5 text-black" />
          </div>
        </div>

        {/* Locked Badge Top Left */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-md border border-white/20">
          <Lock className="w-3 h-3 text-white" />
          <span>Locked Preview</span>
        </div>

        {/* Duration Badge Bottom Right */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-xs font-bold tracking-wide">
          {item.duration}
        </div>
      </div>

      {/* Text Info Below Thumbnail */}
      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
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
          <span className="text-gray-500 font-medium text-xs">
            Video preview available
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
            Locked previews — Unlock via Revolut or PayPal
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
      ) : (
        <div className="py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-600 text-base font-medium">
            No videos found matching "{searchQuery}".
          </p>
          <button
            onClick={() => onSelectItem(items[0])}
            className="mt-4 px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800"
          >
            Browse All Videos
          </button>
        </div>
      )}

    </section>
  );
};
