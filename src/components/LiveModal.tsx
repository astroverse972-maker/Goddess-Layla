import React, { useState, useEffect } from 'react';
import { X, Lock, Users, MessageSquare, CheckCircle2, ShieldCheck, ExternalLink, Radio, Gift } from 'lucide-react';
import { LIVE_PREVIEW_VIDEO, LIVE_PREVIEW_IMG, SOCIAL_LINKS } from '../data/collectionData';

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
  const [viewers, setViewers] = useState(184);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const isLive = liveState?.isLive ?? false;

  useEffect(() => {
    if (!isOpen || !isLive) return;
    const interval = setInterval(() => {
      const nextViewers = Math.floor(Math.random() * (285 - 130 + 1)) + 130;
      setViewers(nextViewers);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen, isLive]);

  useEffect(() => {
    if (isOpen && videoRef.current && isLive) {
      videoRef.current.play().catch(() => {});
    }
  }, [isOpen, hasAccess, isLive]);

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
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-600 animate-ping' : 'bg-gray-500'}`}></span>
              {isLive ? 'LIVE' : 'OFFLINE'}
            </span>
            <span className="text-sm font-extrabold text-white">
              Goddess Layla👸🏻 — VIP Live Stream
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isLive && (
              <div className="flex items-center gap-1.5 text-xs text-gray-200 font-medium">
                <Users className="w-3.5 h-3.5 text-white" />
                <span>{viewers} watching</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Video Stream Window */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
              <video
                ref={videoRef}
                key={`live-stream-${hasAccess ? 'unlocked' : 'preview'}`}
                poster={LIVE_PREVIEW_IMG}
                controls={hasAccess && isLive}
                autoPlay={isLive}
                loop
                muted={!hasAccess || !isLive}
                playsInline
                preload="auto"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className={`w-full h-full object-cover ${!hasAccess || !isLive ? 'pointer-events-none' : ''}`}
              >
                <source src={liveState?.streamUrl || LIVE_PREVIEW_VIDEO} type="video/mp4" referrerPolicy="no-referrer" />
              </video>

              {!isLive ? (
                /* OFFLINE COVER OVERLAY */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-black/85 backdrop-blur-xs">
                  <div className="w-14 h-14 rounded-full bg-gray-900 text-gray-400 border border-gray-700 flex items-center justify-center shadow-2xl">
                    <Radio className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-extrabold text-white">
                      Goddess Layla is currently offline
                    </h4>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto font-medium">
                      The live stream is currently offline. Check back soon or browse her video collection below.
                    </p>
                  </div>
                </div>
              ) : !hasAccess ? (
                /* LIVE LOCKED OVERLAY */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-black/60 backdrop-blur-xs">
                  <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                    <Lock className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-extrabold text-white">
                      {liveState?.title || 'Goddess Layla is Live'}
                    </h4>
                    <p className="text-xs text-gray-300 max-w-xs mx-auto font-medium">
                      {liveState?.description || 'Exclusive broadcast — VIP Sanctuary, genuine devotion.'}
                    </p>
                  </div>

                  {/* TipFunder & Throne Links */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full max-w-xs">
                    <a
                      href={SOCIAL_LINKS.tipfunder}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 px-4 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-xs shadow-lg flex items-center justify-center gap-1"
                    >
                      <span>TipFunder {liveState?.price || '20 €'}</span>
                      <ExternalLink className="w-3 h-3 text-black" />
                    </a>
                    <a
                      href={SOCIAL_LINKS.throne}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-black hover:bg-gray-200 font-bold text-xs shadow-lg flex items-center justify-center gap-1"
                    >
                      <Gift className="w-3 h-3 text-black" />
                      <span>Throne</span>
                      <ExternalLink className="w-3 h-3 text-black" />
                    </a>
                  </div>

                  <button
                    onClick={() => setHasAccess(true)}
                    className="px-6 py-2.5 rounded-full bg-white hover:bg-gray-200 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Access Live Stream (Payment Completed)
                  </button>

                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1 font-semibold text-black">
                <ShieldCheck className="w-4 h-4 text-black" /> Encrypted VIP Stream
              </span>
              <span className="font-semibold text-gray-600">1080p60 • Ultra Low Latency</span>
            </div>
          </div>

          {/* Live Chat Panel */}
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-between space-y-4 border border-gray-200/80 max-h-[360px] lg:max-h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <MessageSquare className="w-4 h-4 text-black" />
                <span className="text-xs font-bold text-black uppercase tracking-wider">Live Chat</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <span className="font-bold text-black">Marcus_VIP:</span>
                  <p className="text-gray-700 mt-0.5">Tribute sent via TipFunder. Thank you Goddess.</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <span className="font-bold text-black">Devotee_089:</span>
                  <p className="text-gray-700 mt-0.5">Sending gift on Throne!</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-gray-200/80">
                  <span className="font-bold text-black">Alex_London:</span>
                  <p className="text-gray-700 mt-0.5">Watching live from London. High definition stream!</p>
                </div>
              </div>
            </div>

            {hasAccess ? (
              <div className="flex items-center gap-2 text-xs text-black font-bold pt-2 border-t border-gray-200">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Full Live Stream Access Activated</span>
              </div>
            ) : (
              <button
                onClick={() => setHasAccess(true)}
                className="w-full py-3 rounded-full bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase transition-all cursor-pointer shadow-sm"
              >
                Unlock Live ({liveState?.price || '20.00 €'})
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
