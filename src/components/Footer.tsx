import React from 'react';
import { SOCIAL_LINKS } from '../data/collectionData';
import { Send, Gift } from 'lucide-react';

interface FooterProps {
  lang?: 'fr' | 'en';
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-white border-t border-gray-200/80 py-12 px-4 sm:px-6 lg:px-8 mt-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-600">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start space-y-1 text-center md:text-left">
            <div className="font-serif text-2xl font-bold tracking-tight text-black">
              Goddess Layla👸🏻
            </div>
            <p className="text-xs text-gray-700 font-medium mt-0.5">
              Telegram: laylathebest • VIP Sanctuary
            </p>
          </div>

          {/* Official Links */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold text-black">
            <a
              href={SOCIAL_LINKS.tipfunder}
              target="_blank"
              rel="noreferrer"
              className="hover:bg-gray-800 transition-colors bg-black text-white px-4 py-2 rounded-full border border-black"
            >
              <span>TipFunder Payment</span>
            </a>
            <a
              href={SOCIAL_LINKS.throne}
              target="_blank"
              rel="noreferrer"
              className="hover:bg-gray-200 transition-colors bg-gray-100 text-black px-4 py-2 rounded-full border border-gray-200 flex items-center gap-1"
            >
              <Gift className="w-3.5 h-3.5 text-black" />
              <span>Throne</span>
            </a>
            <a
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noreferrer"
              className="hover:bg-gray-200 transition-colors bg-gray-100 text-black px-4 py-2 rounded-full border border-gray-200"
            >
              <span>X @Geldherrinlay9</span>
            </a>
            <a
              href={SOCIAL_LINKS.telegram}
              target="_blank"
              rel="noreferrer"
              className="hover:bg-sky-700 transition-colors bg-sky-600 text-white px-4 py-2 rounded-full border border-sky-600 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Telegram</span>
            </a>
          </div>

        </div>

        {/* 18+ OFFICIAL LEGAL NOTICE & COMPLIANCE DISCLAIMER */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gray-50 border border-gray-200/80 text-left space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-bold uppercase tracking-widest font-sans">
              18+ LEGAL NOTICE
            </span>
            <span className="text-xs font-bold text-black uppercase tracking-wider">
              Regulatory Compliance Disclaimer
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed font-normal">
            This website and its exclusive digital content are strictly intended for adults 18 years of age and older. By continuing to access this service, you certify under penalty of perjury that you are of legal age in your jurisdiction. All media, video broadcasts, and trademarks are protected under international copyright and intellectual property laws.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 font-medium border-t border-gray-100 pt-4">
          <div className="select-none cursor-default">
            © {new Date().getFullYear()} Goddess Layla👸🏻. All rights reserved. VIP Space 18+.
          </div>
        </div>

      </div>
    </footer>
  );
};
