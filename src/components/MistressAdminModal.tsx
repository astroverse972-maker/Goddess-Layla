import React, { useState, useEffect } from 'react';
import { X, Crown, Radio, Upload, Lock, CheckCircle2, AlertCircle, ExternalLink, Tag, FolderPlus, Copy, RefreshCw } from 'lucide-react';

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

  // Active Tab: 'upload' | 'submissions' | 'live'
  const [activeTab, setActiveTab] = useState<'upload' | 'submissions' | 'live'>('upload');

  // Live Stream Control State
  const [isLive, setIsLive] = useState(currentLiveState.isLive);
  const [liveTitle, setLiveTitle] = useState(currentLiveState.title);
  const [liveDesc, setLiveDesc] = useState(currentLiveState.description);
  const [livePrice, setLivePrice] = useState(currentLiveState.price);
  const [liveStreamUrl, setLiveStreamUrl] = useState(currentLiveState.streamUrl);
  const [isUpdatingLive, setIsUpdatingLive] = useState(false);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);

  // Content Submission Form State
  const [creatorName, setCreatorName] = useState('Goddess Layla');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoPrice, setVideoPrice] = useState('25.00');
  const [driveLink, setDriveLink] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['femdom', 'exclusive', 'vip']);
  const [videoDescription, setVideoDescription] = useState('');

  const [isPosting, setIsPosting] = useState(false);
  const [postSuccessMsg, setPostSuccessMsg] = useState<string | null>(null);
  const [postErrorMsg, setPostErrorMsg] = useState<string | null>(null);

  // Backend Submissions List State
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [copiedLinkMsg, setCopiedLinkMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsLive(currentLiveState.isLive);
    setLiveTitle(currentLiveState.title);
    setLiveDesc(currentLiveState.description);
    setLivePrice(currentLiveState.price);
    setLiveStreamUrl(currentLiveState.streamUrl);
  }, [currentLiveState]);

  // Fetch submitted Google Drive links from backend API
  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch('/api/admin/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissionsList(data.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [isAuthenticated]);

  if (!isOpen) return null;

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim().toUpperCase();
    if (cleanPass === 'LAYLA2026' || cleanPass === 'GODDESS-VIP' || cleanPass === 'INAYA2026' || cleanPass === 'REINE-VIP') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect secret passcode. Default code: LAYLA2026');
    }
  };

  // Tag Management Functions
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Submit Content to Backend API
  const handlePostContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      setPostErrorMsg('Please provide a title for your video content.');
      return;
    }
    if (!driveLink.trim()) {
      setPostErrorMsg("Please paste your content's Google Drive link.");
      return;
    }

    setIsPosting(true);
    setPostErrorMsg(null);
    setPostSuccessMsg(null);

    try {
      const res = await fetch('/api/content-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: creatorName.trim() || 'Goddess Layla',
          title: videoTitle.trim(),
          price: videoPrice.trim() || '20.00',
          tags,
          googleDriveLink: driveLink.trim(),
          description: videoDescription.trim()
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Set exact message requested by user
        setPostSuccessMsg('Thank for uploading, your content should be visible within 10 minutes ');
        
        // Reset form inputs for next upload
        setVideoTitle('');
        setDriveLink('');
        setVideoDescription('');

        fetchSubmissions();
        onUploadMediaSuccess();
      } else {
        setPostErrorMsg(data.error || 'Failed to post content to backend.');
      }
    } catch (err) {
      setPostErrorMsg('Network error connecting to backend server.');
    } finally {
      setIsPosting(false);
    }
  };

  // Save Live Stream Control
  const handleSaveLiveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingLive(true);
    setLiveSuccessMsg(null);

    try {
      const res = await fetch('/api/live-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: passcode || 'LAYLA2026',
          isLive,
          title: liveTitle,
          description: liveDesc,
          price: livePrice,
          streamUrl: liveStreamUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onUpdateLiveState(data.liveState);
        setLiveSuccessMsg(
          data.liveState.isLive
            ? 'Goddess Layla is NOW LIVE on the site'
            : 'Site status set to Offline'
        );
      } else {
        alert(data.error || 'Error updating live status');
      }
    } catch (err) {
      alert('Connection error');
    } finally {
      setIsUpdatingLive(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkMsg(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedLinkMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans text-black">
      <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl my-auto border border-black">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-sm sm:text-base uppercase tracking-wider">
              GODDESS LAYLA — ADMIN PORTAL
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Authentication Form */
          <div className="p-8 space-y-6 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-xl border border-black">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-black uppercase tracking-tight">
                Goddess Layla Portal
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Enter your secret passcode to access content management.
              </p>
            </div>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Secret Passcode (e.g. LAYLA2026)"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-300 text-black text-center font-bold text-sm focus:border-black focus:outline-hidden"
              />

              {authError && (
                <p className="text-xs font-semibold text-white bg-black p-2.5 rounded-xl border border-black">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer border border-black"
              >
                Unlock Management Panel
              </button>
            </form>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="p-5 sm:p-7 space-y-6 max-h-[85vh] overflow-y-auto">
            
            {/* Header Navigation Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'upload' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:text-black'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Post Content</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('submissions');
                  fetchSubmissions();
                }}
                className={`py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'submissions' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:text-black'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Drive Submissions ({submissionsList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('live')}
                className={`py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'live' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:text-black'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Live Status</span>
              </button>
            </div>

            {/* TAB 1: POST NEW GOOGLE DRIVE CONTENT */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                
                {/* Confirmation Success Message Banner */}
                {postSuccessMsg && (
                  <div className="p-5 rounded-2xl bg-black text-white border border-black space-y-2 shadow-xl animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <h4 className="font-extrabold text-sm sm:text-base">
                        Upload Submitted Successfully!
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-200 font-medium pl-7 leading-relaxed">
                      {postSuccessMsg}
                    </p>
                  </div>
                )}

                {/* Main Form + Live Preview Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column: Interactive Form */}
                  <form onSubmit={handlePostContent} className="space-y-4 text-left">
                    
                    {/* Creator Name */}
                    <div>
                      <label className="text-[11px] font-extrabold text-black block uppercase mb-1">
                        Creator Name
                      </label>
                      <input
                        type="text"
                        value={creatorName}
                        onChange={(e) => setCreatorName(e.target.value)}
                        placeholder="e.g. Goddess Layla"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-semibold text-black focus:bg-white focus:border-black focus:outline-hidden"
                      />
                    </div>

                    {/* Video Title */}
                    <div>
                      <label className="text-[11px] font-extrabold text-black block uppercase mb-1">
                        Video Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="e.g. Exclusive Femdom Control Session"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-semibold text-black focus:bg-white focus:border-black focus:outline-hidden"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="text-[11px] font-extrabold text-black block uppercase mb-1">
                        Price (€ / $) *
                      </label>
                      <input
                        type="text"
                        required
                        value={videoPrice}
                        onChange={(e) => setVideoPrice(e.target.value)}
                        placeholder="e.g. 25.00 €"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-semibold text-black focus:bg-white focus:border-black focus:outline-hidden"
                      />
                    </div>

                    {/* Google Drive Link */}
                    <div>
                      <label className="text-[11px] font-extrabold text-black block uppercase mb-1 flex items-center justify-between">
                        <span>Google Drive Content Link *</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Stored in Backend</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono text-black focus:bg-white focus:border-black focus:outline-hidden"
                      />
                    </div>

                    {/* Interactive Tags Manager */}
                    <div>
                      <label className="text-[11px] font-extrabold text-black block uppercase mb-1">
                        Write Video Tags
                      </label>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                          placeholder="Type tag & press Enter or Add"
                          className="flex-1 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-medium text-black focus:bg-white focus:border-black focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-3 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>

                      {/* Tag Chips list */}
                      <div className="flex flex-wrap items-center gap-1.5 min-h-8">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold shadow-2xs"
                          >
                            <span>#{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="hover:text-amber-400 text-gray-300 cursor-pointer text-xs"
                              title="Remove tag"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Video Description */}
                    <div>
                      <label className="text-[11px] font-extrabold text-black block uppercase mb-1">
                        Video Description / Details
                      </label>
                      <textarea
                        rows={2}
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                        placeholder="Provide details about this exclusive session..."
                        className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-300 text-xs font-medium text-black focus:bg-white focus:border-black focus:outline-hidden resize-none"
                      />
                    </div>

                    {postErrorMsg && (
                      <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold flex items-center gap-2 border border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{postErrorMsg}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isPosting}
                      className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-98 cursor-pointer border border-black flex items-center justify-center gap-2"
                    >
                      {isPosting ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-white" />
                          <span>Post Content</span>
                        </>
                      )}
                    </button>

                  </form>

                  {/* Right Column: Interactive Live Card Preview */}
                  <div className="space-y-3 bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block">
                      LIVE INTERACTIVE PREVIEW
                    </span>

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-md">
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-black uppercase bg-gray-100 px-2.5 py-0.5 rounded-full">
                          {creatorName || 'Goddess Layla'}
                        </span>
                        <span className="text-sm font-extrabold text-black">
                          {videoPrice ? `${videoPrice} €` : '20.00 €'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-black leading-snug">
                        {videoTitle || 'Title of your video will appear here'}
                      </h4>

                      <p className="text-xs text-gray-600 line-clamp-2">
                        {videoDescription || 'Description of your content session will appear here.'}
                      </p>

                      {/* Drive Link Badge */}
                      <div className="p-2 bg-gray-100 rounded-xl border border-gray-200 text-[11px] font-mono text-gray-700 truncate">
                        <span className="font-bold text-black block text-[10px] uppercase font-sans">
                          Connected Google Drive Link:
                        </span>
                        <span className="truncate block">
                          {driveLink || 'No Drive link attached yet'}
                        </span>
                      </div>

                      {/* Tag preview */}
                      <div className="flex flex-wrap items-center gap-1">
                        {tags.map((t) => (
                          <span key={t} className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>

                    </div>

                    <p className="text-[11px] text-gray-500 font-medium">
                      Pressing <strong>Post Content</strong> safely transfers the video title, price, tags, and Google Drive link directly to the backend database.
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: STORED GOOGLE DRIVE SUBMISSIONS LIST */}
            {activeTab === 'submissions' && (
              <div className="space-y-4 text-left">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-black uppercase tracking-wider">
                      Stored Google Drive Content ({submissionsList.length})
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      All video submissions posted by Goddess Layla stored securely in backend memory.
                    </p>
                  </div>

                  <button
                    onClick={fetchSubmissions}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-gray-300"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {copiedLinkMsg && (
                  <div className="p-3 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{copiedLinkMsg}</span>
                  </div>
                )}

                {submissionsList.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500 font-medium">
                    No Google Drive submissions found in backend yet. Use the "Post Content" tab above to submit your first video.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {submissionsList.map((sub) => (
                      <div key={sub.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-black text-sm">{sub.title}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-black text-white font-extrabold text-xs">
                            {sub.price} €
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-gray-600">
                          <span className="font-bold text-black">Creator: {sub.name}</span>
                          <span>•</span>
                          <span>Posted: {new Date(sub.createdAt).toLocaleTimeString()}</span>
                        </div>

                        {/* Google Drive Link Bar */}
                        <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center justify-between gap-2">
                          <div className="truncate font-mono text-[11px] text-gray-800">
                            <span className="font-bold text-black font-sans block text-[10px] uppercase">Google Drive Link:</span>
                            <span className="truncate block">{sub.googleDriveLink}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => copyToClipboard(sub.googleDriveLink, 'Google Drive link')}
                              className="px-2.5 py-1 bg-black text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Link</span>
                            </button>
                            <a
                              href={sub.googleDriveLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-black text-[11px] font-bold rounded-lg flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Open Drive</span>
                            </a>
                          </div>
                        </div>

                        {/* Tags */}
                        {sub.tags && sub.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {sub.tags.map((t: string) => (
                              <span key={t} className="px-2 py-0.5 bg-gray-200 text-black text-[10px] font-bold rounded">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: LIVE STREAM CONTROL */}
            {activeTab === 'live' && (
              <form onSubmit={handleSaveLiveStatus} className="space-y-4 text-left">
                
                <div className="p-4 rounded-2xl bg-gray-50 border border-black flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-black block">
                      Live Stream Status
                    </span>
                    <p className="text-[11px] text-gray-600 font-medium">
                      {isLive
                        ? 'Currently displayed: "Goddess Layla is LIVE"'
                        : 'Currently displayed: "Goddess Layla is currently offline"'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLive(!isLive)}
                    className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer border ${
                      isLive
                        ? 'bg-black text-white border-black shadow-md'
                        : 'bg-white text-black border-gray-400'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-red-500 animate-ping' : 'bg-gray-400'}`}></span>
                    <span>
                      {isLive ? 'LIVE NOW' : 'SET OFFLINE'}
                    </span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-black block uppercase mb-1">
                      Live Stream Title
                    </label>
                    <input
                      type="text"
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      placeholder="e.g. Exclusive Live Broadcast with Goddess Layla"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-semibold text-black focus:bg-white focus:border-black focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-black block uppercase mb-1">
                        Price (€)
                      </label>
                      <input
                        type="text"
                        value={livePrice}
                        onChange={(e) => setLivePrice(e.target.value)}
                        placeholder="20.00 €"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-semibold text-black focus:bg-white focus:border-black focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-black block uppercase mb-1">
                        Stream Link / Video Source
                      </label>
                      <input
                        type="url"
                        value={liveStreamUrl}
                        onChange={(e) => setLiveStreamUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-mono text-black focus:bg-white focus:border-black focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-black block uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={liveDesc}
                      onChange={(e) => setLiveDesc(e.target.value)}
                      placeholder="VIP sanctuary broadcast stream details..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-xs font-medium text-black focus:bg-white focus:border-black focus:outline-hidden resize-none"
                    />
                  </div>
                </div>

                {liveSuccessMsg && (
                  <div className="p-3 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{liveSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUpdatingLive}
                  className="w-full py-3.5 rounded-full bg-black hover:bg-gray-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer border border-black"
                >
                  {isUpdatingLive ? 'Updating Status...' : 'Apply Live Status Changes'}
                </button>

              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
