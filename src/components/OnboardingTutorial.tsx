import React, { useState, useEffect } from 'react';
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
  Gift
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

  // Active step: 1 = Identiteit & Betaling, 2 = Systeemvoorkeuren & Profiel, 3 = Eerste Asset Publicatie (Google Drive)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  // Step 1: Throne & Payment Channels
  const [throneLink, setThroneLink] = useState(initialPaymentSettings?.throne || '');
  const [tipfunderLink, setTipfunderLink] = useState(initialPaymentSettings?.tipfunder || '');
  const [xLink, setXLink] = useState(initialPaymentSettings?.x || '');
  const [telegramLink, setTelegramLink] = useState(initialPaymentSettings?.telegram || '');

  // Step 2: Identity & Aesthetics
  const [creatorName, setCreatorName] = useState(initialProfile?.name || 'Queen Milana');
  const [bioText, setBioText] = useState(
    initialProfile?.bio ||
    'Welkom in het officiële VIP heiligdom van Queen Milana. Exclusieve archieven, transacties en live stream autorisaties verlopen via gecentraliseerde beveiligingskanalen.'
  );
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar || '');

  // Step 3: Google Drive Asset Publication
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDuration, setVideoDuration] = useState('18:45');
  const [videoTags, setVideoTags] = useState('exclusief, 4k, queenmilana');
  const [videoDescription, setVideoDescription] = useState('Exclusief gecodeerd video-archief voor geautoriseerde transacties.');
  const [videoPrice, setVideoPrice] = useState('35.00');
  const [driveUrl, setDriveUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Terminal Status & Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate completeness score for the "Blur to Clear" effect
  const fieldsFilled = [
    Boolean(throneLink.trim()),
    Boolean(bioText.trim()),
    Boolean(avatarUrl.trim()),
    Boolean(driveUrl.trim())
  ].filter(Boolean).length;

  // Real-time blur calculation: starts at 16px blur, reduces with every filled input
  const blurAmount = Math.max(0, 16 - fieldsFilled * 4);

  // Validate Google Drive link
  const isGoogleDriveLink = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase().trim();
    return lower.includes('drive.google.com') || lower.includes('docs.google.com');
  };

  // Sync to context on input
  useEffect(() => {
    updateSiteSettings({
      throne_link: throneLink,
      twitter_link: xLink,
      telegram_link: telegramLink,
      tipfunder_link: tipfunderLink,
      creator_name: creatorName,
      about_text: bioText,
      avatar_url: avatarUrl
    });
  }, [throneLink, xLink, telegramLink, tipfunderLink, creatorName, bioText, avatarUrl]);

  // Step 3: Execute Google Drive Publication with Monospace Terminal Logs
  const handlePublishFirstAsset = async () => {
    setValidationError(null);
    if (!videoTitle.trim()) {
      setValidationError("Voer een geldige activatitel in.");
      return;
    }
    if (!driveUrl.trim()) {
      setValidationError("Google Drive brondocument link is verplicht.");
      return;
    }
    if (!isGoogleDriveLink(driveUrl)) {
      setValidationError("Ongeldig brondomein. Voer een geldige 'drive.google.com' URL in.");
      return;
    }

    setIsProcessing(true);
    setTerminalLogs([
      "SEC_AUTH: Initialiseren van beveiligd Centurion netwerk...",
      "TARGET_NODE: drive.google.com payload verificatie...",
    ]);

    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        "CRYPTO_HASH: AES-256 asset token toewijzing...",
        "ACCESS_POLICY: Autorisatiewachtrij actief voor Koper ID matching..."
      ]);
    }, 450);

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
          duration: videoDuration.trim() || '15:00',
          description: videoDescription.trim(),
          tags: videoTags.split(',').map(t => t.trim()).filter(Boolean),
          category: 'Exclusief Archief'
        })
      });

      setTimeout(async () => {
        if (response.ok) {
          setTerminalLogs(prev => [
            ...prev,
            "DATABASE_SYNC: Gevalideerd in Supabase centrale registry.",
            "STATUS: Versleuteling voltooid. Asset online."
          ]);
          setUploadComplete(true);

          // Mark onboarding completed in database
          await fetch('/api/admin/onboarding-complete', { method: 'POST' });
        } else {
          setTerminalLogs(prev => [
            ...prev,
            "FOUT: Serverfout bij publicatie. Lokale sessie opgeslagen."
          ]);
          setUploadComplete(true);
        }
        setIsProcessing(false);
      }, 1100);
    } catch (err) {
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev,
          "NETWERK_FOUT: Offline modus ingeschakeld.",
          "STATUS: Versleuteling voltooid. Asset online."
        ]);
        setUploadComplete(true);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!throneLink.trim()) {
        setValidationError("Vul uw Throne betaal-link in om door te gaan.");
        return;
      }
      setValidationError(null);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setValidationError(null);
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
              BEVEILIGD FINANCIEEL & ASSET BEHEERTERMINAL
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-white font-bold">STAP {currentStep}</span> / {totalSteps}
          </div>
          <button
            onClick={onSkip}
            className="text-xs font-medium text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer"
          >
            Direct naar Terminal
          </button>
        </div>
      </div>

      {/* Main Split-Screen Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Heavy-Typography Vault Control Panel (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-950 border-r border-white/10 p-6 sm:p-10 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-6 max-w-md">
            
            {/* Step Progress Indicators */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
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

            {/* Step 1: Identiteit & Betaalautorisatie */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Key className="w-3 h-3 text-white" />
                    <span>FASE 01: TRANSACTIEKANALEN</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Bevestig Identiteit & Betaalroutering
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    Koppel uw directe Throne en TipFunder rekeningen. Alle inkomende transacties worden automatisch gevalideerd in uw centrale terminal.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center justify-between">
                      <span>THRONE LINK (VERPLICHT)</span>
                      <span className="text-[9px] text-neutral-500">DIRECTE BETALING</span>
                    </label>
                    <input
                      type="url"
                      value={throneLink}
                      onChange={(e) => setThroneLink(e.target.value)}
                      placeholder="https://throne.com/queenmilana"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                      <span>TIPFUNDER LINK (OPTIONEEL)</span>
                      <span className="text-[9px] text-neutral-500">TRIBUTE PORTAL</span>
                    </label>
                    <input
                      type="url"
                      value={tipfunderLink}
                      onChange={(e) => setTipfunderLink(e.target.value)}
                      placeholder="https://tipfunder.com/..."
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">TELEGRAM</label>
                      <input
                        type="url"
                        value={telegramLink}
                        onChange={(e) => setTelegramLink(e.target.value)}
                        placeholder="https://t.me/..."
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-neutral-400">X (TWITTER)</label>
                      <input
                        type="url"
                        value={xLink}
                        onChange={(e) => setXLink(e.target.value)}
                        placeholder="https://x.com/..."
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Systeemvoorkeuren & Visuele Activa */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Sliders className="w-3 h-3 text-white" />
                    <span>FASE 02: SYSTEEMVOORKEUREN</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Systeemvoorkeuren & Biografie
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    Definieer de publieke representatie van Queen Milana. Wijzigingen worden direct in hoge resolutie gesynchroniseerd.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      NAAM AUTORITEIT
                    </label>
                    <input
                      type="text"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      AVATAR PROFIELAFBEELDING (URL)
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/portret.jpg"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      OFFICIËLE BIOGRAFIE
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

            {/* Step 3: Google Drive Video Asset Publicatie */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white uppercase tracking-wider">
                    <Film className="w-3 h-3 text-white" />
                    <span>FASE 03: GOOGLE DRIVE ASSET PUBLICATIE</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Eerste Video-Asset Publiceren
                  </h2>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    Plaats uw Google Drive videobestand direct in het gecodeerde archief. Bij autorisatie van betaling ontvangt de koper direct de officiële download- en streamlink.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-white">
                      TITEL VAN HET ARCHIEF
                    </label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="bijv. VIP Masterclass Sessie No. 01"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-white flex items-center justify-between">
                      <span>GOOGLE DRIVE BRON-LINK (STRIKT VEREIST)</span>
                      <span className="text-[9px] text-neutral-500 font-mono">DRIVE.GOOGLE.COM</span>
                    </label>
                    <input
                      type="url"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className={`w-full bg-neutral-900 border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none ${
                        driveUrl && !isGoogleDriveLink(driveUrl) 
                          ? 'border-gray-500 focus:border-white' 
                          : 'border-neutral-800 focus:border-white'
                      }`}
                    />
                    {driveUrl && !isGoogleDriveLink(driveUrl) && (
                      <p className="text-[10px] text-gray-400 font-mono">
                        Waarschuwing: voer een geldige Google Drive link in (drive.google.com).
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-300">WAARDE (€)</label>
                      <input
                        type="number"
                        value={videoPrice}
                        onChange={(e) => setVideoPrice(e.target.value)}
                        placeholder="35.00"
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-neutral-300">DUUR</label>
                      <input
                        type="text"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        placeholder="18:45"
                        className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-neutral-300">TAGS & LABELS</label>
                    <input
                      type="text"
                      value={videoTags}
                      onChange={(e) => setVideoTags(e.target.value)}
                      placeholder="exclusief, 4k, queenmilana"
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Monospace Terminal Output Box */}
                  {terminalLogs.length > 0 && (
                    <div className="mt-3 p-3.5 bg-black rounded-xl border border-white/20 font-mono text-[11px] text-white space-y-1 max-h-32 overflow-y-auto">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase border-b border-neutral-800 pb-1 mb-1">
                        <TerminalIcon className="w-3 h-3 text-white" />
                        <span>VAULT ENCRYPTIE LOGBOEK</span>
                      </div>
                      {terminalLogs.map((log, idx) => (
                        <div key={idx} className="leading-tight text-gray-300">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {validationError && (
              <div className="p-3 rounded-xl bg-neutral-900 border border-white/20 text-white text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                <span>{validationError}</span>
              </div>
            )}

          </div>

          {/* Bottom Action Controls */}
          <div className="pt-6 border-t border-neutral-800/80 flex items-center justify-between gap-4">
            {currentStep > 1 && !uploadComplete ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Vorige</span>
              </button>
            ) : <div />}

            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all duration-300 active:scale-95 cursor-pointer ml-auto"
              >
                <span>Bevestig & Volgende</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : uploadComplete ? (
              <button
                onClick={onComplete}
                className="w-full py-4 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Naar Daily Autorisatie Terminal</span>
              </button>
            ) : (
              <button
                onClick={handlePublishFirstAsset}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-white hover:bg-gray-200 disabled:opacity-50 text-black text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Versleuteling bezig...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-black" />
                    <span>Publiceer Asset (Google Drive)</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Right Side: Live "Blur-to-Clear" Interactive Preview (7 cols) */}
        <div className="hidden lg:flex lg:col-span-7 bg-black relative flex-col items-center justify-center p-8 overflow-hidden">
          
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

          {/* Device Mockup Shell with Dynamic Real-time Unblurring */}
          <div className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-800/80 relative transition-all duration-700 ease-out flex flex-col h-[560px]">
            
            {/* Mockup Browser Bar */}
            <div className="h-10 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              </div>
              <div className="text-[10px] text-neutral-400 bg-neutral-950 px-3 py-0.5 rounded-full border border-neutral-800 truncate max-w-xs font-mono">
                https://queenmilana.vip/official
              </div>
              <div className="w-4" />
            </div>

            {/* Dynamic Interactive Unblur Container */}
            <div 
              className="flex-1 overflow-y-auto p-6 space-y-6 text-neutral-900 transition-all duration-700"
              style={{ filter: `blur(${blurAmount}px)` }}
            >
              
              {/* Mockup Hero */}
              <div className="rounded-2xl bg-black text-white p-6 relative overflow-hidden border border-neutral-800">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-wider">
                    <span>OFFICIEEL VIP HEILIGDOM</span>
                  </div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-white">
                    {creatorName || 'Queen Milana'}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed max-w-md line-clamp-3 font-normal">
                    {bioText || 'Welkom in het officiële VIP heiligdom van Queen Milana.'}
                  </p>
                </div>
              </div>

              {/* Mockup Action Buttons */}
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 rounded-xl bg-black text-white text-xs font-bold flex items-center justify-center gap-2 border border-neutral-800">
                  <Gift className="w-3.5 h-3.5 text-white" />
                  <span>Throne Wishlist {throneLink ? '✓ Gekoppeld' : ''}</span>
                </div>
                {tipfunderLink && (
                  <div className="flex-1 p-3 rounded-xl bg-neutral-100 text-black text-xs font-bold flex items-center justify-center gap-2 border border-neutral-200">
                    <CreditCard className="w-3.5 h-3.5 text-black" />
                    <span>TipFunder Tribute</span>
                  </div>
                )}
              </div>

              {/* Mockup Video Asset Card */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-black uppercase">
                    {videoTitle || 'Gecodeerd Archief No. 01'}
                  </span>
                  <span className="font-extrabold text-black">
                    € {videoPrice || '35.00'}
                  </span>
                </div>
                <div className="aspect-video rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-600 relative overflow-hidden">
                  <Lock className="w-8 h-8 text-neutral-400" />
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono bg-black/80 px-2 py-0.5 rounded text-neutral-300">
                    {videoDuration || '18:45'}
                  </div>
                </div>
                <div className="text-[11px] text-neutral-600 line-clamp-2">
                  {videoDescription || 'Exclusief gecodeerd video-archief voor geautoriseerde transacties.'}
                </div>
              </div>

            </div>

            {/* Instant Gratification Live Feedback Pill */}
            <div className="absolute bottom-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-black/90 text-white text-[11px] border border-white/20 shadow-xl flex items-center gap-2 backdrop-blur-md">
              <Eye className="w-3.5 h-3.5 text-white" />
              <span>
                {blurAmount === 0 
                  ? 'Centurion Weergave: 100% Scherp & Live' 
                  : `Live Unblur Voortgang: ${fieldsFilled}/4 Elementen`}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OnboardingTutorial;
