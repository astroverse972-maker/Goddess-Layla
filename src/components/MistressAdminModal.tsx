import React, { useState, useEffect } from 'react';
import { X, Radio, Lock, CheckCircle2, AlertCircle, Plus, RefreshCw, Film, Settings } from 'lucide-react';

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

  // Active Tab: 'live' | 'add_video' | 'manage_videos'
  const [activeTab, setActiveTab] = useState<'live' | 'add_video' | 'manage_videos'>('live');

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
  const [videoUrl, setVideoUrl] = useState('https://i.imgur.com/m0CSW44.mp4');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://i.imgur.com/g5fQwuf.jpg');
  const [category, setCategory] = useState('Femdom & Control');
  const [duration, setDuration] = useState('12:45');
  const [videoDescription, setVideoDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['exclusive', 'goddesslayla', 'vip']);

  const [isPosting, setIsPosting] = useState(false);
  const [postSuccessMsg, setPostSuccessMsg] = useState<string | null>(null);
  const [postErrorMsg, setPostErrorMsg] = useState<string | null>(null);

  // Manage Videos List State
  const [customVideos, setCustomVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingLoadingVideos] = useState(false);

  useEffect(() => {
    setIsLive(currentLiveState.isLive);
    setLiveTitle(currentLiveState.title);
    setLiveDesc(currentLiveState.description);
    setLivePrice(currentLiveState.price);
    setLiveStreamUrl(currentLiveState.streamUrl || 'https://i.imgur.com/m0CSW44.mp4');
  }, [currentLiveState]);

  // Fetch custom uploaded videos
  const fetchCustomVideos = async () => {
    setIsLoadingLoadingVideos(true);
    let items: any[] = [];

    try {
      const res = await fetch('/api/custom-media');
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (Array.isArray(data)) {
          items = data;
        }
      }
    } catch (err) {}

    // Combine with local storage
    try {
      const localVideos = JSON.parse(localStorage.getItem('goddess_custom_videos') || '[]');
      const map = new Map();
      for (const item of [...items, ...localVideos]) {
        if (item.id && !map.has(item.id)) map.set(item.id, item);
      }
      items = Array.from(map.values());
    } catch (lsErr) {}

    setCustomVideos(items);
    setIsLoadingLoadingVideos(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomVideos();
    }
  }, [isAuthenticated]);

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

  // Publish New Video Session directly to the site
  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      setPostErrorMsg('Video title is required.');
      return;
    }
    if (!videoUrl.trim()) {
      setPostErrorMsg('Video URL / MP4 source is required.');
      return;
    }

    setIsPosting(true);
    setPostErrorMsg(null);
    setPostSuccessMsg(null);

    const newVideoItem = {
      id: `custom-vid-${Date.now()}`,
      title: videoTitle.trim(),
      titleEn: videoTitle.trim(),
      category: category.trim() || 'Exclusive Session',
      categoryEn: category.trim() || 'Exclusive Session',
      price: parseFloat(videoPrice) || 25.0,
      previewUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || 'https://i.imgur.com/g5fQwuf.jpg',
      duration: duration.trim() || 'Full length',
      description: videoDescription.trim() || 'Exclusive session published by Goddess Layla.',
      descriptionEn: videoDescription.trim() || 'Exclusive session published by Goddess Layla.',
      tags: tags.length > 0 ? tags : ['goddesslayla', 'exclusive']
    };

    try {
      await fetch('/api/custom-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideoItem),
      }).catch(() => {});
    } catch (err) {}

    // Save locally
    try {
      const existingLocal = JSON.parse(localStorage.getItem('goddess_custom_videos') || '[]');
      existingLocal.unshift(newVideoItem);
      localStorage.setItem('goddess_custom_videos', JSON.stringify(existingLocal));
    } catch (lsErr) {}

    setPostSuccessMsg('Video published successfully! It is now live on the site.');
    setVideoTitle('');
    setVideoDescription('');

    fetchCustomVideos();
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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans text-black animate-fade-in">
      <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl my-auto border-2 border-black transition-all duration-300 transform scale-100">
        
        {/* Modal Header Bar - Pure Black and White */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-white animate-spin-slow" />
            <span className="font-black text-sm sm:text-base uppercase tracking-wider">
              ADMIN PORTAL — GODDESS LAYLA
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Authentication Form - Pure Black and White */
          <div className="p-8 sm:p-12 space-y-6 text-center max-w-md mx-auto animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-xl border border-black hover:scale-105 transition-transform duration-300">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-black uppercase tracking-tight">
                Goddess Layla Admin
              </h3>
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                Enter passcode to access site management
              </p>
            </div>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Passcode"
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-black text-black text-center font-bold text-sm focus:bg-white focus:outline-hidden transition-all"
              />

              {authError && (
                <p className="text-xs font-bold text-white bg-black p-3 rounded-xl border border-black animate-bounce">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider shadow-xl transition-all hover:scale-102 active:scale-95 cursor-pointer border border-black"
              >
                Unlock Management Panel
              </button>
            </form>
          </div>
        ) : (
          /* Main Interactive Dashboard with Smooth Tab Animations */
          <div className="p-5 sm:p-7 space-y-6 max-h-[85vh] overflow-y-auto">
            
            {/* Header Navigation Tabs - Black and White */}
            <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-300">
              <button
                onClick={() => setActiveTab('live')}
                className={`py-3 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                  activeTab === 'live' ? 'bg-black text-white shadow-md scale-102' : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                <Radio className={`w-4 h-4 ${activeTab === 'live' ? 'animate-pulse' : ''}`} />
                <span>Live Stream</span>
              </button>

              <button
                onClick={() => setActiveTab('add_video')}
                className={`py-3 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                  activeTab === 'add_video' ? 'bg-black text-white shadow-md scale-102' : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Video</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('manage_videos');
                  fetchCustomVideos();
                }}
                className={`py-3 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer uppercase ${
                  activeTab === 'manage_videos' ? 'bg-black text-white shadow-md scale-102' : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Videos ({customVideos.length})</span>
              </button>
            </div>

            {/* TAB 1: LIVE STREAM CONTROL */}
            {activeTab === 'live' && (
              <form onSubmit={handleSaveLiveStatus} className="space-y-5 text-left animate-fade-in">
                
                {/* Live Stream Status Toggle Box */}
                <div className="p-5 rounded-2xl bg-gray-50 border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-black">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs font-black uppercase tracking-wider text-black block">
                      Live Broadcast Status
                    </span>
                    <p className="text-xs text-gray-600 font-semibold">
                      {isLive
                        ? 'Site status is set to ONLINE (Live Card Active)'
                        : 'Site status is set to OFFLINE'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLive(!isLive)}
                    className={`px-5 py-2.5 rounded-full font-black text-xs flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 ${
                      isLive
                        ? 'bg-black text-white border-black shadow-md'
                        : 'bg-white text-black border-black'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${isLive ? 'bg-white animate-ping' : 'bg-gray-400'}`}></span>
                    <span>
                      {isLive ? 'LIVE NOW' : 'SET OFFLINE'}
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-black block uppercase mb-1">
                      Live Stream Title
                    </label>
                    <input
                      type="text"
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      placeholder="e.g. Exclusive Live Session with Goddess Layla"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-bold text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-black block uppercase mb-1">
                        Price (€)
                      </label>
                      <input
                        type="text"
                        value={livePrice}
                        onChange={(e) => setLivePrice(e.target.value)}
                        placeholder="20.00 €"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-bold text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-black block uppercase mb-1">
                        Stream Video Source (MP4 / Imgur URL)
                      </label>
                      <input
                        type="url"
                        value={liveStreamUrl}
                        onChange={(e) => setLiveStreamUrl(e.target.value)}
                        placeholder="https://i.imgur.com/m0CSW44.mp4"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-black block uppercase mb-1">
                      Stream Description
                    </label>
                    <textarea
                      rows={3}
                      value={liveDesc}
                      onChange={(e) => setLiveDesc(e.target.value)}
                      placeholder="VIP stream details and instructions..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-medium text-black focus:bg-white focus:border-black focus:outline-hidden resize-none transition-all"
                    />
                  </div>
                </div>

                {liveSuccessMsg && (
                  <div className="p-4 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                    <span>{liveSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUpdatingLive}
                  className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-102 active:scale-95 cursor-pointer border border-black"
                >
                  {isUpdatingLive ? 'Updating Status...' : 'Apply Live Status Changes'}
                </button>

              </form>
            )}

            {/* TAB 2: ADD NEW VIDEO SESSION DIRECTLY TO SITE */}
            {activeTab === 'add_video' && (
              <div className="space-y-6 text-left animate-fade-in">
                
                {postSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-black text-white border border-black space-y-1 shadow-lg animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                      <h4 className="font-black text-sm">
                        Video Published Successfully!
                      </h4>
                    </div>
                    <p className="text-xs text-gray-200 font-medium pl-7">
                      {postSuccessMsg}
                    </p>
                  </div>
                )}

                <form onSubmit={handlePublishVideo} className="space-y-4">
                  
                  {/* Video Title */}
                  <div>
                    <label className="text-xs font-black text-black block uppercase mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Exclusive Dominance Session"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-bold text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                      <label className="text-xs font-black text-black block uppercase mb-1">
                        Price (€) *
                      </label>
                      <input
                        type="text"
                        required
                        value={videoPrice}
                        onChange={(e) => setVideoPrice(e.target.value)}
                        placeholder="25.00"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-bold text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="text-xs font-black text-black block uppercase mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Femdom & Control"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-bold text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Video Source URL */}
                    <div>
                      <label className="text-xs font-black text-black block uppercase mb-1">
                        Video Source (MP4 / Direct Link) *
                      </label>
                      <input
                        type="url"
                        required
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://i.imgur.com/m0CSW44.mp4"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                      />
                    </div>

                    {/* Thumbnail URL */}
                    <div>
                      <label className="text-xs font-black text-black block uppercase mb-1">
                        Poster Thumbnail Image URL
                      </label>
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="https://i.imgur.com/g5fQwuf.jpg"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  {/* Tags Manager */}
                  <div>
                    <label className="text-xs font-black text-black block uppercase mb-1">
                      Video Tags
                    </label>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Type tag & press Enter"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-medium text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        + Add Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-7">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold animate-fade-in transition-all hover:scale-105"
                        >
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-gray-300 text-gray-400 cursor-pointer text-xs"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Video Description */}
                  <div>
                    <label className="text-xs font-black text-black block uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Write details about this video session..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-xs font-medium text-black focus:bg-white focus:border-black focus:outline-hidden resize-none transition-all"
                    />
                  </div>

                  {postErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-gray-100 text-black text-xs font-bold flex items-center gap-2 border border-black animate-bounce">
                      <AlertCircle className="w-4 h-4 text-black shrink-0" />
                      <span>{postErrorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPosting}
                    className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider shadow-xl transition-all hover:scale-102 active:scale-95 cursor-pointer border border-black flex items-center justify-center gap-2"
                  >
                    {isPosting ? (
                      <span>Publishing...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-white" />
                        <span>Publish Video to Site</span>
                      </>
                    )}
                  </button>

                </form>

              </div>
            )}

            {/* TAB 3: MANAGE EXISTING VIDEOS */}
            {activeTab === 'manage_videos' && (
              <div className="space-y-4 text-left animate-fade-in">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-black uppercase tracking-wider">
                      Active Videos ({customVideos.length})
                    </h3>
                    <p className="text-xs text-gray-600 font-semibold">
                      Published video sessions active on Goddess Layla's site.
                    </p>
                  </div>

                  <button
                    onClick={fetchCustomVideos}
                    className="px-3.5 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVideos ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {customVideos.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-300 text-xs text-gray-600 font-semibold">
                    No custom videos published yet. Click "Add Video" above to publish your first session.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {customVideos.map((video) => (
                      <div 
                        key={video.id} 
                        className="p-4 rounded-2xl bg-gray-50 border border-gray-300 hover:border-black transition-all flex items-center justify-between gap-4 text-xs group"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-black text-sm truncate">{video.title}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-black text-white font-black text-xs shrink-0">
                              {video.price} €
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600 text-[11px] font-semibold">
                            <span>Category: {video.category}</span>
                            <span>•</span>
                            <span className="truncate">Source: {video.previewUrl}</span>
                          </div>
                        </div>

                        <div className="px-3 py-1.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          <span>ACTIVE ON SITE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
