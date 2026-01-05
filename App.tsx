import React, { useState, useEffect, useCallback } from 'react';
import { AppView, User, VipTier, Notification } from './types.ts';
import { dbService } from './services/dbService.ts';
import { 
  LayoutDashboard, Coins, CreditCard, Trophy, Bot, User as UserIcon, 
  Ticket, Crown, LogOut, Menu, X, Sparkles, Bell, Zap, TrendingUp, History,
  BookOpen, Users, Cloud
} from 'lucide-react';

import Dashboard from './components/Dashboard.tsx';
import Tasks from './components/Tasks.tsx';
import Withdraw from './components/Withdraw.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import Support from './components/Support.tsx';
import Profile from './components/Profile.tsx';
import Giftcode from './components/Giftcode.tsx';
import Admin from './components/Admin.tsx';
import Vip from './components/Vip.tsx';
import UserNotifications from './components/UserNotifications.tsx';
import Referral from './components/Referral.tsx';
import Guide from './components/Guide.tsx';
import Login from './components/Login.tsx';
import GoldModal from './components/GoldModal.tsx';
import NovaNotification, { NovaSecurityModal } from './components/NovaNotification.tsx';
import GlobalAlertSystem from './components/GlobalAlertSystem.tsx';
import GlobalSearch from './components/GlobalSearch.tsx';

import { NAV_ITEMS } from './constants.tsx';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [toastNotifs, setToastNotifs] = useState<Notification[]>([]);
  const [goldModal, setGoldModal] = useState({ isOpen: false, title: '', desc: '' });
  const [securityModal, setSecurityModal] = useState({ isOpen: false, score: 100 });

  useEffect(() => {
    dbService.getCurrentUser().then(u => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  const handleUpdateUser = useCallback(async (updatedUser: User) => {
    setUser(updatedUser);
    const { success, message } = await dbService.updateUser(updatedUser.id, updatedUser);
    return { success, message };
  }, []);

  const showToast = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Date.now().toString();
    setToastNotifs(prev => [...prev, { 
      id, 
      title, 
      content: message, 
      message, 
      type, 
      createdAt: new Date().toISOString() 
    }]);
  }, []);

  const showGoldSuccess = useCallback((title: string, description: string) => {
    setGoldModal({ isOpen: true, title, desc: description });
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black italic text-blue-500 tracking-widest animate-pulse">NOVA SYNCING...</div>;

  if (!user) return (
    <>
      <GlobalAlertSystem />
      <Login onLoginSuccess={setUser} />
    </>
  );

  const NavItem = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    if (item.adminOnly && !user.isAdmin) return null;
    const active = view === item.id;
    const Icon = item.icon; // Lấy Component Reference
    
    return (
      <button 
        onClick={() => { setView(item.id); setSidebarOpen(false); }} 
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
          active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 
          item.isSpecial ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
          'text-slate-500 hover:bg-white/5'
        }`}
      >
        <Icon size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest italic">{item.label}</span>
      </button>
    );
  };

  const renderView = () => {
    switch (view) {
      case AppView.DASHBOARD: return <Dashboard user={user} setView={setView} />;
      case AppView.TASKS: return <Tasks user={user} onUpdateUser={setUser} />;
      case AppView.WITHDRAW: return <Withdraw user={user} onUpdateUser={setUser} showGoldSuccess={showGoldSuccess} />;
      case AppView.HISTORY: return <Withdraw user={user} onUpdateUser={setUser} initialHistory={true} showGoldSuccess={showGoldSuccess} />;
      case AppView.LEADERBOARD: return <Leaderboard />;
      case AppView.SUPPORT: return <Support />;
      case AppView.PROFILE: return <Profile user={user} onUpdateUser={handleUpdateUser} />;
      case AppView.GIFTCODE: return <Giftcode user={user} onUpdateUser={setUser} showGoldSuccess={showGoldSuccess} />;
      case AppView.ADMIN: return <Admin user={user} onUpdateUser={setUser} setSecurityModal={setSecurityModal} showToast={showToast} showGoldSuccess={showGoldSuccess} />;
      case AppView.VIP: return <Vip user={user} onUpdateUser={setUser} showGoldSuccess={showGoldSuccess} />;
      case AppView.NOTIFICATIONS: return <UserNotifications user={user} />;
      case AppView.REFERRAL: return <Referral user={user} />;
      case AppView.GUIDE: return <Guide />;
      default: return <Dashboard user={user} setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#03050a]">
      <GlobalAlertSystem />
      <NovaNotification notifications={toastNotifs} removeNotification={(id) => setToastNotifs(prev => prev.filter(n => n.id !== id))} />
      <GoldModal isOpen={goldModal.isOpen} title={goldModal.title} description={goldModal.desc} onClose={() => setGoldModal(p => ({ ...p, isOpen: false }))} />
      {securityModal.isOpen && <NovaSecurityModal score={securityModal.score} onClose={() => setSecurityModal(p => ({ ...p, isOpen: false }))} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass-card border-r border-white/5 transform transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-3 mb-10">
            <Sparkles className="text-blue-500 w-8 h-8" />
            <h2 className="font-black text-2xl italic tracking-tighter">NOVA</h2>
          </div>
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map(item => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>
          <div className="mt-auto pt-6 border-t border-white/5">
            <button onClick={() => { dbService.logout(); window.location.reload(); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 font-black uppercase text-[10px] italic hover:bg-red-500/10 transition-all">
              <LogOut size={18} /> ĐĂNG XUẤT
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative no-scrollbar">
        <div className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-blue-600 h-8 flex items-center overflow-hidden border-b border-white/10">
          <div className="animate-marquee whitespace-nowrap text-white font-black uppercase italic text-[9px] tracking-[0.4em]">
            CHÀO MỪNG ĐẾN VỚI HỆ THỐNG DIAMOND NOVA • NHẬN KIM CƯƠNG MIỄN PHÍ 100% • NẠP SẠCH KHÔNG BAN ACC • HỖ TRỢ GEMINI AI 24/7
          </div>
        </div>

        <div className="p-8 lg:p-12 mt-10 max-w-6xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-900 rounded-xl"><Menu size={20} /></button>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">TRẢI NGHIỆM LUXURY</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase italic">Xin chào, {user.fullname}</p>
              </div>
            </div>
            
            <GlobalSearch onNavigate={setView} isAdmin={user.isAdmin} />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Số dư Nova</p>
                <p className="text-xl font-black text-emerald-500 italic leading-none">{user.balance.toLocaleString()} P</p>
              </div>
              <div 
                onClick={() => setView(AppView.NOTIFICATIONS)}
                className="p-3 bg-white/5 rounded-2xl text-slate-400 border border-white/5 relative cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Bell size={18} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
            </div>
          </header>

          {renderView()}
        </div>
      </main>

      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default App;