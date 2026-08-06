import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Lock, Image as ImageIcon, Sparkles, ExternalLink, Eye } from 'lucide-react';
import { AUDIO_TEASERS } from '../data/ariaData';
import { AudioTeaser } from '../types';
import heroPortrait from '../assets/images/aria_hero_portrait_1785642523890.jpg';
import throneBanner from '../assets/images/aria_throne_room_1785642536151.jpg';
import { audioSynth } from '../utils/audioSynth';

export const TheVault: React.FC = () => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [activePhotoCategory, setActivePhotoCategory] = useState<string>('all');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  const galleryPhotos = [
    { id: 'p1', title: 'Throne Room Editorial', category: 'editorial', src: throneBanner, desc: 'High fashion obsidian throne shoot with crimson velvet accents.' },
    { id: 'p2', title: 'Empress Portrait in Silk', category: 'photoshoots', src: heroPortrait, desc: 'Official portrait depicting regal presence and obsidian crown.' },
  ];

  const handlePlayTeaser = (teaser: AudioTeaser) => {
    if (playingAudioId === teaser.id) {
      audioSynth.stopTeaserTone();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(teaser.id);
      audioSynth.playTeaserTone(teaser.synthFrequency, 5000, () => {
        setPlayingAudioId(null);
      });
    }
  };

  return (
    <section id="vault" className="py-20 bg-neutral-950 border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full btn-liquid-secondary text-xs font-mono uppercase tracking-widest text-rose-200">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>Exclusive Archives</span>
          </div>
          <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            THE VAULT & VOICE TEASERS
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto font-normal">
            Preview bespoke audio notes, visual teasers, and high-fashion editorial archives from Maitresse Aria's personal collection.
          </p>
        </div>

        {/* Audio Teasers Player Grid */}
        <div className="space-y-4">
          <h3 className="font-sans font-bold text-xl text-white border-l-2 border-rose-400 pl-3">
            Bespoke Audio Voice Teasers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUDIO_TEASERS.map((teaser) => {
              const isPlaying = playingAudioId === teaser.id;

              return (
                <div
                  key={teaser.id}
                  className={`p-6 rounded-3xl liquid-card transition-all duration-300 flex items-center justify-between gap-4 ${
                    isPlaying
                      ? 'border-amber-400/80 bg-rose-950/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                      : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-rose-200 border border-white/10">
                        {teaser.category}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">{teaser.duration}</span>
                    </div>
                    <h4 className="font-sans font-bold text-base text-white">{teaser.title}</h4>
                    <p className="text-xs text-neutral-400 font-normal">{teaser.description}</p>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => handlePlayTeaser(teaser)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 active:scale-95 shadow-lg ${
                      isPlaying
                        ? 'btn-liquid-gold text-neutral-950 animate-pulse'
                        : 'btn-liquid-primary text-rose-200'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Teaser Archives */}
        <div className="space-y-4 pt-6">
          <h3 className="font-sans font-bold text-xl text-white border-l-2 border-rose-400 pl-3">
            Editorial Photo Archives
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {galleryPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhotoModal(photo.src)}
                className="group relative rounded-3xl overflow-hidden liquid-card cursor-pointer shadow-2xl border border-white/20"
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-72 object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-sans font-bold text-lg text-white">{photo.title}</h4>
                      <p className="text-xs text-neutral-300 font-normal mt-1">{photo.desc}</p>
                    </div>
                    <div className="p-3 rounded-full btn-liquid-secondary text-rose-200 group-hover:scale-110 transition-transform">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        {selectedPhotoModal && (
          <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full liquid-card rounded-3xl overflow-hidden shadow-2xl border border-white/20">
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full btn-liquid-secondary text-white"
              >
                ✕
              </button>
              <img
                src={selectedPhotoModal}
                alt="Vault Archive Full Preview"
                referrerPolicy="no-referrer"
                className="w-full max-h-[80vh] object-contain bg-black"
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
