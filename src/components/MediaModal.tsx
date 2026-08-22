import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ExternalLink, HardDrive, Play, Gift, Lock, ShieldCheck } from 'lucide-react';
import { CollectionItem } from '../data/collectionData';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { cleanDisplayTitle, cleanDisplayDescription, isUrlOrDriveLink } from '../utils/sanitizeMedia';

interface MediaModalProps {
  item: CollectionItem | null;
  isOpen: boolean;
  onClose: () => void;
  lang?: 'fr' | 'en';
}

export const MediaModal: React.FC<MediaModalProps> = ({ item, isOpen, onClose }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [signedDownloadUrl, setSignedDownloadUrl] = useState<string | null>(null);
  const [googleDriveDeliveryUrl, setGoogleDriveDeliveryUrl] = useState<string | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();

  const throneUrl = siteSettings.throne_link || paymentSettings.throne || 'https://throne.com';
  const tipfunderUrl = siteSettings.tipfunder_link || paymentSettings.tipfunder;
  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Queen Milana';

  const handleVerifyOrSubmitRef = async () => {
    if (!paymentRefInput.trim() || !item) return;
    setIsVerifying(true);
    setVerifyMessage(null);

    const ref = paymentRefInput.trim();

    // 1. Try checking if it's an approved VIP token / passcode
    try {
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          paymentMethod: 'Throne/TipFunder/VIP',
          transactionRef: ref
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.verified) {
        setUnlocked(true);
        setVerifySuccess(true);
        setVerifyMessage('Payment verified. Full Google Drive archive access granted.');
        if (verifyData.accessToken) {
          localStorage.setItem(`unlocked_media_${item.id}`, verifyData.accessToken);
        }
        if (verifyData.downloadUrl || verifyData.streamUrl) {
          setSignedDownloadUrl(verifyData.downloadUrl || verifyData.streamUrl);
        }
        if (verifyData.googleDriveUrl) {
          setGoogleDriveDeliveryUrl(verifyData.googleDriveUrl);
        }
        setIsVerifying(false);
        return;
      }
    } catch (e) {}

    // 2. Otherwise submit as payment reference request for Queen Milana to authorize in her terminal
    try {
      const subRes = await fetch('/api/payment-requests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fanIdentifier: `Buyer (${ref.substring(0, 8)})`,
          paymentMethod: 'Throne Direct',
          transactionRef: ref,
          videoId: item.id,
          videoTitle: cleanDisplayTitle(item.titleEn || item.title),
          amount: `${item.price.toFixed(2)} €`
        })
      });
      const subData = await subRes.json();
      if (subRes.ok && subData.success) {
        setVerifySuccess(true);
        setVerifyMessage('Transaction reference submitted to Queen Milana for authorization.');
      } else {
        setVerifySuccess(false);
        setVerifyMessage(subData.error || 'Submission failed. Please check your reference.');
      }
    } catch (err: any) {
      setVerifySuccess(false);
      setVerifyMessage('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen && item) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setIsMuted(true);
      setSignedDownloadUrl(null);
      setGoogleDriveDeliveryUrl(null);
      
      const savedToken = localStorage.getItem(`unlocked_media_${item.id}`);
      if (savedToken) {
        fetch(`/api/check-access/${item.id}`, {
          headers: { Authorization: `Bearer ${savedToken}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.hasAccess) {
              setUnlocked(true);
              if (data.downloadUrl || data.streamUrl) {
                setSignedDownloadUrl(data.downloadUrl || data.streamUrl);
              }
              if (data.googleDriveUrl) {
                setGoogleDriveDeliveryUrl(data.googleDriveUrl);
              }
            }
          })
          .catch(() => {});
      } else {
        setUnlocked(false);
      }

      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, item]);

  if (!isOpen || !item) return null;

  // Clean, high-status sanitized title and description
  const title = cleanDisplayTitle(item.titleEn || item.title, 'Exclusive Masterclass Archive');
  const description = cleanDisplayDescription(
    item.descriptionEn || item.description,
    'Exclusive encrypted masterclass video archive for authorized devotees.'
  );

  const isDrivePreview = isUrlOrDriveLink(item.previewUrl);
  const canPlayDirectVideo = Boolean(
    signedDownloadUrl || 
    (item.previewUrl && !isDrivePreview && (item.previewUrl.endsWith('.mp4') || item.previewUrl.endsWith('.webm') || item.previewUrl.includes('catbox')))
  );

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in font-sans"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 my-auto flex flex-col"
      >
        
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 bg-gray-50/90 border-b border-gray-200/80 flex items-center justify-between">
          <span className="text-xs font-bold text-black tracking-wider uppercase font-sans flex items-center gap-2">
            <span>{creatorName} — {unlocked ? 'Full Archive Authorized' : 'Preview Mode'}</span>
            {unlocked && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-black border border-gray-300 text-[10px] font-bold">AUTHORIZED</span>}
          </span>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-black transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player / Preview Area */}
        <div className="relative aspect-video w-full bg-black overflow-hidden group">
          {canPlayDirectVideo ? (
            <>
              <video
                ref={videoRef}
                key={`${item.id}-${signedDownloadUrl ? 'full' : 'preview'}`}
                poster={item.thumbnailUrl}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
              >
                <source src={signedDownloadUrl || item.previewUrl} type="video/mp4" referrerPolicy="no-referrer" />
              </video>

              {/* Sound Toggle Floating Overlay Button */}
              {isMuted && (
                <button
                  onClick={toggleMute}
                  className="absolute top-4 right-4 z-20 px-4 py-2 rounded-full bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/20 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Enable Sound</span>
                </button>
              )}
            </>
          ) : (
            <div className="relative w-full h-full bg-neutral-950 flex items-center justify-center overflow-hidden">
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover brightness-75 filter blur-[1px]"
                />
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                  {unlocked ? (
                    <ShieldCheck className="w-7 h-7 text-white" />
                  ) : (
                    <Lock className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="space-y-1 max-w-md">
                  <span className="text-[11px] font-mono tracking-widest text-white/70 uppercase">
                    {unlocked ? 'ARCHIVE UNLOCKED' : 'ENCRYPTED MASTERCLASS ASSET'}
                  </span>
                  <h4 className="text-lg font-bold text-white tracking-tight">{title}</h4>
                  <p className="text-xs text-neutral-300 font-normal">
                    {unlocked 
                      ? 'Payment verified. Click below to open and stream your complete Google Drive archive.' 
                      : 'Full high-definition Google Drive delivery is unlocked upon payment confirmation.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="p-6 sm:p-8 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-gray-100">
          
          <div className="space-y-3 max-w-lg">
            <h3 className="text-lg sm:text-xl font-bold text-black leading-snug">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(item.tags || ['exclusive', '4k', 'queenmilana']).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-gray-100 text-black text-xs font-semibold border border-gray-200/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full md:w-80 shrink-0 bg-gray-50/90 border border-gray-200/80 rounded-2xl p-5 flex flex-col items-center sm:items-end justify-center gap-3 text-center sm:text-right">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                FULL ARCHIVE
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-black">
                {item.price.toFixed(2)} €
              </span>
            </div>

            {!unlocked ? (
              <div className="flex flex-col gap-2.5 w-full">
                {/* Throne Direct Link */}
                <a
                  href={throneUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full px-4 py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Gift className="w-3.5 h-3.5 text-white" />
                  <span>Pay via Throne ({item.price.toFixed(2)} €)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </a>

                {/* Submit Payment Ref / Passcode Unlock */}
                <div className="pt-2 border-t border-gray-200">
                  <input
                    type="text"
                    placeholder="Enter Throne Ref or Passcode"
                    value={paymentRefInput}
                    onChange={(e) => setPaymentRefInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs font-mono text-black focus:outline-none focus:border-black mb-1.5"
                  />
                  <button
                    onClick={handleVerifyOrSubmitRef}
                    disabled={isVerifying || !paymentRefInput.trim()}
                    className="w-full py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? 'Verifying...' : 'Request Access'}
                  </button>
                  {verifyMessage && (
                    <p className={`text-[11px] mt-1.5 text-center font-medium ${verifySuccess ? 'text-black font-semibold' : 'text-gray-600'}`}>
                      {verifyMessage}
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-gray-500 text-center">
                  Access is released by {creatorName} upon verification.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5 w-full">
                <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-black text-xs font-bold border border-gray-300 w-full">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Access Authorized</span>
                </div>

                {googleDriveDeliveryUrl && (
                  <a
                    href={googleDriveDeliveryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-4 py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <HardDrive className="w-4 h-4 text-white" />
                    <span>Open in Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </a>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default MediaModal;
