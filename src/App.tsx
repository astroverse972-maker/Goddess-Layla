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

export function App() {
  const [lang, setLang] = useState<'fr' | 'en'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<CollectionItem | null>(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMistressAdminOpen, setIsMistressAdminOpen] = useState(false);

  // Live Stream State from Server
  const [liveState, setLiveState] = useState({
    isLive: false,
    title: 'Exclusive Live Session with Goddess Layla',
    description: 'Exclusive live stream preview. Enter my VIP sanctuary. Reserved for verified devotees.',
    price: '20.00 €',
    streamUrl: 'https://i.imgur.com/m0CSW44.mp4',
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
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchServerState();
    const interval = setInterval(fetchServerState, 5000); // sync every 5 seconds

    // Check if URL indicates admin portal request
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        path.includes('/admin') ||
        path.includes('/layla') ||
        path.includes('/goddess') ||
        path.includes('/espace-reine') ||
        path.includes('/reine') ||
        search.includes('admin') ||
        hash.includes('admin') ||
        hash.includes('espace-reine')
      ) {
        setIsMistressAdminOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    // Discrete Keyboard Shortcut: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsMistressAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const allCollectionItems = [...customMedia, ...COLLECTION_ITEMS];

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
        onOpenAdmin={() => setIsMistressAdminOpen(true)}
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

        {/* Boss Inaya Bio & Slideshow Section */}
        <AboutBio lang={lang} />

      </main>

      {/* Footer */}
      <Footer lang={lang} onOpenAdmin={() => setIsMistressAdminOpen(true)} />

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
        onClose={() => setIsMistressAdminOpen(false)}
        lang={lang}
        currentLiveState={liveState}
        onUpdateLiveState={(newState) => setLiveState(newState)}
        onUploadMediaSuccess={fetchServerState}
      />

    </div>
  );
}

export default App;

