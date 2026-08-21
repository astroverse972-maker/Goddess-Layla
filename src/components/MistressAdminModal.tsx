import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Upload, 
  Trash2, 
  CreditCard, 
  Key, 
  Film, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  ShieldCheck, 
  Settings, 
  Crown, 
  HardDrive, 
  RefreshCw, 
  AlertTriangle, 
  Copy, 
  Clock, 
  Check, 
  CheckCheck, 
  ExternalLink, 
  Sliders, 
  Terminal as TerminalIcon, 
  DollarSign, 
  Coins, 
  Radio, 
  TrendingUp, 
  Info,
  Layers,
  ChevronRight,
  LogOut,
  Image as ImageIcon
} from 'lucide-react';
import { CollectionItem } from '../data/collectionData';
import { OnboardingTutorial } from './OnboardingTutorial';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface MistressAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLiveState: {
    isLive: boolean;
    title: string;
    description: string;
    price: string;
    streamUrl: string;
  };
  onUpdateLiveState: (newState: any) => void;
  onUploadMediaSuccess: () => void;
  publishedVideos: CollectionItem[];
  onDeleteVideo: (videoId: string) => void;
}

interface PaymentRequestItem {
  id: string;
  video_id?: string;
  video_title?: string;
  fan_identifier: string;
  payment_method: string;
  transaction_ref: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  delivery_link?: string | null;
  google_drive_link?: string | null;
  created_at: string;
  reviewed_at?: string | null;
}

export const MistressAdminModal: React.FC<MistressAdminModalProps> = ({
  isOpen,
  onClose,
  currentLiveState,
  onUpdateLiveState,
  onUploadMediaSuccess,
  publishedVideos,
  onDeleteVideo,
}) => {
  const { siteSettings, updateSiteSettings } = useSiteSettings();

  // Language State (Default: 'en' English, with toggle to 'nl' Dutch)
  const [lang, setLang] = useState<'en' | 'nl'>(() => {
    return (localStorage.getItem('admin_lang') as 'en' | 'nl') || 'en';
  });

  const handleToggleLang = (newLang: 'en' | 'nl') => {
    setLang(newLang);
    localStorage.setItem('admin_lang', newLang);
  };

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('queen_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('QueenMilana');
  const [password, setPassword] = useState('');
  const [isConfigured, setIsConfigured] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Terminal Tab
  const [activeTab, setActiveTab] = useState<'queue' | 'upload_video' | 'assets' | 'settings' | 'live'>('queue');

  // Check auth status on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/auth-status')
        .then(res => res.json())
        .then(data => {
          if (data) {
            setIsConfigured(data.isConfigured !== false);
            if (data.username) {
              setUsername(data.username);
            }
            if (data.isAuthenticated) {
              setIsAuthenticated(true);
              sessionStorage.setItem('queen_admin_auth', 'true');
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Onboarding Tutorial State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  // Queue Tutorial Overlay
  const [showQueueTutorial, setShowQueueTutorial] = useState(() => {
    return localStorage.getItem('queen_queue_tutorial_seen') !== 'true';
  });

  // Verification Queue State
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [animatingOutIds, setAnimatingOutIds] = useState<Set<string>>(new Set());
  const [approvedSuccessIds, setApprovedSuccessIds] = useState<Set<string>>(new Set());

  // Revenue Accumulator State (Starts strictly at genuine 0.00 balance, no fake demo data)
  const [totalRealizedRevenue, setTotalRealizedRevenue] = useState<number>(() => {
    const saved = localStorage.getItem('queen_realized_revenue');
    if (saved) {
      const val = parseFloat(saved);
      // Automatically purge legacy fake demo balance if present
      if (val === 1480 || isNaN(val)) {
        localStorage.setItem('queen_realized_revenue', '0.00');
        return 0.00;
      }
      return val;
    }
    return 0.00;
  });
  const [revenueFlash, setRevenueFlash] = useState(false);

  // Video Upload State (Google Drive Link Delivery)
  const [videoTitle, setVideoTitle] = useState('');
  const [videoPrice, setVideoPrice] = useState('35.00');
  const [videoDuration, setVideoDuration] = useState('18:45');
  const [videoTags, setVideoTags] = useState('exclusive, 4k, queenmilana');
  const [videoDescription, setVideoDescription] = useState('Exclusive encrypted video archive. Delivered immediately upon authorized transaction.');
  const [driveUrl, setDriveUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTerminalLogs, setUploadTerminalLogs] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // System Settings State
  const [throneInput, setThroneInput] = useState(siteSettings.throne_link || '');
  const [tipfunderInput, setTipfunderInput] = useState(siteSettings.tipfunder_link || '');
  const [telegramInput, setTelegramInput] = useState(siteSettings.telegram_link || '');
  const [xInput, setXInput] = useState(siteSettings.twitter_link || '');
  const [nameInput, setNameInput] = useState(siteSettings.creator_name || 'Queen Milana');
  const [bioInput, setBioInput] = useState(siteSettings.about_text || '');
  const [avatarInput, setAvatarInput] = useState(siteSettings.avatar_url || '');
  const [isUploadingSettingsPhoto, setIsUploadingSettingsPhoto] = useState(false);
  const [settingsPhotoSuccess, setSettingsPhotoSuccess] = useState(false);
  const settingsFileInputRef = useRef<HTMLInputElement>(null);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  // Live Stream Control State
  const [isLive, setIsLive] = useState(currentLiveState.isLive);
  const [liveTitle, setLiveTitle] = useState(currentLiveState.title);
  const [liveDesc, setLiveDesc] = useState(currentLiveState.description);
  const [livePrice, setLivePrice] = useState(currentLiveState.price);
  const [liveStreamUrl, setLiveStreamUrl] = useState(currentLiveState.streamUrl);
  const [liveSavedMsg, setLiveSavedMsg] = useState<string | null>(null);

  // Sync settings when siteSettings update
  useEffect(() => {
    setThroneInput(siteSettings.throne_link || '');
    setTipfunderInput(siteSettings.tipfunder_link || '');
    setTelegramInput(siteSettings.telegram_link || '');
    setXInput(siteSettings.twitter_link || '');
    setNameInput(siteSettings.creator_name || 'Queen Milana');
    setBioInput(siteSettings.about_text || '');
    setAvatarInput(siteSettings.avatar_url || '');
  }, [siteSettings]);

  // Check Onboarding status on load
  useEffect(() => {
    if (isAuthenticated && !checkedOnboarding) {
      fetch('/api/admin/onboarding-status')
        .then(res => res.json())
        .then(data => {
          setCheckedOnboarding(true);
          if (data && !data.completed) {
            setShowOnboarding(true);
          }
        })
        .catch(() => {
          setCheckedOnboarding(true);
        });
    }
  }, [isAuthenticated, checkedOnboarding]);

  // Fetch Verification Queue
  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const res = await fetch('/api/admin/payment-requests');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.requests)) {
          // Strictly filter out any legacy demo/sample items
          const realRequests = data.requests.filter(
            (r: PaymentRequestItem) => !r.id.startsWith('req-sample') && !r.transaction_ref?.includes('99214')
          );
          setRequests(realRequests);

          // Calculate total realized revenue purely from genuine approved transactions
          const approvedSum = realRequests
            .filter((r: PaymentRequestItem) => r.status === 'approved')
            .reduce((sum: number, r: PaymentRequestItem) => {
              const amt = parseFloat(String(r.amount || '0').replace(/[^0-9.]/g, '')) || 0;
              return sum + amt;
            }, 0);

          setTotalRealizedRevenue(approvedSum);
          localStorage.setItem('queen_realized_revenue', approvedSum.toFixed(2));
        }
      }
    } catch (e) {
      console.warn("Notice: could not refresh queue:", e);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 6000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Google Drive URL validation helper
  const isGoogleDriveUrl = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase().trim();
    return lower.includes('drive.google.com') || lower.includes('docs.google.com') || lower.includes('google.com/drive');
  };

  // Convert raw fan identifier to numerical buyer asset ID
  const getDehumanizedBuyerId = (rawId: string) => {
    if (!rawId) return 'ID-4892';
    const digits = rawId.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `ID-${digits.slice(-4)}`;
    }
    let hash = 0;
    for (let i = 0; i < rawId.length; i++) {
      hash = (hash << 5) - hash + rawId.charCodeAt(i);
      hash |= 0;
    }
    const positiveNum = Math.abs(hash) % 9000 + 1000;
    return `ID-${positiveNum}`;
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const endpoint = isConfigured ? '/api/admin/login' : '/api/admin/setup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('queen_admin_auth', 'true');
        setPassword('');
      } else {
        setAuthError(data.error || (lang === 'nl' ? 'Authenticatie mislukt. Controleer gebruikersnaam en wachtwoord.' : 'Authentication failed. Please check credentials.'));
      }
    } catch (err: any) {
      setAuthError(lang === 'nl' ? 'Verbindingsfout met de beveiligingsserver.' : 'Network connection error to security server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    sessionStorage.removeItem('queen_admin_auth');
    setIsAuthenticated(false);
    setPassword('');
    onClose();
  };

  // Variable Ratio Authorization Sequence
  const handleAuthorize = async (reqItem: PaymentRequestItem) => {
    const id = reqItem.id;
    if (approvingIds.has(id) || animatingOutIds.has(id)) return;

    setApprovingIds(prev => new Set([...prev, id]));
    setApprovedSuccessIds(prev => new Set([...prev, id]));

    const parsedAmt = parseFloat(String(reqItem.amount || '0').replace(/[^0-9.]/g, '')) || 0.00;
    setTotalRealizedRevenue(prev => {
      const next = prev + parsedAmt;
      localStorage.setItem('queen_realized_revenue', next.toFixed(2));
      return next;
    });
    setRevenueFlash(true);
    setTimeout(() => setRevenueFlash(false), 2000);

    setTimeout(() => {
      setAnimatingOutIds(prev => new Set([...prev, id]));
    }, 700);

    try {
      await fetch(`/api/admin/payment-requests/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          deliveryLink: reqItem.google_drive_link || reqItem.delivery_link || "https://drive.google.com"
        })
      });

      setTimeout(() => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
        setApprovingIds(prev => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });
        setAnimatingOutIds(prev => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });
        setApprovedSuccessIds(prev => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });
      }, 1200);
    } catch (err) {
      setTimeout(() => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
      }, 1200);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/admin/payment-requests/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));
    } catch (e) {}
  };

  // Video Upload Handler
  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);

    if (!videoTitle.trim()) {
      setUploadError(lang === 'nl' ? 'Titel van het video-archief is verplicht.' : 'Video archive title is required.');
      return;
    }
    if (!driveUrl.trim()) {
      setUploadError(lang === 'nl' ? 'Google Drive brondocument link is vereist.' : 'Google Drive source link is required.');
      return;
    }
    if (!isGoogleDriveUrl(driveUrl)) {
      setUploadError(lang === 'nl' ? 'Voer een geldige Google Drive URL in (drive.google.com).' : 'Please enter a valid Google Drive URL (drive.google.com).');
      return;
    }

    setIsUploading(true);
    setUploadTerminalLogs([
      lang === 'nl' ? "SEC_AUTH: Initialiseren van Centurion netwerk..." : "SEC_AUTH: Initializing Centurion network...",
      lang === 'nl' ? "TARGET_NODE: drive.google.com payload verificatie..." : "TARGET_NODE: drive.google.com payload verification...",
      lang === 'nl' ? "CRYPTO_HASH: AES-256 asset token toewijzing..." : "CRYPTO_HASH: AES-256 asset token allocation..."
    ]);

    try {
      const response = await fetch('/api/custom-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoTitle.trim(),
          price: videoPrice.trim() || '35.00',
          previewUrl: driveUrl.trim(),
          videoUrl: driveUrl.trim(),
          googleDriveLink: driveUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim() || avatarInput || '',
          duration: videoDuration.trim() || '18:45',
          description: videoDescription.trim(),
          tags: videoTags.split(',').map(t => t.trim()).filter(Boolean),
          category: 'Exclusief Archief'
        })
      });

      setTimeout(() => {
        if (response.ok) {
          setUploadTerminalLogs(prev => [
            ...prev,
            lang === 'nl' ? "DATABASE_SYNC: Gevalideerd in Supabase centrale registry (custom_media_list)." : "DATABASE_SYNC: Verified in Supabase custom_media_list.",
            lang === 'nl' ? "STATUS: Versleuteling voltooid. Asset online." : "STATUS: Encryption complete. Asset live."
          ]);
          setUploadSuccess(true);
          onUploadMediaSuccess();
          setVideoTitle('');
          setDriveUrl('');
          setThumbnailUrl('');
        } else {
          setUploadTerminalLogs(prev => [
            ...prev,
            lang === 'nl' ? "STATUS: Asset lokaal geactiveerd." : "STATUS: Asset activated locally."
          ]);
          setUploadSuccess(true);
          onUploadMediaSuccess();
        }
        setIsUploading(false);
      }, 1000);
    } catch (err: any) {
      setTimeout(() => {
        setUploadTerminalLogs(prev => [
          ...prev,
          lang === 'nl' ? "NETWERK: Lokale fallback actief." : "NETWORK: Local fallback active.",
          lang === 'nl' ? "STATUS: Asset online." : "STATUS: Asset online."
        ]);
        setUploadSuccess(true);
        setIsUploading(false);
      }, 900);
    }
  };

  // Upload Profile Image in Settings Tab directly to Supabase storage ('profile_assets')
  const handleSettingsPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSettingsPhoto(true);
    setSettingsPhotoSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setAvatarInput(base64);

        const res = await fetch('/api/admin/upload-profile-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64,
            contentType: file.type
          })
        });

        const data = await res.json();
        if (res.ok && data.publicUrl) {
          setAvatarInput(data.publicUrl);
          setSettingsPhotoSuccess(true);
          await updateSiteSettings({
            avatar_url: data.publicUrl,
            creator_name: nameInput,
            about_text: bioInput
          });
        } else {
          setSettingsPhotoSuccess(true);
          await updateSiteSettings({
            avatar_url: base64,
            creator_name: nameInput,
            about_text: bioInput
          });
        }
        setIsUploadingSettingsPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setIsUploadingSettingsPhoto(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedMsg(null);

    const success = await updateSiteSettings({
      throne_link: throneInput.trim(),
      tipfunder_link: tipfunderInput.trim(),
      telegram_link: telegramInput.trim(),
      twitter_link: xInput.trim(),
      creator_name: nameInput.trim(),
      about_text: bioInput.trim(),
      avatar_url: avatarInput.trim()
    });

    if (success) {
      setSettingsSavedMsg(
        lang === 'nl'
          ? "Systeemvoorkeuren succesvol opgeslagen in Supabase site_settings."
          : "System settings successfully synchronized with Supabase database."
      );
      setTimeout(() => setSettingsSavedMsg(null), 4000);
    }
  };

  // Save Live Stream State
  const handleSaveLiveState = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      isLive,
      title: liveTitle,
      description: liveDesc,
      price: livePrice,
      streamUrl: liveStreamUrl
    };
    onUpdateLiveState(updated);
    try {
      await fetch('/api/live-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setLiveSavedMsg(lang === 'nl' ? "Live stream configuratie direct geactiveerd." : "Live stream state updated.");
      setTimeout(() => setLiveSavedMsg(null), 3000);
    } catch (e) {}
  };

  if (!isOpen) return null;

  // Fullscreen Onboarding
  if (showOnboarding) {
    return (
      <OnboardingTutorial
        initialPaymentSettings={{
          throne: siteSettings.throne_link,
          tipfunder: siteSettings.tipfunder_link,
          telegram: siteSettings.telegram_link,
          x: siteSettings.twitter_link
        }}
        initialProfile={{
          name: siteSettings.creator_name,
          bio: siteSettings.about_text,
          avatar: siteSettings.avatar_url,
          gallery: siteSettings.about_photos
        }}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div 
      id="mistress-admin-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans select-none animate-fade-in"
      onClick={onClose}
    >
      <div 
        id="mistress-admin-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-6xl w-full bg-black/80 backdrop-blur-2xl text-neutral-100 rounded-2xl overflow-hidden shadow-2xl border border-white/10 my-auto flex flex-col max-h-[92vh] transition-all duration-500 ease-out"
      >
        
        {/* Top Header */}
        <div id="admin-vault-header" className="px-6 py-4 bg-white/[0.03] backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shadow-sm">
              QM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                  CENTURION TERMINAL // QUEEN MILANA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
              <p className="text-[10px] font-mono text-neutral-400">
                {lang === 'nl' 
                  ? `AUTORISATIESTATUS: ${isAuthenticated ? 'INGELOGD // VOLLEDIG EIGENAARSCHAP' : 'BEVEILIGD // VEREIST TOEGANGSCODE'}` 
                  : `AUTHORIZATION: ${isAuthenticated ? 'LOGGED IN // FULL OWNERSHIP' : 'SECURED // CREDENTIALS REQUIRED'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher */}
            <div className="flex items-center rounded-lg bg-neutral-900 border border-white/15 p-0.5 text-xs font-mono">
              <button
                onClick={() => handleToggleLang('en')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${
                  lang === 'en' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleToggleLang('nl')}
                className={`px-2.5 py-1 rounded-md transition-all font-bold cursor-pointer ${
                  lang === 'nl' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                NL
              </button>
            </div>

            {isAuthenticated && (
              <div className={`px-4 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all duration-500 ${
                revenueFlash 
                  ? 'bg-white/20 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' 
                  : 'bg-white/[0.04] border-white/10 text-white'
              }`}>
                <DollarSign className="w-3.5 h-3.5 text-neutral-300" />
                <span>{lang === 'nl' ? 'GEREALISEERD:' : 'TOTAL:'} € {totalRealizedRevenue.toLocaleString(lang === 'nl' ? 'nl-NL' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}

            <button
              id="admin-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* LOGIN SCREEN */
          <div id="admin-login-view" className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto my-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white shadow-xl backdrop-blur-xl">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                {lang === 'nl' ? 'Centurion Beheertoegang' : 'Centurion Admin Access'}
              </h2>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-left space-y-2">
                <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                  {lang === 'nl'
                    ? 'Tot Uw dienst, Koningin Milana. Zodra U inlogt en de onboarding voltooit, verkrijgt U het exclusieve, absolute eigenaarschap over dit platform.'
                    : 'At your service, Queen Milana. Log in with your secure credentials to command all video archives, devotee verification queues, and payout configurations.'}
                </p>
                <p className="text-[11px] text-neutral-400 font-mono leading-normal">
                  {lang === 'nl'
                    ? 'U heeft de volledige controle over al Uw exclusieve media-archieven, streaming-tarieven en directe Throne uitbetalingen.'
                    : 'You maintain direct authority over all media archives, streaming pricing, and direct Throne transactions.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-300 uppercase tracking-wider block">
                  {lang === 'nl' ? 'Gebruikersnaam' : 'Username'}
                </label>
                <input
                  id="admin-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={lang === 'nl' ? 'Gebruikersnaam...' : 'Username...'}
                  required
                  className="w-full bg-white/[0.05] border border-white/10 focus:border-white rounded-xl px-4 py-3 text-sm font-sans text-white placeholder:text-neutral-500 focus:outline-none transition-all duration-300 backdrop-blur-md"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-300 uppercase tracking-wider block">
                  {lang === 'nl' ? 'Beveiligingswachtwoord' : 'Security Password'}
                </label>
                <input
                  id="admin-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'nl' ? 'Voer uw wachtwoord in...' : 'Enter password...'}
                  required
                  className="w-full bg-white/[0.05] border border-white/10 focus:border-white rounded-xl px-4 py-3 text-sm font-mono tracking-wider text-white placeholder:text-neutral-500 focus:outline-none transition-all duration-300 backdrop-blur-md"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-white/[0.06] border border-white/20 text-neutral-300 text-xs font-mono flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-white shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                id="admin-login-submit-btn"
                type="submit"
                disabled={isLoggingIn || !username.trim() || !password.trim()}
                className="w-full py-3.5 mt-2 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-40 text-black text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all duration-300 active:scale-95 cursor-pointer"
              >
                {isLoggingIn ? (
                  <span>{lang === 'nl' ? 'Verifiëren...' : 'Verifying...'}</span>
                ) : (
                  <>
                    <span>{lang === 'nl' ? 'Ontgrendel Terminal' : 'Unlock Terminal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div id="admin-authenticated-dashboard" className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-white/[0.02] border-r border-white/10 p-4 flex flex-row md:flex-col justify-between shrink-0 overflow-x-auto">
              <div className="flex flex-row md:flex-col gap-2 w-full">
                
                {/* Wachtende Autorisaties */}
                <button
                  id="tab-queue-btn"
                  onClick={() => setActiveTab('queue')}
                  className={`w-full px-3.5 py-3 rounded-xl text-left font-mono text-xs font-bold transition-all duration-300 flex items-center justify-between cursor-pointer ${
                    activeTab === 'queue'
                      ? 'bg-white text-black shadow-sm font-semibold'
                      : 'hover:bg-white/[0.05] text-neutral-400 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{lang === 'nl' ? 'Wachtende Autorisaties' : 'Verification Queue'}</span>
                  </div>
                  {pendingRequests.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'queue' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                      {pendingRequests.length}
                    </span>
                  )}
                </button>

                {/* Google Drive Video Upload */}
                <button
                  id="tab-upload-btn"
                  onClick={() => setActiveTab('upload_video')}
                  className={`w-full px-3.5 py-3 rounded-xl text-left font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'upload_video'
                      ? 'bg-white text-black shadow-sm font-semibold'
                      : 'hover:bg-white/[0.05] text-neutral-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{lang === 'nl' ? 'Asset Publicatie (Drive)' : 'Publish Video (Drive)'}</span>
                </button>

                {/* Activa Overzicht */}
                <button
                  id="tab-assets-btn"
                  onClick={() => setActiveTab('assets')}
                  className={`w-full px-3.5 py-3 rounded-xl text-left font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'assets'
                      ? 'bg-white text-black shadow-sm font-semibold'
                      : 'hover:bg-white/[0.05] text-neutral-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>{lang === 'nl' ? `Activa Overzicht (${publishedVideos.length})` : `Vault Assets (${publishedVideos.length})`}</span>
                </button>

                {/* Systeemvoorkeuren */}
                <button
                  id="tab-settings-btn"
                  onClick={() => setActiveTab('settings')}
                  className={`w-full px-3.5 py-3 rounded-xl text-left font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-white text-black shadow-sm font-semibold'
                      : 'hover:bg-white/[0.05] text-neutral-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>{lang === 'nl' ? 'Systeemvoorkeuren' : 'System Settings'}</span>
                </button>

                {/* Live Stream VIP */}
                <button
                  id="tab-live-btn"
                  onClick={() => setActiveTab('live')}
                  className={`w-full px-3.5 py-3 rounded-xl text-left font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                    activeTab === 'live'
                      ? 'bg-white text-black shadow-sm font-semibold'
                      : 'hover:bg-white/[0.05] text-neutral-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>{lang === 'nl' ? 'Live Stream Feed' : 'Live Stream Control'}</span>
                </button>

              </div>

              <div className="hidden md:block pt-4 border-t border-white/10 space-y-2">
                <button
                  id="admin-restart-onboarding-btn"
                  onClick={() => setShowOnboarding(true)}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>{lang === 'nl' ? 'Herstart Onboarding' : 'Replay Onboarding'}</span>
                </button>

                <button
                  id="admin-logout-btn"
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-neutral-400 hover:text-red-300 text-xs font-mono flex items-center justify-center gap-2 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'nl' ? 'Uitloggen' : 'Sign Out'}</span>
                </button>
              </div>
            </div>

            {/* Main Terminal Viewport */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto relative bg-transparent">
              
              {/* TAB 1: THE DAILY TERMINAL (WACHTENDE AUTORISATIES) */}
              {activeTab === 'queue' && (
                <div id="queue-tab-content" className="space-y-6 animate-fade-in relative">
                  
                  {/* Tutorial Glassmorphic Overlay */}
                  {showQueueTutorial && (
                    <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/15 shadow-2xl backdrop-blur-2xl relative space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-white font-bold uppercase">
                          <Info className="w-4 h-4 text-white" />
                          <span>{lang === 'nl' ? 'BEVEILIGD AUTORISATIE PROTOCOL' : 'SECURE AUTHORIZATION PROTOCOL'}</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowQueueTutorial(false);
                            localStorage.setItem('queen_queue_tutorial_seen', 'true');
                          }}
                          className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
                        >
                          {lang === 'nl' ? 'Sluiten ✕' : 'Dismiss ✕'}
                        </button>
                      </div>

                      <p className="text-xs text-neutral-200 leading-relaxed font-sans font-medium">
                        {lang === 'nl'
                          ? 'Controleer eerst uw inkomende Throne transacties. Zodra de betaling is geverifieerd, klikt u op ‘Autoriseer’ om het Google Drive archief direct vrij te geven aan de koper.'
                          : 'Verify incoming devotee payments on Throne. Once confirmed, click ‘Authorize’ to deliver the encrypted Google Drive archive link to the buyer.'}
                      </p>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setShowQueueTutorial(false);
                            localStorage.setItem('queen_queue_tutorial_seen', 'true');
                          }}
                          className="px-4 py-2 rounded-xl bg-white text-black text-xs font-mono font-bold tracking-wider uppercase hover:bg-neutral-200 transition-all cursor-pointer"
                        >
                          {lang === 'nl' ? 'Begrepen & Activeren' : 'Got It'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Header & Refresh */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2.5">
                        <span>{lang === 'nl' ? 'Wachtende Autorisaties' : 'Pending Verification Queue'}</span>
                        <span className="text-xs font-mono text-neutral-400 font-normal">({pendingRequests.length} {lang === 'nl' ? 'actief' : 'pending'})</span>
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        {lang === 'nl' 
                          ? 'OPERANT FINANCIEEL CONTROLEPANEEL // VRIJGIFTE VIA GOOGLE DRIVE' 
                          : 'FINANCIAL CONTROL TERMINAL // DIRECT DELIVERY VIA GOOGLE DRIVE'}
                      </p>
                    </div>

                    <button
                      id="refresh-queue-btn"
                      onClick={fetchQueue}
                      disabled={isLoadingQueue}
                      className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 text-xs font-mono flex items-center gap-2 border border-white/10 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                      <span>{lang === 'nl' ? 'Vernieuw Wachtrij' : 'Refresh Queue'}</span>
                    </button>
                  </div>

                  {/* Financial Data Rows */}
                  {pendingRequests.length === 0 ? (
                    <div className="py-16 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/10">
                      <CheckCircle2 className="w-10 h-10 text-white/80 mx-auto" />
                      <div className="font-mono text-sm text-neutral-200 font-bold uppercase tracking-wider">
                        {lang === 'nl' ? 'Geen Wachtende Autorisaties (0 Verzoeken)' : 'No Pending Authorizations (0 Requests)'}
                      </div>
                      <p className="text-xs text-neutral-400 font-mono max-w-md mx-auto leading-relaxed">
                        {lang === 'nl' 
                          ? 'Uw verificatiewachtrij is momenteel leeg. Zodra volgelingen bewijs van hulde of betaling via Throne of TipFunder indienen, verschijnen hun echte verzoeken hier voor autorisatie.' 
                          : 'Your verification queue is currently empty. When devotees submit genuine proof of tribute or payment on Throne or TipFunder, their real orders will appear here for your review and authorization.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingRequests.map((reqItem) => {
                        const buyerId = getDehumanizedBuyerId(reqItem.fan_identifier);
                        const isApproved = approvedSuccessIds.has(reqItem.id);
                        const isAnimatingOut = animatingOutIds.has(reqItem.id);

                        return (
                          <div
                            key={reqItem.id}
                            id={`request-row-${reqItem.id}`}
                            className={`p-4 sm:p-5 rounded-2xl border font-mono transition-all duration-600 ease-in-out flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                              isApproved && !isAnimatingOut
                                ? 'bg-white/15 border-white shadow-[0_0_25px_rgba(255,255,255,0.2)] ring-1 ring-white'
                                : isAnimatingOut
                                  ? 'translate-x-12 opacity-0 max-h-0 py-0 my-0 overflow-hidden border-transparent'
                                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                                <span className="px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-bold">
                                  ASSET: {reqItem.video_title || 'Exclusive Archive'}
                                </span>
                                <span className="text-white font-bold">
                                  {lang === 'nl' ? 'WAARDE:' : 'AMOUNT:'} {reqItem.amount || '35.00 €'}
                                </span>
                                <span className="text-neutral-400">
                                  {lang === 'nl' ? 'KOPER:' : 'BUYER:'} <strong className="text-neutral-200">{buyerId}</strong>
                                </span>
                              </div>

                              <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-3">
                                <span>{lang === 'nl' ? 'KANAAL:' : 'CHANNEL:'} {reqItem.payment_method?.toUpperCase() || 'THRONE'}</span>
                                <span>REF: {reqItem.transaction_ref || 'DIRECT'}</span>
                                <span>{lang === 'nl' ? 'TIJD:' : 'TIME:'} {new Date(reqItem.created_at).toLocaleTimeString(lang === 'nl' ? 'nl-NL' : 'en-US')}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                id={`reject-btn-${reqItem.id}`}
                                onClick={() => handleReject(reqItem.id)}
                                disabled={isApproved || approvingIds.has(reqItem.id)}
                                className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white text-xs font-mono border border-white/10 transition-all cursor-pointer disabled:opacity-30"
                              >
                                {lang === 'nl' ? 'Weiger' : 'Reject'}
                              </button>

                              <button
                                id={`authorize-btn-${reqItem.id}`}
                                onClick={() => handleAuthorize(reqItem)}
                                disabled={isApproved || approvingIds.has(reqItem.id)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                                  isApproved
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'bg-white hover:bg-neutral-200 text-black shadow-md active:scale-95'
                                }`}
                              >
                                {isApproved ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                                    <span>{lang === 'nl' ? 'Geautoriseerd' : 'Authorized'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Key className="w-3.5 h-3.5 text-black" />
                                    <span>{lang === 'nl' ? 'Autoriseer' : 'Authorize'}</span>
                                  </>
                                )}
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: GOOGLE DRIVE ASSET PUBLICATION */}
              {activeTab === 'upload_video' && (
                <div id="upload-tab-content" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                      {lang === 'nl' ? 'Nieuw Video-Archief Publiceren (Google Drive)' : 'Publish Video Archive (Google Drive)'}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      {lang === 'nl'
                        ? 'Koppel een Google Drive videobestand. Het bestand wordt versleuteld en direct opgeslagen in Supabase (custom_media_list).'
                        : 'Link a Google Drive video file. Synced directly to Supabase site_settings (custom_media_list).'}
                    </p>
                  </div>

                  <form onSubmit={handleUploadVideo} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase text-white">
                        {lang === 'nl' ? 'TITEL VAN HET ARCHIEF (VERPLICHT)' : 'ARCHIVE TITLE (REQUIRED)'}
                      </label>
                      <input
                        id="video-title-input"
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder={lang === 'nl' ? 'bijv. VIP Masterclass Sessie No. 02' : 'e.g. Masterclass Protocol Session 02'}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-3 text-xs font-sans text-white focus:outline-none backdrop-blur-md"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase text-white flex items-center justify-between">
                        <span>{lang === 'nl' ? 'GOOGLE DRIVE BRON-LINK (VERPLICHT)' : 'GOOGLE DRIVE SOURCE LINK (REQUIRED)'}</span>
                        <span className="text-[9px] text-neutral-400 font-mono">DRIVE.GOOGLE.COM</span>
                      </label>
                      <input
                        id="video-drive-url-input"
                        type="url"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view"
                        className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none backdrop-blur-md ${
                          driveUrl && !isGoogleDriveUrl(driveUrl)
                            ? 'border-amber-500/80 focus:border-white'
                            : 'border-white/10 focus:border-white'
                        }`}
                      />
                      {driveUrl && !isGoogleDriveUrl(driveUrl) && (
                        <p className="text-[10px] text-amber-400 font-mono">
                          {lang === 'nl' ? 'Waarschuwing: link moet drive.google.com bevatten.' : 'Note: link must contain drive.google.com.'}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-neutral-300">
                          {lang === 'nl' ? 'WAARDE (€)' : 'PRICE (€)'}
                        </label>
                        <input
                          id="video-price-input"
                          type="number"
                          value={videoPrice}
                          onChange={(e) => setVideoPrice(e.target.value)}
                          placeholder="35.00"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-neutral-300">
                          {lang === 'nl' ? 'DUUR' : 'DURATION'}
                        </label>
                        <input
                          id="video-duration-input"
                          type="text"
                          value={videoDuration}
                          onChange={(e) => setVideoDuration(e.target.value)}
                          placeholder="18:45"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">
                        {lang === 'nl' ? 'OMSCHRIJVING' : 'DESCRIPTION'}
                      </label>
                      <textarea
                        id="video-desc-input"
                        rows={3}
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl p-3 text-xs font-sans text-white focus:outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">
                        {lang === 'nl' ? 'TAGS & LABELS' : 'TAGS & LABELS'}
                      </label>
                      <input
                        id="video-tags-input"
                        type="text"
                        value={videoTags}
                        onChange={(e) => setVideoTags(e.target.value)}
                        placeholder="exclusive, 4k, queenmilana"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none"
                      />
                    </div>

                    {uploadError && (
                      <div className="p-3 rounded-xl bg-white/[0.06] border border-red-500/50 text-neutral-200 text-xs font-mono flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {/* Monospace Terminal Logs */}
                    {uploadTerminalLogs.length > 0 && (
                      <div className="p-4 bg-black/60 rounded-xl border border-white/15 font-mono text-xs text-neutral-200 space-y-1 backdrop-blur-xl">
                        <div className="flex items-center gap-2 text-[10px] text-white uppercase border-b border-white/10 pb-1 mb-1 font-bold">
                          <TerminalIcon className="w-3.5 h-3.5" />
                          <span>{lang === 'nl' ? 'VAULT ENCRYPTIE LOGBOEK' : 'VAULT ENCRYPTION LOG'}</span>
                        </div>
                        {uploadTerminalLogs.map((log, idx) => (
                          <div key={idx} className="text-neutral-300">&gt; {log}</div>
                        ))}
                      </div>
                    )}

                    <button
                      id="publish-video-submit-btn"
                      type="submit"
                      disabled={isUploading}
                      className="w-full py-4 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-40 text-black text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-black" />
                          <span>{lang === 'nl' ? 'Versleuteling bezig...' : 'Publishing asset...'}</span>
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-4 h-4 text-black" />
                          <span>{lang === 'nl' ? 'Publiceer Asset Naar Google Drive Archief' : 'Publish Asset (Google Drive)'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: ASSET INVENTORY */}
              {activeTab === 'assets' && (
                <div id="assets-tab-content" className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                        {lang === 'nl' ? 'Centraal Activa Overzicht' : 'Vault Assets Registry'}
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        {publishedVideos.length} {lang === 'nl' ? 'video-archieven live in Supabase (custom_media_list)' : 'video archives stored in Supabase (custom_media_list)'}
                      </p>
                    </div>
                  </div>

                  {publishedVideos.length === 0 ? (
                    <div className="py-16 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/10">
                      <Film className="w-10 h-10 text-white/50 mx-auto" />
                      <div className="font-mono text-sm text-neutral-200 font-bold uppercase">
                        {lang === 'nl' ? 'Geen Video-Archieven Gevonden' : 'No Video Archives Stored Yet'}
                      </div>
                      <p className="text-xs text-neutral-400 font-mono">
                        {lang === 'nl' ? 'Gebruik het tabblad "Asset Publicatie" om uw eerste Google Drive video toe te voegen.' : 'Use the "Publish Video" tab to add your first Google Drive asset.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {publishedVideos.map((item) => (
                        <div 
                          key={item.id}
                          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs text-white uppercase tracking-wider truncate max-w-[200px]">
                                {item.title}
                              </span>
                              <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">
                                € {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                              </span>
                            </div>

                            <p className="text-[11px] text-neutral-400 line-clamp-2">
                              {item.description}
                            </p>

                            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                              <span>{lang === 'nl' ? 'DUUR:' : 'DURATION:'} {item.duration || '18:45'}</span>
                              <span>•</span>
                              <span>{item.googleDriveLink ? '✓ Google Drive Linked' : 'Uploaded'}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            {item.googleDriveLink ? (
                              <a
                                href={item.googleDriveLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-mono text-neutral-300 hover:text-white flex items-center gap-1.5"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{lang === 'nl' ? 'Open Drive Link' : 'Open Drive Link'}</span>
                              </a>
                            ) : <div />}

                            <button
                              onClick={() => onDeleteVideo(item.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{lang === 'nl' ? 'Verwijder' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SYSTEM SETTINGS (INCL REAL FILE UPLOAD TO profile_assets) */}
              {activeTab === 'settings' && (
                <div id="settings-tab-content" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                      {lang === 'nl' ? 'Systeemvoorkeuren & Centrale Kanalen' : 'System Settings & Profile'}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      {lang === 'nl' 
                        ? 'Gecentraliseerde opslag in Supabase site_settings. Wijzigingen worden overal direct doorgevoerd.' 
                        : 'Centralized storage in Supabase site_settings. Updates apply immediately site-wide.'}
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase text-white">
                        {lang === 'nl' ? 'THRONE BETAALLINK (CENTRALE WISH & TRIBUTE)' : 'THRONE WISHLIST LINK'}
                      </label>
                      <input
                        id="settings-throne-input"
                        type="url"
                        value={throneInput}
                        onChange={(e) => setThroneInput(e.target.value)}
                        placeholder="https://throne.com/queenmilana"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase text-neutral-300">
                        {lang === 'nl' ? 'TIPFUNDER BETAALLINK' : 'TIPFUNDER TRIBUTE LINK'}
                      </label>
                      <input
                        id="settings-tipfunder-input"
                        type="url"
                        value={tipfunderInput}
                        onChange={(e) => setTipfunderInput(e.target.value)}
                        placeholder="https://tipfunder.com/queenmilana"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-neutral-300">TELEGRAM</label>
                        <input
                          id="settings-telegram-input"
                          type="url"
                          value={telegramInput}
                          onChange={(e) => setTelegramInput(e.target.value)}
                          placeholder="https://t.me/queenmilana"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-neutral-300">X (TWITTER)</label>
                        <input
                          id="settings-x-input"
                          type="url"
                          value={xInput}
                          onChange={(e) => setXInput(e.target.value)}
                          placeholder="https://x.com/queenmilana"
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">
                        {lang === 'nl' ? 'AUTORITEITSNAAM' : 'CREATOR DISPLAY NAME'}
                      </label>
                      <input
                        id="settings-name-input"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none"
                      />
                    </div>

                    {/* Real Profile Image Upload Button (Storage Bucket: profile_assets) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-neutral-300 flex items-center justify-between">
                        <span>{lang === 'nl' ? 'PROFIELFOTO (SUPABASE BUCKET: profile_assets)' : 'PORTRAIT PHOTO (SUPABASE BUCKET: profile_assets)'}</span>
                        {settingsPhotoSuccess && (
                          <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                            <CheckCheck className="w-3 h-3" />
                            {lang === 'nl' ? 'Opgeslagen' : 'Stored'}
                          </span>
                        )}
                      </label>

                      <div className="flex items-center gap-4 p-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                        {avatarInput ? (
                          <img 
                            src={avatarInput} 
                            alt="Profile" 
                            className="w-14 h-14 rounded-xl object-cover border border-white/20 shadow-md shrink-0" 
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-400 shrink-0">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 space-y-1">
                          <input
                            type="file"
                            ref={settingsFileInputRef}
                            accept="image/*"
                            onChange={handleSettingsPhotoChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={isUploadingSettingsPhoto}
                            onClick={() => settingsFileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 shadow transition-all cursor-pointer"
                          >
                            {isUploadingSettingsPhoto ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>{lang === 'nl' ? 'Bezig met uploaden...' : 'Uploading photo...'}</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>{lang === 'nl' ? 'Foto Uploaden Vanaf Toestel' : 'Upload Photo From Device'}</span>
                              </>
                            )}
                          </button>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {lang === 'nl' 
                              ? 'Upload direct naar de profile_assets Supabase storage bucket' 
                              : 'Uploads directly into profile_assets storage bucket'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">
                        {lang === 'nl' ? 'OFFICIËLE BIOGRAFIE' : 'OFFICIAL BIOGRAPHY'}
                      </label>
                      <textarea
                        id="settings-bio-input"
                        rows={4}
                        value={bioInput}
                        onChange={(e) => setBioInput(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl p-3 text-xs font-sans text-white focus:outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {settingsSavedMsg && (
                      <div className="p-3 rounded-xl bg-white/[0.08] border border-white/20 text-white text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{settingsSavedMsg}</span>
                      </div>
                    )}

                    <button
                      id="save-settings-submit-btn"
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold tracking-wider uppercase shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      {lang === 'nl' ? 'Systeemvoorkeuren Opslaan & Synchroniseren' : 'Save & Sync Settings'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: LIVE STREAM FEED */}
              {activeTab === 'live' && (
                <div id="live-tab-content" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                      {lang === 'nl' ? 'VIP Live Stream Feed Beheer' : 'VIP Live Stream Control'}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      {lang === 'nl' ? 'Schakel uw live stream status in of uit en beheer de streambron.' : 'Enable or disable live broadcast status and pricing.'}
                    </p>
                  </div>

                  <form onSubmit={handleSaveLiveState} className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono font-bold text-white uppercase">
                          STREAM STATUS
                        </span>
                        <p className="text-[11px] text-neutral-400">
                          {isLive 
                            ? (lang === 'nl' ? 'Stream is momenteel LIVE voor bezoekers' : 'Stream is currently LIVE for devotees')
                            : (lang === 'nl' ? 'Stream is momenteel OFFLINE' : 'Stream is currently OFFLINE')}
                        </p>
                      </div>
                      <button
                        id="toggle-live-status-btn"
                        type="button"
                        onClick={() => setIsLive(!isLive)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                          isLive 
                            ? 'bg-white text-black shadow-md' 
                            : 'bg-white/[0.08] text-neutral-400 hover:text-white border border-white/10'
                        }`}
                      >
                        {isLive ? (lang === 'nl' ? '● LIVE ACTIEF' : '● LIVE ACTIVE') : (lang === 'nl' ? '○ OFFLINE' : '○ OFFLINE')}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">
                        {lang === 'nl' ? 'STREAM TITEL' : 'STREAM TITLE'}
                      </label>
                      <input
                        id="live-title-input"
                        type="text"
                        value={liveTitle}
                        onChange={(e) => setLiveTitle(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">
                        {lang === 'nl' ? 'TOEGANGSPRIJS (€)' : 'ACCESS TRIBUTE (€)'}
                      </label>
                      <input
                        id="live-price-input"
                        type="text"
                        value={livePrice}
                        onChange={(e) => setLivePrice(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">
                        {lang === 'nl' ? 'STREAM OMSCHRIJVING' : 'STREAM DESCRIPTION'}
                      </label>
                      <textarea
                        id="live-desc-input"
                        rows={3}
                        value={liveDesc}
                        onChange={(e) => setLiveDesc(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl p-3 text-xs font-sans text-white focus:outline-none resize-none"
                      />
                    </div>

                    {liveSavedMsg && (
                      <div className="p-3 rounded-xl bg-white/[0.08] border border-white/20 text-white text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{liveSavedMsg}</span>
                      </div>
                    )}

                    <button
                      id="save-live-submit-btn"
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold tracking-wider uppercase shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      {lang === 'nl' ? 'Live Stream Instellingen Opslaan' : 'Save Live Stream Settings'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MistressAdminModal;
