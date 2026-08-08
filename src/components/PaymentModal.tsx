import React, { useState, useEffect } from 'react';
import { X, Send, ExternalLink, Check, Gift } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/collectionData';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'fr' | 'en';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sent, setSent] = useState(false);
  const [tipfunderUrl, setTipfunderUrl] = useState<string>(SOCIAL_LINKS.tipfunder);
  const [throneUrl, setThroneUrl] = useState<string>(SOCIAL_LINKS.throne);

  useEffect(() => {
    fetch('/api/payment-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.tipfunder) setTipfunderUrl(data.tipfunder);
          if (data.throne) setThroneUrl(data.throne);
        }
      })
      .catch(() => {});

    try {
      const savedPay = localStorage.getItem('goddess_payment_settings');
      if (savedPay) {
        const parsed = JSON.parse(savedPay);
        if (parsed.tipfunder) setTipfunderUrl(parsed.tipfunder);
        if (parsed.throne) setThroneUrl(parsed.throne);
      }
    } catch (e) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      window.open(tipfunderUrl || SOCIAL_LINKS.tipfunder, '_blank');
      setSent(false);
    }, 1000);
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
            Goddess Layla - TipFunder Payment Portal
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
              TipFunder Tribute
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              TipFunder is the official payment method for Goddess Layla.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Amount Selection Grid */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                SELECT AMOUNT
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[25, 50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      !customAmount && selectedAmount === amt
                        ? 'bg-black text-white shadow-md'
                        : 'bg-gray-100/90 hover:bg-gray-200/90 text-black border border-gray-200/60'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                OR ENTER DESIRED AMOUNT ($)
              </label>
              <input
                type="number"
                placeholder="$ e.g. 750"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-gray-100/90 border border-gray-200/80 focus:bg-white focus:ring-2 focus:ring-black rounded-2xl px-4 py-3 text-sm font-medium text-black placeholder:text-gray-400 focus:outline-hidden transition-all"
              />
            </div>

            {/* Message Area */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                MESSAGE FOR GODDESS LAYLA
              </label>
              <textarea
                rows={3}
                placeholder="Write your note or tribute message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-100/90 border border-gray-200/80 focus:bg-white focus:ring-2 focus:ring-black rounded-2xl p-4 text-sm font-medium text-black placeholder:text-gray-400 focus:outline-hidden transition-all resize-none"
              />
            </div>

            {/* Send Tribute Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-extrabold text-sm tracking-wide shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Pay ${currentAmount} on TipFunder</span>
            </button>

            {sent && (
              <div className="p-3 bg-gray-100 border border-gray-300 text-black text-xs rounded-2xl text-center font-bold flex items-center justify-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Redirecting to TipFunder...</span>
              </div>
            )}

          </form>

          {/* Quick External Links */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs font-bold text-gray-600">
            <a 
              href={tipfunderUrl} 
              target="_blank" 
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 text-black font-bold"
            >
              <span>TipFunder Direct</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>
            <span>•</span>
            <a 
              href={throneUrl} 
              target="_blank" 
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 text-black font-bold"
            >
              <Gift className="w-3.5 h-3.5 text-black" />
              <span>Throne Wishlist</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
