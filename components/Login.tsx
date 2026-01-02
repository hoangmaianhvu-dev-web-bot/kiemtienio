
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { User, AdBanner } from '../types.ts';
import { SOCIAL_LINKS } from '../constants.tsx';
import { 
  Sparkles, 
  UserCircle, 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowRight,
  ChevronRight,
  History,
  Check,
  ArrowLeft,
  Key,
  Send,
  AtSign,
  Bot,
  ShieldCheck,
  PhoneCall,
  SendHorizontal,
  MessageCircle
} from 'lucide-react';

interface Props {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [telegramUsername, setTelegramUsername] = useState(''); 
  const [referralCode, setReferralCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const [isResetStep2, setIsResetStep2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('nova_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setAuthMode('signup');
    }
    
    dbService.getTotalUserCount().then(setTotalUsersCount);
    dbService.getAds(false).then(res => setAds(res.filter(a => a.isActive)));
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIdx(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const u = await dbService.login(email, password);
    setIsLoading(false);
    if (u) {
      if (rememberMe) {
        localStorage.setItem('nova_remember_email', email);
      } else {
        localStorage.removeItem('nova_remember_email');
      }
      onLoginSuccess(u);
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('Vui lòng điền đủ thông tin!');
    setIsLoading(true);
    const res = await dbService.signup(email, password, name, referralCode);
    setIsLoading(false);
    if (res.success) {
      setAuthMode('login');
      setError('');
      setSuccessMsg('Đăng ký thành công! Hãy đăng nhập ngay.');
    } else {
      setError(res.message);
    }
  };

  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !telegramUsername) return setError('Vui lòng nhập Email và Username Telegram.');
    if (!telegramUsername.startsWith('@')) return setError('Username Telegram phải bắt đầu bằng @');
    
    setIsLoading(true);
    const res = await dbService.requestResetCode(email, telegramUsername);
    setIsLoading(false);

    if (res.success) {
      setIsResetStep2(true);
      setError('');
      setSuccessMsg("Yêu cầu thành công! Hãy nhấn nút mở Bot bên dưới.");
      setTimeout(() => {
        window.open(`https://t.me/anhvudev_kiemtienonline_bot?start=reset`, '_blank');
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) return setError('Vui lòng nhập mã và mật khẩu mới.');
    setIsLoading(true);
    const res = await dbService.resetPassword(email, resetCode, newPassword);
    setIsLoading(false);
    if (res.success) {
      setAuthMode('login');
      setIsResetStep2(false);
      setResetCode('');
      setNewPassword('');
      setSuccessMsg('Mật khẩu đã được khôi phục thành công!');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-6xl glass-card rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative z-10 border border-white/5">
        
        <div className="hidden lg:flex lg:w-1/2 bg-[#0a0f1e]/40 flex-col p-16 relative overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent"></div>
          
          <div className="relative z-10 space-y-12 h-full flex flex-col">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">DIAMOND NOVA</h1>
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.3em]">PREMIUM HUB</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white leading-none uppercase italic tracking-tighter">
                HỆ THỐNG <br /> <span className="nova-gradient">NHIỆM VỤ - KIẾM TIỀN - KC FF</span>
              </h2>
              <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-sm italic">
                Cơ chế kiếm thưởng an toàn, bảo mật nhất Việt Nam với công nghệ Nova Cloud Sync.
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {ads.length > 0 && (
                <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl animate-in fade-in duration-700">
                  <img 
                    src={ads[currentAdIdx].imageUrl} 
                    alt={ads[currentAdIdx].title}
                    className="w-full aspect-video object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Tin tài trợ</span>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tight">{ads[currentAdIdx].title}</h3>
                    <a href={ads[currentAdIdx].targetUrl} target="_blank" className="mt-4 flex items-center gap-2 text-[10px] font-black text-white/60 hover:text-white transition-colors uppercase italic tracking-widest">
                      Xem ngay <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-10 border-t border-white/5 pt-8">
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Thành viên</span>
                <span className="text-2xl font-black text-white italic">{(totalUsersCount + 2500).toLocaleString()}+</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Phản hồi</span>
                <span className="text-2xl font-black text-emerald-500 italic">99.9%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-10 md:p-20 flex flex-col justify-center bg-black/40 relative">
          <div className="max-w-sm mx-auto w-full space-y-10">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                {authMode === 'login' ? 'ĐĂNG NHẬP' : authMode === 'signup' ? 'GIA NHẬP' : 'KHÔI PHỤC'}
              </h2>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] italic">Nova Cloud Security v1.2</p>
            </div>

            {authMode === 'forgot' ? (
              <form onSubmit={isResetStep2 ? handleForgotStep2 : handleForgotStep1} className="space-y-4">
                 {!isResetStep2 ? (
                   <>
                     <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-3xl space-y-3 shadow-xl">
                        <div className="flex items-center gap-3 text-blue-400">
                           <Bot className="w-6 h-6 animate-pulse" />
                           <span className="text-[11px] font-black uppercase italic tracking-widest">BOT TỰ ĐỘNG</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                          Nhập Email & User Telegram để nhận mã.
                        </p>
                     </div>
                     <div className="relative group">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                       <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="EMAIL" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white font-black outline-none focus:border-blue-600 transition-all text-[11px] shadow-inner" />
                     </div>
                     <div className="relative group">
                       <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                       <input type="text" value={telegramUsername} onChange={e => setTelegramUsername(e.target.value)} placeholder="TELEGRAM (@...)" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white font-black outline-none focus:border-blue-600 transition-all text-[11px] shadow-inner" />
                     </div>
                     <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest transition-all active:scale-95 italic text-[11px]">
                       {isLoading ? 'ĐANG XỬ LÝ...' : 'GỬI YÊU CẦU LẤY MÃ'}
                     </button>
                   </>
                 ) : (
                   <>
                     <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl space-y-3">
                        <div className="flex items-center gap-3 text-emerald-400"><Key className="w-6 h-6" /><span className="text-[11px] font-black uppercase">NHẬP MÃ TỪ BOT</span></div>
                        <p className="text-[10px] text-slate-400 font-medium italic">Gửi Email {email} cho Bot để nhận mã.</p>
                     </div>
                     <div className="relative group">
                       <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input type="text" value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="MÃ 6 SỐ" maxLength={6} className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white font-black outline-none text-center tracking-[0.5em]" />
                     </div>
                     <div className="relative group">
                       <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                       <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="MẬT KHẨU MỚI" className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white font-black outline-none" />
                     </div>
                     <button disabled={isLoading} className="w-full bg-emerald-600 py-5 rounded-2xl font-black text-white uppercase italic text-[11px]">{isLoading ? 'ĐANG LƯU...' : 'ĐỔI MẬT KHẨU'}</button>
                   </>
                 )}
                 <button type="button" onClick={() => setAuthMode('login')} className="w-full text-[9px] font-black text-slate-500 uppercase italic flex items-center justify-center gap-2"><ArrowLeft size={12} /> QUAY LẠI</button>
              </form>
            ) : (
              <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="relative group">
                    <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="HỌ TÊN (IN HOA)" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white font-black uppercase italic outline-none text-[11px]" />
                  </div>
                )}
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="EMAIL" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none text-[11px]" />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="MẬT KHẨU" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none text-[11px]" />
                </div>

                {authMode === 'signup' && (
                  <div className="relative group">
                    <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} placeholder="MÃ GIỚI THIỆU" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none text-[11px] uppercase tracking-widest" />
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="flex items-center justify-between px-2 py-2">
                    <button type="button" onClick={() => setRememberMe(!rememberMe)} className="flex items-center gap-3 group">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${rememberMe ? 'bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-slate-800 bg-slate-950'}`}>
                        {rememberMe && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase italic">Lưu thông tin</span>
                    </button>
                    <button type="button" onClick={() => setAuthMode('forgot')} className="text-[10px] font-black text-blue-500 uppercase italic">Quên mật khẩu?</button>
                  </div>
                )}

                <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 text-[11px] italic">
                  <span>{isLoading ? 'ĐANG XỬ LÝ...' : authMode === 'login' ? 'TIẾP TỤC ĐĂNG NHẬP' : 'XÁC THỰC TÀI KHOẢN'}</span>
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </form>
            )}

            {error && <div className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-4 rounded-xl text-center border border-red-500/10">{error}</div>}
            {successMsg && <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 p-4 rounded-xl text-center border border-emerald-500/10">{successMsg}</div>}

            <div className="text-center pt-6">
              <button 
                onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMsg(''); }} 
                className="text-slate-600 text-[10px] font-black hover:text-blue-400 uppercase tracking-widest italic"
              >
                {authMode === 'login' ? 'CHƯA CÓ TÀI KHOẢN? ĐĂNG KÝ NGAY' : 'ĐÃ CÓ TÀI KHOẢN? ĐĂNG NHẬP'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Admin & Community Support Contacts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
          <div className="flex flex-col gap-3 pointer-events-auto">
            <a 
              href={SOCIAL_LINKS.TELEGRAM_GROUP} 
              target="_blank" 
              className="w-12 h-12 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-full flex items-center justify-center text-blue-500 shadow-lg hover:bg-blue-600 hover:text-white transition-all hover:scale-110 group relative"
              title="Tham gia cộng đồng"
            >
              <MessageCircle size={20} />
              <div className="absolute right-full mr-3 px-3 py-1 bg-black/80 rounded-lg text-[9px] font-black text-white uppercase italic tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/5">NHÓM TELEGRAM</div>
            </a>
            <div className="h-px w-8 bg-white/10 mx-auto my-1"></div>
            <a 
              href={SOCIAL_LINKS.ZALO_ADMIN} 
              target="_blank" 
              className="w-12 h-12 bg-blue-400/20 backdrop-blur-xl border border-blue-400/30 rounded-full flex items-center justify-center text-blue-400 shadow-lg hover:bg-blue-400 hover:text-white transition-all hover:scale-110 group relative"
              title="Zalo Admin 0337117930"
            >
              <PhoneCall size={20} />
              <div className="absolute right-full mr-3 px-3 py-1 bg-black/80 rounded-lg text-[9px] font-black text-white uppercase italic tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/5">ZALO ADMIN</div>
            </a>
            <a 
              href={SOCIAL_LINKS.TELEGRAM_ADMIN} 
              target="_blank" 
              className="w-12 h-12 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-full flex items-center justify-center text-blue-500 shadow-lg hover:bg-blue-600 hover:text-white transition-all hover:scale-110 group relative"
              title="Telegram Admin @VanhTRUM"
            >
              <SendHorizontal size={20} />
              <div className="absolute right-full mr-3 px-3 py-1 bg-black/80 rounded-lg text-[9px] font-black text-white uppercase italic tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/5">TELE ADMIN</div>
            </a>
          </div>
      </div>

      <div className="mt-8 flex items-center gap-6 opacity-40">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest italic text-center">Encrypted Connection © 2025 Nova Sync</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
