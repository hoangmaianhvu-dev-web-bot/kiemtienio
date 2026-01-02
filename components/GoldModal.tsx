
import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';

interface GoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type?: 'success' | 'warning';
}

const GoldModal: React.FC<GoldModalProps> = ({ isOpen, onClose, title, description, type = 'success' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop with strong blur */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-[12px]" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md glass-gold-card rounded-[2.5rem] border border-[#d4af37]/50 overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.2)] animate-in zoom-in-95 slide-in-from-bottom-6 duration-500">
        
        {/* Verification Link Header */}
        <div className="pt-8 px-8 text-center">
           <span className="text-[10px] font-black text-[#d4af37]/60 tracking-[0.3em] uppercase italic opacity-80 block mb-2">
             VERIFIED BY DIAMONDNOVA.COM
           </span>
           <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent w-full"></div>
        </div>

        {/* Main Content */}
        <div className="p-12 flex flex-col items-center text-center">
          
          {/* Animated Icon Circle */}
          <div className="mb-10 relative group">
            <div className={`w-24 h-24 rounded-full border-2 ${type === 'success' ? 'border-[#d4af37]' : 'border-rose-500'} flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] bg-gradient-to-b from-[#d4af37]/10 to-transparent relative z-10 transition-transform group-hover:scale-110 duration-500`}>
              {type === 'success' ? (
                <Check className="w-12 h-12 text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]" strokeWidth={3} />
              ) : (
                <ShieldAlert className="w-12 h-12 text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]" strokeWidth={3} />
              )}
            </div>
            {/* Pulsing ring */}
            <div className={`absolute -inset-4 rounded-full border ${type === 'success' ? 'border-[#d4af37]/20' : 'border-rose-500/20'} animate-ping opacity-30`}></div>
            <div className={`absolute -inset-8 rounded-full border ${type === 'success' ? 'border-[#d4af37]/10' : 'border-rose-500/10'} animate-pulse opacity-20`}></div>
          </div>

          {/* Title with Metallic Gradient */}
          <h2 className={`text-4xl font-black italic uppercase tracking-tighter mb-5 leading-none ${type === 'success' ? 'gold-text-shimmer' : 'text-white'}`}>
            {title}
          </h2>

          {/* Luxury Description */}
          <p className="text-slate-300 text-sm font-medium leading-relaxed italic mb-12 max-w-[90%] mx-auto opacity-80">
            {description}
          </p>

          {/* Luxury Pill Button with Metallic Shine */}
          <button 
            onClick={onClose}
            className={`w-full py-5 px-10 rounded-full font-black uppercase italic text-xs tracking-[0.25em] transition-all duration-500 active:scale-95 shadow-2xl relative overflow-hidden group/btn ${
              type === 'success' 
              ? 'bg-gradient-to-b from-[#fdf2d0] via-[#d4af37] to-[#8a6d1d] text-white shadow-[0_15px_40px_rgba(138,109,29,0.4)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.5)]' 
              : 'bg-rose-600 text-white shadow-rose-600/30'
            }`}
          >
            <span className="relative z-10">XÁC NHẬN HOÀN TẤT</span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]"></div>
          </button>
        </div>

        {/* Dynamic Light Rays */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#d4af37]/10 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#d4af37]/10 blur-[80px] rounded-full"></div>
      </div>

      <style>{`
        .glass-gold-card {
          background: linear-gradient(160deg, #0a0a0a 0%, #020202 100%);
        }
        .gold-text-shimmer {
          background: linear-gradient(90deg, #edc967 0%, #ffffff 50%, #edc967 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gold-shimmer 4s linear infinite;
        }
        @keyframes gold-shimmer {
          to { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default GoldModal;
