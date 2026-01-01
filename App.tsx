
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, User, AdBanner } from './types';
import { dbService } from './services/dbService';
import { NAV_ITEMS } from './constants';
import { 
  Menu, 
  X, 
  LogOut, 
  UserCircle, 
  ArrowRight, 
  Sparkles, 
  Mail, 
  Lock, 
  KeyRound,
  ShieldCheck,
  Coins
} from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Withdraw from './components/Withdraw';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Giftcode from './components/Giftcode';
import Referral from './components/Referral';
import Admin from './components/Admin';
import Guide from './components/Guide';
import UserNotifications from './components/UserNotifications';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'none'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const totalUsersCount = useMemo(() => dbService.getTotalUserCount(), []);
  
  const MASCOT_CAT_URL = "https://cdn-icons-png.flaticon.com/512/3069/3069153.png";

  useEffect(() => {
    // Kiểm tra mã giới thiệu từ URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setAuthMode('signup');
    }

    const sessionUser = dbService.getCurrentUser();
    if (sessionUser) {
      setUser(sessionUser);
      setAuthMode('none');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = dbService.login(email, password);
    if (u) { 
      setUser(u); 
      setAuthMode('none'); 
      setError(''); 
    } else { 
      setError('Sai email hoặc mật khẩu!'); 
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('Vui lòng điền đủ thông tin!');
    const res = dbService.signup(email, password, name, referralCode);
    if (res.success) { 
      setAuthMode('login'); 
      setError(''); 
      setSuccessMsg('Đăng ký thành công! Hãy đăng nhập.'); 
    } else { 
      setError(res.message); 
    }
  };

  const logout = () => { 
    dbService.logout(); 
    setUser(null); 
    setAuthMode('login'); 
    setCurrentView(AppView.DASHBOARD);
  };

  const updateUser = (updated: User) => { 
    setUser(updated); 
    dbService.updateCurrentUser(updated); 
  };

  if (authMode !== 'none') {
    return (
      <div className="min-h-screen bg-[#06080c] flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-[5%] left-[-5%] w-[40%] h-[40%] opacity-[0.06] pointer-events-none select-none float-animation">
           <img src={MASCOT_CAT_URL} alt="Mascot BG" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]" />
        </div>
        <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] opacity-[0.06] pointer-events-none select-none float-animation" style={{ animationDelay: '3s' }}>
           <img src={MASCOT_CAT_URL} alt="Mascot BG" className="w-full h-full object-contain rotate-12 filter drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]" />
        </div>

        <header className="w-full z-[100] px-4 md:px-6 py-6 sticky top-0">
          <div className="container mx-auto max-w-7xl">
            <div className="glass-card rounded-[2.5rem] px-8 py-5 flex items-center justify-between border border-white/10 shadow-2xl backdrop-blur-3xl bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">NOVA CORE</h1>
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">VISION 1.0</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => setAuthMode('login')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Đăng nhập</button>
                <button onClick={() => setAuthMode('signup')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Đăng ký</button>
              </div>

              <button onClick={() => setIsAuthMenuOpen(!isAuthMenuOpen)} className="md:hidden p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300">
                {isAuthMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto z-10 flex flex-col lg:flex-row items-center justify-center gap-16 max-w-7xl px-8 pt-8 flex-1">
          <div className="w-full lg:w-1/2 space-y-10 text-center lg:text-left animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-black uppercase tracking-[0.3em]">
                <ShieldCheck className="w-4 h-4" /> BẢN QUYỀN VISION 1.0
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] uppercase tracking-tighter italic">
                LÀM NHIỆM VỤ <br />
                <span className="nova-gradient">KIẾM MONEY & DIAMOND</span>
              </h1>
              <p className="text-slate-300 font-black text-sm md:text-xl uppercase tracking-[0.1em] max-w-md mx-auto lg:mx-0 leading-relaxed drop-shadow-lg">
                KIẾM TIỀN, <span className="text-blue-400">KIẾM KIM CƯƠNG FF</span> MIỄN PHÍ.
              </p>
            </div>
            
            <div className="flex justify-center lg:justify-start">
               <div className="w-56 h-56 rounded-[3.5rem] overflow-hidden border-4 border-white/10 shadow-3xl rotate-3 hover:rotate-0 transition-transform duration-700 group bg-slate-900/40 p-8 backdrop-blur-xl flex items-center justify-center border-amber-500/20">
                  <img src={MASCOT_CAT_URL} alt="Lucky Cat Mascot" className="w-full h-full object-contain group-hover:scale-125 transition-transform duration-1000 float-animation" />
               </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="glass-card w-full max-w-md p-10 md:p-14 rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.1)] backdrop-blur-3xl relative">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{authMode === 'login' ? 'XÁC THỰC' : 'GIA NHẬP'}</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 italic">Vision 1.0 • Bảo mật 256-bit</p>
              </div>

              <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-5">
                {authMode === 'signup' && (
                  <div className="relative group">
                    <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="HỌ VÀ TÊN THẬT" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-16 pr-8 py-5 text-white font-black uppercase italic outline-none focus:border-blue-600 transition-all text-sm" />
                  </div>
                )}
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ĐỊA CHỈ EMAIL" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-16 pr-8 py-5 text-white font-bold outline-none focus:border-blue-600 transition-all text-sm" />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="MẬT KHẨU" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-16 pr-8 py-5 text-white font-bold outline-none focus:border-blue-600 transition-all text-sm" />
                </div>

                {authMode === 'signup' && (
                  <div className="relative group">
                    <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} placeholder="MÃ GIỚI THIỆU (NẾU CÓ)" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-16 pr-8 py-5 text-white font-bold outline-none focus:border-blue-600 transition-all text-sm uppercase" />
                  </div>
                )}

                {error && <div className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-4 rounded-xl text-center border border-red-500/20">{error}</div>}
                {successMsg && <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 p-4 rounded-xl text-center border border-emerald-500/20">{successMsg}</div>}

                <button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/30 uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 group mt-8 italic">
                  <span>{authMode === 'login' ? 'TIẾP TỤC ĐĂNG NHẬP' : 'XÁC NHẬN GIA NHẬP'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </form>

              <div className="mt-10 text-center">
                <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMsg(''); }} className="text-slate-500 text-[10px] font-black hover:text-blue-400 uppercase tracking-[0.2em] transition-all italic">
                  {authMode === 'login' ? 'CHƯA CÓ TÀI KHOẢN? ĐĂNG KÝ MỚI' : 'QUAY LẠI TRANG ĐĂNG NHẬP'}
                </button>
              </div>
            </div>

            <div className="mt-16 flex gap-16 text-center">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cộng đồng</span>
                <span className="text-4xl font-black text-white italic drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">{totalUsersCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Máy chủ</span>
                <span className="text-4xl font-black text-emerald-500 italic uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">ONLINE</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const renderView = () => {
    if (!user) return null;
    if (user.isBanned) return <div className="p-20 text-center text-red-500 font-black uppercase tracking-[0.2em] glass-card rounded-3xl m-6">Tài khoản đã bị đình chỉ.</div>;
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard user={user} setView={setCurrentView} />;
      case AppView.TASKS: return <Tasks user={user} onUpdateUser={updateUser} />;
      case AppView.WITHDRAW: return <Withdraw user={user} onUpdateUser={updateUser} />;
      case AppView.HISTORY: return <Withdraw user={user} onUpdateUser={updateUser} initialHistory={true} />;
      case AppView.LEADERBOARD: return <Leaderboard />;
      case AppView.PROFILE: return <Profile user={user} onUpdateUser={updateUser} />;
      case AppView.GIFTCODE: return <Giftcode user={user} onUpdateUser={updateUser} />;
      case AppView.REFERRAL: return <Referral user={user} />;
      case AppView.ADMIN: return user.isAdmin ? <Admin user={user} onUpdateUser={updateUser} /> : <Dashboard user={user} setView={setCurrentView} />;
      case AppView.GUIDE: return <Guide />;
      case AppView.NOTIFICATIONS: return <UserNotifications user={user} />;
      default: return <Dashboard user={user} setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#06080c] text-slate-200 selection:bg-blue-600/20">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass-card border-r border-white/5 transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-12 px-2">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center shadow-xl shadow-blue-600/20">
                <Sparkles className="w-7 h-7 text-white" />
             </div>
             <div>
               <h2 className="font-black text-xl text-white italic leading-none">NOVA</h2>
               <span className="text-[9px] font-black text-blue-500 tracking-widest uppercase">VISION 1.0</span>
             </div>
          </div>
          
          <nav className="flex-1 space-y-2 no-scrollbar overflow-y-auto">
            {NAV_ITEMS.map(item => {
              if (item.adminOnly && !user?.isAdmin) return null;
              const active = currentView === item.id;
              return (
                <button key={item.id} onClick={() => { setCurrentView(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all border ${active ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-500/20 shadow-xl shadow-blue-600/10' : 'text-slate-500 hover:text-white hover:bg-white/5 border-transparent'}`}>
                  <div className={active ? 'text-white' : ''}>{React.cloneElement(item.icon as any, { className: 'w-5 h-5' })}</div>
                  <span className="font-black text-[11px] uppercase tracking-widest italic">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
             <div className="flex items-center gap-4 px-3 mb-8">
               <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 via-red-600 to-purple-800 rounded-2xl flex items-center justify-center font-black text-white border border-white/10 shadow-inner text-lg drop-shadow-md">
                 {user?.fullname.charAt(0)}
               </div>
               <div className="flex flex-col overflow-hidden">
                 <span className="text-xs font-black text-white uppercase italic truncate">{user?.fullname}</span>
                 <span className={`text-[8px] font-bold ${user?.isAdmin ? 'text-amber-500 animate-pulse' : 'text-blue-500'}`}>{user?.isAdmin ? 'MASTER ADMIN' : 'ELITE MEMBER'}</span>
               </div>
             </div>
             <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 font-black hover:bg-red-500/10 transition-all uppercase text-[10px] tracking-widest italic border border-transparent hover:border-red-500/20">
               <LogOut className="w-5 h-5" /> THOÁT RA
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
        <div className="md:hidden flex items-center justify-between mb-10 glass-card p-6 rounded-[2.5rem] border border-white/10 shadow-lg">
           <div className="flex items-center gap-4">
             <Sparkles className="w-7 h-7 text-blue-500" />
             <span className="font-black text-lg italic text-white uppercase tracking-tighter">DIAMOND NOVA</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-slate-900 rounded-2xl text-white"><Menu className="w-6 h-6" /></button>
        </div>
        
        <div className="max-w-6xl mx-auto pb-20 relative">
          {renderView()}
          
          <div className="absolute bottom-[-4rem] right-0 text-[9px] font-black text-slate-700 uppercase tracking-widest italic">
            © 2025 DIAMOND NOVA • VISION 1.0
          </div>
        </div>
      </main>

      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};

export default App;
