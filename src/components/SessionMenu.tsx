import React, { useState } from 'react';
import { Crown, Sparkles, Clock, ShieldCheck, Calculator, ArrowRight, Check, Plus } from 'lucide-react';
import { SESSION_OFFERINGS } from '../data/ariaData';
import { SessionOffering } from '../types';

interface SessionMenuProps {
  onSelectOfferingForBooking: (offering: SessionOffering, calculatedTotal: number, addOns: string[]) => void;
}

export const SessionMenu: React.FC<SessionMenuProps> = ({ onSelectOfferingForBooking }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedOffering, setSelectedOffering] = useState<SessionOffering>(SESSION_OFFERINGS[0]);
  const [durationMultiplier, setDurationMultiplier] = useState<number>(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const addOnOptions = [
    { id: 'add-priority', label: '24-Hour Priority Processing', price: 100 },
    { id: 'add-script', label: 'Bespoke Custom Written Script', price: 150 },
    { id: 'add-lock', label: 'Cryptographic Lock Key Vaulting', price: 200 },
    { id: 'add-nda', label: 'Enhanced Bilateral NDA Agreement', price: 100 },
  ];

  const filteredOfferings = activeCategory === 'all'
    ? SESSION_OFFERINGS
    : SESSION_OFFERINGS.filter(s => s.category === activeCategory);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    let base = selectedOffering.price * durationMultiplier;
    selectedAddOns.forEach(addonId => {
      const match = addOnOptions.find(a => a.id === addonId);
      if (match) base += match.price;
    });
    return base;
  };

  const totalTribute = calculateTotal();

  return (
    <section id="sessions" className="py-20 bg-neutral-950 border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full btn-liquid-secondary text-xs font-mono uppercase tracking-widest text-rose-200">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Consultation & Offerings</span>
          </div>
          <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            SESSION MENU & CALCULATOR
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto font-normal">
            Select your desired tier or utilize the live calculator to estimate tribute requirements for bespoke sessions.
          </p>
        </div>

        {/* Category Filters as Liquid Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 max-w-fit mx-auto">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: 'in-person', label: 'In-Person' },
            { id: 'findom', label: 'Findom & Drain' },
            { id: 'chastity', label: 'Chastity & Lock' },
            { id: 'custom-media', label: 'Custom Audio/Video' },
            { id: 'virtual', label: 'Virtual Live' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'btn-liquid-primary text-amber-200 font-bold shadow-lg'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOfferings.map((offering) => {
            const isSelected = selectedOffering.id === offering.id;

            return (
              <div
                key={offering.id}
                className={`relative rounded-3xl p-7 liquid-card flex flex-col justify-between transition-all duration-300 ${
                  isSelected
                    ? 'border-amber-400/80 bg-rose-950/20 shadow-[0_0_35px_rgba(245,158,11,0.2)]'
                    : ''
                }`}
              >
                {offering.popular && (
                  <div className="absolute -top-3.5 right-6 btn-liquid-gold text-neutral-950 font-mono text-[10px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg">
                    Popular Protocol
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-sans font-bold text-xl text-white">{offering.title}</h3>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-extrabold text-rose-300">${offering.price}</span>
                    <span className="text-xs text-neutral-400 font-mono">/ {offering.duration}</span>
                  </div>

                  <p className="text-xs text-neutral-300 font-normal leading-relaxed">
                    {offering.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <div className="text-[11px] font-mono text-rose-300 uppercase tracking-wider">Features Included:</div>
                    <ul className="space-y-2">
                      {offering.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                          <Check className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <button
                    onClick={() => setSelectedOffering(offering)}
                    className={`w-full py-3 rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'btn-liquid-gold text-neutral-950 font-bold shadow-lg'
                        : 'btn-liquid-primary text-rose-200'
                    }`}
                  >
                    <span>{isSelected ? 'Active in Calculator' : 'Select Offering'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Tribute Calculator Panel */}
        <div className="liquid-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/20">
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl btn-liquid-gold text-amber-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-xl font-bold text-white">Live Session Tribute Calculator</h3>
              <p className="text-xs text-neutral-400">Customize duration and add-ons to preview exact tribute requirements.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Base Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-rose-300 uppercase tracking-wider">Selected Base Offering</label>
              <div className="p-3.5 liquid-input rounded-2xl text-amber-200 font-sans font-bold text-sm">
                {selectedOffering.title} (${selectedOffering.price})
              </div>
            </div>

            {/* 2. Duration Multiplier */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-rose-300 uppercase tracking-wider">Duration Multiplier</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(mult => (
                  <button
                    key={mult}
                    onClick={() => setDurationMultiplier(mult)}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-mono transition-all ${
                      durationMultiplier === mult
                        ? 'btn-liquid-primary text-amber-200 font-bold shadow-md'
                        : 'btn-liquid-secondary text-neutral-400'
                    }`}
                  >
                    {mult}x ({mult * parseInt(selectedOffering.duration)} {selectedOffering.duration.includes('Days') ? 'Days' : 'Mins'})
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Add-ons Selection */}
            <div className="space-y-2 col-span-1 md:col-span-3">
              <label className="text-xs font-mono text-rose-300 uppercase tracking-wider">Optional Protocol Add-Ons</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addOnOptions.map(addon => {
                  const isChecked = selectedAddOns.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`p-3.5 rounded-2xl text-left text-xs transition-all flex items-center justify-between ${
                        isChecked
                          ? 'btn-liquid-primary border-amber-400/80 text-amber-200 font-medium'
                          : 'btn-liquid-secondary text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-full ${isChecked ? 'bg-amber-400 text-neutral-950' : 'bg-white/10'}`}>
                          <Plus className="w-3 h-3" />
                        </div>
                        <span>{addon.label}</span>
                      </div>
                      <span className="font-mono text-amber-300 font-bold">+${addon.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Calculator Output & Action */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-neutral-400 uppercase">Estimated Total Tribute Requirement:</div>
              <div className="text-3xl font-mono font-bold text-amber-300">${totalTribute} USD</div>
            </div>

            <button
              onClick={() => onSelectOfferingForBooking(selectedOffering, totalTribute, selectedAddOns)}
              className="w-full sm:w-auto btn-liquid-gold px-8 py-3.5 text-neutral-950 font-mono text-xs uppercase tracking-widest font-bold rounded-full shadow-xl flex items-center justify-center gap-2 animate-shimmer-sheen overflow-hidden"
            >
              <span>Submit Inquiry With Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
