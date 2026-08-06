import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/collectionData';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'fr' | 'en';
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [sessionType, setSessionType] = useState('VIP Sanctuary / Custom Request');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setName('');
      setHandle('');
      setMessage('');
    }, 2000);
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
          <span className="text-xs font-bold text-black tracking-wider uppercase font-sans">
            Goddess Lay👸🏻 - Contact & Booking
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-1">
            <h4 className="font-serif text-2xl font-bold text-black">Goddess Lay👸🏻</h4>
            <p className="text-xs text-gray-500 font-medium">
              Telegram: laylathebest • VIP Space
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  YOUR NAME / HANDLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 rounded-2xl bg-gray-100/80 border border-gray-200/80 text-sm font-medium text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  TELEGRAM / X / EMAIL
                </label>
                <input
                  type="text"
                  required
                  placeholder="@handle or email"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 rounded-2xl bg-gray-100/80 border border-gray-200/80 text-sm font-medium text-black focus:bg-white focus:border-black focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                INQUIRY SUBJECT
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-2xl bg-gray-100/80 border border-gray-200/80 text-sm font-medium text-black focus:bg-white focus:border-black focus:outline-hidden transition-all cursor-pointer"
              >
                <option>VIP Sanctuary / Custom Request</option>
                <option>Private Live Stream Booking</option>
                <option>Custom Video Order</option>
                <option>TipFunder Verification</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                MESSAGE
              </label>
              <textarea
                rows={4}
                required
                placeholder="State your request clearly..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-2xl bg-gray-100/80 border border-gray-200/80 text-sm font-medium text-black focus:bg-white focus:border-black focus:outline-hidden transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-black hover:bg-gray-800 text-white font-extrabold text-sm tracking-wide shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>

            {submitted && (
              <div className="p-3 bg-gray-100 border border-gray-300 text-black text-xs rounded-2xl text-center font-bold flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Message sent! Goddess Layla will review your request.</span>
              </div>
            )}
          </form>

          {/* Socials Link Footer */}
          <div className="pt-2 border-t border-gray-100 text-center text-xs font-bold space-x-3">
            <a 
              href={SOCIAL_LINKS.telegram} 
              target="_blank" 
              rel="noreferrer"
              className="text-sky-600 hover:underline"
            >
              Telegram: @laylathebest
            </a>
            <span>•</span>
            <a 
              href={SOCIAL_LINKS.x} 
              target="_blank" 
              rel="noreferrer"
              className="text-black hover:underline"
            >
              X: @Geldherrinlay9
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
