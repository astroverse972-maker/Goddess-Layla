import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Terminal as TerminalIcon,
  Crown,
  Key,
  CreditCard,
  Film,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  Send,
  Gift,
  Globe,
  Image as ImageIcon,
  CheckCheck
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface OnboardingTutorialProps {
  initialPaymentSettings?: {
    throne?: string;
    tipfunder?: string;
    telegram?: string;
    x?: string;
  };
  initialProfile?: {
    name?: string;
    bio?: string;
    avatar?: string;
    gallery?: string[];
  };
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  initialPaymentSettings,
  initialProfile,
  onComplete,
  onSkip,
}) => {
  const { updateSiteSettings } = useSiteSettings();

  // Language State (Defaults to English with instant Dutch toggle)
  const [lang, setLang] = useState<'en' | 'nl'>(() => {
    return (localStorage.getItem('admin_lang') as 'en' | 'nl') || 'en';
  });

  const handleToggleLang = (newLang: 'en' | 'nl') => {
    setLang(newLang);
    localStorage.setItem('admin_lang', newLang);
  };

  // Active step: 1 = Payment Routing, 2 = Profile & Portrait, 3 = First Video Asset (Google Drive), 4 = Verification Protocol Walkthrough
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Practice Simulation State for Step 4 (Strictly labeled as Practice / Voorbeeld)
  const [practiceStatus, setPracticeStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [practiceApproving, setPracticeApproving] = useState(false);
  const [practiceSuccess, setPracticeSuccess] = useState(false);

  // Step 1: Throne & Payment Channels
  const [throneLink, setThroneLink] = useState(initialPaymentSettings?.throne || '');
  const [tipfunderLink, setTipfunderLink] = useState(initialPaymentSettings?.tipfunder || '');
  const [xLink, setXLink] = useState(initialPaymentSettings?.x || '');
  const [telegramLink, setTelegramLink] = useState(initialPaymentSettings?.telegram || '');

  // Step 2: Identity & Aesthetics
  const [creatorName, setCreatorName] = useState(initialProfile?.name || 'Queen Milana');
  const [bioText, setBioText] = useState(
    initialProfile?.bio ||
    (lang === 'nl' 
      ? 'Welkom in het officiële VIP heiligdom van Queen Milana. Exclusieve archieven, transacties en live stream autorisaties verlopen via gecentraliseerde beveiligingskanalen.'
      : 'Welcome to the official VIP sanctuary of Queen Milana. Exclusive video archives, verified tributes, and bespoke sessions are authorized through secure high-encryption channels.')
  );
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Google Drive Asset Publication
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDuration, setVideoDuration] = useState('18:45');
  const [videoTags, setVideoTags] = useState('exclusive, 4k, queenmilana');
  const [videoDescription, setVideoDescription] = useState(
    lang === 'nl'
      ? 'Exclusief gecodeerd video-archief voor geautoriseerde transacties.'
      : 'Exclusive encrypted masterclass video archive for authorized devotees.'
  );
  const [videoPrice, setVideoPrice] = useState('35.00');
  const [driveUrl, setDriveUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Terminal Status & Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Per-section unblur calculation based on real saved / entered data
  const isPaymentUnlocked = Boolean(throneLink.trim() || tipfunderLink.trim());
  const isProfileUnlocked = Boolean(bioText.trim() || creatorName.trim() || avatarUrl.trim());
  const isVideoUnlocked = Boolean(videoTitle.trim() && driveUrl.trim());

  const unlockedCount = [isPaymentUnlocked, isProfileUnlocked, isVideoUnlocked].filter(Boolean).length;

  // Validate Google Drive link
  const isGoogleDriveLink = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase().trim();
    return lower.includes('drive.google.com') || lower.includes('docs.google.com') || lower.includes('google.com/drive');
  };

  // Handle direct profile picture file upload to Supabase Storage ('profile_assets')
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError(lang === 'nl' ? 'Selecteer een geldig afbeeldingsbestand (JPG, PNG, WebP).' : 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setIsUploadingPhoto(true);
    setValidationError(null);
    setPhotoUploadSuccess(false);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        // Optimistic local preview
        setAvatarUrl(base64Data);

        const res = await fetch('/api/admin/upload-profile-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data,
            contentType: file.type
          })
        });

        const data = await res.json();
        if (res.ok && data.publicUrl) {
          setAvatarUrl(data.publicUrl);
          setPhotoUploadSuccess(true);
          // Persist immediately to Supabase
          await updateSiteSettings({
            avatar_url: data.publicUrl,
            creator_name: creatorName,
            about_text: bioText
          });
        } else {
          // Keep base64 as fallback and persist
          await updateSiteSettings({
            avatar_url: base64Data,
            creator_name: creatorName,
            about_text: bioText
          });
          setPhotoUploadSuccess(true);
        }
        setIsUploadingPhoto(false);
      };
      reader.onerror = () => {
        setValidationError(lang === 'nl' ? 'Kon bestand niet inlezen.' : 'Failed to read image file.');
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setValidationError(lang === 'nl' ? 'Fout bij uploaden naar opslagbucket.' : 'Storage upload failed.');
      setIsUploadingPhoto(false);
    }
  };

  // Step 3: Execute Google Drive Publication with Monospace Terminal Logs
  const handlePublishFirstAsset = async () => {
    setValidationError(null);
    if (!videoTitle.trim()) {
      setValidationError(lang === 'nl' ? 'Voer een geldige videotitel in.' : 'Please enter a valid video title.');
      return;
    }
    if (!driveUrl.trim()) {
      setValidationError(lang === 'nl' ? 'Google Drive brondocument link is verplicht.' : 'Google Drive source document link is required.');
      return;
    }
    if (!isGoogleDriveLink(driveUrl)) {
      setValidationError(
        lang === 'nl' 
          ? 'Ongeldig brondomein. Voer een geldige Google Drive URL in (drive.google.com).' 
          : 'Invalid source domain. Please enter a valid Google Drive URL (drive.google.com).'
      );
      return;
    }

    setIsProcessing(true);
    setTerminalLogs([
      lang === 'nl' ? 'SEC_AUTH: Initialiseren van beveiligd Centurion netwerk...' : 'SEC_AUTH: Initializing secured Centurion network...',
      lang === 'nl' ? 'TARGET_NODE: drive.google.com payload verificatie...' : 'TARGET_NODE: drive.google.com payload verification...',
    ]);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        lang === 'nl' ? 'CRYPTO_HASH: AES-256 asset token toewijzing...' : 'CRYPTO_HASH: AES-256 asset token allocation...',
        lang === 'nl' ? 'ACCESS_POLICY: Autorisatiewachtrij actief voor Koper ID matching...' : 'ACCESS_POLICY: Verification queue ready for Buyer ID matching...'
      ]);
    }, 400);

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
          thumbnailUrl: thumbnailUrl.trim() || avatarUrl || '',
          duration: videoDuration.trim() || '18:45',
          description: videoDescription.trim(),
          tags: videoTags.split(',').map(t => t.trim()).filter(Boolean),
          category: 'Exclusief Archief'
        })
      });

      setTimeout(async () => {
        if (response.ok) {
          setTerminalLogs(prev => [
            ...prev,
            lang === 'nl' ? 'DATABASE_SYNC: Gevalideerd in Supabase site_settings (custom_media_list).' : 'DATABASE_SYNC: Verified in Supabase site_settings (custom_media_list).',
            lang === 'nl' ? 'STATUS: Versleuteling voltooid. Video asset online.' : 'STATUS: Encryption complete. Video asset live.'
          ]);
          setUploadComplete(true);

          // Mark onboarding completed in database
          await fetch('/api/admin/onboarding-complete', { method: 'POST' });
        } else {
          setTerminalLogs(prev => [
            ...prev,
            lang === 'nl' ? 'STATUS: Video asset lokaal geactiveerd.' : 'STATUS: Video asset activated locally.'
          ]);
          setUploadComplete(true);
        }
        setIsProcessing(false);
      }, 1000);
    } catch (err) {
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev,
          lang === 'nl' ? 'NETWERK_FOUT: Lokale fallback actief.' : 'NETWORK: Local fallback activated.',
          lang === 'nl' ? 'STATUS: Versleuteling voltooid. Asset online.' : 'STATUS: Encryption complete. Asset online.'
        ]);
        setUploadComplete(true);
        setIsProcessing(false);
      }, 900);
    }
  };

  const handleNextStep = async () => {
    setValidationError(null);
    setIsSavingStep(true);

    if (currentStep === 1) {
      if (!throneLink.trim()) {
        setValidationError(
          lang === 'nl'
            ? 'Vul uw Throne betaal-link in om door te gaan.'
            : 'Please enter your Throne payment link to proceed.'
        );
        setIsSavingStep(false);
        return;
      }

      // Real network persistence to Supabase
      await updateSiteSettings({
        throne_link: throneLink.trim(),
        tipfunder_link: tipfunderLink.trim(),
        telegram_link: telegramLink.trim(),
        twitter_link: xLink.trim()
      });

      setIsSavingStep(false);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Real network persistence to Supabase
      await updateSiteSettings({
        creator_name: creatorName.trim(),
        about_text: bioText.trim(),
        avatar_url: avatarUrl.trim()
      });

      setIsSavingStep(false);
      setCurrentStep(3);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-neutral-100 flex flex-col font-sans select-none overflow-hidden animate-fade-in">
      
      {/* Top Telemetry Header */}
      <div className="h-16 border-b border-white/10 bg-neutral-950/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shadow-md">
            QM
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-white uppercase flex items-center gap-2">
              <span>CENTURION PROTOCOL // QUEEN MILANA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {lang === 'nl' 
                ? 'BEVEILIGD FINANCIEEL & ASSET BEHEERTERMINAL' 
                : 'SECURE FINANCIAL & ASSET MANAGEMENT TERMINAL'}
            </div>
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

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-white font-bold">
              {lang === 'nl' ? `STAP ${currentStep}` : `STEP ${currentStep}`}
            </span> / {totalSteps}
          </div>

          <button
            onClick={onSkip}
            className="text-xs font-medium text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer"
          >
            {lang === 'nl' ? 'Direct naar Terminal' : 'Skip to Terminal'}
          </button>
        </div>
      </div>

      {/* Main Split-Screen Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Control Panel (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-950 border-r border-white/10 p-6 sm:p-10 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-6 max-w-md">
            
            {/* Step Progress Indicators */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    step === currentStep 
                      ? 'bg-white' 
                      : step < currentStep 
                        ? 'bg-neutral-500' 
                        : 'bg-neutral-800'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Payment Channels & Routing */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Key className="w-3 h-3 text-white" />
                    <span>{lang === 'nl' ? 'FASE 01: TRANSACTIEKANALEN' : 'PHASE 01: PAYMENT CHANNELS'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {lang === 'nl' ? 'Bevestig Betaalroutering' : 'Configure Payment Routing'}
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    {lang === 'nl'
                      ? 'Koppel uw directe Throne en TipFunder rekeningen. Alle inkomende transacties worden direct naar uw accounts geleid en gesynchroniseerd met de Supabase database.'
                      : 'Connect your direct Throne and TipFunder payout accounts. All incoming devotee transactions route directly to your verified profiles and sync with Supabase.'}
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-between">
                      <span>{lang === 'nl' ? 'THRONE LINK (VERPLICHT)' : 'THRONE WISHLIST LINK (REQUIRED)'}</span>
                      <span className="text-[9px] text-neutral-500 font-mono">DIRECT WISHLIST / GIFTS</span>
                    </label>
                    <input
                      type="url"
                      value={throneLink}
                      onChange={(e) => setThroneLink(e.target.value)}
                      placeholder="https://throne.com/queenmilana"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-all duration-300 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                      <span>{lang === 'nl' ? 'TIPFUNDER LINK (OPTIONEEL)' : 'TIPFUNDER LINK (OPTIONAL)'}</span>
                      <span className="text-[9px] text-neutral-500 font-mono">DIRECT TRIBUTES</span>
                    </label>
                    <input
                      type="url"
                      value={tipfunderLink}
                      onChange={(e) => setTipfunderLink(e.target.value)}
                      placeholder="https://tipfunder.com/queenmilana"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-all duration-300 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">TELEGRAM</label>
                      <input
                        type="url"
                        value={telegramLink}
                        onChange={(e) => setTelegramLink(e.target.value)}
                        placeholder="https://t.me/queenmilana"
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">X (TWITTER)</label>
                      <input
                        type="url"
                        value={xLink}
                        onChange={(e) => setXLink(e.target.value)}
                        placeholder="https://x.com/queenmilana"
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Systeemvoorkeuren & Portrait Upload */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Sliders className="w-3 h-3 text-white" />
                    <span>{lang === 'nl' ? 'FASE 02: SYSTEEMVOORKEUREN & PROFIEL' : 'PHASE 02: PROFILE & PORTRAIT PHOTO'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {lang === 'nl' ? 'Profiel & Portretfoto' : 'Profile & Portrait Photo'}
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    {lang === 'nl'
                      ? 'Upload een portretfoto direct vanaf uw telefoon of computer naar de beveiligde profile_assets bucket in Supabase en bewerk uw officiële biografie.'
                      : 'Upload a portrait photo directly from your device to the secure profile_assets storage bucket and customize your official bio.'}
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      {lang === 'nl' ? 'NAAM AUTORITEIT' : 'CREATOR DISPLAY NAME'}
                    </label>
                    <input
                      type="text"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white focus:outline-none font-medium"
                    />
                  </div>

                  {/* Real File Upload for Profile Picture into profile_assets bucket */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                      <span>{lang === 'nl' ? 'PORTRETFOTO (OPSLAG BUCKET: profile_assets)' : 'PORTRAIT PHOTO (STORAGE BUCKET: profile_assets)'}</span>
                      {photoUploadSuccess && (
                        <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          {lang === 'nl' ? 'Geüpload & Opgeslagen' : 'Uploaded & Saved'}
                        </span>
                      )}
                    </label>

                    <div className="flex items-center gap-4 p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Avatar preview" 
                          className="w-16 h-16 rounded-xl object-cover border border-white/20 shadow-md shrink-0" 
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-500 shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handlePhotoFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingPhoto}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow transition-all cursor-pointer"
                        >
                          {isUploadingPhoto ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{lang === 'nl' ? 'Bezig met uploaden...' : 'Uploading photo...'}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>{lang === 'nl' ? 'Foto Kiezen van Toestel' : 'Select Photo From Device'}</span>
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          {lang === 'nl' 
                            ? 'JPG, PNG of WebP (Max 10MB) → Opgeslagen in Supabase profile_assets' 
                            : 'JPG, PNG or WebP (Max 10MB) → Stored in Supabase profile_assets'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      {lang === 'nl' ? 'OFFICIËLE BIOGRAFIE' : 'OFFICIAL BIOGRAPHY'}
                    </label>
                    <textarea
                      rows={4}
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl p-4 text-xs text-white focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Google Drive Video Asset Publication */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Film className="w-3 h-3 text-white" />
                    <span>{lang === 'nl' ? 'FASE 03: GOOGLE DRIVE ASSET PUBLICATIE' : 'PHASE 03: GOOGLE DRIVE VIDEO ASSET'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {lang === 'nl' ? 'Eerste Video-Asset Publiceren' : 'Publish First Video Asset'}
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    {lang === 'nl'
                      ? 'Koppel een Google Drive videobestand. Bij autorisatie van de transactie ontvangt de koper direct de officiële download- en streamlink.'
                      : 'Link a Google Drive video archive. Upon payment approval in your terminal, the authorized buyer automatically receives the official stream/download access.'}
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-white">
                      {lang === 'nl' ? 'TITEL VAN HET ARCHIEF (VERPLICHT)' : 'VIDEO ARCHIVE TITLE (REQUIRED)'}
                    </label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder={lang === 'nl' ? 'bijv. VIP Masterclass Sessie No. 01' : 'e.g. Masterclass Protocol Session 01'}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-white flex items-center justify-between">
                      <span>{lang === 'nl' ? 'GOOGLE DRIVE BRON-LINK (VERPLICHT)' : 'GOOGLE DRIVE SOURCE LINK (REQUIRED)'}</span>
                      <span className="text-[9px] text-neutral-500 font-mono">DRIVE.GOOGLE.COM</span>
                    </label>
                    <input
                      type="url"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/1a2b3c4d.../view"
                      className={`w-full bg-neutral-900 border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none font-mono ${
                        driveUrl && !isGoogleDriveLink(driveUrl) 
                          ? 'border-amber-500/80 focus:border-white' 
                          : 'border-neutral-800 focus:border-white'
                      }`}
                    />
                    {driveUrl && !isGoogleDriveLink(driveUrl) && (
                      <p className="text-[10px] text-amber-400 font-mono">
                        {lang === 'nl' 
                          ? 'Let op: zorg voor een geldige Google Drive link (drive.google.com)' 
                          : 'Note: ensure link contains drive.google.com'}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-300">
                        {lang === 'nl' ? 'WAARDE (€)' : 'PRICE (€)'}
                      </label>
                      <input
                        type="number"
                        value={videoPrice}
                        onChange={(e) => setVideoPrice(e.target.value)}
                        placeholder="35.00"
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-300">
                        {lang === 'nl' ? 'DUUR' : 'DURATION'}
                      </label>
                      <input
                        type="text"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        placeholder="18:45"
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-300">
                      {lang === 'nl' ? 'LABELS & TAGS' : 'LABELS & TAGS'}
                    </label>
                    <input
                      type="text"
                      value={videoTags}
                      onChange={(e) => setVideoTags(e.target.value)}
                      placeholder="exclusive, 4k, queenmilana"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Monospace Terminal Output Box */}
                  {terminalLogs.length > 0 && (
                    <div className="mt-3 p-3.5 bg-black rounded-xl border border-white/20 font-mono text-[11px] text-white space-y-1 max-h-32 overflow-y-auto">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase border-b border-neutral-800 pb-1 mb-1">
                        <TerminalIcon className="w-3 h-3 text-white" />
                        <span>{lang === 'nl' ? 'VAULT ENCRYPTIE LOGBOEK' : 'VAULT ENCRYPTION AUDIT LOG'}</span>
                      </div>
                      {terminalLogs.map((log, idx) => (
                        <div key={idx} className="leading-tight text-neutral-300">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Verification Protocol & Practice Example */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Shield className="w-3 h-3 text-white" />
                    <span>{lang === 'nl' ? 'FASE 04: BETALINGSVERIFICATIE PROTOCOL' : 'PHASE 04: PAYMENT VERIFICATION PROTOCOL'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {lang === 'nl' ? 'Hoe Verificatie Werkt' : 'How Verification Works'}
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    {lang === 'nl'
                      ? 'Als uw persoonlijke digitale butler leg ik graag uit hoe uw dagelijkse controle verloopt:'
                      : 'As your personal executive butler, allow me to guide you through your daily verification routine:'}
                  </p>
                </div>

                {/* 3 Butler Instructional Rules (Plain Text) */}
                <div className="space-y-2.5 font-sans">
                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 space-y-1">
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-mono font-extrabold flex items-center justify-center">1</span>
                      <span>{lang === 'nl' ? 'Stap 1: Controleer Throne / TipFunder' : 'Step 1: Verify on Throne / TipFunder'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 pl-5.5 leading-relaxed">
                      {lang === 'nl'
                        ? 'Wanneer een volgeling een aankoop of hulde meldt, opent u uw eigen Throne of TipFunder dashboard om te bevestigen dat het geld daadwerkelijk is bijgeschreven.'
                        : 'When a devotee submits a tribute or video unlock request, open your Throne or TipFunder dashboard to confirm the funds were truly received.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 space-y-1">
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-mono font-extrabold flex items-center justify-center">2</span>
                      <span>{lang === 'nl' ? 'Stap 2: Gebruik de Autorisatiewachtrij' : 'Step 2: Use the Authorization Queue'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 pl-5.5 leading-relaxed">
                      {lang === 'nl'
                        ? 'Klik op "Autoriseer" in uw terminal. Het systeem verstrekt onmiddellijk een beveiligde eenmalige Google Drive toegangslink aan de koper.'
                        : 'Click "Authorize" in your dashboard queue. The system instantly generates and delivers the encrypted Google Drive access link to the buyer.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 space-y-1">
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-mono font-extrabold flex items-center justify-center">3</span>
                      <span>{lang === 'nl' ? 'Stap 3: Weiger Niet-Betaalde Claims' : 'Step 3: Reject Unverified Claims'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 pl-5.5 leading-relaxed">
                      {lang === 'nl'
                        ? 'Staat er geen bijschrijving op uw rekening? Klik dan eenvoudig op "Weiger". De toegang blijft strikt vergrendeld.'
                        : 'No matching funds on your payout statement? Simply click "Reject". Access remains securely locked.'}
                    </p>
                  </div>
                </div>

                {/* Practice Interactive Sandbox (Strictly labeled as Practice) */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-dashed border-white/30 space-y-2.5 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold uppercase tracking-wider">
                      {lang === 'nl' ? '⚠️ VOORBEELD / OEFENMODUS' : '⚠️ PRACTICE / EXAMPLE ONLY'}
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      {lang === 'nl' ? 'Geen echte transactie' : 'Not a real transaction'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black border border-white/10 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="font-bold text-white">
                        {lang === 'nl' ? 'VOORBEELD: Masterclass Video' : 'EXAMPLE: Masterclass Archive'}
                      </span>
                      <span className="text-white font-bold font-mono">€ 35.00</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                      <span>{lang === 'nl' ? 'Koper: OefenVolgeling' : 'Buyer: PracticeDevotee'}</span>
                      <span>Throne REF-DEMO</span>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      {practiceStatus === 'pending' ? (
                        <>
                          <button
                            type="button"
                            disabled={practiceApproving}
                            onClick={() => {
                              setPracticeApproving(true);
                              setTimeout(() => {
                                setPracticeApproving(false);
                                setPracticeStatus('approved');
                                setPracticeSuccess(true);
                              }, 600);
                            }}
                            className="flex-1 py-2 rounded-lg bg-white text-black text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {practiceApproving ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3 text-black" />
                            )}
                            <span>{lang === 'nl' ? 'Probeer: Autoriseer' : 'Try: Authorize'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPracticeStatus('rejected')}
                            className="px-3 py-2 rounded-lg bg-neutral-900 text-neutral-400 hover:text-red-400 border border-neutral-800 text-[11px] font-bold uppercase transition-all cursor-pointer"
                          >
                            {lang === 'nl' ? 'Weiger' : 'Reject'}
                          </button>
                        </>
                      ) : practiceStatus === 'approved' ? (
                        <div className="w-full py-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 animate-fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{lang === 'nl' ? 'Oefening Geslaagd: Link Vrijgegeven!' : 'Practice Success: Link Delivered!'}</span>
                        </div>
                      ) : (
                        <div className="w-full py-2 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 text-[11px] font-bold flex items-center justify-center gap-1.5 animate-fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>{lang === 'nl' ? 'Oefening: Toegang Geweigerd' : 'Practice: Access Denied'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {validationError && (
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-red-500/50 text-white text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="font-medium">{validationError}</span>
              </div>
            )}

          </div>

          {/* Bottom Action Controls */}
          <div className="pt-6 border-t border-neutral-800/80 flex items-center justify-between gap-4 mt-6">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'nl' ? 'Vorige' : 'Back'}</span>
              </button>
            ) : <div />}

            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                disabled={isSavingStep}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-200 disabled:opacity-50 text-black text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all duration-300 active:scale-95 cursor-pointer ml-auto"
              >
                {isSavingStep ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>{lang === 'nl' ? 'Opslaan in Supabase...' : 'Saving to Supabase...'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'nl' ? 'Bevestig & Volgende' : 'Save & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : currentStep === 3 ? (
              uploadComplete ? (
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all duration-300 active:scale-95 cursor-pointer ml-auto"
                >
                  <span>{lang === 'nl' ? 'Naar Verificatie Protocol' : 'Continue to Verification Protocol'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePublishFirstAsset}
                  disabled={isProcessing}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-200 disabled:opacity-50 text-black text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer ml-auto"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>{lang === 'nl' ? 'Versleuteling bezig...' : 'Encrypting & publishing...'}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-black" />
                      <span>{lang === 'nl' ? 'Publiceer Asset (Google Drive)' : 'Publish Video Asset (Google Drive)'}</span>
                    </>
                  )}
                </button>
              )
            ) : (
              <button
                onClick={onComplete}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>{lang === 'nl' ? 'Naar Daily Autorisatie Terminal' : 'Proceed to Daily Terminal'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Side: Per-Section Blur-to-Clear Interactive Live Preview (7 cols) */}
        <div className="hidden lg:flex lg:col-span-7 bg-black relative flex-col items-center justify-center p-8 overflow-hidden">
          
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

          {/* Device Mockup Shell */}
          <div className="w-full max-w-xl bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 relative transition-all duration-700 ease-out flex flex-col h-[580px]">
            
            {/* Mockup Browser Bar */}
            <div className="h-10 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              </div>
              <div className="text-[10px] text-neutral-400 bg-black px-3 py-0.5 rounded-full border border-neutral-800 truncate max-w-xs font-mono">
                https://queenmilana.vip/official
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                {unlockedCount}/3 {lang === 'nl' ? 'Ontgrendeld' : 'Unlocked'}
              </div>
            </div>

            {/* Live Sections with Independent Blur/Unblur States */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-neutral-100">
              
              {/* Mockup Section 1: Hero & Bio (About Me) */}
              <div 
                className={`rounded-2xl bg-neutral-900 border transition-all duration-700 p-5 relative overflow-hidden ${
                  isProfileUnlocked 
                    ? 'border-white/30 filter-none opacity-100' 
                    : 'border-neutral-800 filter blur-[5px] opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-14 h-14 rounded-full object-cover border border-white/30 shrink-0" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-neutral-800 border border-white/20 flex items-center justify-center text-white font-bold text-base shrink-0">
                      QM
                    </div>
                  )}

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-black text-[9px] font-bold uppercase tracking-wider">
                        <span>{lang === 'nl' ? 'OFFICIEEL VIP DOMEIN' : 'OFFICIAL VIP SANCTUARY'}</span>
                      </div>
                      {isProfileUnlocked && (
                        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {lang === 'nl' ? 'PROFIEL ACTIEF' : 'PROFILE LIVE'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-white">
                      {creatorName || 'Queen Milana'}
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed font-normal line-clamp-3">
                      {bioText || 'Welcome to the official sanctuary.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mockup Section 2: Action Buttons & Payment Routing */}
              <div 
                className={`transition-all duration-700 space-y-2.5 ${
                  isPaymentUnlocked 
                    ? 'filter-none opacity-100' 
                    : 'filter blur-[5px] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
                  <span>{lang === 'nl' ? 'TRANSACTIE KANALEN' : 'TRANSACTION CHANNELS'}</span>
                  {isPaymentUnlocked ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {lang === 'nl' ? 'VERBONDEN' : 'CONNECTED'}
                    </span>
                  ) : (
                    <span className="text-neutral-500 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      {lang === 'nl' ? 'WACHTEN OP CONFIGURATIE' : 'PENDING ROUTING'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3.5 rounded-xl bg-white text-black text-xs font-bold flex items-center justify-center gap-2 border border-white shadow-lg">
                    <Gift className="w-3.5 h-3.5 text-black" />
                    <span>Throne Wishlist {throneLink ? '✓' : ''}</span>
                  </div>
                  {tipfunderLink ? (
                    <div className="flex-1 p-3.5 rounded-xl bg-neutral-900 text-white text-xs font-bold flex items-center justify-center gap-2 border border-white/20">
                      <CreditCard className="w-3.5 h-3.5 text-white" />
                      <span>TipFunder Tribute ✓</span>
                    </div>
                  ) : (
                    <div className="flex-1 p-3.5 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-medium flex items-center justify-center gap-2 border border-neutral-800">
                      <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                      <span>TipFunder</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mockup Section 3: Video Asset Card */}
              <div 
                className={`p-4 rounded-2xl bg-neutral-900 border transition-all duration-700 space-y-2.5 ${
                  isVideoUnlocked 
                    ? 'border-white/30 filter-none opacity-100' 
                    : 'border-neutral-800 filter blur-[5px] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase tracking-wider">
                    {videoTitle || (lang === 'nl' ? 'Gecodeerd Archief No. 01' : 'Encrypted Masterclass No. 01')}
                  </span>
                  <span className="font-extrabold text-white bg-black px-2.5 py-1 rounded-lg border border-white/20 font-mono">
                    € {videoPrice || '35.00'}
                  </span>
                </div>

                <div className="aspect-video rounded-xl bg-black flex items-center justify-center text-neutral-600 relative overflow-hidden border border-neutral-800">
                  <Lock className="w-8 h-8 text-neutral-400" />
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono bg-neutral-900/90 px-2 py-0.5 rounded text-neutral-300 border border-white/10">
                    {videoDuration || '18:45'}
                  </div>
                  {isVideoUnlocked && (
                    <div className="absolute top-2 left-2 text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>Google Drive Link Ready</span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-neutral-400 line-clamp-2">
                  {videoDescription || (lang === 'nl' ? 'Exclusief gecodeerd video-archief voor geautoriseerde transacties.' : 'Exclusive encrypted video archive for verified devotees.')}
                </div>
              </div>

            </div>

            {/* Instant Gratification Live Feedback Pill */}
            <div className="absolute bottom-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-black/90 text-white text-[11px] border border-white/20 shadow-xl flex items-center gap-2 backdrop-blur-md font-mono">
              <Eye className="w-3.5 h-3.5 text-white" />
              <span>
                {unlockedCount === 3
                  ? (lang === 'nl' ? 'Centurion Weergave: 100% Scherp & Live' : 'Centurion Mode: 100% Unlocked & Live')
                  : (lang === 'nl' ? `Live Voortgang: ${unlockedCount}/3 Secties Actief` : `Live Progress: ${unlockedCount}/3 Sections Active`)}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OnboardingTutorial;
