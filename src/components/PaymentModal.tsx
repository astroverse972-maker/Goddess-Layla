import React, { useState } from 'react';
import { X, Send, ExternalLink, Check, Gift, CreditCard } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'fr' | 'en';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [sent, setSent] = useState(false);
  const { siteSettings, paymentSettings, creatorProfile } = useSiteSettings();

  if (!isOpen) return null;

  const tipfunderUrl = siteSettings.tipfunder_link || paymentSettings.tipfunder || 'https://tipfunder.com';
  const throneUrl = siteSettings.throne_link || paymentSettings.throne || 'https://throne.com';
  const creatorName = siteSettings.creator_name || creatorProfile.name || 'Queen Milana';
  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmitTipfunder = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      window.open(tipfunderUrl, '_blank');
      setSent(false);
    }, 600);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in font-sans"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200/80 my-auto flex flex-col"
      >
        
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 bg-gray-50/90 border-b border-gray-200/80 flex items-center justify-between">
          <span className="text-xs font-bold text-black tracking-wider uppercase">
            {creatorName} - Payment & Tribute Portal
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
              Direct Payment & Tribute
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Official centralized payment channels for {creatorName}.
            </p>
          </div>

          {/* Direct Throne Option */}
          {throneUrl && (
            <div className="p-4 rounded-2xl bg-neutral-950 text-white space-y-2.5 border border-neutral-800 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-white" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    THRONE DIRECT PAYMENT & WISHLIST
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white bg-neutral-900 border border-white/20 px-2 py-0.5 rounded">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Direct gifts and transactions through the verified Throne account of {creatorName}.
              </p>
              <a
                href={throneUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-white hover:bg-gray-200 text-black font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer text-center"
              >
                <span>Open Throne Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>
            </div>
          )}

          {/* TipFunder Option */}
          {tipfunderUrl && (
            <form onSubmit={handleSubmitTipfunder} className="space-y-4 pt-2 border-t border-gray-200">
              
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-neutral-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  TipFunder Tribute Portal
                </span>
              </div>

              {/* Amount Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-gray-50 text-black border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {amt} €
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {sent ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Redirecting to TipFunder...</span>
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
    </div>
  );
};

export default PaymentModal;
