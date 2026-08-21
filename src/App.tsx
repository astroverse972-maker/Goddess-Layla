import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TheCollection } from './components/TheCollection';
import { AboutBio } from './components/AboutBio';
import { TributeSection } from './components/TributeSection';
import { Footer } from './components/Footer';
import { MediaModal } from './components/MediaModal';
import { LiveModal } from './components/LiveModal';
import { WishlistModal } from './components/WishlistModal';
import { PaymentModal } from './components/PaymentModal';
import { ContactModal } from './components/ContactModal';
import { MistressAdminModal } from './components/MistressAdminModal';
import { COLLECTION_ITEMS, CollectionItem } from './data/collectionData';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

export function MainAppContent() {
  const [lang, setLang] = useState<'fr' | 'en'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<CollectionItem | null>(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMistressAdminOpen, setIsMistressAdminOpen] = useState(false);

  // Hidden/Removed Video IDs State (for soft removal from page)
  const [hiddenVideoIds, setHiddenVideoIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('goddess_hidden_videos') || '[]');
    } catch {
      return [];
    }
  });

  // Live Stream State from Server
  const [liveState, setLiveState] = useState({
    isLive: false,
    title: 'Exclusive Live Session with Goddess Milana',
    description: 'Exclusive live stream preview. Enter my VIP sanctuary. Reserved for verified devotees.',
    price: '20.00 €',
    streamUrl: '',
  });

  // Custom Uploaded Media Items
  const [customMedia, setCustomMedia] = useState<CollectionItem[]>([]);

  // Fetch live stream status and uploaded media on load with resilient fallback
  const fetchServerState = () => {
    fetch('/api/live-status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.isLive === 'boolean') {
          setLiveState(data);
        } else {
          const savedLocal = localStorage.getItem('goddess_live_state');
          if (savedLocal) {
            try { setLiveState(JSON.parse(savedLocal)); } catch (e) {}
          }
        }
      })
      .catch(() => {
        const savedLocal = localStorage.getItem('goddess_live_state');
        if (savedLocal) {
          try { setLiveState(JSON.parse(savedLocal)); } catch (e) {}
        }
      });

    fetch('/api/custom-media')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setCustomMedia(data);
        } else if (data && Array.isArray(data.media)) {
          setCustomMedia(data.media);
          if (Array.isArray(data.hiddenVideoIds)) {
            setHiddenVideoIds(data.hiddenVideoIds);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchServerState();
    const interval = setInterval(fetchServerState, 5000); // sync every 5 seconds

    // Check if URL indicates admin portal request strictly via path /admin
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path === '/admin/' || path.startsWith('/admin/')) {
        setIsMistressAdminOpen(true);
      } else {
        setIsMistressAdminOpen(false);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);

    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsMistressAdminOpen(false);
    if (window.location.pathname.toLowerCase().startsWith('/admin')) {
      window.history.replaceState(null, '', '/');
    }
  };

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Remove video from public page view without backend database deletion
  const handleDeleteVideo = (videoId: string) => {
    const updatedHidden = Array.from(new Set([...hiddenVideoIds, videoId]));
    setHiddenVideoIds(updatedHidden);
    try {
      localStorage.setItem('goddess_hidden_videos', JSON.stringify(updatedHidden));
    } catch (e) {}

    // Send soft-delete signal to server so video is hidden for all visitors
    fetch('/api/custom-media/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    }).catch(() => {});
  };

  // Filter out any hidden videos from public display
  const rawCollection = [...customMedia, ...COLLECTION_ITEMS];
  const allCollectionItems = rawCollection.filter((item) => !hiddenVideoIds.includes(item.id));

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'fr' ? 'en' : 'fr'))}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
        onOpenContact={() => setIsContactModalOpen(true)}
        onOpenShop={scrollToCollection}
      />

      {/* Main Page Layout */}
      <main className="space-y-8 pb-12">
        
        {/* Hero Watch Me Live Card */}
        <Hero
          lang={lang}
          liveState={liveState}
          onJoinLive={() => setIsLiveModalOpen(true)}
        />

        {/* The Collection Grid */}
        <TheCollection
          items={allCollectionItems}
          searchQuery={searchQuery}
          lang={lang}
          onSelectItem={(item) => setSelectedMedia(item)}
        />

        {/* Tribute Section */}
        <TributeSection lang={lang} />

        {/* Goddess Milana Bio & Slideshow Section */}
        <AboutBio lang={lang} />

      </main>

      {/* Footer */}
      <Footer lang={lang} />

      {/* Modals */}
      <MediaModal
        item={selectedMedia}
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        lang={lang}
      />

      <LiveModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        lang={lang}
        liveState={liveState}
      />

      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        lang={lang}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        lang={lang}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        lang={lang}
      />

      <MistressAdminModal
        isOpen={isMistressAdminOpen}
        onClose={handleCloseAdmin}
        lang={lang}
        currentLiveState={liveState}
        onUpdateLiveState={(newState) => setLiveState(newState)}
        onUploadMediaSuccess={fetchServerState}
        publishedVideos={allCollectionItems}
        onDeleteVideo={handleDeleteVideo}
      />

    </div>
  );
}

export function App() {
  return (
    <SiteSettingsProvider>
      <MainAppContent />
    </SiteSettingsProvider>
  );
}

export default App;
