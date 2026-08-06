import React, { useState } from 'react';
import { Scroll, ShieldAlert, CheckCircle2, AlertTriangle, Lock, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { CODEX_RULES } from '../data/ariaData';
import { CodexRule } from '../types';

interface CodexProtocolProps {
  protocolVerified: boolean;
  onVerifyProtocol: (status: boolean) => void;
}

export const CodexProtocol: React.FC<CodexProtocolProps> = ({ protocolVerified, onVerifyProtocol }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRule, setExpandedRule] = useState<string | null>('rule-1');
  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({});

  const filteredRules = selectedCategory === 'all'
    ? CODEX_RULES
    : CODEX_RULES.filter(r => r.category === selectedCategory);

  const toggleCheck = (id: string) => {
    const updated = { ...checkedRules, [id]: !checkedRules[id] };
    setCheckedRules(updated);

    const mandatoryRules = CODEX_RULES.filter(r => r.mandatory);
    const allMandatoryChecked = mandatoryRules.every(r => updated[r.id]);
    onVerifyProtocol(allMandatoryChecked);
  };

  return (
    <section id="codex" className="py-20 bg-neutral-950 border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full btn-liquid-secondary text-xs font-mono uppercase tracking-widest text-rose-200">
            <Scroll className="w-3.5 h-3.5 text-amber-300" />
            <span>Rules of Engagement</span>
          </div>
          <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            THE CODEX & PROTOCOL
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto font-normal">
            Adherence to protocol is mandatory. Review each clause carefully before attempting communication or submitting a session inquiry.
          </p>
        </div>

        {/* Category Tabs as Liquid Glass Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 max-w-fit mx-auto">
          {['all', 'etiquette', 'tribute', 'sessions', 'boundaries'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === cat
                  ? 'btn-liquid-primary text-amber-200 font-bold shadow-lg'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Rules Accordion / Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRules.map((rule) => {
            const isExpanded = expandedRule === rule.id;
            const isChecked = !!checkedRules[rule.id];

            return (
              <div
                key={rule.id}
                className={`p-6 rounded-3xl liquid-card transition-all duration-300 ${
                  isChecked
                    ? 'border-rose-500/50 bg-rose-950/20 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    
                    {/* Checkbox for verification */}
                    <button
                      onClick={() => toggleCheck(rule.id)}
                      className={`mt-1 p-1.5 rounded-full transition-all ${
                        isChecked ? 'btn-liquid-gold text-neutral-950' : 'bg-white/10 text-neutral-400 hover:text-white'
                      }`}
                      title="Acknowledge Rule"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans font-bold text-lg text-white">{rule.title}</h3>
                        {rule.mandatory && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 font-normal">{rule.summary}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs text-neutral-300 leading-relaxed font-normal bg-black/40 p-4 rounded-2xl">
                    {rule.fullDetails}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Verification Status Banner in Liquid Glass */}
        <div className={`p-6 sm:p-8 rounded-3xl liquid-card flex flex-col sm:flex-row items-center justify-between gap-6 transition-all ${
          protocolVerified
            ? 'border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.2)]'
            : 'border-rose-500/30'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl border ${
              protocolVerified
                ? 'btn-liquid-secondary text-emerald-400 border-emerald-500/40'
                : 'btn-liquid-secondary text-rose-400 border-rose-500/40'
            }`}>
              {protocolVerified ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-sans font-bold text-lg text-white">
                {protocolVerified ? 'Protocol Verification Active' : 'Protocol Verification Pending'}
              </h4>
              <p className="text-xs text-neutral-400 font-normal mt-0.5">
                {protocolVerified
                  ? 'All mandatory clauses acknowledged. You are permitted to submit direct consultation inquiries.'
                  : 'Check off mandatory rules above to activate your verified devotee status.'}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <span className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
              protocolVerified
                ? 'btn-liquid-gold text-amber-200'
                : 'btn-liquid-secondary text-neutral-400'
            }`}>
              {protocolVerified ? 'Verified Devotee' : 'Unverified'}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
