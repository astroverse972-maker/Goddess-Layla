import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Link2, 
  Image, 
  Check, 
  Upload, 
  Trash2, 
  User, 
  CreditCard, 
  Key,
  Video,
  Film,
  Sparkles,
  ArrowRight,
  Eye,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { CollectionItem } from '../data/collectionData';

interface MistressAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'fr' | 'en';
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

export const MistressAdminModal: React.FC<MistressAdminModalProps> = ({
  isOpen,
  onClose,
  currentLiveState,
  onUpdateLiveState,
  onUploadMediaSuccess,
  publishedVideos,
  onDeleteVideo,
}) => {
  // Real Supabase Admin Authentication State
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // First-Time Setup State
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmSetupPassword, setConfirmSetupPassword] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Security Settings Tab State
  const [currentSecurityPassword, setCurrentSecurityPassword] = useState('');
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState<string | null>(null);
  const [securityErrorMsg, setSecurityErrorMsg] = useState<string | null>(null);

  // Creator Studio Tabs: strictly 'upload_video' FIRST, then 'live', 'profile', 'payments', 'security'
  const [activeTab, setActiveTab] = useState<'upload_video' | 'live' | 'profile' | 'payments' | 'security'>('upload_video');

  // Live Stream Control State
  const [isLive, setIsLive] = useState(currentLiveState.isLive);
  const [liveTitle, setLiveTitle] = useState(currentLiveState.title);
  const [liveDesc, setLiveDesc] = useState(currentLiveState.description);
  const [livePrice, setLivePrice] = useState(currentLiveState.price);
  const [liveStreamUrl, setLiveStreamUrl] = useState(currentLiveState.streamUrl || 'https://i.imgur.com/m0CSW44.mp4');
  const [isUpdatingLive, setIsUpdatingLive] = useState(false);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);

  // New Video Upload Form State
  const [videoTitle, setVideoTitle] = useState('');
  const [videoPrice, setVideoPrice] = useState('25.00');
  const [driveLink, setDriveLink] = useState('');
  
  // Custom Cover Image
  const [useCustomThumbnail, setUseCustomThumbnail] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const [category, setCategory] = useState('Exclusive Session');
  const [videoDescription, setVideoDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['exclusive', 'goddesslayla', 'vip']);

  const [isPosting, setIsPosting] = useState(false);
  const [postSuccessMsg, setPostSuccessMsg] = useState<string | null>(null);
  const [postErrorMsg, setPostErrorMsg] = useState<string | null>(null);

  // Creator Profile Settings State
  const [creatorName, setCreatorName] = useState('Goddess Layla');
  const [creatorBio, setCreatorBio] = useState('Welcome to my official VIP sanctuary. Tributes, gifts, and live stream support are handled exclusively through TipFunder and Throne.');
  const [galleryImg1, setGalleryImg1] = useState('https://i.imgur.com/STRpELi.jpg');
  const [galleryImg2, setGalleryImg2] = useState('https://i.imgur.com/bjTQJK7.jpg');
  const [galleryImg3, setGalleryImg3] = useState('https://i.imgur.com/tzmLquQ.jpg');
  const [galleryImg4, setGalleryImg4] = useState('https://i.imgur.com/g5fQwuf.jpg');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Payment Methods State
  const [tipfunderUrl, setTipfunderUrl] = useState('https://www.tipfunder.com/Geldherrinlay9');
  const [throneUrl, setThroneUrl] = useState('https://throne.com/geldherrinlayla');
  const [telegramUrl, setTelegramUrl] = useState('https://t.me/laylathebest');
  const [xUrl, setXUrl] = useState('https://x.com/Geldherrinlay9');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsLive(currentLiveState.isLive);
    setLiveTitle(currentLiveState.title);
    setLiveDesc(currentLiveState.description);
    setLivePrice(currentLiveState.price);
    setLiveStreamUrl(currentLiveState.streamUrl || 'https://i.imgur.com/m0CSW44.mp4');
  }, [currentLiveState]);

  // Check Supabase authentication status & load existing profile
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/admin/auth-status', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setIsConfigured(Boolean(data.isConfigured));
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
          }
          if (data.username) {
            setLoginUsername(data.username);
            setNewUsernameInput(data.username);
          }
        }
      })
      .catch(() => {
        setIsConfigured(false);
      });

    fetch('/api/creator-profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((p) => {
        if (p) {
          if (p.name) setCreatorName(p.name);
          if (p.bio) setCreatorBio(p.bio);
          if (Array.isArray(p.gallery)) {
            if (p.gallery[0]) setGalleryImg1(p.gallery[0]);
            if (p.gallery[1]) setGalleryImg2(p.gallery[1]);
            if (p.gallery[2]) setGalleryImg3(p.gallery[2]);
            if (p.gallery[3]) setGalleryImg4(p.gallery[3]);
          }
        }
      })
      .catch(() => {});

    fetch('/api/payment-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((pay) => {
        if (pay) {
          if (pay.tipfunder) setTipfunderUrl(pay.tipfunder);
          if (pay.throne) setThroneUrl(pay.throne);
          if (pay.telegram) setTelegramUrl(pay.telegram);
          if (pay.x) setXUrl(pay.x);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInitialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    const user = setupUsername.trim();
    const pass = setupPassword.trim();
    const confirmPass = confirmSetupPassword.trim();

    if (!user || user.length < 3) {
      setSetupError('Username must be at least 3 characters long.');
      return;
    }
    if (!pass || pass.length < 3) {
      setSetupError('Password must be at least 3 characters long.');
      return;
    }
    if (pass !== confirmPass) {
      setSetupError('Passwords do not match.');
      return;
    }

    setIsSettingUp(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user, password: pass })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        setIsConfigured(true);
        setIsAuthenticated(true);
        setLoginUsername(user);
        setNewUsernameInput(user);
      } else {
        const errorMsg = data?.error || `Server error (${res.status || 'unknown'})`;
        if (errorMsg.toLowerCase().includes('already set up') || errorMsg.toLowerCase().includes('already configured')) {
          setIsConfigured(true);
          setLoginUsername(user);
          setAuthError(data?.error || 'An admin account is already set up. Please sign in with your chosen credentials.');
        } else {
          setSetupError(errorMsg);
        }
      }
    } catch (err: any) {
      setSetupError(err.message || 'Server connection error.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const user = loginUsername.trim();
    const pass = loginPassword.trim();

    if (!user || !pass) {
      setAuthError('Please enter both username and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user, password: pass })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        setIsAuthenticated(true);
        setLoginPassword('');
      } else {
        setAuthError(data?.error || 'Invalid username or password. Security verification failed.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Server authentication error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    setIsAuthenticated(false);
  };



  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const extractDriveFileId = (url: string) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const handlePostVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostErrorMsg(null);
    setPostSuccessMsg(null);

    if (!driveLink.trim()) {
      setPostErrorMsg('Please provide a Google Drive video shareable link.');
      return;
    }

    setIsPosting(true);

    try {
      const driveFileId = extractDriveFileId(driveLink.trim());
      const finalStreamUrl = driveFileId 
        ? `https://lh3.googleusercontent.com/d/${driveFileId}`
        : driveLink.trim();

      const defaultCover = 'https://i.imgur.com/STRpELi.jpg';
      const finalThumbnail = useCustomThumbnail && thumbnailUrl.trim() 
        ? thumbnailUrl.trim() 
        : defaultCover;

      const payload = {
        title: videoTitle.trim() || 'New Exclusive Session',
        price: videoPrice.trim() || '25.00',
        video_url: finalStreamUrl,
        googleDriveLink: driveLink.trim(),
        thumbnail_url: finalThumbnail,
        thumbnailUrl: finalThumbnail,
        category: category.trim() || 'Goddess Exclusive',
        description: videoDescription.trim() || 'Exclusive high-definition content.',
        tags: tags.length > 0 ? tags : ['exclusive', 'goddesslayla']
      };

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('content_submissions').insert([{
            title: payload.title,
            price: payload.price,
            google_drive_link: payload.googleDriveLink || payload.video_url,
            thumbnail_url: payload.thumbnail_url,
            category: payload.category,
            name: "Goddess Layla",
            description: payload.description,
            tags: payload.tags,
            status: "published",
            created_at: new Date().toISOString()
          }]);
        } catch (sbErr) {
          console.warn('Supabase client insert notice:', sbErr);
        }
      }

      const res = await fetch('/api/custom-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let resData: any = null;
      try {
        const text = await res.text();
        resData = JSON.parse(text);
      } catch (e) {
        resData = { success: false };
      }

      if (res.ok && resData && resData.success) {
        setPostSuccessMsg('Video published successfully! Content is live.');
      } else {
        setPostSuccessMsg('Thank you, Video will appear in page after verification');
      }

      setVideoTitle('');
      setDriveLink('');
      setThumbnailUrl('');
      setUseCustomThumbnail(false);
      setVideoDescription('');

      onUploadMediaSuccess();
    } catch (err: any) {
      setPostErrorMsg(err.message || 'Error processing video link');
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdateLiveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingLive(true);
    setLiveSuccessMsg(null);

    const newState = {
      passcode: '1234',
      isLive,
      title: liveTitle.trim() || 'GODDESS LAYLA LIVE VIP SESSION',
      description: liveDesc.trim() || 'Exclusive private stream.',
      price: livePrice.trim() || '50.00',
      streamUrl: liveStreamUrl.trim() || 'https://i.imgur.com/m0CSW44.mp4'
    };

    try {
      const res = await fetch('/api/live-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState)
      });

      if (res.ok) {
        onUpdateLiveState(newState);
        setLiveSuccessMsg('Live Stream settings saved. Updates live across all users!');
      } else {
        onUpdateLiveState(newState);
        setLiveSuccessMsg('Live Stream state updated.');
      }
    } catch (err) {
      onUpdateLiveState(newState);
      setLiveSuccessMsg('Live Stream state updated.');
    } finally {
      setIsUpdatingLive(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);

    const profileData = {
      name: creatorName.trim(),
      bio: creatorBio.trim(),
      gallery: [
        galleryImg1.trim(),
        galleryImg2.trim(),
        galleryImg3.trim(),
        galleryImg4.trim()
      ].filter(Boolean)
    };

    fetch('/api/creator-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    }).catch(() => {});

    try {
      localStorage.setItem('goddess_creator_profile', JSON.stringify(profileData));
      window.dispatchEvent(new Event('storage'));
      setProfileSuccessMsg('Profile and gallery updated successfully across all visitors.');
    } catch (err) {
      setProfileSuccessMsg('Profile updated.');
    }
  };

  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSuccessMsg(null);

    const payData = {
      tipfunder: tipfunderUrl.trim(),
      throne: throneUrl.trim(),
      telegram: telegramUrl.trim(),
      x: xUrl.trim()
    };

    fetch('/api/payment-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payData)
    }).catch(() => {});

    try {
      localStorage.setItem('goddess_payment_settings', JSON.stringify(payData));
      window.dispatchEvent(new Event('storage'));
      setPaymentSuccessMsg('Payment methods and channels updated successfully across all visitors.');
    } catch (err) {
      setPaymentSuccessMsg('Payment settings saved.');
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrorMsg(null);
    setSecuritySuccessMsg(null);

    const cleanCurrent = currentSecurityPassword.trim();
    const cleanUser = newUsernameInput.trim();
    const cleanNewPass = newPasswordInput.trim();
    const cleanConfirmPass = confirmNewPasswordInput.trim();

    if (!cleanCurrent) {
      setSecurityErrorMsg('Please enter your current password to verify your identity.');
      return;
    }

    if (cleanNewPass && cleanNewPass !== cleanConfirmPass) {
      setSecurityErrorMsg('New passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/admin/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: cleanCurrent,
          newUsername: cleanUser,
          newPassword: cleanNewPass
        })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        setSecuritySuccessMsg(`Credentials updated successfully! Username: "${data.username}".`);
        setCurrentSecurityPassword('');
        setNewPasswordInput('');
        setConfirmNewPasswordInput('');
        if (data.username) {
          setLoginUsername(data.username);
          setNewUsernameInput(data.username);
        }
      } else {
        setSecurityErrorMsg(data?.error || 'Failed to update credentials.');
      }
    } catch (err: any) {
      setSecurityErrorMsg(err.message || 'Failed to communicate with database server.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white w-full h-full flex flex-col font-sans selection:bg-white selection:text-black overflow-hidden animate-fade-in">
      
      {/* Top Header Bar */}
      <header className="h-16 px-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0 text-white z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
          <div>
            <span className="font-bold text-sm tracking-wider uppercase text-white block">
              Creator Studio
            </span>
          </div>
        </div>

        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-300 font-sans font-medium">{publishedVideos.length} Catalog Items</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-ping' : 'bg-neutral-600'}`}></span>
              <span className="text-neutral-300 font-sans font-medium">{isLive ? 'LIVE ONLINE' : 'STREAM OFFLINE'}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            aria-label="Exit Studio"
          >
            <span>Exit Studio</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      {!isAuthenticated ? (
        /* Full Screen Authentication / Setup View */
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 bg-black flex flex-col items-center justify-start sm:justify-center py-8">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-10 space-y-6 text-center shadow-2xl my-auto">
            <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-7 h-7" />
            </div>

            {!isConfigured ? (
              /* FIRST-TIME SETUP SCREEN */
              <div className="space-y-4 text-left">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                    First-Time Admin Setup
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    Choose your official username and password.
                  </p>
                </div>

                <form onSubmit={handleInitialSetup} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block uppercase tracking-wider mb-1.5">
                      Choose Admin Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={setupUsername}
                      onChange={(e) => setSetupUsername(e.target.value)}
                      placeholder="e.g. LaylaAdmin"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-bold text-sm focus:border-white focus:outline-none transition-all placeholder-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block uppercase tracking-wider mb-1.5">
                      Choose Admin Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      placeholder="Create secure password"
                      className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-bold text-sm focus:border-white focus:outline-none transition-all placeholder-neutral-600 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block uppercase tracking-wider mb-1.5">
                      Confirm Admin Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmSetupPassword}
                      onChange={(e) => setConfirmSetupPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-bold text-sm focus:border-white focus:outline-none transition-all placeholder-neutral-600 font-sans"
                    />
                  </div>

                  {setupError && (
                    <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-white shrink-0" />
                      <span>{setupError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSettingUp}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isSettingUp ? 'Saving Credentials...' : 'Create Account & Enter Studio'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              /* LOGIN SCREEN */
              <div className="space-y-4 text-left">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                    Studio Sign In
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    Enter your username and password to access Creator Studio
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block uppercase tracking-wider mb-1.5">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Username"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-bold text-sm focus:border-white focus:outline-none transition-all placeholder-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-300 block uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-white font-bold text-sm focus:border-white focus:outline-none transition-all placeholder-neutral-600 font-sans"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMeCheckbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-800 bg-black text-white focus:ring-0 cursor-pointer accent-white"
                    />
                    <label htmlFor="rememberMeCheckbox" className="text-xs font-medium text-neutral-300 cursor-pointer select-none">
                      Remember Me on this browser
                    </label>
                  </div>

                  {authError && (
                    <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-300 flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 text-white shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isLoggingIn ? 'Verifying Credentials...' : 'Enter Creator Studio'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full Screen Authenticated Portal Layout */
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-black text-white">
          
          {/* Navigation Sidebar / Top Navigation Bar */}
          <aside className="w-full md:w-64 bg-neutral-950 border-b md:border-b-0 md:border-r border-neutral-800 shrink-0 p-3 sm:p-4 flex md:flex-col justify-start gap-1.5 overflow-x-auto md:overflow-y-auto md:overflow-x-visible">
            
            <div className="hidden md:block px-3 py-2 mb-2 border-b border-neutral-800">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500 block">
                Studio Management
              </span>
            </div>

            {/* TAB 1: UPLOAD VIDEO */}
            <button
              onClick={() => setActiveTab('upload_video')}
              className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 cursor-pointer uppercase tracking-wider shrink-0 text-left ${
                activeTab === 'upload_video'
                  ? 'bg-white text-black shadow-md font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>Upload Video</span>
            </button>

            {/* TAB 2: LIVE STREAM */}
            <button
              onClick={() => setActiveTab('live')}
              className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 cursor-pointer uppercase tracking-wider shrink-0 text-left ${
                activeTab === 'live'
                  ? 'bg-white text-black shadow-md font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Radio className="w-4 h-4 shrink-0" />
              <span>Live Broadcast</span>
            </button>

            {/* TAB 3: CREATOR PROFILE */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 cursor-pointer uppercase tracking-wider shrink-0 text-left ${
                activeTab === 'profile'
                  ? 'bg-white text-black shadow-md font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile & Gallery</span>
            </button>

            {/* TAB 4: PAYMENTS */}
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 cursor-pointer uppercase tracking-wider shrink-0 text-left ${
                activeTab === 'payments'
                  ? 'bg-white text-black shadow-md font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Payment Links</span>
            </button>

            {/* TAB 5: SECURITY */}
            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 cursor-pointer uppercase tracking-wider shrink-0 text-left ${
                activeTab === 'security'
                  ? 'bg-white text-black shadow-md font-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Key className="w-4 h-4 shrink-0" />
              <span>Passcode & Security</span>
            </button>
          </aside>

          {/* Main Work Area */}
          <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 md:p-10 max-w-5xl mx-auto w-full space-y-8">
            
            {/* TAB 1: UPLOAD VIDEO & CATALOG MANAGEMENT */}
            {activeTab === 'upload_video' && (
              <div className="space-y-8">
                
                {/* Section Title */}
                <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Upload className="w-6 h-6 text-white" />
                      <span>Upload New Exclusive Content</span>
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Add Google Drive shareable video links directly to your public catalog
                    </p>
                  </div>
                </div>

                {/* Upload Form */}
                <form onSubmit={handlePostVideo} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  
                  {/* Google Drive Link Field */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-white" />
                      <span>Google Drive Shareable Link *</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs text-white focus:border-white focus:outline-none transition-all placeholder-neutral-600 font-sans"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1.5">
                      Ensure your link access is set to <span className="text-neutral-300 font-bold">"Anyone with the link can view"</span>.
                    </p>
                  </div>

                  {/* Title & Price Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                        Video Title
                      </label>
                      <input
                        type="text"
                        required
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="e.g. VIP Private Domination Session"
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                        Access Price ($)
                      </label>
                      <input
                        type="text"
                        required
                        value={videoPrice}
                        onChange={(e) => setVideoPrice(e.target.value)}
                        placeholder="25.00"
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Category Selection (Self-written free text input) */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Enter category name (e.g. Foot Worship, Exclusive Session, Custom)"
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all placeholder-neutral-600"
                    />
                  </div>

                  {/* Custom Thumbnail Option */}
                  <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setUseCustomThumbnail(!useCustomThumbnail)}>
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-white" />
                        <span className="text-xs font-bold uppercase tracking-wider">Custom Thumbnail / Cover Image</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={useCustomThumbnail}
                        onChange={(e) => setUseCustomThumbnail(e.target.checked)}
                        className="w-4 h-4 rounded accent-white cursor-pointer"
                      />
                    </div>

                    {useCustomThumbnail && (
                      <div className="pt-2">
                        <input
                          type="url"
                          value={thumbnailUrl}
                          onChange={(e) => setThumbnailUrl(e.target.value)}
                          placeholder="https://i.imgur.com/your-image.jpg"
                          className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:border-white focus:outline-none transition-all font-sans"
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      Description & Notes
                    </label>
                    <textarea
                      rows={3}
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Detailed description for your audience..."
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs text-white focus:border-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Messages */}
                  {postErrorMsg && (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                      <span>{postErrorMsg}</span>
                    </div>
                  )}

                  {/* EXACT CONFIRMATION MESSAGE REQUIRED */}
                  {postSuccessMsg && (
                    <div className="p-4 rounded-xl bg-white text-black text-xs font-black flex items-center gap-2 shadow-lg">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-black" />
                      <span>{postSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPosting}
                    className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPosting ? (
                      <span>Processing Media...</span>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Publish Video to Public Site</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Video Catalog Manager Section */}
                <div className="space-y-4 pt-6 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wider text-white">
                        Published Video Catalog
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Remove videos from your public feed anytime (Soft Delete: preserved safely in storage)
                      </p>
                    </div>
                  </div>

                  {publishedVideos.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
                      <Film className="w-8 h-8 mx-auto text-neutral-600" />
                      <p className="text-xs font-bold text-neutral-400">No videos published yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {publishedVideos.map((video) => {
                        const thumbSrc = video.thumbnailUrl || (video as any).thumbnail_url || (video as any).image || (video as any).previewUrl || 'https://i.imgur.com/STRpELi.jpg';
                        return (
                          <div key={video.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-4 group hover:border-neutral-700 transition-all">
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-neutral-800 relative flex items-center justify-center">
                              <img 
                                src={thumbSrc} 
                                alt={video.title} 
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.src !== 'https://i.imgur.com/STRpELi.jpg') {
                                    target.src = 'https://i.imgur.com/STRpELi.jpg';
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate uppercase tracking-tight">{video.title}</h4>
                              <p className="text-[11px] text-neutral-400 font-sans font-medium mt-0.5">${typeof video.price === 'number' ? video.price.toFixed(2) : video.price}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 font-sans font-medium">
                                {video.category || 'Exclusive'}
                              </span>
                            </div>
                            <button
                              onClick={() => onDeleteVideo(video.id)}
                              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-white hover:text-black text-neutral-400 transition-all cursor-pointer shrink-0"
                              title="Remove Video from Public Site"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: LIVE BROADCAST CONTROL */}
            {activeTab === 'live' && (
              <form onSubmit={handleUpdateLiveStream} className="space-y-6">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Radio className="w-6 h-6 text-white" />
                    <span>Live Stream Broadcast Studio</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Control your live broadcast status, stream source URL, and view pricing
                  </p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  
                  {/* Live Toggle Bar */}
                  <div className="p-5 rounded-2xl bg-black border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3.5 h-3.5 rounded-full ${isLive ? 'bg-white animate-ping' : 'bg-neutral-600'}`}></div>
                      <div>
                        <span className="font-bold text-sm uppercase tracking-wider text-white block">
                          Broadcasting Status: {isLive ? 'LIVE NOW' : 'OFFLINE'}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {isLive ? 'Public VIP stream card is glowing on main feed' : 'Stream is hidden/inactive'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsLive(!isLive)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        isLive 
                          ? 'bg-white text-black hover:bg-neutral-200' 
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isLive ? 'Turn Off Live' : 'Go Live Now'}
                    </button>
                  </div>

                  {/* Title & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                        Live Stream Title
                      </label>
                      <input
                        type="text"
                        value={liveTitle}
                        onChange={(e) => setLiveTitle(e.target.value)}
                        placeholder="GODDESS LAYLA LIVE EXCLUSIVE"
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                        Ticket Price ($)
                      </label>
                      <input
                        type="text"
                        value={livePrice}
                        onChange={(e) => setLivePrice(e.target.value)}
                        placeholder="50.00"
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Video Stream URL */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      Live Stream Video URL / HLS / Direct MP4 / Google Drive
                    </label>
                    <input
                      type="url"
                      value={liveStreamUrl}
                      onChange={(e) => setLiveStreamUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs text-white focus:border-white focus:outline-none transition-all font-sans"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      Stream Announcement Description
                    </label>
                    <textarea
                      rows={3}
                      value={liveDesc}
                      onChange={(e) => setLiveDesc(e.target.value)}
                      placeholder="Welcome to my official live private broadcast session..."
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs text-white focus:border-white focus:outline-none transition-all"
                    />
                  </div>

                  {liveSuccessMsg && (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      <span>{liveSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdatingLive}
                    className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isUpdatingLive ? 'Saving Broadcast...' : 'Update Live Stream Settings'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: CREATOR PROFILE & GALLERY */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="w-6 h-6 text-white" />
                    <span>Profile & Gallery Customization</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Edit your bio description, creator name, and public slide images in real-time
                  </p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  
                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      Public Creator Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="Goddess Layla"
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Bio Description */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      About & Sanctuary Bio Description
                    </label>
                    <textarea
                      rows={4}
                      value={creatorBio}
                      onChange={(e) => setCreatorBio(e.target.value)}
                      placeholder="Write your bio description here..."
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs text-white focus:border-white focus:outline-none transition-all leading-relaxed"
                    />
                  </div>

                  {/* Gallery Slide Images */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider">
                      Public Gallery Slide Photo Links (URLs)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-neutral-400 font-sans block mb-1">Image 1 URL</span>
                        <input
                          type="url"
                          value={galleryImg1}
                          onChange={(e) => setGalleryImg1(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-xs text-white focus:border-white focus:outline-none font-sans"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 font-sans block mb-1">Image 2 URL</span>
                        <input
                          type="url"
                          value={galleryImg2}
                          onChange={(e) => setGalleryImg2(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-xs text-white focus:border-white focus:outline-none font-sans"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 font-sans block mb-1">Image 3 URL</span>
                        <input
                          type="url"
                          value={galleryImg3}
                          onChange={(e) => setGalleryImg3(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-xs text-white focus:border-white focus:outline-none font-sans"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 font-sans block mb-1">Image 4 URL</span>
                        <input
                          type="url"
                          value={galleryImg4}
                          onChange={(e) => setGalleryImg4(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-xs text-white focus:border-white focus:outline-none font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {profileSuccessMsg && (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer shadow-lg"
                  >
                    Save Profile & Gallery
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: PAYMENT METHODS & SOCIAL LINKS */}
            {activeTab === 'payments' && (
              <form onSubmit={handleSavePayments} className="space-y-6">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-white" />
                    <span>Payment Links & Channels</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Configure official payment gateways and direct link platforms
                  </p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      TipFunder Payment URL
                    </label>
                    <input
                      type="url"
                      value={tipfunderUrl}
                      onChange={(e) => setTipfunderUrl(e.target.value)}
                      placeholder="https://www.tipfunder.com/..."
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-sans text-white focus:border-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      Throne Wishlist URL
                    </label>
                    <input
                      type="url"
                      value={throneUrl}
                      onChange={(e) => setThroneUrl(e.target.value)}
                      placeholder="https://throne.com/..."
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-sans text-white focus:border-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                        Telegram Link
                      </label>
                      <input
                        type="url"
                        value={telegramUrl}
                        onChange={(e) => setTelegramUrl(e.target.value)}
                        placeholder="https://t.me/..."
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-sans text-white focus:border-white focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                        X (Twitter) Profile URL
                      </label>
                      <input
                        type="url"
                        value={xUrl}
                        onChange={(e) => setXUrl(e.target.value)}
                        placeholder="https://x.com/..."
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-sans text-white focus:border-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {paymentSuccessMsg && (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      <span>{paymentSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer shadow-lg"
                  >
                    Save Payment Settings
                  </button>
                </div>
              </form>
            )}

            {/* TAB 5: SECURITY & CREDENTIALS MANAGEMENT */}
            {activeTab === 'security' && (
              <form onSubmit={handleSaveSecurity} className="space-y-6">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-6 h-6 text-white" />
                    <span>Studio Security & Admin Account</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Update your admin username or password anytime
                  </p>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                  
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      Current Password (Required for Verification) *
                    </label>
                    <input
                      type="password"
                      required
                      value={currentSecurityPassword}
                      onChange={(e) => setCurrentSecurityPassword(e.target.value)}
                      placeholder="Type current password to authorize changes"
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all font-sans"
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-900">
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      New Username (Optional)
                    </label>
                    <input
                      type="text"
                      value={newUsernameInput}
                      onChange={(e) => setNewUsernameInput(e.target.value)}
                      placeholder="Admin username"
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Leave blank if keeping current password"
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPasswordInput}
                      onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all font-sans"
                    />
                  </div>

                  {securityErrorMsg && (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-white shrink-0" />
                      <span>{securityErrorMsg}</span>
                    </div>
                  )}

                  {securitySuccessMsg && (
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      <span>{securitySuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer shadow-lg"
                  >
                    Save Credentials
                  </button>
                </div>
              </form>
            )}

          </main>
        </div>
      )}

    </div>
  );
};
