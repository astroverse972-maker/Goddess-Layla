import React, { useState } from 'react';
import { Send, Check, ExternalLink, Gift, CreditCard } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface TributeSectionProps {
  lang?: 'fr' | 'en';
}

export const TributeSection: React.FC<TributeSectionProps> = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [sent, setSent] = useState(false);
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();

  const tipfunderUrl = siteSettings.tipfunder_link || paymentSettings.tipfunder || 'https://tipfunder.com';
  const throneUrl = siteSettings.throne_link || paymentSettings.throne || 'https://throne.com';
  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Queen Milana';
  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      window.open(tipfunderUrl, '_blank');
      setSent(false);
    }, 600);
  };

  return (
    <section id="tribute-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50/60 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Title & Subtitle */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
            Tribute & Direct Transactions
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium max-w-lg mx-auto">
            Official and secure payment channels for {creatorName}.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 space-y-6">
          
          {/* Throne Direct Hero Box */}
          {throneUrl && (
            <div className="p-4 rounded-2xl bg-neutral-950 text-white space-y-2 border border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-white" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    THRONE WISHLIST & TRANSACTIONS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white bg-neutral-900 border border-white/20 px-2 py-0.5 rounded">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Direct gifts and transactions are processed in real-time.
              </p>
              <a
                href={throneUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-white hover:bg-gray-200 text-black font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer text-center"
              >
                <span>Direct to Throne ({creatorName})</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>
            </div>
          )}

          {tipfunderUrl && (
            <form onSubmit={handleSubmit} className="space-y-6 pt-2 border-t border-gray-200">
              
              {/* Amount selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-700" />
                  <span>TIPFUNDER SELECTION</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                  {[25, 50, 100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-3 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-black text-white border-black shadow-xs scale-102'
                          : 'bg-gray-50 text-black border-gray-200/80 hover:bg-gray-100'
                      }`}
                    >
                      {amt} €
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-extrabold text-xs sm:text-sm tracking-wide uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {sent ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Connecting to TipFunder...</span>
                  </>
                ) : (
                  <>
                    <span>Pay {currentAmount} € via TipFunder</span>
                    <ExternalLink className="w-4 h-4 text-white" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};

export default TributeSection;
