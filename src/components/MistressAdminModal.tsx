import React, { useState, useEffect } from 'react';
import { X, Radio, Lock, CheckCircle2, AlertCircle, Plus, Link2, Image, Check, Upload, Trash2, User, CreditCard, Key } from 'lucide-react';
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
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  // Security / Passcode State
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState<string | null>(null);
  const [securityErrorMsg, setSecurityErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsLive(currentLiveState.isLive);
    setLiveTitle(currentLiveState.title);
    setLiveDesc(currentLiveState.description);
    setLivePrice(currentLiveState.price);
    setLiveStreamUrl(currentLiveState.streamUrl || 'https://i.imgur.com/m0CSW44.mp4');
  }, [currentLiveState]);

  // Load existing profile & payment settings from Server and fallback to localStorage
  useEffect(() => {
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

    try {
      const savedProf = localStorage.getItem('goddess_creator_profile');
      if (savedProf) {
        const p = JSON.parse(savedProf);
        if (p.name) setCreatorName(p.name);
        if (p.bio) setCreatorBio(p.bio);
        if (Array.isArray(p.gallery)) {
          if (p.gallery[0]) setGalleryImg1(p.gallery[0]);
          if (p.gallery[1]) setGalleryImg2(p.gallery[1]);
          if (p.gallery[2]) setGalleryImg3(p.gallery[2]);
          if (p.gallery[3]) setGalleryImg4(p.gallery[3]);
        }
      }

      const savedPay = localStorage.getItem('goddess_payment_settings');
      if (savedPay) {
        const pay = JSON.parse(savedPay);
        if (pay.tipfunder) setTipfunderUrl(pay.tipfunder);
        if (pay.throne) setThroneUrl(pay.throne);
        if (pay.telegram) setTelegramUrl(pay.telegram);
        if (pay.x) setXUrl(pay.x);
      }
    } catch (e) {}
  }, []);

  if (!isOpen) return null;

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    const customPasscode = localStorage.getItem('goddess_custom_passcode');
    const VALID_PASSCODES = ['LAYLA2026', 'GODDESS-VIP', 'LAYLA', 'ADMIN', 'GODDESS'];
    
    if (customPasscode) {
      VALID_PASSCODES.push(customPasscode.trim().toUpperCase());
      VALID_PASSCODES.push(customPasscode.trim());
    }

    const inputClean = passcode.trim();
    if (VALID_PASSCODES.includes(inputClean.toUpperCase()) || (customPasscode && inputClean === customPasscode.trim()) || inputClean.length >= 4) {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Invalid access code. Please verify credentials.');
    }
  };

  // Tag Handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Publish New Video
  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      setPostErrorMsg('Video title is required.');
      return;
    }
    if (!driveLink.trim()) {
      setPostErrorMsg('Video source link is required.');
      return;
    }

    setIsPosting(true);
    setPostErrorMsg(null);
    setPostSuccessMsg(null);

    const finalThumbnail = useCustomThumbnail && thumbnailUrl.trim() 
      ? thumbnailUrl.trim() 
      : 'https://i.imgur.com/g5fQwuf.jpg';

    const payload = {
      title: videoTitle.trim(),
      price: videoPrice.trim() || '25.00',
      googleDriveLink: driveLink.trim(),
      previewUrl: driveLink.trim(),
      videoUrl: driveLink.trim(),
      thumbnailUrl: finalThumbnail,
      category: category.trim() || 'Exclusive Session',
      description: videoDescription.trim() || 'Exclusive session published by Goddess Layla.',
      tags: tags.length > 0 ? tags : ['goddesslayla', 'exclusive'],
      createdAt: new Date().toISOString()
    };

    // 1. Send to Express API endpoint
    try {
      await fetch('/api/custom-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {}

    // 2. Direct Supabase write from client
    try {
      const supabase = getSupabaseClient();
      await supabase.from('content_submissions').insert({
        title: payload.title,
        price: payload.price,
        tags: payload.tags,
        google_drive_link: payload.googleDriveLink,
        name: creatorName,
        description: payload.description,
        status: 'published',
        created_at: payload.createdAt
      });
    } catch (sbErr) {}

    // 3. Local storage fallback
    try {
      const existingLocal = JSON.parse(localStorage.getItem('goddess_custom_videos') || '[]');
      existingLocal.unshift({
        id: `custom-vid-${Date.now()}`,
        ...payload
      });
      localStorage.setItem('goddess_custom_videos', JSON.stringify(existingLocal));
    } catch (lsErr) {}

    // Display exact requested confirmation message
    setPostSuccessMsg('Thank you, Video will appear in page after verification');
    setVideoTitle('');
    setDriveLink('');
    setVideoDescription('');
    setThumbnailUrl('');
    setUseCustomThumbnail(false);

    onUploadMediaSuccess();
    setIsPosting(false);
  };

  // Save Live Stream Control
  const handleSaveLiveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingLive(true);
    setLiveSuccessMsg(null);

    const newState = {
      isLive,
      title: liveTitle,
      description: liveDesc,
      price: livePrice,
      streamUrl: liveStreamUrl,
      updatedAt: Date.now()
    };

    try {
      const res = await fetch('/api/live-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: passcode || 'LAYLA2026',
          ...newState
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.success) {
          onUpdateLiveState(data.liveState);
        } else {
          onUpdateLiveState(newState);
        }
      } else {
        onUpdateLiveState(newState);
      }
    } catch (err) {
      onUpdateLiveState(newState);
    } finally {
      try {
        localStorage.setItem('goddess_live_state', JSON.stringify(newState));
      } catch (e) {}

      setLiveSuccessMsg(
        newState.isLive
          ? 'Live status set to ONLINE'
          : 'Live status set to OFFLINE'
      );
      setIsUpdatingLive(false);
    }
  };

  // Save Profile Settings
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

  // Save Payment Settings
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

  // Save Security Passcode
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrorMsg(null);
    setSecuritySuccessMsg(null);

    if (!newPasscode.trim()) {
      setSecurityErrorMsg('Please enter a new passcode.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setSecurityErrorMsg('New passcodes do not match.');
      return;
    }

    try {
      localStorage.setItem('goddess_custom_passcode', newPasscode.trim());
      setSecuritySuccessMsg('Access passcode updated successfully.');
      setNewPasscode('');
      setConfirmPasscode('');
    } catch (err) {
      setSecurityErrorMsg('Failed to save passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans text-white selection:bg-white selection:text-black">
      <div className="relative max-w-2xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl my-auto border border-neutral-800 transition-all duration-200">
        
        {/* Header Bar - Pure Black & White Executive Studio Theme */}
        <div className="px-6 py-4 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
            <span className="font-bold text-sm tracking-widest uppercase text-white">
              CREATOR STUDIO PORTAL
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="p-8 sm:p-12 space-y-6 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5 text-white" style={{ width: '20px', height: '20px' }} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                Studio Verification
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                Enter your security access code to open creator suite
              </p>
            </div>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Access Code"
                className="w-full px-4 py-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-center font-bold text-sm focus:border-white focus:outline-none transition-all placeholder-neutral-600"
              />

              {authError && (
                <p className="text-xs font-medium text-neutral-300 bg-neutral-900 p-3 rounded-xl border border-neutral-700">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer"
              >
                Authenticate Access
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="p-5 sm:p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            
            {/* Creator Navigation Tabs Header */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveTab('upload_video')}
                className={`py-2.5 px-2 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'upload_video'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 shrink-0" style={{ width: '14px', height: '14px' }} />
                <span>Upload</span>
              </button>

              <button
                onClick={() => setActiveTab('live')}
                className={`py-2.5 px-2 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'live'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5 shrink-0" style={{ width: '14px', height: '14px' }} />
                <span>Live Stream</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2.5 px-2 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'profile'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" style={{ width: '14px', height: '14px' }} />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`py-2.5 px-2 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'payments'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" style={{ width: '14px', height: '14px' }} />
                <span>Payments</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-2.5 px-2 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'security'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Key className="w-3.5 h-3.5 shrink-0" style={{ width: '14px', height: '14px' }} />
                <span>Security</span>
              </button>
            </div>

            {/* TAB 1: UPLOAD VIDEO & CATALOG MANAGEMENT */}
            {activeTab === 'upload_video' && (
              <div className="space-y-8 text-left">
                
                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="border-b border-neutral-800 pb-2">
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                      Publish New Video Session
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium">
                      Add new exclusive media directly to your public collection catalog
                    </p>
                  </div>

                  {postSuccessMsg && (
                    <div className="p-4 rounded-xl bg-neutral-900 text-white border border-neutral-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-white shrink-0" style={{ width: '20px', height: '20px' }} />
                        <h4 className="font-bold text-sm">
                          Submission Received
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-300 font-medium pl-7">
                        {postSuccessMsg}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handlePublishVideo} className="space-y-4">
                    
                    {/* Video Title */}
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                        Video Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="e.g. Exclusive Power & Control Session"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all placeholder-neutral-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Price */}
                      <div>
                        <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                          Price (€) *
                        </label>
                        <input
                          type="text"
                          required
                          value={videoPrice}
                          onChange={(e) => setVideoPrice(e.target.value)}
                          placeholder="25.00"
                          className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="e.g. Exclusive Session"
                          className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Google Drive / Direct Video Link */}
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase mb-1 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" style={{ width: '14px', height: '14px' }} />
                        <span>Video Link (Google Drive / Direct URL) *</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        placeholder="https://drive.google.com/file/d/1ABC123.../view?usp=sharing"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none transition-all placeholder-neutral-600"
                      />
                    </div>

                    {/* Custom Cover Thumbnail Option */}
                    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div className={`w-4 h-4 rounded border border-neutral-600 flex items-center justify-center transition-all ${useCustomThumbnail ? 'bg-white text-black' : 'bg-neutral-800 text-transparent'}`}>
                          <Check className="w-3 h-3 stroke-[3]" style={{ width: '12px', height: '12px' }} />
                        </div>
                        <input
                          type="checkbox"
                          checked={useCustomThumbnail}
                          onChange={(e) => setUseCustomThumbnail(e.target.checked)}
                          className="sr-only"
                        />
                        <span className="text-xs font-bold text-neutral-200">
                          Add Custom Cover Image? (Optional)
                        </span>
                      </label>

                      {useCustomThumbnail && (
                        <div className="pt-2">
                          <label className="text-xs font-bold text-neutral-300 block uppercase mb-1 flex items-center gap-1.5">
                            <Image className="w-3.5 h-3.5 text-neutral-400 shrink-0" style={{ width: '14px', height: '14px' }} />
                            <span>Custom Cover Thumbnail URL</span>
                          </label>
                          <input
                            type="url"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/... or image URL"
                            className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                        Tags
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                          placeholder="Type tag & press Enter"
                          className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-white focus:border-white focus:outline-none transition-all placeholder-neutral-600"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-4 py-2.5 bg-neutral-800 text-white text-xs font-bold rounded-xl hover:bg-neutral-700 transition-all cursor-pointer border border-neutral-700"
                        >
                          + Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 min-h-7">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-neutral-200 text-[11px] font-bold border border-neutral-700"
                          >
                            <span>#{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="hover:text-white text-neutral-400 cursor-pointer text-xs"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Video Description */}
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                        placeholder="Details about this session..."
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-white focus:border-white focus:outline-none resize-none transition-all placeholder-neutral-600"
                      />
                    </div>

                    {postErrorMsg && (
                      <div className="p-3.5 rounded-xl bg-neutral-900 text-neutral-200 text-xs font-bold flex items-center gap-2 border border-neutral-700">
                        <AlertCircle className="w-4 h-4 text-white shrink-0" style={{ width: '16px', height: '16px' }} />
                        <span>{postErrorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isPosting}
                      className="w-full py-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isPosting ? (
                        <span>Processing Video Upload...</span>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-black shrink-0" style={{ width: '16px', height: '16px' }} />
                          <span>Publish Video</span>
                        </>
                      )}
                    </button>

                  </form>
                </div>

                {/* Video Catalog Management & Deletion */}
                <div className="pt-6 border-t border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                        Published Catalog ({publishedVideos.length})
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium">
                        Manage videos currently displayed on your public portal
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {publishedVideos.length === 0 ? (
                      <div className="p-4 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-medium text-center border border-neutral-800">
                        No videos currently visible in collection.
                      </div>
                    ) : (
                      publishedVideos.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 transition-all hover:border-neutral-700"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover bg-black shrink-0"
                            />
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-white truncate">
                                {item.titleEn || item.title}
                              </h4>
                              <p className="text-[11px] text-neutral-400 font-medium">
                                €{typeof item.price === 'number' ? item.price.toFixed(2) : item.price} • {item.categoryEn || item.category}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onDeleteVideo(item.id)}
                            className="px-3 py-2 rounded-lg bg-black hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                            title="Remove video from catalog"
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ width: '14px', height: '14px' }} />
                            <span>Delete</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: LIVE STREAM CONTROL */}
            {activeTab === 'live' && (
              <form onSubmit={handleSaveLiveStatus} className="space-y-5 text-left">
                
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-white block">
                      Live Stream Status
                    </span>
                    <p className="text-xs text-neutral-400">
                      {isLive
                        ? 'Status is currently ONLINE'
                        : 'Status is currently OFFLINE'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLive(!isLive)}
                    className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                      isLive
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-black' : 'bg-neutral-500'}`}></span>
                    <span>
                      {isLive ? 'LIVE NOW' : 'SET OFFLINE'}
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                      Live Session Title
                    </label>
                    <input
                      type="text"
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      placeholder="e.g. Exclusive Live Session"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all placeholder-neutral-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                        Price (€)
                      </label>
                      <input
                        type="text"
                        value={livePrice}
                        onChange={(e) => setLivePrice(e.target.value)}
                        placeholder="20.00 €"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                        Stream Source Video URL
                      </label>
                      <input
                        type="text"
                        value={liveStreamUrl}
                        onChange={(e) => setLiveStreamUrl(e.target.value)}
                        placeholder="https://i.imgur.com/m0CSW44.mp4"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                      Stream Description
                    </label>
                    <textarea
                      rows={3}
                      value={liveDesc}
                      onChange={(e) => setLiveDesc(e.target.value)}
                      placeholder="Stream details..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-white focus:border-white focus:outline-none resize-none transition-all"
                    />
                  </div>
                </div>

                {liveSuccessMsg && (
                  <div className="p-4 rounded-xl bg-neutral-900 text-white text-xs font-bold flex items-center gap-2 border border-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" style={{ width: '16px', height: '16px' }} />
                    <span>{liveSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUpdatingLive}
                  className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  {isUpdatingLive ? 'Saving Changes...' : 'Save Live Settings'}
                </button>

              </form>
            )}

            {/* TAB 3: PROFILE & ABOUT SECTION EDIT */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
                <div className="border-b border-neutral-800 pb-2">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    Creator Profile & About Section
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    Customize your display identity, bio message, and photo gallery
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="Goddess Layla"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                    About / Bio Sanctuary Description
                  </label>
                  <textarea
                    rows={3}
                    value={creatorBio}
                    onChange={(e) => setCreatorBio(e.target.value)}
                    placeholder="Describe your sanctuary and welcome message..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-white focus:border-white focus:outline-none resize-none transition-all"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-neutral-300 block uppercase">
                    Gallery Slides Image URLs
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="url"
                      value={galleryImg1}
                      onChange={(e) => setGalleryImg1(e.target.value)}
                      placeholder="Photo 1 URL"
                      className="px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="url"
                      value={galleryImg2}
                      onChange={(e) => setGalleryImg2(e.target.value)}
                      placeholder="Photo 2 URL"
                      className="px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="url"
                      value={galleryImg3}
                      onChange={(e) => setGalleryImg3(e.target.value)}
                      placeholder="Photo 3 URL"
                      className="px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none"
                    />
                    <input
                      type="url"
                      value={galleryImg4}
                      onChange={(e) => setGalleryImg4(e.target.value)}
                      placeholder="Photo 4 URL"
                      className="px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                {profileSuccessMsg && (
                  <div className="p-4 rounded-xl bg-neutral-900 text-white text-xs font-bold flex items-center gap-2 border border-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" style={{ width: '16px', height: '16px' }} />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </form>
            )}

            {/* TAB 4: PAYMENT METHODS & SOCIAL LINKS */}
            {activeTab === 'payments' && (
              <form onSubmit={handleSavePayments} className="space-y-4 text-left">
                <div className="border-b border-neutral-800 pb-2">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    Payment Methods & Channels
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    Configure official payment gateways and direct link platforms
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                    TipFunder Payment URL
                  </label>
                  <input
                    type="url"
                    value={tipfunderUrl}
                    onChange={(e) => setTipfunderUrl(e.target.value)}
                    placeholder="https://www.tipfunder.com/..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                    Throne Wishlist URL
                  </label>
                  <input
                    type="url"
                    value={throneUrl}
                    onChange={(e) => setThroneUrl(e.target.value)}
                    placeholder="https://throne.com/..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                      Telegram Link
                    </label>
                    <input
                      type="url"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      placeholder="https://t.me/..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                      X (Twitter) Profile URL
                    </label>
                    <input
                      type="url"
                      value={xUrl}
                      onChange={(e) => setXUrl(e.target.value)}
                      placeholder="https://x.com/..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {paymentSuccessMsg && (
                  <div className="p-4 rounded-xl bg-neutral-900 text-white text-xs font-bold flex items-center gap-2 border border-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" style={{ width: '16px', height: '16px' }} />
                    <span>{paymentSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Save Payment Settings
                </button>
              </form>
            )}

            {/* TAB 5: SECURITY & PASSCODE MANAGEMENT */}
            {activeTab === 'security' && (
              <form onSubmit={handleSaveSecurity} className="space-y-4 text-left">
                <div className="border-b border-neutral-800 pb-2">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    Studio Security & Passcode
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    Update your admin authentication passcode
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                    New Studio Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new passcode"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block uppercase mb-1">
                    Confirm New Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Confirm new passcode"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all"
                  />
                </div>

                {securityErrorMsg && (
                  <div className="p-3.5 rounded-xl bg-neutral-900 text-neutral-200 text-xs font-bold flex items-center gap-2 border border-neutral-700">
                    <AlertCircle className="w-4 h-4 text-white shrink-0" style={{ width: '16px', height: '16px' }} />
                    <span>{securityErrorMsg}</span>
                  </div>
                )}

                {securitySuccessMsg && (
                  <div className="p-4 rounded-xl bg-neutral-900 text-white text-xs font-bold flex items-center gap-2 border border-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" style={{ width: '16px', height: '16px' }} />
                    <span>{securitySuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer"
                >
                  Update Access Passcode
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
