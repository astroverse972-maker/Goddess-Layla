import React, { useState } from 'react';
import { Send, Check, ExternalLink, Gift } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/collectionData';

interface TributeSectionProps {
  lang?: 'fr' | 'en';
}

export const TributeSection: React.FC<TributeSectionProps> = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sent, setSent] = useState(false);

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      window.open(SOCIAL_LINKS.tipfunder, '_blank');
      setSent(false);
    }, 1000);
  };

  return (
    <section id="tribute-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50/60 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Title & Subtitle */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
            Send Tribute
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-medium max-w-lg mx-auto">
            All tributes are processed safely via TipFunder.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Amount selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                SELECT AMOUNT
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
                    className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      !customAmount && selectedAmount === amt
                        ? 'bg-black text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-black'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                OR ENTER DESIRED AMOUNT ($)
              </label>
              <input
                type="number"
                placeholder="$ e.g. 750"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-gray-100/90 border-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl px-4 py-3.5 text-sm font-medium text-black placeholder:text-gray-400 focus:outline-none transition-all"
              />
            </div>

            {/* Message */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                MESSAGE / NOTE
              </label>
              <textarea
                rows={3}
                placeholder="Write your tribute message to Goddess Layla..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-100/90 border-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl p-4 text-sm font-medium text-black placeholder:text-gray-400 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-extrabold text-sm tracking-wide shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                Pay ${currentAmount} via TipFunder
              </span>
            </button>

            {sent && (
              <div className="p-3 bg-gray-100 border border-gray-300 text-black text-xs rounded-2xl text-center font-bold flex items-center justify-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Redirecting to TipFunder...</span>
              </div>
            )}

          </form>

          {/* Quick Payment Gateways */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs font-bold text-gray-600">
            <a 
              href={SOCIAL_LINKS.tipfunder} 
              target="_blank" 
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 text-black font-extrabold"
            >
              <span>TipFunder Payment</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>
            <span>•</span>
            <a 
              href={SOCIAL_LINKS.throne} 
              target="_blank" 
              rel="noreferrer"
              className="hover:underline flex items-center gap-1 text-black font-extrabold"
            >
              <Gift className="w-3.5 h-3.5 text-black" />
              <span>Throne Wishlist</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
