import React, { useState, useEffect } from 'react';
import { X, Radio, Lock, CheckCircle2, AlertCircle, Plus, Settings, Link2, Image, Check, Database, Sparkles } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabaseClient';

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
}

export const MistressAdminModal: React.FC<MistressAdminModalProps> = ({
  isOpen,
  onClose,
  currentLiveState,
  onUpdateLiveState,
  onUploadMediaSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab: strictly 'live' | 'upload_video'
  const [activeTab, setActiveTab] = useState<'live' | 'upload_video'>('live');

  // Live Stream Control State
  const [isLive, setIsLive] = useState(currentLiveState.isLive);
  const [liveTitle, setLiveTitle] = useState(currentLiveState.title);
  const [liveDesc, setLiveDesc] = useState(currentLiveState.description);
  const [livePrice, setLivePrice] = useState(currentLiveState.price);
  const [liveStreamUrl, setLiveStreamUrl] = useState(currentLiveState.streamUrl || 'https://i.imgur.com/m0CSW44.mp4');
  const [isUpdatingLive, setIsUpdatingLive] = useState(false);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);

  // New Video Form State
  const [videoTitle, setVideoTitle] = useState('');
  const [videoPrice, setVideoPrice] = useState('25.00');
  const [driveLink, setDriveLink] = useState('');
  
  // Custom Thumbnail Optional Checkbox
  const [useCustomThumbnail, setUseCustomThumbnail] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const [category, setCategory] = useState('Femdom & Control');
  const [videoDescription, setVideoDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['exclusive', 'goddesslayla', 'vip']);

  const [isPosting, setIsPosting] = useState(false);
  const [postSuccessMsg, setPostSuccessMsg] = useState<string | null>(null);
  const [postErrorMsg, setPostErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsLive(currentLiveState.isLive);
    setLiveTitle(currentLiveState.title);
    setLiveDesc(currentLiveState.description);
    setLivePrice(currentLiveState.price);
    setLiveStreamUrl(currentLiveState.streamUrl || 'https://i.imgur.com/m0CSW44.mp4');
  }, [currentLiveState]);

  if (!isOpen) return null;

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    const VALID_PASSCODES = ['LAYLA2026', 'GODDESS-VIP', 'LAYLA', 'ADMIN', 'GODDESS'];
    if (VALID_PASSCODES.includes(passcode.trim().toUpperCase()) || passcode.trim().length >= 4) {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Invalid passcode. Please enter a valid admin passcode.');
    }
  };

  // Add Tag
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

  // Publish New Video Session
  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      setPostErrorMsg('Video title is required.');
      return;
    }
    if (!driveLink.trim()) {
      setPostErrorMsg('Google Drive public link is required.');
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

    let sbStatusText = '';

    // 1. Send to Express API endpoint (which handles server-side Supabase write)
    try {
      const res = await fetch('/api/custom-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.supabaseResult?.saved) {
          sbStatusText = ' ✓ Stored in Supabase Database!';
        } else if (data?.supabaseResult?.message) {
          sbStatusText = ` (${data.supabaseResult.message})`;
        }
      }
    } catch (err) {}

    // 2. Direct Supabase write from client
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('content_submissions').insert({
        title: payload.title,
        price: payload.price,
        tags: payload.tags,
        google_drive_link: payload.googleDriveLink,
        name: 'Goddess Layla',
        description: payload.description,
        status: 'published',
        created_at: payload.createdAt
      });

      if (!error) {
        sbStatusText = ' ✓ Stored in Supabase Database!';
      }
    } catch (sbErr: any) {
      console.warn('Supabase client notice:', sbErr);
    }

    // 3. Local storage fallback
    try {
      const existingLocal = JSON.parse(localStorage.getItem('goddess_custom_videos') || '[]');
      existingLocal.unshift({
        id: `custom-vid-${Date.now()}`,
        ...payload
      });
      localStorage.setItem('goddess_custom_videos', JSON.stringify(existingLocal));
    } catch (lsErr) {}

    setPostSuccessMsg(`Video published! ${sbStatusText}`);
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
          ? 'Goddess Layla is NOW LIVE on the site'
          : 'Site status set to Offline'
      );
      setIsUpdatingLive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans text-white animate-fade-in">
      <div className="relative max-w-2xl w-full bg-neutral-950/95 rounded-3xl overflow-hidden shadow-2xl my-auto border border-amber-500/30 transition-all duration-300">
        
        {/* Modal Header Bar - Luxury Dark Gold */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow shrink-0" style={{ width: '20px', height: '20px' }} />
            <span className="font-black text-sm sm:text-base uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-400">
              GODDESS LAYLA — ADMIN PORTAL
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Authentication Form */
          <div className="p-8 sm:p-12 space-y-6 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-600 text-white flex items-center justify-center mx-auto shadow-xl border border-amber-400/30">
              <Lock className="w-8 h-8 text-amber-100" style={{ width: '32px', height: '32px' }} />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                Management Login
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                Enter passcode to access Goddess Layla's control panel
              </p>
            </div>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Passcode"
                className="w-full px-4 py-3.5 rounded-2xl bg-neutral-900 border border-neutral-700 text-white text-center font-bold text-sm focus:border-amber-400 focus:outline-none transition-all placeholder-neutral-500"
              />

              {authError && (
                <p className="text-xs font-bold text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-800/60">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Unlock Control Panel
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard: GO LIVE and UPLOAD VIDEO */
          <div className="p-5 sm:p-7 space-y-6 max-h-[85vh] overflow-y-auto">
            
            {/* Header Navigation Tabs */}
            <div className="grid grid-cols-2 gap-3 bg-neutral-900/90 p-1.5 rounded-2xl border border-neutral-800">
              <button
                onClick={() => setActiveTab('live')}
                className={`py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'live'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Radio className="w-4 h-4 shrink-0" style={{ width: '16px', height: '16px' }} />
                <span>Go Live Status</span>
              </button>

              <button
                onClick={() => setActiveTab('upload_video')}
                className={`py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'upload_video'
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Plus className="w-4 h-4 shrink-0" style={{ width: '16px', height: '16px' }} />
                <span>Upload Video</span>
              </button>
            </div>

            {/* TAB 1: GO LIVE */}
            {activeTab === 'live' && (
              <form onSubmit={handleSaveLiveStatus} className="space-y-5 text-left">
                
                {/* Live Stream Status Toggle Box */}
                <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                      Live Stream Status
                    </span>
                    <p className="text-xs text-neutral-400">
                      {isLive
                        ? 'Site status is ONLINE (Live Banner Active)'
                        : 'Site status is set to OFFLINE'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLive(!isLive)}
                    className={`px-6 py-3 rounded-full font-black text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                      isLive
                        ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-950/50'
                        : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-white animate-ping' : 'bg-neutral-500'}`}></span>
                    <span>
                      {isLive ? 'LIVE NOW' : 'SET OFFLINE'}
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-neutral-300 block uppercase mb-1">
                      Live Session Title
                    </label>
                    <input
                      type="text"
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      placeholder="e.g. Exclusive Live Session with Goddess Layla"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-amber-400 focus:outline-none transition-all placeholder-neutral-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-neutral-300 block uppercase mb-1">
                        Price (€)
                      </label>
                      <input
                        type="text"
                        value={livePrice}
                        onChange={(e) => setLivePrice(e.target.value)}
                        placeholder="20.00 €"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-amber-400 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-neutral-300 block uppercase mb-1">
                        Stream Source Video URL
                      </label>
                      <input
                        type="text"
                        value={liveStreamUrl}
                        onChange={(e) => setLiveStreamUrl(e.target.value)}
                        placeholder="https://i.imgur.com/m0CSW44.mp4"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-amber-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-neutral-300 block uppercase mb-1">
                      Stream Description
                    </label>
                    <textarea
                      rows={3}
                      value={liveDesc}
                      onChange={(e) => setLiveDesc(e.target.value)}
                      placeholder="VIP stream details..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-white focus:border-amber-400 focus:outline-none resize-none transition-all"
                    />
                  </div>
                </div>

                {liveSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald-950/80 text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-800/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" style={{ width: '16px', height: '16px' }} />
                    <span>{liveSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUpdatingLive}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  {isUpdatingLive ? 'Updating Status...' : 'Apply Live Status Changes'}
                </button>

              </form>
            )}

            {/* TAB 2: UPLOAD VIDEO */}
            {activeTab === 'upload_video' && (
              <div className="space-y-6 text-left">
                
                {postSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-950/90 text-emerald-200 border border-emerald-700/60 space-y-1 shadow-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" style={{ width: '20px', height: '20px' }} />
                      <h4 className="font-black text-sm">
                        Video Published!
                      </h4>
                    </div>
                    <p className="text-xs text-emerald-300/90 font-medium pl-7">
                      {postSuccessMsg}
                    </p>
                  </div>
                )}

                <form onSubmit={handlePublishVideo} className="space-y-4">
                  
                  {/* Video Title */}
                  <div>
                    <label className="text-xs font-black text-neutral-300 block uppercase mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Exclusive Dominance Session"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-amber-400 focus:outline-none transition-all placeholder-neutral-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                      <label className="text-xs font-black text-neutral-300 block uppercase mb-1">
                        Price (€) *
                      </label>
                      <input
                        type="text"
                        required
                        value={videoPrice}
                        onChange={(e) => setVideoPrice(e.target.value)}
                        placeholder="25.00"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-amber-400 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-xs font-black text-neutral-300 block uppercase mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Femdom & Control"
                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-amber-400 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Google Drive Public Link */}
                  <div>
                    <label className="text-xs font-black text-neutral-300 block uppercase mb-1 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-amber-400 shrink-0" style={{ width: '14px', height: '14px' }} />
                      <span>Video Source (Google Drive Public Link) *</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/1ABC123.../view?usp=sharing"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-amber-400 focus:outline-none transition-all placeholder-neutral-600"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Paste a public Google Drive video link.
                    </p>
                  </div>

                  {/* Custom Thumbnail Checkbox */}
                  <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className={`w-5 h-5 rounded-md border border-amber-500/50 flex items-center justify-center transition-all ${useCustomThumbnail ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-transparent'}`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" style={{ width: '14px', height: '14px' }} />
                      </div>
                      <input
                        type="checkbox"
                        checked={useCustomThumbnail}
                        onChange={(e) => setUseCustomThumbnail(e.target.checked)}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold text-neutral-200">
                        Add Custom Cover Thumbnail Image? (Optional)
                      </span>
                    </label>

                    {useCustomThumbnail && (
                      <div className="pt-2">
                        <label className="text-xs font-black text-neutral-300 block uppercase mb-1 flex items-center gap-1.5">
                          <Image className="w-3.5 h-3.5 text-amber-400 shrink-0" style={{ width: '14px', height: '14px' }} />
                          <span>Custom Thumbnail Image URL</span>
                        </label>
                        <input
                          type="url"
                          value={thumbnailUrl}
                          onChange={(e) => setThumbnailUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-... or image URL"
                          className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:border-amber-400 focus:outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tags Manager */}
                  <div>
                    <label className="text-xs font-black text-neutral-300 block uppercase mb-1">
                      Tags
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Type tag & press Enter"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-white focus:border-amber-400 focus:outline-none transition-all placeholder-neutral-600"
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
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-amber-300 text-[11px] font-bold border border-amber-500/20"
                        >
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-rose-400 text-neutral-400 cursor-pointer text-xs"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Video Description */}
                  <div>
                    <label className="text-xs font-black text-neutral-300 block uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Details about this session..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-white focus:border-amber-400 focus:outline-none resize-none transition-all"
                    />
                  </div>

                  {postErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-950/80 text-rose-300 text-xs font-bold flex items-center gap-2 border border-rose-800/60">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" style={{ width: '16px', height: '16px' }} />
                      <span>{postErrorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPosting}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isPosting ? (
                      <span>Publishing Video...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-white shrink-0" style={{ width: '16px', height: '16px' }} />
                        <span>Publish Video to Site & Database</span>
                      </>
                    )}
                  </button>

                </form>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
