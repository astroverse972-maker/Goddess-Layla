import React from 'react';
import { Send, Gift } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface FooterProps {
  lang?: 'fr' | 'en';
}

export const Footer: React.FC<FooterProps> = () => {
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();
  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Queen Milana';
  const tipfunderLink = siteSettings.tipfunder_link || paymentSettings.tipfunder;
  const throneLink = siteSettings.throne_link || paymentSettings.throne;
  const xLink = siteSettings.twitter_link || paymentSettings.x;
  const telegramLink = siteSettings.telegram_link || paymentSettings.telegram;

  return (
    <footer className="bg-white border-t border-gray-200/80 py-12 px-4 sm:px-6 lg:px-8 mt-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-600">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start space-y-1 text-center md:text-left">
            <div className="font-serif text-2xl font-bold tracking-tight text-black">
              {creatorName}
            </div>
            <p className="text-xs text-gray-700 font-medium mt-0.5">
              Official VIP Sanctuary • All Rights Reserved
            </p>
          </div>

          {/* Official Links */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold text-black">
            {throneLink && (
              <a
                href={throneLink}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-gray-800 transition-colors bg-black text-white px-4 py-2 rounded-full border border-black flex items-center gap-1"
              >
                <Gift className="w-3.5 h-3.5 text-white" />
                <span>Throne</span>
              </a>
            )}
            {tipfunderLink && (
              <a
                href={tipfunderLink}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-gray-200 transition-colors bg-gray-100 text-black px-4 py-2 rounded-full border border-gray-200 flex items-center gap-1"
              >
                <span>TipFunder Tribute</span>
              </a>
            )}
            {xLink && (
              <a
                href={xLink}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-gray-200 transition-colors bg-gray-100 text-black px-4 py-2 rounded-full border border-gray-200"
              >
                <span>X (Twitter)</span>
              </a>
            )}
            {telegramLink && (
              <a
                href={telegramLink}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-gray-800 transition-colors bg-black text-white px-4 py-2 rounded-full border border-black flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Telegram</span>
              </a>
            )}
          </div>

        </div>

        {/* 18+ OFFICIAL LEGAL NOTICE & COMPLIANCE DISCLAIMER */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gray-50 border border-gray-200/80 text-left space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-bold uppercase tracking-widest font-sans">
              18+ LEGAL NOTICE
            </span>
            <span className="text-xs font-bold text-black uppercase tracking-wider">
              Legal Compliance & Privacy
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed font-normal">
            This website and exclusive digital archives are strictly intended for adults aged 18 and older. By accessing this platform, you certify that you are of legal age in your jurisdiction. All media, video transactions, and trademarks are protected under international copyright and intellectual property laws.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium border-t border-gray-100 pt-4">
          <div className="select-none cursor-default">
            © {new Date().getFullYear()} {creatorName}. All rights reserved. VIP 18+.
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
