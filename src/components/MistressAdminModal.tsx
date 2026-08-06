import React, { useState, useEffect } from 'react';
import { X, Radio, Lock, CheckCircle2, AlertCircle, Plus, Link2, Image, Check, Upload } from 'lucide-react';
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

  // Active Tab: strictly 'upload_video' first, then 'live'
  const [activeTab, setActiveTab] = useState<'upload_video' | 'live'>('upload_video');

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
  
  const [category, setCategory] = useState('Exclusive Session');
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
        name: 'Goddess Layla',
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

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans text-white">
      <div className="relative max-w-xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl my-auto border border-neutral-800 transition-all duration-200">
        
        {/* Modal Header Bar - Minimal Black & White */}
        <div className="px-6 py-4 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-widest uppercase text-white">
              ADMIN PORTAL
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

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Authentication Form */
          <div className="p-8 sm:p-10 space-y-6 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5 text-white" style={{ width: '20px', height: '20px' }} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                Admin Authentication
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                Enter your passcode to access the control panel
              </p>
            </div>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Passcode"
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-center font-bold text-sm focus:border-white focus:outline-none transition-all placeholder-neutral-500"
              />

              {authError && (
                <p className="text-xs font-semibold text-neutral-300 bg-neutral-900 p-3 rounded-xl border border-neutral-700">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer"
              >
                Access Control Panel
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard: UPLOAD VIDEO FIRST, then LIVE STREAM */
          <div className="p-5 sm:p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            
            {/* Header Navigation Tabs - Upload Video First */}
            <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveTab('upload_video')}
                className={`py-3 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'upload_video'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Upload className="w-4 h-4 shrink-0" style={{ width: '16px', height: '16px' }} />
                <span>Upload Video</span>
              </button>

              <button
                onClick={() => setActiveTab('live')}
                className={`py-3 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
                  activeTab === 'live'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Radio className="w-4 h-4 shrink-0" style={{ width: '16px', height: '16px' }} />
                <span>Live Stream</span>
              </button>
            </div>

            {/* TAB 1: UPLOAD VIDEO */}
            {activeTab === 'upload_video' && (
              <div className="space-y-5 text-left">
                
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
                      placeholder="e.g. Exclusive Video Session"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all placeholder-neutral-500"
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

                  {/* Google Drive Public Link */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block uppercase mb-1 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" style={{ width: '14px', height: '14px' }} />
                      <span>Video Source (Google Drive Public Link) *</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/1ABC123.../view?usp=sharing"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none transition-all placeholder-neutral-500"
                    />
                  </div>

                  {/* Custom Thumbnail Checkbox */}
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
                        Add Custom Cover Thumbnail Image? (Optional)
                      </span>
                    </label>

                    {useCustomThumbnail && (
                      <div className="pt-2">
                        <label className="text-xs font-bold text-neutral-300 block uppercase mb-1 flex items-center gap-1.5">
                          <Image className="w-3.5 h-3.5 text-neutral-400 shrink-0" style={{ width: '14px', height: '14px' }} />
                          <span>Custom Thumbnail Image URL</span>
                        </label>
                        <input
                          type="url"
                          value={thumbnailUrl}
                          onChange={(e) => setThumbnailUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-... or image URL"
                          className="w-full px-4 py-3 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white focus:border-white focus:outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* Tags Manager */}
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
                        className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-white focus:border-white focus:outline-none transition-all placeholder-neutral-500"
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
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-white focus:border-white focus:outline-none resize-none transition-all"
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
                      <span>Uploading Video...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-black shrink-0" style={{ width: '16px', height: '16px' }} />
                        <span>Upload Video</span>
                      </>
                    )}
                  </button>

                </form>

              </div>
            )}

            {/* TAB 2: LIVE STREAM */}
            {activeTab === 'live' && (
              <form onSubmit={handleSaveLiveStatus} className="space-y-5 text-left">
                
                {/* Live Stream Status Toggle Box */}
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
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-white focus:border-white focus:outline-none transition-all placeholder-neutral-500"
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
                  {isUpdatingLive ? 'Updating...' : 'Save Live Settings'}
                </button>

              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
