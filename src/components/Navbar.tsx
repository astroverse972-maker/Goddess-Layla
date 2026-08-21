import React, { useState } from 'react';
import { Search, Menu, X as CloseIcon, CreditCard, Mail, Film, Gift, Send } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenPayment: () => void;
  onOpenContact: () => void;
  onOpenShop: () => void;
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
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();

  const throneLink = siteSettings.throne_link || paymentSettings.throne;
  const tipfunderLink = siteSettings.tipfunder_link || paymentSettings.tipfunder;
  const xLink = siteSettings.twitter_link || paymentSettings.x;
  const telegramLink = siteSettings.telegram_link || paymentSettings.telegram;
  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Queen Milana';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-2xs transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Name */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer group flex items-center gap-2 select-none"
        >
          <span className="font-serif text-xl sm:text-2xl font-extrabold text-black tracking-tight transition-colors">
            {creatorName}
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

          {/* Throne Link (Primary) */}
          {throneLink && (
            <a
              href={throneLink}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-full bg-black text-white hover:bg-gray-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5 text-white" />
              <span>Throne Direct</span>
            </a>
          )}

          {/* Payment Button (TipFunder) */}
          {tipfunderLink && (
            <button
              onClick={onOpenPayment}
              className="px-3.5 py-2 rounded-full bg-gray-100/80 hover:bg-gray-200/90 text-black border border-gray-200/70 text-xs font-semibold backdrop-blur-md transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-black" />
              <span>TipFunder Tribute</span>
            </button>
          )}

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
                  className="text-xs text-gray-400 hover:text-black cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Social Links on Right */}
        <div className="hidden sm:flex items-center gap-2">
          {xLink && (
            <a
              href={xLink}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-black border border-gray-200/80 transition-colors"
              title="X / Twitter"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}

          {telegramLink && (
            <a
              href={telegramLink}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-black border border-gray-200/80 transition-colors"
              title="Telegram"
            >
              <Send className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-gray-100 text-black border border-gray-200 cursor-pointer"
          >
            {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
          <div className="relative flex items-center mb-3">
            <div className="bg-gray-100 border border-gray-200 rounded-full px-3.5 py-2 text-xs flex items-center gap-2 w-full">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-black placeholder:text-gray-400 focus:outline-none w-full text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenShop();
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-black text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>My Videos</span>
            </button>

            {throneLink && (
              <a
                href={throneLink}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-black text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4 text-white" />
                <span>Throne</span>
              </a>
            )}

            {tipfunderLink && (
              <button
                onClick={() => {
                  onOpenPayment();
                  setMobileMenuOpen(false);
                }}
                className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-black text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>TipFunder</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-black text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
