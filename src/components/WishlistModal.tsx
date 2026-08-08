import React from 'react';
import { X, ExternalLink, Heart, Gift } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/collectionData';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'fr' | 'en';
}

export const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl my-8 border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-black fill-black" />
            <h3 className="font-serif font-bold text-lg text-gray-900">
              Gifts & Tribute Portal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-1">
            <h4 className="font-serif text-2xl font-extrabold text-gray-900">Goddess Layla</h4>
            <p className="text-xs text-gray-500 font-medium">
              Send gifts and tributes directly to Goddess Layla.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TipFunder */}
            <div className="p-5 rounded-2xl bg-black text-white space-y-3 shadow-md">
              <span className="text-[10px] font-mono text-gray-300 uppercase font-bold">Only Official Payment</span>
              <h5 className="font-bold text-lg">TipFunder Direct</h5>
              <a
                href={SOCIAL_LINKS.tipfunder}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-gray-100"
              >
                <span>TipFunder Payment</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Throne */}
            <div className="p-5 rounded-2xl bg-gray-900 text-white space-y-3 shadow-md">
              <span className="text-[10px] font-mono text-gray-300 uppercase font-bold">Wishlist & Gifts</span>
              <h5 className="font-bold text-lg">Throne Wishlist</h5>
              <a
                href={SOCIAL_LINKS.throne}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-gray-100"
              >
                <Gift className="w-3.5 h-3.5 text-black" />
                <span>Throne Wishlist</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
