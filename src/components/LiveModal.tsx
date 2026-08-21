import React, { useState, useEffect } from 'react';
import { X, Lock, Users, MessageSquare, CheckCircle2, ShieldCheck, ExternalLink, Radio, Gift, CreditCard } from 'lucide-react';
import { LIVE_PREVIEW_VIDEO, LIVE_PREVIEW_IMG } from '../data/collectionData';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface LiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'fr' | 'en';
  liveState?: {
    isLive: boolean;
    title: string;
    description: string;
    price: string;
    streamUrl: string;
  };
}

export const LiveModal: React.FC<LiveModalProps> = ({ isOpen, onClose, liveState }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const isLive = liveState?.isLive ?? false;
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();

  const throneUrl = siteSettings.throne_link || paymentSettings.throne || 'https://throne.com';
  const tipfunderUrl = siteSettings.tipfunder_link || paymentSettings.tipfunder;
  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Queen Milana';

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen, hasAccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in font-sans">
      <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl my-auto border border-gray-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
              isLive ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-ping' : 'bg-gray-500'}`}></span>
              {isLive ? 'LIVE' : 'OFFLINE ARCHIVES'}
            </span>
            <span className="text-sm font-extrabold text-white">
              {creatorName} — VIP Live Stream
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isLive && (
              <div className="flex items-center gap-1.5 text-xs text-gray-200 font-medium">
                <Users className="w-3.5 h-3.5 text-white" />
                <span>184 authorized</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-800 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Stream Body Layout */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Video Viewport (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-2xl bg-black overflow-hidden shadow-md group">
              <video
                ref={videoRef}
                poster={LIVE_PREVIEW_IMG}
                controls={hasAccess}
                controlsList="nodownload"
                autoPlay
                loop
                muted={!hasAccess}
                playsInline
                className={`w-full h-full object-cover ${!hasAccess ? 'filter blur-md brightness-50' : ''}`}
              >
                <source src={liveState?.streamUrl || LIVE_PREVIEW_VIDEO} type="video/mp4" />
              </video>

              {/* Locked Overlay */}
              {!hasAccess ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white space-y-4 bg-black/40">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>

                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-base sm:text-lg font-bold">
                      {liveState?.title || 'Exclusive VIP Live Stream Access'}
                    </h3>
                    <p className="text-xs text-gray-300">
                      {liveState?.description || 'Authorize through Throne to unlock full live stream access.'}
                    </p>
                  </div>

                  {/* Throne & TipFunder Links */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full max-w-xs">
                    {throneUrl && (
                      <a
                        href={throneUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 px-4 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5 text-black" />
                        <span>Throne {liveState?.price || '20 €'}</span>
                        <ExternalLink className="w-3 h-3 text-black" />
                      </a>
                    )}

                    {tipfunderUrl && (
                      <a
                        href={tipfunderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 px-4 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-black" />
                        <span>TipFunder</span>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setHasAccess(true)}
                    className="px-6 py-2.5 rounded-full bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Confirm Access (Payment Complete)
                  </button>

                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1 font-semibold text-black">
                <ShieldCheck className="w-4 h-4 text-black" /> Secure VIP Stream
              </span>
              <span className="font-semibold text-gray-600 font-mono">1080p60 • AES-256</span>
            </div>
          </div>

          {/* Live Chat Telemetry Panel */}
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-between space-y-4 border border-gray-200/80 max-h-[360px] lg:max-h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <MessageSquare className="w-4 h-4 text-black" />
                <span className="text-xs font-bold text-black uppercase tracking-wider">Live Telemetry</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs font-mono">
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <span className="font-bold text-black">Transaction ID-4892:</span>
                  <p className="text-gray-700 mt-0.5 font-sans">Throne authorization verified.</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <span className="font-bold text-black">Transaction ID-8834:</span>
                  <p className="text-gray-700 mt-0.5 font-sans">Access credentials confirmed.</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <span className="font-bold text-black">Node 01:</span>
                  <p className="text-gray-700 mt-0.5 font-sans">Centurion streaming channel stable.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <input
                type="text"
                placeholder="Send message to stream..."
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:border-black"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LiveModal;
