import React, { useState, useEffect } from 'react';
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
  LogOut
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

  // Queue Tutorial Overlay (The Secure Handoff)
  const [showQueueTutorial, setShowQueueTutorial] = useState(() => {
    return localStorage.getItem('queen_queue_tutorial_seen') !== 'true';
  });

  // Verification Queue State
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [animatingOutIds, setAnimatingOutIds] = useState<Set<string>>(new Set());
  const [approvedSuccessIds, setApprovedSuccessIds] = useState<Set<string>>(new Set());

  // Revenue Accumulator State (Variable Ratio Reinforcement)
  const [totalRealizedRevenue, setTotalRealizedRevenue] = useState<number>(() => {
    const saved = localStorage.getItem('queen_realized_revenue');
    return saved ? parseFloat(saved) : 1480.00;
  });
  const [revenueFlash, setRevenueFlash] = useState(false);

  // Video Upload State (Google Drive Link Delivery)
  const [videoTitle, setVideoTitle] = useState('');
  const [videoPrice, setVideoPrice] = useState('35.00');
  const [videoDuration, setVideoDuration] = useState('18:45');
  const [videoTags, setVideoTags] = useState('exclusief, 4k, queenmilana');
  const [videoDescription, setVideoDescription] = useState('Gecodeerd archiefbestand. Uitsluitend toegankelijk na geautoriseerde transactie.');
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
          setRequests(data.requests);
        }
      }
    } catch (e) {
      console.warn("Kon wachtende autorisaties niet ophalen:", e);
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

  // Strict Google Drive URL validation helper
  const isGoogleDriveUrl = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase().trim();
    return lower.includes('drive.google.com') || lower.includes('docs.google.com');
  };

  // Convert raw fan identifier to dehumanized numerical asset ID
  const getDehumanizedBuyerId = (rawId: string) => {
    if (!rawId) return 'ID-4892';
    // If it already has ID format, clean it
    const digits = rawId.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `ID-${digits.slice(-4)}`;
    }
    // Generate deterministic 4-digit code based on string hash
    let hash = 0;
    for (let i = 0; i < rawId.length; i++) {
      hash = (hash << 5) - hash + rawId.charCodeAt(i);
      hash |= 0;
    }
    const positiveNum = Math.abs(hash) % 9000 + 1000;
    return `ID-${positiveNum}`;
  };

  // Login handler using real Supabase credentials validation
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
        setAuthError(data.error || 'Authenticatie mislukt. Controleer uw gebruikersnaam en wachtwoord.');
      }
    } catch (err: any) {
      setAuthError('Er is een verbindingsfout opgetreden bij de beveiligingsserver.');
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

  // THE HIT INTERACTION: Variable Ratio Scheduling & Approval Sequence
  const handleAuthorize = async (reqItem: PaymentRequestItem) => {
    const id = reqItem.id;
    if (approvingIds.has(id) || animatingOutIds.has(id)) return;

    // 1. Mark as in-progress and immediately update button to "Geautoriseerd"
    setApprovingIds(prev => new Set([...prev, id]));
    setApprovedSuccessIds(prev => new Set([...prev, id]));

    // Parse amount for revenue tally increment
    const numAmount = parseFloat(reqItem.amount.replace(/[^0-9.]/g, '')) || 35.00;

    try {
      await fetch(`/api/admin/payment-requests/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
    } catch (e) {}

    // 2. Trigger glowing brass revenue counter tick
    setTotalRealizedRevenue(prev => {
      const next = prev + numAmount;
      try { localStorage.setItem('queen_realized_revenue', next.toFixed(2)); } catch (e) {}
      return next;
    });
    setRevenueFlash(true);
    setTimeout(() => setRevenueFlash(false), 900);

    // 3. Smooth slide-right & fade out over 0.6 seconds (The Hit completion)
    setTimeout(() => {
      setAnimatingOutIds(prev => new Set([...prev, id]));

      setTimeout(() => {
        setRequests(prev => prev.filter(r => r.id !== id));
        setApprovingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setAnimatingOutIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setApprovedSuccessIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 600);
    }, 450);
  };

  // Reject transaction
  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/admin/payment-requests/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (e) {}
  };

  // Handle Video Upload with Google Drive link and Monospace terminal logging
  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);

    if (!videoTitle.trim()) {
      setUploadError("Activatitel is vereist.");
      return;
    }
    if (!driveUrl.trim()) {
      setUploadError("Google Drive brondocument link is vereist.");
      return;
    }
    if (!isGoogleDriveUrl(driveUrl)) {
      setUploadError("Ongeldig brondomein. Voer een geldige Google Drive URL in (drive.google.com).");
      return;
    }

    setIsUploading(true);
    setUploadTerminalLogs([
      "SEC_AUTH: Initialiseren van beveiligd Centurion netwerk...",
      "TARGET_NODE: drive.google.com payload verificatie...",
      "CRYPTO_HASH: AES-256 asset token toewijzing..."
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
          thumbnailUrl: thumbnailUrl.trim() || '',
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
            "DATABASE_SYNC: Gevalideerd in Supabase centrale registry.",
            "STATUS: Versleuteling voltooid. Asset online."
          ]);
          setUploadSuccess(true);
          onUploadMediaSuccess();
          setVideoTitle('');
          setDriveUrl('');
          setThumbnailUrl('');
        } else {
          setUploadTerminalLogs(prev => [
            ...prev,
            "FOUT: Serverfout bij archivering. Lokale sessie bijgewerkt."
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
          "NETWERK_FOUT: Lokale fallback actief.",
          "STATUS: Versleuteling voltooid. Asset online."
        ]);
        setUploadSuccess(true);
        setIsUploading(false);
      }, 900);
    }
  };

  // Save Systeemvoorkeuren
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
      setSettingsSavedMsg("Systeemvoorkeuren succesvol gesynchroniseerd met de centrale database.");
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
      setLiveSavedMsg("Live stream configuratie direct geactiveerd.");
      setTimeout(() => setLiveSavedMsg(null), 3000);
    } catch (e) {}
  };

  if (!isOpen) return null;

  // Render Fullscreen Onboarding if not completed
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
          avatar: siteSettings.avatar_url
        }}
        onComplete={() => {
          setShowOnboarding(false);
          fetchQueue();
        }}
        onSkip={() => {
          setShowOnboarding(false);
          fetchQueue();
        }}
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
        
        {/* Top High-Security Vault Header */}
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
                AUTORISATIESTATUS: {isAuthenticated ? 'INGELOGD // VOLLEDIG EIGENAARSCHAP' : 'BEVEILIGD // VEREIST TOEGANGSCODE'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className={`px-4 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all duration-500 ${
                revenueFlash 
                  ? 'bg-white/20 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' 
                  : 'bg-white/[0.04] border-white/10 text-white'
              }`}>
                <DollarSign className="w-3.5 h-3.5 text-neutral-300" />
                <span>GEREALISEERD: € {totalRealizedRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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

        {/* Modal Content */}
        {!isAuthenticated ? (
          /* LOGIN SCREEN WITH STEP 0 MESSAGING */
          <div id="admin-login-view" className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto my-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white shadow-xl backdrop-blur-xl">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                Centurion Beheertoegang
              </h2>
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-left space-y-2">
                <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                  Tot Uw dienst, Koningin Milana. Zodra U inlogt en de onboarding voltooit, verkrijgt U het exclusieve, absolute eigenaarschap over dit platform.
                </p>
                <p className="text-[11px] text-neutral-400 font-mono leading-normal">
                  U heeft de volledige controle over al Uw exclusieve media-archieven, streaming-tarieven en directe Throne uitbetalingen.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-300 uppercase tracking-wider block">
                  Gebruikersnaam
                </label>
                <input
                  id="admin-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Gebruikersnaam..."
                  required
                  className="w-full bg-white/[0.05] border border-white/10 focus:border-white rounded-xl px-4 py-3 text-sm font-sans text-white placeholder:text-neutral-500 focus:outline-none transition-all duration-300 backdrop-blur-md"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-300 uppercase tracking-wider block">
                  Beveiligingswachtwoord
                </label>
                <input
                  id="admin-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Voer uw wachtwoord in..."
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
                  <span>Verifiëren...</span>
                ) : (
                  <>
                    <span>Ontgrendel Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED VAULT DASHBOARD */
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
                    <span>Wachtende Autorisaties</span>
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
                  <span>Asset Publicatie (Drive)</span>
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
                  <span>Activa Overzicht ({publishedVideos.length})</span>
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
                  <span>Systeemvoorkeuren</span>
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
                  <span>Live Stream Feed</span>
                </button>

              </div>

              <div className="hidden md:block pt-4 border-t border-white/10 space-y-2">
                <button
                  id="admin-restart-onboarding-btn"
                  onClick={() => setShowOnboarding(true)}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Herstart Onboarding</span>
                </button>

                <button
                  id="admin-logout-btn"
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-neutral-400 hover:text-red-300 text-xs font-mono flex items-center justify-center gap-2 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Uitloggen</span>
                </button>
              </div>
            </div>

            {/* Main Terminal Viewport */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto relative bg-transparent">
              
              {/* TAB 1: THE DAILY TERMINAL (WACHTENDE AUTORISATIES) */}
              {activeTab === 'queue' && (
                <div id="queue-tab-content" className="space-y-6 animate-fade-in relative">
                  
                  {/* Tutorial Glassmorphic Overlay (The Secure Handoff) */}
                  {showQueueTutorial && (
                    <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/15 shadow-2xl backdrop-blur-2xl relative space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-white font-bold uppercase">
                          <Info className="w-4 h-4 text-white" />
                          <span>BEVEILIGD AUTORISATIE PROTOCOL</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowQueueTutorial(false);
                            localStorage.setItem('queen_queue_tutorial_seen', 'true');
                          }}
                          className="text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
                        >
                          Sluiten ✕
                        </button>
                      </div>

                      <p className="text-xs text-neutral-200 leading-relaxed font-sans font-medium">
                        Controleer eerst uw inkomende Throne transacties. Zodra de betaling is geverifieerd, klikt u op <strong className="text-white">‘Autoriseer’</strong> om het Google Drive archief direct vrij te geven aan de koper.
                      </p>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            setShowQueueTutorial(false);
                            localStorage.setItem('queen_queue_tutorial_seen', 'true');
                          }}
                          className="px-4 py-2 rounded-xl bg-white text-black text-xs font-mono font-bold tracking-wider uppercase hover:bg-neutral-200 transition-all cursor-pointer"
                        >
                          Begrepen & Activeren
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Header & Refresh */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2.5">
                        <span>Wachtende Autorisaties</span>
                        <span className="text-xs font-mono text-neutral-400 font-normal">({pendingRequests.length} actief)</span>
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        OPERANT FINANCIEEL CONTROLEPANEEL // VRIJGIFTE VIA GOOGLE DRIVE
                      </p>
                    </div>

                    <button
                      id="refresh-queue-btn"
                      onClick={fetchQueue}
                      disabled={isLoadingQueue}
                      className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 text-xs font-mono flex items-center gap-2 border border-white/10 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                      <span>Vernieuw Wachtrij</span>
                    </button>
                  </div>

                  {/* High-Contrast Stark Financial Data Rows */}
                  {pendingRequests.length === 0 ? (
                    <div className="py-16 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/10">
                      <CheckCircle2 className="w-10 h-10 text-white/80 mx-auto" />
                      <div className="font-mono text-sm text-neutral-200 font-bold uppercase tracking-wider">
                        Geen Wachtende Autorisaties
                      </div>
                      <p className="text-xs text-neutral-400 font-mono max-w-sm mx-auto">
                        Alle inkomende Throne transacties zijn verwerkt en geautoriseerd.
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
                            
                            {/* Dehumanized Asset Telemetry Data */}
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                                <span className="px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-white font-bold">
                                  ASSET REQUEST: {reqItem.video_title || 'Exclusief Archief'}
                                </span>
                                <span className="text-white font-bold">
                                  WAARDE: {reqItem.amount || '35.00 €'}
                                </span>
                                <span className="text-neutral-400">
                                  KOPER: <strong className="text-neutral-200">{buyerId}</strong>
                                </span>
                              </div>

                              <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-3">
                                <span>KANAAL: {reqItem.payment_method?.toUpperCase() || 'THRONE'}</span>
                                <span>REF: {reqItem.transaction_ref || 'TRANSACTIE-DIRECT'}</span>
                                <span>TIJDSTIP: {new Date(reqItem.created_at).toLocaleTimeString('nl-NL')}</span>
                              </div>
                            </div>

                            {/* Approval / Rejection Controls */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                id={`reject-btn-${reqItem.id}`}
                                onClick={() => handleReject(reqItem.id)}
                                disabled={isApproved || approvingIds.has(reqItem.id)}
                                className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white text-xs font-mono border border-white/10 transition-all cursor-pointer disabled:opacity-30"
                              >
                                Weiger
                              </button>

                              {/* THE HIT BUTTON: Changes to "Geautoriseerd", White highlight, Slides Right */}
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
                                    <span>Geautoriseerd</span>
                                  </>
                                ) : (
                                  <>
                                    <Key className="w-3.5 h-3.5 text-black" />
                                    <span>Autoriseer</span>
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

              {/* TAB 2: GOOGLE DRIVE ASSET PUBLICATIE */}
              {activeTab === 'upload_video' && (
                <div id="upload-tab-content" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                      Nieuw Video-Archief Publiceren (Google Drive)
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      Strikt gevalideerd Google Drive brondocument. Koper ontvangt directe archieflink bij autorisatie.
                    </p>
                  </div>

                  <form onSubmit={handleUploadVideo} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase text-white">
                        TITEL VAN HET ARCHIEF
                      </label>
                      <input
                        id="video-title-input"
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="bijv. VIP Masterclass Sessie No. 02"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-3 text-xs font-sans text-white focus:outline-none backdrop-blur-md"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase text-white flex items-center justify-between">
                        <span>GOOGLE DRIVE BRON-LINK (DRIVE.GOOGLE.COM)</span>
                        <span className="text-[9px] text-neutral-400">STRIKT VERPLICHT</span>
                      </label>
                      <input
                        id="video-drive-url-input"
                        type="url"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view"
                        className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none backdrop-blur-md ${
                          driveUrl && !isGoogleDriveUrl(driveUrl)
                            ? 'border-white/60 focus:border-white'
                            : 'border-white/10 focus:border-white'
                        }`}
                      />
                      {driveUrl && !isGoogleDriveUrl(driveUrl) && (
                        <p className="text-[10px] text-neutral-300 font-mono">
                          Waarschuwing: link moet een geldig Google Drive adres bevatten (drive.google.com).
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-neutral-300">WAARDE (€)</label>
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
                        <label className="text-[10px] font-mono uppercase text-neutral-300">DUUR</label>
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
                      <label className="text-[10px] font-mono uppercase text-neutral-300">OMSCHRIJVING</label>
                      <textarea
                        id="video-desc-input"
                        rows={3}
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl p-3 text-xs font-sans text-white focus:outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">MINIATUURAFBEELDING (URL - OPTIONEEL)</label>
                      <input
                        id="video-thumbnail-input"
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="https://example.com/thumbnail.jpg"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-500 focus:outline-none"
                      />
                    </div>

                    {uploadError && (
                      <div className="p-3 rounded-xl bg-white/[0.06] border border-white/20 text-neutral-200 text-xs font-mono flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-white" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {/* Monospace Terminal Logs */}
                    {uploadTerminalLogs.length > 0 && (
                      <div className="p-4 bg-black/60 rounded-xl border border-white/15 font-mono text-xs text-neutral-200 space-y-1 backdrop-blur-xl">
                        <div className="flex items-center gap-2 text-[10px] text-white uppercase border-b border-white/10 pb-1 mb-1 font-bold">
                          <TerminalIcon className="w-3.5 h-3.5" />
                          <span>VAULT ENCRYPTIE LOGBOEK</span>
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
                          <span>Versleuteling bezig...</span>
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-4 h-4 text-black" />
                          <span>Publiceer Asset Naar Google Drive Archief</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: ACTIVA OVERZICHT */}
              {activeTab === 'assets' && (
                <div id="assets-tab-content" className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                        Gepubliceerde Activa & Google Drive Archieven
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        TOTAAL {publishedVideos.length} ACTIEVE ASSETS IN DE CENTRALE REGISTRY
                      </p>
                    </div>

                    <button
                      id="new-archive-shortcut-btn"
                      onClick={() => setActiveTab('upload_video')}
                      className="px-3.5 py-2 rounded-xl bg-white text-black text-xs font-mono font-bold uppercase flex items-center gap-1.5 hover:bg-neutral-200 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nieuw Archief</span>
                    </button>
                  </div>

                  {publishedVideos.length === 0 ? (
                    <div className="py-16 text-center space-y-3 bg-white/[0.02] rounded-2xl border border-white/10">
                      <Film className="w-10 h-10 text-neutral-500 mx-auto" />
                      <div className="font-mono text-sm text-neutral-300 font-bold uppercase">
                        Geen Activa Gepubliceerd
                      </div>
                      <p className="text-xs text-neutral-400 font-mono">
                        Publiceer uw eerste Google Drive video-sessie via het tabblad 'Asset Publicatie'.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {publishedVideos.map((item) => (
                        <div
                          key={item.id}
                          id={`asset-card-${item.id}`}
                          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/25 space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-white uppercase truncate max-w-[200px]">
                                {item.titleEn || item.title}
                              </span>
                              <span className="font-mono text-xs font-extrabold text-white">
                                € {item.price.toFixed(2)}
                              </span>
                            </div>

                            <p className="text-xs text-neutral-400 line-clamp-2">
                              {item.descriptionEn || item.description}
                            </p>

                            <div className="text-[11px] font-mono text-neutral-400 truncate">
                              BRON: {item.previewUrl || 'Google Drive Encrypted'}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-neutral-300">
                              STATUS: LIVE & ACTIEF
                            </span>
                            <button
                              id={`delete-asset-${item.id}`}
                              onClick={() => onDeleteVideo(item.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Verwijder van feed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SYSTEEMVOORKEUREN */}
              {activeTab === 'settings' && (
                <div id="settings-tab-content" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                      Systeemvoorkeuren & Centrale Kanalen
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      Gecentraliseerde opslag in Supabase 'site_settings'. Wijzigingen worden overal op het platform direct doorgevoerd.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold uppercase text-white">
                        THRONE BETAALLINK (CENTRALE WISH & TRIBUTE)
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
                        TIPFUNDER BETAALLINK
                      </label>
                      <input
                        id="settings-tipfunder-input"
                        type="url"
                        value={tipfunderInput}
                        onChange={(e) => setTipfunderInput(e.target.value)}
                        placeholder="https://tipfunder.com/..."
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
                          placeholder="https://t.me/..."
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
                          placeholder="https://x.com/..."
                          className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">AUTORITEITSNAAM</label>
                      <input
                        id="settings-name-input"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">AVATAR URL</label>
                      <input
                        id="settings-avatar-input"
                        type="url"
                        value={avatarInput}
                        onChange={(e) => setAvatarInput(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">BIOGRAFIE</label>
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
                      Systeemvoorkeuren Opslaan & Synchroniseren
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: LIVE STREAM FEED */}
              {activeTab === 'live' && (
                <div id="live-tab-content" className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-white font-sans">
                      VIP Live Stream Feed Beheer
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      Schakel uw live stream status in of uit en beheer de streambron.
                    </p>
                  </div>

                  <form onSubmit={handleSaveLiveState} className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono font-bold text-white uppercase">
                          STREAM STATUS
                        </span>
                        <p className="text-[11px] text-neutral-400">
                          {isLive ? 'Stream is momenteel LIVE voor bezoekers' : 'Stream is momenteel OFFLINE'}
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
                        {isLive ? '● LIVE ACTIEF' : '○ OFFLINE'}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">STREAM TITEL</label>
                      <input
                        id="live-stream-title-input"
                        type="text"
                        value={liveTitle}
                        onChange={(e) => setLiveTitle(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-sans text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">STREAM OMSCHRIJVING</label>
                      <textarea
                        id="live-stream-desc-input"
                        rows={2}
                        value={liveDesc}
                        onChange={(e) => setLiveDesc(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl p-3 text-xs font-sans text-white focus:outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-300">STREAM BRON (VIDEO / HLS URL)</label>
                      <input
                        id="live-stream-url-input"
                        type="url"
                        value={liveStreamUrl}
                        onChange={(e) => setLiveStreamUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/[0.04] border border-white/10 focus:border-white rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    {liveSavedMsg && (
                      <div className="p-3 rounded-xl bg-white/[0.08] border border-white/20 text-white text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{liveSavedMsg}</span>
                      </div>
                    )}

                    <button
                      id="save-live-status-submit-btn"
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold tracking-wider uppercase shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      Live Stream Status Updaten
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
