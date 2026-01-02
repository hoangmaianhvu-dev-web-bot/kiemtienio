
import React, { useState } from 'react';
import { User } from '../types.ts';
import { 
  Shield, 
  Save, 
  Gamepad, 
  Building2, 
  Fingerprint,
  Calendar,
  CheckCircle2,
  BookOpen,
  Mail,
  Diamond,
  Crown,
  Zap,
  Star,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Activity
} from 'lucide-react';

interface Props {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [bank, setBank] = useState(user.bankInfo);
  const [gameId, setGameId] = useState(user.idGame);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateUser({ ...user, bankInfo: bank, idGame: gameId });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const score = user.securityScore ?? 100;
  
  const getSecurityStatus = () => {
    if (score > 80) return { 
      label: 'TIN CẬY TUYỆT ĐỐI', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20',
      icon: <ShieldCheck className="w-6 h-6" />,
      desc: 'Tài khoản an toàn. Ưu tiên rút tiền siêu tốc.'
    };
    if (score >= 50) return { 
      label: 'CẦN THEO DÕI', 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/20',
      icon: <ShieldAlert className="w-6 h-6" />,
      desc: 'Phát hiện hành vi nghi vấn nhẹ. Rút tiền sẽ được duyệt thủ công.'
    };
    return { 
      label: 'NGUY HIỂM', 
      color: 'text-red-500', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20',
      icon: <ShieldOff className="w-6 h-6" />,
      desc: 'Rủi ro cao. Tài khoản bị hạn chế rút tiền.'
    };
  };

  const security = getSecurityStatus();

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30 border-2 border-white/10">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">{user.fullname}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VIP MEMBER • #{user.id.toUpperCase()}</span>
              {user.isAdmin && <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-amber-500/20">ADMIN</span>}
            </div>
          </div>
        </div>

        {/* Sentinel Score Mini Card */}
        <div className={`glass-card px-6 py-4 rounded-2xl border ${security.border} ${security.bg} flex items-center gap-4`}>
          <div className={`${security.color} animate-pulse`}>
            {security.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${security.color}`}>{security.label}</span>
              <span className="text-white font-black text-lg italic">{score} Pts</span>
            </div>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Nova Sentinel AI Analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4 hover:border-blue-500/30 transition-all">
          <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400">
            <Mail className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Liên kết email</p>
            <p className="text-white font-bold text-xs truncate">{user.email}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4 hover:border-emerald-500/30 transition-all">
          <div className="p-4 bg-emerald-600/10 rounded-2xl text-emerald-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Ngày gia nhập</p>
            <p className="text-white font-bold text-xs">{user.joinDate}</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4 hover:border-purple-500/30 transition-all">
          <div className="p-4 bg-purple-600/10 rounded-2xl text-purple-400">
            <Diamond className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Rank hội viên</p>
            <p className="text-white font-bold text-xs uppercase italic">{user.isAdmin ? 'MASTER NOVA' : 'DIAMOND ELITE'}</p>
          </div>
        </div>
        <div className={`glass-card p-6 rounded-[2rem] border transition-all flex items-center gap-4 ${security.bg} ${security.border}`}>
          <div className={`p-4 rounded-2xl ${security.bg} ${security.color}`}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Độ an toàn</p>
            <p className={`font-black text-xs uppercase italic ${security.color}`}>{score}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sentinel Detailed Status Card */}
          <div className={`glass-card p-8 md:p-10 rounded-[3rem] border-2 ${security.border} relative overflow-hidden`}>
             <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
               <Shield className="w-64 h-64 text-white" />
             </div>
             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="relative">
                   <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * score) / 100}
                        className={`${security.color} transition-all duration-1000 ease-out`}
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white italic">{score}</span>
                      <span className="text-[8px] font-black text-slate-500 uppercase">SCORE</span>
                   </div>
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                   <div>
                      <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${security.color}`}>NOVA SENTINEL AUDIT</h3>
                      <p className="text-white font-bold text-sm mt-1">{security.label}</p>
                   </div>
                   <p className="text-slate-400 text-xs font-medium italic leading-relaxed">
                     {security.desc} Hệ thống tự động phân tích hành vi nạp, rút và làm nhiệm vụ để bảo vệ cộng đồng Diamond Nova.
                   </p>
                   <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 border border-white/5 uppercase italic">IP Consistency: OK</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 border border-white/5 uppercase italic">Anti-Bot: Passed</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 border border-white/5 uppercase italic">Audit Sync: Verified</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="glass-card p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Building2 className="w-32 h-32" /></div>
             <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 border-b border-white/5 pb-4">Thông tin thanh toán</h3>
             <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Thông tin ATM (STK - Ngân hàng - Chủ TK)</label>
                   <textarea value={bank} onChange={(e) => setBank(e.target.value)} placeholder="VD: 1900110022 - MB BANK - NGUYEN VAN A" rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none focus:border-blue-600 transition-all resize-none shadow-inner" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">ID Game (Free Fire / LQ)</label>
                   <input type="text" value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder="VD: 2029384756" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white font-bold outline-none focus:border-blue-600 transition-all shadow-inner" />
                   <p className="text-[9px] text-slate-600 font-bold italic ml-2">Mẹo: Nhập chính xác ID để nhận KC tự động qua cổng nạp.</p>
                </div>
                <div className="flex justify-end">
                   <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center gap-3 uppercase tracking-widest text-xs italic transition-all active:scale-95">
                      {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      <span>{saved ? 'ĐÃ CẬP NHẬT' : 'LƯU THAY ĐỔI'}</span>
                   </button>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass-card p-8 rounded-[3rem] border border-white/5 relative overflow-hidden bg-blue-600/5">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                 <BookOpen className="w-6 h-6 text-blue-500" /> GIỚI THIỆU
              </h3>
              <div className="space-y-4">
                 <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
                    Diamond Nova là nền tảng kiếm thưởng uy tín số 1 Việt Nam. Chúng tôi cung cấp giải pháp cày nhiệm vụ vượt link rút gọn để quy đổi thành giá trị thực.
                 </p>
                 <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black text-slate-300 uppercase italic">Thanh toán minh bạch</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black text-slate-300 uppercase italic">Hỗ trợ 24/7 qua AI</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black text-slate-300 uppercase italic">Cộng đồng 10.000+ member</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* VIP Section - Simplified in right col */}
           <div className="relative group overflow-hidden glass-card p-8 rounded-[3rem] border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-transparent">
             <Crown className="w-12 h-12 text-amber-500 mb-6" />
             <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">NOVA VIP</h3>
             <p className="text-slate-400 text-[10px] font-medium italic mb-6">Tăng tốc độ kiếm điểm và ưu tiên xử lý rút tiền 24/7.</p>
             <button 
                onClick={() => alert("Chương trình VIP đang được cập nhật menu mới. Vui lòng quay lại sau!")}
                className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-xl uppercase italic tracking-widest text-[10px]"
             >
                XEM GÓI VIP
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
