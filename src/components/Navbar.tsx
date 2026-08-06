import React, { useState } from 'react';
import { Search, Menu, X as CloseIcon, CreditCard, Mail, Film, Gift, Send } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/collectionData';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenPayment: () => void;
  onOpenContact: () => void;
  onOpenShop: () => void;
  onOpenAdmin: () => void;
  lang?: 'fr' | 'en';
  onToggleLang?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenPayment,
  onOpenContact,
  onOpenShop,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-2xs transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Name */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer group flex items-center gap-2 select-none"
        >
          <span className="font-serif text-xl sm:text-2xl font-extrabold text-black tracking-tight transition-colors">
            Goddess Lay👸🏻
          </span>
        </div>

        {/* Center Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Videos Link */}
          <button
            onClick={onOpenShop}
            className="px-3.5 py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/90 text-black border border-gray-200/70 text-xs font-semibold backdrop-blur-md transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5 text-black" />
            <span>My Videos</span>
          </button>

          {/* Payment Button (TipFunder) */}
          <button
            onClick={onOpenPayment}
            className="px-3.5 py-2 rounded-full bg-black text-white hover:bg-gray-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-white" />
            <span>TipFunder Payment</span>
          </button>

          {/* Throne Link */}
          <a
            href={SOCIAL_LINKS.throne}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/90 text-black border border-gray-200/70 text-xs font-semibold backdrop-blur-md transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5 text-black" />
            <span>Throne</span>
          </a>

          {/* Contact Button */}
          <button
            onClick={onOpenContact}
            className="px-3.5 py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/90 text-black border border-gray-200/70 text-xs font-semibold backdrop-blur-md transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-black" />
            <span>Contact</span>
          </button>

          {/* Search Input Bar */}
          <div className="relative flex items-center">
            <div className="bg-gray-100/80 border border-gray-200/60 focus-within:border-black focus-within:bg-white rounded-full px-3.5 py-1.5 text-xs flex items-center gap-2 w-36 xl:w-44 transition-all">
              <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-black placeholder:text-gray-400 focus:outline-none w-full text-xs font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Far Right: Social Links X & Telegram */}
        <div className="hidden sm:flex items-center gap-2">
          <a
            href={SOCIAL_LINKS.telegram}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
            title="Telegram laylathebest"
          >
            <Send className="w-3 h-3 text-white" />
            <span>Telegram</span>
          </a>

          <a
            href={SOCIAL_LINKS.x}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-full bg-black text-white hover:bg-gray-800 text-xs font-bold transition-all shadow-xs flex items-center gap-1"
            title="X (Twitter) @Geldherrinlay9"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>X</span>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-black focus:outline-none"
          >
            {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-5 space-y-3 animate-fade-in">
          <button
            onClick={() => {
              onOpenShop();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-bold text-black border-b border-gray-100 flex items-center justify-between"
          >
            <span>My Videos</span>
            <Film className="w-4 h-4 text-black" />
          </button>

          <a
            href={SOCIAL_LINKS.tipfunder}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-left py-2 text-sm font-bold text-black border-b border-gray-100 flex items-center justify-between"
          >
            <span>TipFunder Payment</span>
            <CreditCard className="w-4 h-4 text-black" />
          </a>

          <a
            href={SOCIAL_LINKS.throne}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-left py-2 text-sm font-bold text-black border-b border-gray-100 flex items-center justify-between"
          >
            <span>Throne Wishlist</span>
            <Gift className="w-4 h-4 text-black" />
          </a>

          <button
            onClick={() => {
              onOpenContact();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-bold text-black border-b border-gray-100 flex items-center justify-between"
          >
            <span>Contact</span>
            <Mail className="w-4 h-4 text-black" />
          </button>

          <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs font-bold">
            <a 
              href={SOCIAL_LINKS.telegram} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-full bg-sky-600 text-white flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Telegram</span>
            </a>
            <a 
              href={SOCIAL_LINKS.x} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-full bg-black text-white flex items-center justify-center gap-1.5"
            >
              <span>X @Geldherrinlay9</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
