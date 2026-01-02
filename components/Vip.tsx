
import React, { useState } from 'react';
import { User } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { VIP_PRICE, VIP_TASK_LIMIT, formatK } from '../constants.tsx';
import { Crown, Zap, ShieldCheck, CheckCircle2, Lock, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Vip: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    if (user.isVip) return;
    if (user.balance < VIP_PRICE) return alert('Bạn không đủ điểm (P) để nâng cấp!');
    
    setIsLoading(true);
    const res = await dbService.upgradeToVip(user.id);
    setIsLoading(false);
    
    if (res.success) {
      setSuccess(true);
      const updatedUser = await dbService.getCurrentUser();
      if (updatedUser) onUpdateUser(updatedUser);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
      <div className="relative overflow-hidden glass-card p-12 md:p-16 rounded-[4rem] border border-amber-500/20 shadow-3xl bg-gradient-to-br from-amber-500/10 to-transparent text-center">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
          <Crown className="w-64 h-64 text-amber-500" />
        </div>
        
        <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-xs font-black uppercase tracking-[0.4em] italic shadow-glow-amber">
              <Crown className="w-4 h-4" /> NOVALAND ELITE
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter italic drop-shadow-2xl">
             RANK <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">VIP</span>
            </h1>
            <p className="text-slate-400 font-medium italic max-w-xl mx-auto">
              Nâng cấp tài khoản lên VIP để nhận những đặc quyền tối thượng và gia tăng thu nhập nhanh gấp bội.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-8 bg-slate-900/40">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter border-b border-white/5 pb-4">QUYỀN LỢI VIP</h3>
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Zap className="w-5 h-5" /></div>
              <div>
                <h4 className="font-black text-white text-sm uppercase italic">Bonus 20% Thưởng</h4>
                <p className="text-[11px] text-slate-500 italic">Tất cả nhiệm vụ sẽ được cộng thêm 20% giá trị điểm (P).</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><ShieldCheck className="w-5 h-5" /></div>
              <div>
                <h4 className="font-black text-white text-sm uppercase italic">Ưu tiên rút tiền</h4>
                <p className="text-[11px] text-slate-500 italic">Lệnh rút tiền của VIP sẽ được xử lý trước trong vòng 5-10 phút.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Sparkles className="w-5 h-5" /></div>
              <div>
                <h4 className="font-black text-white text-sm uppercase italic">Tăng giới hạn ngày</h4>
                <p className="text-[11px] text-slate-500 italic">Tăng hạn mức lên {VIP_TASK_LIMIT} nhiệm vụ/ngày (Mặc định: 20).</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="glass-card p-10 rounded-[3rem] border border-amber-500/30 flex flex-col justify-center items-center text-center space-y-8 bg-black/40 shadow-2xl">
          {user.isVip ? (
             <div className="space-y-6">
                <div className="w-24 h-24 bg-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-glow-amber">
                   <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">BẠN LÀ VIP</h3>
                   <p className="text-amber-500 font-black uppercase text-[10px] tracking-widest mt-2 italic">TRẠNG THÁI: HOẠT ĐỘNG VĨNH VIỄN</p>
                </div>
             </div>
          ) : success ? (
             <div className="animate-bounce">
                <h3 className="text-3xl font-black text-emerald-500 uppercase italic">THÀNH CÔNG!</h3>
                <p className="text-white text-xs mt-2 italic">Rank VIP đã được kích hoạt.</p>
             </div>
          ) : (
            <>
              <div className="space-y-2">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">PHÍ NÂNG CẤP</span>
                 <div className="text-5xl font-black text-white italic tracking-tighter">{formatK(VIP_PRICE)} P</div>
                 <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest italic mt-2">Duy nhất 1 lần - Hiệu lực vĩnh viễn</p>
              </div>
              <button 
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-6 rounded-3xl uppercase tracking-widest italic transition-all active:scale-95 shadow-glow-amber text-sm flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <><Sparkles className="w-6 h-6" /> KÍCH HOẠT VIP NGAY</>}
              </button>
            </>
          )}
        </div>
      </div>
      <style>{`
        .shadow-glow-amber { box-shadow: 0 0 30px rgba(245, 158, 11, 0.4); }
      `}</style>
    </div>
  );
};

export default Vip;
