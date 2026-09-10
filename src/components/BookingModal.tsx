import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Send, Copy, Check, Calendar, Crown } from 'lucide-react';
import { SessionOffering, BookingFormState } from '../types';
import { SESSION_OFFERINGS } from '../data/ariaData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOffering?: SessionOffering | null;
  initialTotal?: number;
  initialAddOns?: string[];
  protocolVerified: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialOffering,
  initialTotal,
  initialAddOns = [],
  protocolVerified
}) => {
  const [formState, setFormState] = useState<BookingFormState>({
    devoteeTitle: '',
    email: '',
    telegramOrX: '',
    sessionType: initialOffering?.title || SESSION_OFFERINGS[0].title,
    preferredDate: '',
    tributeAmount: initialTotal || initialOffering?.price || 500,
    addOns: initialAddOns,
    protocolAccepted: protocolVerified,
    customNotes: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    if (initialOffering) {
      setFormState(prev => ({
        ...prev,
        sessionType: initialOffering.title,
        tributeAmount: initialTotal || initialOffering.price
      }));
    }
  }, [initialOffering, initialTotal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const generatedReceipt = `=== SESSION INQUIRY ===
Name: ${formState.devoteeTitle}
Email: ${formState.email}
Handle: ${formState.telegramOrX}
Session: ${formState.sessionType}
Preferred Date: ${formState.preferredDate || 'Flexible'}
Estimated Price: $${formState.tributeAmount} USD
Terms Accepted: ${formState.protocolAccepted ? 'YES' : 'PENDING'}
Notes: ${formState.customNotes || 'None'}
Timestamp: ${new Date().toLocaleString()}`;

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(generatedReceipt);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative max-w-2xl w-full liquid-card rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/20 my-8">
        
        {/* Modal Top Header */}
        <div className="bg-white/5 backdrop-blur-2xl px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-300" />
            <h3 className="font-sans font-bold text-lg text-white">Book a Session</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Protocol Badge Warning */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
                protocolVerified
                  ? 'btn-liquid-secondary border-emerald-500/40 text-emerald-300'
                  : 'btn-liquid-secondary border-neutral-500/40 text-neutral-300'
              }`}>
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span>
                  {protocolVerified
                    ? 'Guidelines acknowledged: Your inquiry will be reviewed promptly.'
                    : 'Please make sure to review our session guidelines before booking.'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-neutral-300 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formState.devoteeTitle}
                    onChange={(e) => setFormState({ ...formState, devoteeTitle: e.target.value })}
                    placeholder="e.g. Marcus"
                    className="w-full liquid-input rounded-2xl px-4 py-3 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-300 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="yourname@example.com"
                    className="w-full liquid-input rounded-2xl px-4 py-3 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-neutral-300 uppercase">Telegram / X Handle</label>
                  <input
                    type="text"
                    value={formState.telegramOrX}
                    onChange={(e) => setFormState({ ...formState, telegramOrX: e.target.value })}
                    placeholder="@handle"
                    className="w-full liquid-input rounded-2xl px-4 py-3 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-300 uppercase">Preferred Session Date</label>
                  <input
                    type="date"
                    value={formState.preferredDate}
                    onChange={(e) => setFormState({ ...formState, preferredDate: e.target.value })}
                    className="w-full liquid-input rounded-2xl px-4 py-3 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-300 uppercase">Selected Session Offering</label>
                <select
                  value={formState.sessionType}
                  onChange={(e) => setFormState({ ...formState, sessionType: e.target.value })}
                  className="w-full liquid-input rounded-2xl px-4 py-3 text-xs text-white mt-1 focus:outline-none"
                >
                  {SESSION_OFFERINGS.map(s => (
                    <option key={s.id} value={s.title} className="bg-neutral-900 text-white">{s.title} (${s.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-300 uppercase">Custom Requests / Notes</label>
                <textarea
                  rows={3}
                  value={formState.customNotes}
                  onChange={(e) => setFormState({ ...formState, customNotes: e.target.value })}
                  placeholder="Detail any preferences, questions, or specific topics..."
                  className="w-full liquid-input rounded-2xl p-4 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="modal-protocol"
                  checked={formState.protocolAccepted}
                  onChange={(e) => setFormState({ ...formState, protocolAccepted: e.target.checked })}
                  className="rounded-lg border-white/20 bg-white/10 accent-amber-400 w-4 h-4"
                />
                <label htmlFor="modal-protocol" className="text-xs text-neutral-300 font-normal">
                  I confirm that I have read and agree to the guidelines.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 btn-liquid-gold text-neutral-950 font-mono text-xs uppercase font-bold rounded-full shadow-xl flex items-center justify-center gap-2 animate-shimmer-sheen overflow-hidden"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full btn-liquid-gold text-neutral-950 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-sans font-bold text-2xl text-white">Inquiry Received</h4>
              <p className="text-xs text-neutral-300 font-normal max-w-md mx-auto">
                Your request has been generated. You can copy your inquiry details below to send directly via email or Telegram.
              </p>

              <div className="p-4 bg-black/60 border border-white/10 rounded-2xl text-left font-mono text-xs text-amber-200/90 whitespace-pre-wrap">
                {generatedReceipt}
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={handleCopyReceipt}
                  className="px-6 py-3 btn-liquid-primary text-amber-200 rounded-full text-xs font-mono uppercase flex items-center gap-2"
                >
                  {copiedPayload ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy Inquiry Text'}</span>
                </button>

                <button
                  onClick={() => { setSubmitted(false); onClose(); }}
                  className="px-6 py-3 btn-liquid-secondary text-white rounded-full text-xs font-mono uppercase"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
