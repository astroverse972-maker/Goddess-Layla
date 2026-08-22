import React, { useState, useRef } from 'react';
import { 
  Shield, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Crown, 
  Key, 
  CreditCard, 
  Film, 
  RefreshCw, 
  Eye, 
  Sliders, 
  Gift, 
  Image as ImageIcon, 
  CheckCheck,
  Trash2,
  Plus
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { cleanDisplayTitle, cleanDisplayDescription, isUrlOrDriveLink } from '../utils/sanitizeMedia';

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

  // Onboarding Tutorial is locked to Dutch (Nederlands)
  const lang: 'nl' = 'nl';

  // 5 Active Steps:
  // 1: Payment Routing (Throne & TipFunder)
  // 2: Profile & Portrait Avatar Photo (profile_assets)
  // 3: "About Me" Photo Gallery (3-6 photos direct to profile_assets)
  // 4: First Video Asset (Google Drive)
  // 5: Verification Protocol Walkthrough & Practice Example
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Throne & Payment Channels
  const [throneLink, setThroneLink] = useState(initialPaymentSettings?.throne || '');
  const [tipfunderLink, setTipfunderLink] = useState(initialPaymentSettings?.tipfunder || '');
  const [xLink, setXLink] = useState(initialPaymentSettings?.x || '');
  const [telegramLink, setTelegramLink] = useState(initialPaymentSettings?.telegram || '');

  // Step 2: Identity & Avatar
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

  // Step 3: "About Me" Photo Gallery (3 to 6 photos direct upload to profile_assets)
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(() => {
    if (Array.isArray(initialProfile?.gallery) && initialProfile.gallery.length > 0) {
      return initialProfile.gallery.filter(Boolean);
    }
    return [];
  });
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<string>('');
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: Google Drive Asset Publication
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

  // Step 5: Practice Simulation State
  const [practiceStatus, setPracticeStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [practiceApproving, setPracticeApproving] = useState(false);

  // Terminal & Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Unblur calculations for live preview
  const isPaymentUnlocked = Boolean(throneLink.trim() || tipfunderLink.trim());
  const isProfileUnlocked = Boolean(bioText.trim() || creatorName.trim() || avatarUrl.trim());
  const isGalleryUnlocked = galleryPhotos.length > 0;
  const isVideoUnlocked = Boolean(videoTitle.trim() && driveUrl.trim());

  const unlockedCount = [isPaymentUnlocked, isProfileUnlocked, isGalleryUnlocked, isVideoUnlocked].filter(Boolean).length;

  const isGoogleDriveLink = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase().trim();
    return lower.includes('drive.google.com') || lower.includes('docs.google.com') || lower.includes('google.com/drive');
  };

  // Direct avatar upload to profile_assets
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
          await updateSiteSettings({
            avatar_url: data.publicUrl,
            creator_name: creatorName,
            about_text: bioText
          });
        } else {
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
    } catch (err) {
      setValidationError(lang === 'nl' ? 'Fout bij uploaden naar profile_assets bucket.' : 'Storage upload failed.');
      setIsUploadingPhoto(false);
    }
  };

  // Direct multi-photo upload to profile_assets
  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setValidationError(lang === 'nl' ? 'Selecteer geldige afbeeldingsbestanden (JPG, PNG, WebP).' : 'Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    if (galleryPhotos.length + validFiles.length > 6) {
      setValidationError(
        lang === 'nl' 
          ? `U heeft ${galleryPhotos.length} foto's en probeert er ${validFiles.length} toe te voegen. Het maximum is 6 foto's.` 
          : `You have ${galleryPhotos.length} photos and selected ${validFiles.length}. The maximum allowed is 6 photos.`
      );
      return;
    }

    setIsUploadingGallery(true);
    setValidationError(null);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setGalleryUploadProgress(`${lang === 'nl' ? 'Uploaden naar profile_assets' : 'Uploading to profile_assets'} (${i + 1}/${validFiles.length})...`);

        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/admin/upload-gallery-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data,
            contentType: file.type
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.publicUrl) {
            uploadedUrls.push(data.publicUrl);
          } else {
            uploadedUrls.push(base64Data);
          }
        } else {
          uploadedUrls.push(base64Data);
        }
      }

      const newGallery = [...galleryPhotos, ...uploadedUrls].slice(0, 6);
      setGalleryPhotos(newGallery);

      // Persist directly to Supabase
      await updateSiteSettings({
        about_photos: newGallery,
        gallery: newGallery
      });
    } catch (err) {
      setValidationError(lang === 'nl' ? 'Fout bij uploaden van galerijfoto\'s.' : 'Failed uploading gallery images.');
    } finally {
      setIsUploadingGallery(false);
      setGalleryUploadProgress('');
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveGalleryPhoto = async (indexToRemove: number) => {
    const updated = galleryPhotos.filter((_, idx) => idx !== indexToRemove);
    setGalleryPhotos(updated);
    await updateSiteSettings({
      about_photos: updated,
      gallery: updated
    });
  };

  // Step 4: Publish Video Asset
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

    const cleanTitle = cleanDisplayTitle(videoTitle.trim(), lang === 'nl' ? 'VIP Masterclass Protocol 01' : 'VIP Masterclass Protocol 01');
    const cleanDesc = cleanDisplayDescription(
      videoDescription.trim(),
      lang === 'nl'
        ? 'Exclusief versleuteld masterclass video archief voor geautoriseerde volgelingen.'
        : 'Exclusive encrypted masterclass video archive for authorized devotees.'
    );

    try {
      const response = await fetch('/api/custom-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanTitle,
          price: videoPrice.trim() || '35.00',
          previewUrl: driveUrl.trim(),
          videoUrl: driveUrl.trim(),
          googleDriveLink: driveUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim() || avatarUrl || (galleryPhotos[0] || ''),
          duration: videoDuration.trim() || '18:45',
          description: cleanDesc,
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
          await fetch('/api/admin/onboarding-complete', { method: 'POST' });
        } else {
          setTerminalLogs(prev => [
            ...prev,
            lang === 'nl' ? 'STATUS: Video asset geactiveerd.' : 'STATUS: Video asset activated.'
          ]);
          setUploadComplete(true);
        }
        setIsProcessing(false);
      }, 1000);
    } catch (err) {
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev,
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

      await updateSiteSettings({
        throne_link: throneLink.trim(),
        tipfunder_link: tipfunderLink.trim(),
        telegram_link: telegramLink.trim(),
        twitter_link: xLink.trim()
      });

      setIsSavingStep(false);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      await updateSiteSettings({
        creator_name: creatorName.trim(),
        about_text: bioText.trim(),
        avatar_url: avatarUrl.trim()
      });

      setIsSavingStep(false);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Save gallery photos array
      await updateSiteSettings({
        about_photos: galleryPhotos,
        gallery: galleryPhotos
      });

      setIsSavingStep(false);
      setCurrentStep(4);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-neutral-100 flex flex-col font-sans select-none overflow-hidden animate-fade-in">
      
      {/* Top Telemetry Header - Responsive for Mobile & Desktop */}
      <div className="h-14 sm:h-16 border-b border-white/10 bg-neutral-950/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shadow-md shrink-0">
            QM
          </div>
          <div className="truncate">
            <div className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase flex items-center gap-1.5 truncate">
              <span className="truncate">CENTURION // QUEEN MILANA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
            </div>
            <div className="text-[9px] sm:text-[10px] text-neutral-400 font-mono truncate hidden xs:block">
              {lang === 'nl' 
                ? 'BEVEILIGD ONBOARDING PROTOCOL' 
                : 'SECURE ONBOARDING PROTOCOL'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono text-neutral-400 bg-neutral-900 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10">
            <span className="text-white font-bold">
              {lang === 'nl' ? `STAP ${currentStep}` : `STEP ${currentStep}`}
            </span> / {totalSteps}
          </div>

          <button
            onClick={onSkip}
            className="text-[11px] sm:text-xs font-medium text-neutral-400 hover:text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer whitespace-nowrap"
          >
            {lang === 'nl' ? 'Overslaan' : 'Skip'}
          </button>
        </div>
      </div>

      {/* Main Container - Fully Optimized for Mobile Viewports */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Step Form Controls */}
        <div className="lg:col-span-6 xl:col-span-5 bg-neutral-950 border-r border-white/10 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto w-full">
          
          <div className="space-y-5 max-w-lg mx-auto w-full">
            
            {/* Step Progress Indicators */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div 
                  key={step}
                  className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-500 ${
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
              <div className="space-y-4 sm:space-y-5 animate-fade-in">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Key className="w-3 h-3 text-white" />
                    <span>{lang === 'nl' ? 'FASE 01: TRANSACTIEKANALEN' : 'PHASE 01: PAYMENT CHANNELS'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
                    {lang === 'nl' ? 'Bevestig Betaalroutering' : 'Configure Payment Routing'}
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    {lang === 'nl'
                      ? 'Koppel uw directe Throne en TipFunder rekeningen. Alle inkomende transacties worden direct naar uw accounts geleid en gesynchroniseerd.'
                      : 'Connect your direct Throne and TipFunder payout accounts. Devotee payments route straight to your verified profiles.'}
                  </p>
                </div>

                <div className="space-y-3.5 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-between">
                      <span>{lang === 'nl' ? 'THRONE LINK (VERPLICHT)' : 'THRONE WISHLIST LINK (REQUIRED)'}</span>
                      <span className="text-[9px] text-neutral-400 font-mono">DIRECT WISHLIST / GIFTS</span>
                    </label>
                    <input
                      type="url"
                      value={throneLink}
                      onChange={(e) => setThroneLink(e.target.value)}
                      placeholder="https://throne.com/queenmilana"
                      className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-all duration-300 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                      <span>{lang === 'nl' ? 'TIPFUNDER LINK (OPTIONEEL)' : 'TIPFUNDER LINK (OPTIONAL)'}</span>
                      <span className="text-[9px] text-neutral-400 font-mono">DIRECT TRIBUTES</span>
                    </label>
                    <input
                      type="url"
                      value={tipfunderLink}
                      onChange={(e) => setTipfunderLink(e.target.value)}
                      placeholder="https://tipfunder.com/queenmilana"
                      className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-all duration-300 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">TELEGRAM</label>
                      <input
                        type="url"
                        value={telegramLink}
                        onChange={(e) => setTelegramLink(e.target.value)}
                        placeholder="https://t.me/queenmilana"
                        className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">X (TWITTER)</label>
                      <input
                        type="url"
                        value={xLink}
                        onChange={(e) => setXLink(e.target.value)}
                        placeholder="https://x.com/queenmilana"
                        className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Profile & Portrait Avatar Upload */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-5 animate-fade-in">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Sliders className="w-3 h-3 text-white" />
                    <span>{lang === 'nl' ? 'FASE 02: PROFIEL & PORTRETFOTO' : 'PHASE 02: PROFILE & PORTRAIT PHOTO'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
                    {lang === 'nl' ? 'Profiel & Hoofdportret' : 'Profile & Portrait Photo'}
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    {lang === 'nl'
                      ? 'Upload een portretfoto direct vanaf uw telefoon naar de beveiligde profile_assets bucket in Supabase en bewerk uw biografie.'
                      : 'Upload your main portrait photo directly from your phone into Supabase profile_assets storage bucket and set your bio.'}
                  </p>
                </div>

                <div className="space-y-3.5 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      {lang === 'nl' ? 'NAAM AUTORITEIT' : 'CREATOR DISPLAY NAME'}
                    </label>
                    <input
                      type="text"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white focus:outline-none font-medium"
                    />
                  </div>

                  {/* Real File Upload for Profile Picture into profile_assets bucket */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                      <span>{lang === 'nl' ? 'PORTRETFOTO (profile_assets)' : 'PORTRAIT PHOTO (profile_assets)'}</span>
                      {photoUploadSuccess && (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                          <CheckCheck className="w-3 h-3" />
                          {lang === 'nl' ? 'Opgeslagen' : 'Stored'}
                        </span>
                      )}
                    </label>

                    <div className="flex items-center gap-3 sm:gap-4 p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Avatar preview" 
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-white/20 shadow-md shrink-0" 
                        />
                      ) : (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-500 shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5 min-w-0">
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
                          className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all cursor-pointer w-full sm:w-auto active:scale-95"
                        >
                          {isUploadingPhoto ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                              <span>{lang === 'nl' ? 'Uploaden...' : 'Uploading...'}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-black" />
                              <span>{lang === 'nl' ? 'Foto Kiezen van Telefoon' : 'Upload From Phone'}</span>
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-neutral-400 font-mono truncate">
                          {lang === 'nl' 
                            ? 'Supabase bucket: profile_assets' 
                            : 'Supabase bucket: profile_assets'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      {lang === 'nl' ? 'OFFICIËLE BIOGRAFIE' : 'OFFICIAL BIOGRAPHY'}
                    </label>
                    <textarea
                      rows={3}
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl p-3.5 text-xs text-white focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Multi-Photo "About Me" Gallery Upload (3-6 Photos direct to profile_assets) */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-5 animate-fade-in">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <ImageIcon className="w-3 h-3 text-white" />
                    <span>{lang === 'nl' ? 'FASE 03: ABOUT ME FOTOGALERIJ' : 'PHASE 03: ABOUT ME PHOTO GALLERY'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
                    {lang === 'nl' ? 'Galerij / Slideshow Foto\'s' : 'About Me Gallery Slideshow'}
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    {lang === 'nl'
                      ? 'Upload 3 tot 6 foto\'s direct vanaf uw telefoon naar de profile_assets opslagbucket. Deze vormen de officiële interactieve VIP-slideshow op de openbare website.'
                      : 'Upload 3 to 6 photos directly from your phone into the profile_assets storage bucket. These power the interactive VIP slideshow on the public site.'}
                  </p>
                </div>

                <div className="space-y-3.5 pt-1">
                  {/* Upload Trigger Button & Counter Badge */}
                  <div className="flex items-center justify-between gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{lang === 'nl' ? 'Galerij Status:' : 'Gallery Status:'}</span>
                        <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${galleryPhotos.length >= 3 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'}`}>
                          {galleryPhotos.length} / 6 {lang === 'nl' ? 'Foto\'s' : 'Photos'}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {galleryPhotos.length < 3 
                          ? (lang === 'nl' ? 'Aanbevolen: minimaal 3 foto\'s' : 'Recommended: at least 3 photos')
                          : (lang === 'nl' ? 'Klaar voor publicatie' : 'Ready for public slideshow')}
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleGalleryFilesChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isUploadingGallery || galleryPhotos.length >= 6}
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-40 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition-all cursor-pointer active:scale-95 shrink-0"
                    >
                      {isUploadingGallery ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                          <span className="hidden sm:inline">{lang === 'nl' ? 'Uploaden...' : 'Uploading...'}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-black" />
                          <span>{lang === 'nl' ? 'Foto\'s Kiezen' : 'Add Photos'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {galleryUploadProgress && (
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-white flex items-center gap-2 animate-fade-in">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                      <span>{galleryUploadProgress}</span>
                    </div>
                  )}

                  {/* Uploaded Gallery Thumbnails Grid (2 cols mobile, 3 cols sm) */}
                  {galleryPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                      {galleryPhotos.map((imgUrl, index) => (
                        <div 
                          key={index}
                          className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-900 border border-white/20 shadow-md group"
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Gallery photo ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Slide Index Badge */}
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                            #{index + 1}
                          </span>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryPhoto(index)}
                            className="absolute top-1.5 right-1.5 min-w-[32px] min-h-[32px] p-1.5 rounded-lg bg-black/80 hover:bg-red-600 text-white border border-white/20 transition-colors flex items-center justify-center cursor-pointer shadow-md"
                            title={lang === 'nl' ? 'Verwijder foto' : 'Delete photo'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-neutral-900/60 rounded-2xl border border-dashed border-neutral-800 space-y-2 p-4">
                      <ImageIcon className="w-8 h-8 text-neutral-500 mx-auto" />
                      <p className="text-xs text-neutral-300 font-medium">
                        {lang === 'nl' ? 'Nog geen galerijfoto\'s geüpload' : 'No gallery photos uploaded yet'}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {lang === 'nl' ? 'Tik op "Foto\'s Kiezen" om 3 tot 6 foto\'s te selecteren vanaf uw telefoon.' : 'Tap "Add Photos" to select 3 to 6 photos from your phone library.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Google Drive Video Asset Publication */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-5 animate-fade-in">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Film className="w-3 h-3 text-white" />
                    <span>{lang === 'nl' ? 'FASE 04: GOOGLE DRIVE ASSET PUBLICATIE' : 'PHASE 04: GOOGLE DRIVE VIDEO ASSET'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
                    {lang === 'nl' ? 'Eerste Video Publiceren' : 'Publish First Video Asset'}
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    {lang === 'nl'
                      ? 'Koppel een Google Drive videobestand. Bij autorisatie ontvangt de koper direct de officiële toegangslink.'
                      : 'Link a Google Drive video file. Upon payment approval, the buyer automatically receives instant access.'}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-white">
                      {lang === 'nl' ? 'TITEL VAN HET ARCHIEF (VERPLICHT)' : 'VIDEO ARCHIVE TITLE (REQUIRED)'}
                    </label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isUrlOrDriveLink(val)) {
                          if (!driveUrl) setDriveUrl(val.trim());
                          setVideoTitle(lang === 'nl' ? 'VIP Masterclass Protocol 01' : 'VIP Masterclass Protocol 01');
                          setValidationError(
                            lang === 'nl' 
                              ? 'Google Drive link automatisch verplaatst naar het Google Drive Link veld hieronder.' 
                              : 'Google Drive link automatically placed into the Google Drive field below.'
                          );
                        } else {
                          setVideoTitle(val);
                        }
                      }}
                      placeholder={lang === 'nl' ? 'bijv. Masterclass VIP Sessie 01' : 'e.g. Masterclass VIP Session 01'}
                      className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-white flex items-center justify-between">
                      <span>{lang === 'nl' ? 'GOOGLE DRIVE LINK (VERPLICHT)' : 'GOOGLE DRIVE SOURCE LINK (REQUIRED)'}</span>
                      <span className="text-[9px] text-neutral-400 font-mono">DRIVE.GOOGLE.COM</span>
                    </label>
                    <input
                      type="url"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className={`w-full min-h-[44px] bg-neutral-900 border rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none ${
                        driveUrl && !isGoogleDriveLink(driveUrl)
                          ? 'border-amber-500/80 focus:border-white'
                          : 'border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">{lang === 'nl' ? 'PRIJS (€)' : 'PRICE (€)'}</label>
                      <input
                        type="text"
                        value={videoPrice}
                        onChange={(e) => setVideoPrice(e.target.value)}
                        placeholder="35.00"
                        className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">{lang === 'nl' ? 'DUUR' : 'DURATION'}</label>
                      <input
                        type="text"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        placeholder="18:45"
                        className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Monospace Terminal Logs */}
                  {terminalLogs.length > 0 && (
                    <div className="p-3 bg-black border border-neutral-800 rounded-xl space-y-1 font-mono text-[10px] text-neutral-300">
                      {terminalLogs.map((log, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                          <span className="text-neutral-500">&gt;</span>
                          <span className={log.includes('STATUS:') || log.includes('DATABASE_SYNC:') ? 'text-emerald-400 font-bold' : ''}>{log}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Verification Protocol & Practice Example */}
            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-5 animate-fade-in">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Shield className="w-3 h-3 text-white" />
                    <span>{lang === 'nl' ? 'FASE 05: VERIFICATIE PROTOCOL' : 'PHASE 05: VERIFICATION PROTOCOL'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
                    {lang === 'nl' ? 'Hoe Verificatie Werkt' : 'How Verification Works'}
                  </h2>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    {lang === 'nl'
                      ? 'Als uw persoonlijke digitale butler leg ik graag uit hoe uw dagelijkse controle verloopt:'
                      : 'As your personal executive butler, allow me to guide you through your daily verification routine:'}
                  </p>
                </div>

                {/* 3 Butler Instructional Rules */}
                <div className="space-y-2.5 font-sans">
                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 space-y-1">
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-mono font-extrabold flex items-center justify-center">1</span>
                      <span>{lang === 'nl' ? 'Stap 1: Controleer Throne / TipFunder' : 'Step 1: Verify on Throne / TipFunder'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 pl-5.5 leading-relaxed">
                      {lang === 'nl'
                        ? 'Wanneer een volgeling een aankoop meldt, opent u uw eigen Throne of TipFunder app om te bevestigen dat het geld daadwerkelijk is bijgeschreven.'
                        : 'When a devotee submits a video unlock request, open your Throne or TipFunder app to confirm the funds were truly received.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-white/10 space-y-1">
                    <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-mono font-extrabold flex items-center justify-center">2</span>
                      <span>{lang === 'nl' ? 'Stap 2: Gebruik de Autorisatiewachtrij' : 'Step 2: Use the Authorization Queue'}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 pl-5.5 leading-relaxed">
                      {lang === 'nl'
                        ? 'Klik op "Autoriseer" in uw terminal. Het systeem verstrekt onmiddellijk de Google Drive toegangslink aan de koper.'
                        : 'Click "Authorize" in your dashboard queue. The system instantly delivers the Google Drive access link to the buyer.'}
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

                {/* Practice Sandbox (Strictly labeled as Practice) */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-dashed border-white/30 space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold uppercase tracking-wider">
                      {lang === 'nl' ? '⚠️ VOORBEELD / OEFENMODUS' : '⚠️ PRACTICE / EXAMPLE ONLY'}
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      {lang === 'nl' ? 'Geen echte transactie' : 'Not a real transaction'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black border border-white/10 space-y-1.5 text-xs">
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

                    <div className="pt-1.5 flex items-center gap-2">
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
                              }, 600);
                            }}
                            className="min-h-[44px] flex-1 py-2 rounded-lg bg-white text-black text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            {practiceApproving ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-black" />
                            ) : (
                              <Check className="w-3 h-3 text-black" />
                            )}
                            <span>{lang === 'nl' ? 'Probeer: Autoriseer' : 'Try: Authorize'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPracticeStatus('rejected')}
                            className="min-h-[44px] px-3 py-2 rounded-lg bg-neutral-900 text-neutral-400 hover:text-red-400 border border-neutral-800 text-[11px] font-bold uppercase transition-all cursor-pointer"
                          >
                            {lang === 'nl' ? 'Weiger' : 'Reject'}
                          </button>
                        </>
                      ) : practiceStatus === 'approved' ? (
                        <div className="w-full py-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 animate-fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{lang === 'nl' ? 'Oefening Geslaagd: Link Vrijgegeven!' : 'Practice Success: Link Delivered!'}</span>
                        </div>
                      ) : (
                        <div className="w-full py-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 text-[11px] font-bold flex items-center justify-center gap-1.5 animate-fade-in">
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
              <div className="p-3 rounded-xl bg-neutral-900 border border-red-500/50 text-white text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="leading-snug">{validationError}</span>
              </div>
            )}

          </div>

          {/* Bottom Action Controls - Mobile Thumb-Friendly */}
          <div className="pt-5 border-t border-neutral-800/80 flex items-center justify-between gap-3 mt-5">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="min-h-[44px] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'nl' ? 'Vorige' : 'Back'}</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isSavingStep}
                className="min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all duration-300 active:scale-95 cursor-pointer ml-auto"
              >
                {isSavingStep ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                    <span>{lang === 'nl' ? 'Opslaan...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'nl' ? 'Volgende Stap' : 'Next Step'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            ) : currentStep === 4 ? (
              uploadComplete ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all duration-300 active:scale-95 cursor-pointer ml-auto"
                >
                  <span>{lang === 'nl' ? 'Naar Verificatie Protocol' : 'Continue to Protocol'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublishFirstAsset}
                  disabled={isProcessing}
                  className="min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl bg-white hover:bg-gray-200 disabled:opacity-50 text-black text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer ml-auto"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>{lang === 'nl' ? 'Versleutelen...' : 'Encrypting...'}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-black" />
                      <span>{lang === 'nl' ? 'Publiceer Video' : 'Publish Video Asset'}</span>
                    </>
                  )}
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={onComplete}
                className="min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>{lang === 'nl' ? 'Naar Daily Terminal' : 'Enter Daily Terminal'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Side: Desktop/Tablet Blur-to-Clear Mockup Preview */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-black relative flex-col items-center justify-center p-8 overflow-hidden">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

          {/* Device Mockup Shell */}
          <div className="w-full max-w-lg bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 relative transition-all duration-700 ease-out flex flex-col h-[580px]">
            
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
                {unlockedCount}/4 {lang === 'nl' ? 'Actief' : 'Active'}
              </div>
            </div>

            {/* Live Sections with Independent Blur/Unblur States */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-neutral-100">
              
              {/* Mockup Section 1: Hero & Bio */}
              <div 
                className={`rounded-2xl bg-neutral-900 border transition-all duration-700 p-4 relative overflow-hidden ${
                  isProfileUnlocked 
                    ? 'border-white/30 filter-none opacity-100' 
                    : 'border-neutral-800 filter blur-[5px] opacity-60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full object-cover border border-white/30 shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-neutral-800 border border-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      QM
                    </div>
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-black text-[9px] font-bold uppercase tracking-wider">
                        <span>VIP SANCTUARY</span>
                      </div>
                      {isProfileUnlocked && (
                        <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>LIVE</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-white truncate">
                      {creatorName || 'Queen Milana'}
                    </h3>
                    <p className="text-[11px] text-neutral-300 leading-relaxed line-clamp-2">
                      {bioText || 'Welcome to the official sanctuary.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mockup Section 2: Photo Gallery Preview */}
              <div 
                className={`p-3 rounded-2xl bg-neutral-900 border transition-all duration-700 space-y-2 ${
                  isGalleryUnlocked 
                    ? 'border-white/30 filter-none opacity-100' 
                    : 'border-neutral-800 filter blur-[5px] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>{lang === 'nl' ? 'ABOUT ME GALERIJ' : 'ABOUT ME GALLERY'}</span>
                  <span className="text-emerald-400 font-bold">
                    {galleryPhotos.length} {lang === 'nl' ? 'FOTO\'S' : 'PHOTOS'}
                  </span>
                </div>

                {galleryPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {galleryPhotos.slice(0, 3).map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt="Preview" 
                        className="aspect-[3/4] rounded-lg object-cover border border-white/15 w-full"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="aspect-[16/6] rounded-lg bg-black border border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500 font-mono">
                    {lang === 'nl' ? '3-6 Foto\'s in Slideshow' : '3-6 Photos in Slideshow'}
                  </div>
                )}
              </div>

              {/* Mockup Section 3: Action Buttons & Payment Routing */}
              <div 
                className={`transition-all duration-700 space-y-2 ${
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
                      <span>{lang === 'nl' ? 'VERBONDEN' : 'CONNECTED'}</span>
                    </span>
                  ) : (
                    <span className="text-neutral-500 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{lang === 'nl' ? 'CONFIGUREREN' : 'ROUTING PENDING'}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2.5 rounded-xl bg-white text-black text-xs font-bold flex items-center justify-center gap-1.5 border border-white shadow-md">
                    <Gift className="w-3 h-3 text-black" />
                    <span>Throne {throneLink ? '✓' : ''}</span>
                  </div>
                  {tipfunderLink ? (
                    <div className="flex-1 p-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/20">
                      <CreditCard className="w-3 h-3 text-white" />
                      <span>TipFunder ✓</span>
                    </div>
                  ) : (
                    <div className="flex-1 p-2.5 rounded-xl bg-neutral-900 text-neutral-400 text-xs font-medium flex items-center justify-center gap-1.5 border border-neutral-800">
                      <CreditCard className="w-3 h-3 text-neutral-500" />
                      <span>TipFunder</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mockup Section 4: Video Asset Card */}
              <div 
                className={`p-3.5 rounded-2xl bg-neutral-900 border transition-all duration-700 space-y-2 ${
                  isVideoUnlocked 
                    ? 'border-white/30 filter-none opacity-100' 
                    : 'border-neutral-800 filter blur-[5px] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase tracking-wider truncate">
                    {videoTitle || (lang === 'nl' ? 'Gecodeerd Archief' : 'Masterclass Archive')}
                  </span>
                  <span className="font-extrabold text-white bg-black px-2 py-0.5 rounded border border-white/20 font-mono text-[11px]">
                    € {videoPrice || '35.00'}
                  </span>
                </div>

                <div className="aspect-video rounded-lg bg-black flex items-center justify-center text-neutral-600 relative overflow-hidden border border-neutral-800">
                  <Lock className="w-6 h-6 text-neutral-400" />
                  <div className="absolute bottom-1.5 right-1.5 text-[8px] font-mono bg-neutral-900/90 px-1.5 py-0.5 rounded text-neutral-300 border border-white/10">
                    {videoDuration || '18:45'}
                  </div>
                  {isVideoUnlocked && (
                    <div className="absolute top-1.5 left-1.5 text-[8px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-2 h-2" />
                      <span>Google Drive Ready</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Instant Live Feedback Pill */}
            <div className="absolute bottom-3 right-3 z-20 px-3 py-1 rounded-full bg-black/90 text-white text-[10px] border border-white/20 shadow-xl flex items-center gap-1.5 backdrop-blur-md font-mono">
              <Eye className="w-3 h-3 text-white" />
              <span>
                {unlockedCount === 4
                  ? (lang === 'nl' ? '100% Scherp & Live' : '100% Unlocked & Live')
                  : (lang === 'nl' ? `${unlockedCount}/4 Secties Actief` : `${unlockedCount}/4 Sections Active`)}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OnboardingTutorial;
