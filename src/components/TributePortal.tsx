import React, { useState } from 'react';
import { Coins, Heart, Gift, ExternalLink, Sparkles, Send, Copy, Check, ShieldCheck } from 'lucide-react';
import { WISHLIST_ITEMS, DEVOTION_LOGS, SOCIAL_LINKS } from '../data/ariaData';
import { DevotionLog } from '../types';
import { audioSynth } from '../utils/audioSynth';

export const TributePortal: React.FC = () => {
  const [logs, setLogs] = useState<DevotionLog[]>(DEVOTION_LOGS);
  const [devoteeName, setDevoteeName] = useState('');
  const [customAmount, setCustomAmount] = useState<number>(50);
  const [tributeMessage, setTributeMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [submittedTribute, setSubmittedTribute] = useState(false);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSimulateTribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAmount || customAmount <= 0) return;

    const newLog: DevotionLog = {
      id: `dev-${Date.now()}`,
      devoteeName: devoteeName.trim() || 'Anonymous Devotee',
      amount: customAmount,
      timestamp: 'Just now',
      message: tributeMessage.trim() || 'Silent Tribute offered with utmost respect.',
      badge: 'Interactive Devotee'
    };

    setLogs([newLog, ...logs]);
    setSubmittedTribute(true);
    audioSynth.playChime();

    setTimeout(() => {
      setSubmittedTribute(false);
      setDevoteeName('');
      setTributeMessage('');
    }, 3000);
  };

  return (
    <section id="tributes" className="py-20 bg-neutral-950 border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full btn-liquid-secondary text-xs font-mono uppercase tracking-widest text-rose-200">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span>Honors & Devotion</span>
          </div>
          <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            TRIBUTE PORTAL & WISHLIST
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto font-normal">
            Tribute demonstrates honor and unlocks priority attention. Choose from direct payment channels, wishlist fulfillment, or present a silent tribute.
          </p>
        </div>

        {/* Direct Tribute Shortcut Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* CashApp */}
          <div className="liquid-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-emerald-400 uppercase">CashApp Tag</span>
              <h4 className="font-sans font-bold text-lg text-white">{SOCIAL_LINKS.cashapp}</h4>
              <p className="text-xs text-neutral-400 font-normal">Direct instant cash drain & consultation tribute.</p>
            </div>
            <button
              onClick={() => handleCopy(SOCIAL_LINKS.cashapp, 'cashapp')}
              className="w-full py-2.5 btn-liquid-secondary text-amber-200 rounded-full text-xs font-mono uppercase flex items-center justify-center gap-1.5"
            >
              {copiedLink === 'cashapp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink === 'cashapp' ? 'Tag Copied' : 'Copy CashApp'}</span>
            </button>
          </div>

          {/* Throne Wishlist */}
          <div className="liquid-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-rose-300 uppercase">Throne Wishlist</span>
              <h4 className="font-sans font-bold text-lg text-white">Official Wishlist</h4>
              <p className="text-xs text-neutral-400 font-normal">100% privacy-protected gift fulfillment.</p>
            </div>
            <a
              href={SOCIAL_LINKS.throne}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 btn-liquid-gold text-neutral-950 font-bold rounded-full text-xs font-mono uppercase flex items-center justify-center gap-1.5"
            >
              <span>Fulfill Gift</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Crypto Vault */}
          <div className="liquid-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-300 uppercase">Crypto Ledger</span>
              <h4 className="font-sans font-bold text-lg text-white">BTC / ETH Vault</h4>
              <p className="text-xs text-neutral-400 font-normal">High-value anonymous cryptocurrency tributes.</p>
            </div>
            <button
              onClick={() => handleCopy('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'crypto')}
              className="w-full py-2.5 btn-liquid-secondary text-amber-200 rounded-full text-xs font-mono uppercase flex items-center justify-center gap-1.5"
            >
              {copiedLink === 'crypto' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink === 'crypto' ? 'Address Copied' : 'Copy ETH Address'}</span>
            </button>
          </div>

          {/* Direct Contact */}
          <div className="liquid-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-neutral-400 uppercase">Inquiries Email</span>
              <h4 className="font-sans font-bold text-lg text-white">Direct Contact</h4>
              <p className="text-xs text-neutral-400 font-normal">Formal inquiries with proof of tribute.</p>
            </div>
            <button
              onClick={() => handleCopy(SOCIAL_LINKS.email, 'email')}
              className="w-full py-2.5 btn-liquid-secondary text-amber-200 rounded-full text-xs font-mono uppercase flex items-center justify-center gap-1.5"
            >
              {copiedLink === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink === 'email' ? 'Email Copied' : 'Copy Email'}</span>
            </button>
          </div>

        </div>

        {/* Wishlist Items Showcase */}
        <div className="space-y-4 pt-4">
          <h3 className="font-sans font-bold text-xl text-white border-l-2 border-rose-400 pl-3">
            Active Sanctuary Wishlist Items
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {WISHLIST_ITEMS.map((item) => (
              <div
                key={item.id}
                className="liquid-card p-6 rounded-3xl flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-rose-200 border border-white/10">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono text-amber-300 font-bold">${item.price}</span>
                  </div>
                  <h4 className="font-sans font-bold text-base text-white">{item.name}</h4>
                  <p className="text-xs text-neutral-300 font-normal">{item.description}</p>
                </div>

                <a
                  href={SOCIAL_LINKS.throne}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 btn-liquid-primary text-rose-200 rounded-full text-xs font-mono uppercase flex-shrink-0 whitespace-nowrap"
                >
                  {item.linkText}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Silent Tribute Form & Devotion Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          
          {/* Interactive Form */}
          <div className="liquid-card p-6 sm:p-8 rounded-3xl space-y-4 border border-white/20">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-300" />
              <h3 className="font-sans font-bold text-lg text-white">Offer Silent Tribute</h3>
            </div>
            <p className="text-xs text-neutral-400 font-normal">
              Submit a quick simulated devotion record to appear on the official Devotion Feed.
            </p>

            <form onSubmit={handleSimulateTribute} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-rose-300 uppercase">Devotee Name / Pseudonym</label>
                <input
                  type="text"
                  value={devoteeName}
                  onChange={(e) => setDevoteeName(e.target.value)}
                  placeholder="e.g. Submissive #9021 or Anonymous"
                  className="w-full liquid-input rounded-2xl px-4 py-3 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-rose-300 uppercase">Tribute Amount ($USD)</label>
                <div className="flex gap-2 mt-1">
                  {[25, 50, 100, 250].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setCustomAmount(amt)}
                      className={`flex-1 py-2 rounded-2xl text-xs font-mono transition-all ${
                        customAmount === amt
                          ? 'btn-liquid-gold text-neutral-950 font-bold'
                          : 'btn-liquid-secondary text-neutral-400'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-rose-300 uppercase">Devotion Message</label>
                <textarea
                  rows={2}
                  value={tributeMessage}
                  onChange={(e) => setTributeMessage(e.target.value)}
                  placeholder="Express your respect or gratitude..."
                  className="w-full liquid-input rounded-2xl p-4 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 btn-liquid-gold text-neutral-950 font-mono text-xs uppercase font-bold rounded-full shadow-lg flex items-center justify-center gap-2 animate-shimmer-sheen overflow-hidden"
              >
                <Send className="w-4 h-4" />
                <span>Submit Devotion Record</span>
              </button>

              {submittedTribute && (
                <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-2xl text-center font-mono">
                  Devotion recorded! Thank you for honoring Maitresse Aria.
                </div>
              )}
            </form>
          </div>

          {/* Devotion Logs Feed */}
          <div className="liquid-card p-6 sm:p-8 rounded-3xl space-y-4 border border-white/20 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-lg text-white">Devotion Ticker Log</h3>
                <span className="text-[10px] font-mono text-rose-300 uppercase">Live Feed</span>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-sans font-bold text-white">{log.devoteeName}</span>
                      <span className="font-mono text-rose-300 font-bold">${log.amount}</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-normal italic">"{log.message}"</p>
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 pt-1">
                      <span>{log.badge || 'Verified Devotee'}</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
