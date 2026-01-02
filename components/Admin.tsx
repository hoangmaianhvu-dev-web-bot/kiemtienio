
import React, { useState, useEffect, useMemo } from 'react';
import { User, WithdrawalRequest, Giftcode, Announcement, AdBanner, ActivityLog } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { formatK } from '../constants.tsx';
import { 
  Users, CreditCard, Search, Ban, Unlock, Plus, Trash2, Megaphone, ShieldCheck, 
  ShoppingBag, Ticket, History, Activity, Database, Copy, CheckCircle2, X, 
  PlusCircle, Gamepad2, Building2, AlertTriangle, Loader2, Eye, EyeOff,
  LayoutTemplate, ImageIcon, MessageSquarePlus, Tag, UserPlus, BarChart3, TrendingUp,
  Hash, ShieldAlert
} from 'lucide-react';

interface Props {
  user: User;
  onUpdateUser: (user: User) => void;
}

export default function Admin({ user, onUpdateUser }: Props) {
  const [tab, setTab] = useState<'users' | 'withdrawals' | 'ads' | 'announcements' | 'giftcodes' | 'logs' | 'setup'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [withdrawSearchTerm, setWithdrawSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [giftcodes, setGiftcodes] = useState<Giftcode[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showModal, setShowModal] = useState<string | null>(null);

  const [newAd, setNewAd] = useState({ title: '', imageUrl: '', targetUrl: '' });
  const [newAnn, setNewAnn] = useState({ title: '', content: '', priority: 'low' as 'low' | 'high' });
  const [newGc, setNewGc] = useState({ code: '', amount: 10000, maxUses: 100 });

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(w => 
      w.userName.toLowerCase().includes(withdrawSearchTerm.toLowerCase()) ||
      w.details.toLowerCase().includes(withdrawSearchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(withdrawSearchTerm.toLowerCase())
    );
  }, [withdrawals, withdrawSearchTerm]);

  const stats = useMemo(() => {
    const totalBalance = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    return { totalUsers: allUsers.length, totalBalance, pendingWithdrawals };
  }, [allUsers, withdrawals]);

  const refreshData = async () => {
    setIsSyncing(true);
    try {
      const [u, w, g, a, adsData, l] = await Promise.all([
        dbService.getAllUsers(),
        dbService.getWithdrawals(),
        dbService.getGiftcodes(true), 
        dbService.getAnnouncements(true), 
        dbService.getAds(true),
        dbService.getActivityLogs()
      ]);
      setAllUsers(u);
      setWithdrawals(w);
      setGiftcodes(g);
      setAnnouncements(a);
      setAds(adsData);
      setLogs(l);
    } catch (err: any) {
      console.error("Sync error:", err?.message || err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [tab]);

  const handleToggleBan = async (u: User) => {
    const reason = u.isBanned ? '' : 'Bị khóa bởi quản trị viên';
    await dbService.updateUser(u.id, { isBanned: !u.isBanned, banReason: reason });
    refreshData();
  };

  const handleWithdrawAction = async (id: string, status: 'completed' | 'rejected') => {
    await dbService.updateWithdrawalStatus(id, status);
    refreshData();
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    alert('Đã copy Mã: ' + id);
  };

  const handleAddAd = async () => {
    if (!newAd.title || !newAd.imageUrl) return alert("Vui lòng nhập đủ thông tin!");
    await dbService.saveAd(newAd);
    setNewAd({ title: '', imageUrl: '', targetUrl: '' });
    setShowModal(null);
    refreshData();
  };

  const handleToggleAd = async (id: string, current: boolean) => {
    await dbService.updateAdStatus(id, !current);
    refreshData();
  };

  const handleDeleteAd = async (id: string) => {
    if (window.confirm("Xóa quảng cáo này?")) {
      await dbService.deleteAd(id);
      refreshData();
    }
  };

  const handleAddAnn = async () => {
    if (!newAnn.title || !newAnn.content) return alert("Vui lòng nhập đủ thông tin!");
    await dbService.saveAnnouncement(newAnn);
    setNewAnn({ title: '', content: '', priority: 'low' });
    setShowModal(null);
    refreshData();
  };

  const handleToggleAnn = async (id: string, current: boolean) => {
    await dbService.updateAnnouncementStatus(id, !current);
    refreshData();
  };

  const handleDeleteAnn = async (id: string) => {
    if (window.confirm("Xóa thông báo này?")) {
      await dbService.deleteAnnouncement(id);
      refreshData();
    }
  };

  const handleAddGc = async () => {
    if (!newGc.code || !newGc.amount) return alert("Vui lòng nhập đủ thông tin!");
    await dbService.addGiftcode(newGc);
    setNewGc({ code: '', amount: 10000, maxUses: 100 });
    setShowModal(null);
    refreshData();
  };

  const handleToggleGc = async (code: string, current: boolean) => {
    await dbService.updateGiftcodeStatus(code, !current);
    refreshData();
  };

  const handleDeleteGc = async (code: string) => {
    if (window.confirm(`Xóa Giftcode ${code}?`)) {
      await dbService.deleteGiftcode(code);
      refreshData();
    }
  };

  const copySql = () => {
    const sql = `-- MÃ KHỞI TẠO VÀ SỬA LỖI DATABASE DIAMOND NOVA (AUDIT INTEGRITY)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users_data (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    fullname TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    total_earned NUMERIC DEFAULT 0,
    total_giftcode_earned NUMERIC DEFAULT 0, -- Cột mới cho Audit
    tasks_today INTEGER DEFAULT 0,
    tasks_week INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    security_score INTEGER DEFAULT 100,
    join_date TIMESTAMPTZ DEFAULT NOW(),
    last_task_date TIMESTAMPTZ,
    bank_info TEXT DEFAULT '',
    id_game TEXT DEFAULT '',
    task_counts JSONB DEFAULT '{}'::jsonb,
    referral_count INTEGER DEFAULT 0,
    reset_code TEXT
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users_data(id),
    user_name TEXT,
    amount NUMERIC,
    type TEXT,
    status TEXT DEFAULT 'pending',
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_name TEXT,
    action TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tắt RLS để Prototype hoạt động mượt mà
ALTER TABLE public.users_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;`;
    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20"><ShieldCheck className="w-8 h-8 text-white" /></div>
          <div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">NOVA ADMIN</h1>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic mt-1">Hệ thống quản trị Vision 1.4</p>
          </div>
        </div>
        <button onClick={refreshData} className="px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-slate-800 flex items-center gap-2 transition-all">
           <Activity className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} /> ĐỒNG BỘ DỮ LIỆU
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] border border-blue-500/10 flex items-center justify-between bg-blue-500/5">
           <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">TỔNG HỘI VIÊN</span>
              <h2 className="text-4xl font-black text-white italic tracking-tighter">{stats.totalUsers.toLocaleString()}</h2>
           </div>
           <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400"><Users size={32} /></div>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] border border-emerald-500/10 flex items-center justify-between bg-emerald-500/5">
           <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">TỔNG ĐIỂM HỆ THỐNG</span>
              <h2 className="text-4xl font-black text-white italic tracking-tighter">{formatK(stats.totalBalance)} P</h2>
           </div>
           <div className="p-4 bg-emerald-600/10 rounded-2xl text-emerald-400"><TrendingUp size={32} /></div>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] border border-amber-500/10 flex items-center justify-between bg-amber-500/5">
           <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">YÊU CẦU ĐANG CHỜ</span>
              <h2 className="text-4xl font-black text-white italic tracking-tighter">{stats.pendingWithdrawals}</h2>
           </div>
           <div className="p-4 bg-amber-600/10 rounded-2xl text-amber-400"><CreditCard size={32} /></div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
        {[
          { id: 'users', label: 'Hội viên', icon: <Users className="w-4 h-4" /> },
          { id: 'withdrawals', label: 'Rút tiền', icon: <CreditCard className="w-4 h-4" />, badge: withdrawals.filter(w=>w.status==='pending').length },
          { id: 'ads', label: 'Quảng cáo', icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'announcements', label: 'Thông báo', icon: <Megaphone className="w-4 h-4" /> },
          { id: 'giftcodes', label: 'Giftcode', icon: <Ticket className="w-4 h-4" /> },
          { id: 'logs', label: 'Nhật ký', icon: <History className="w-4 h-4" /> },
          { id: 'setup', label: 'Hệ thống', icon: <Database className="w-4 h-4" /> },
        ].map(i => (
          <button key={i.id} onClick={() => setTab(i.id as any)} className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2 ${tab === i.id ? 'bg-blue-600 border-blue-500 shadow-2xl text-white' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'}`}>
            {i.icon} <span>{i.label}</span>
            {i.badge ? <span className="ml-2 bg-red-600 px-2 py-0.5 rounded-full text-[8px] text-white">{i.badge}</span> : null}
          </button>
        ))}
      </div>

      <div className="glass-card p-10 md:p-14 rounded-[4rem] border border-white/10 shadow-3xl bg-slate-950/40 relative min-h-[600px]">
        {tab === 'users' && (
           <div className="space-y-10 animate-in slide-in-from-right-4">
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="relative w-full max-w-md">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                   <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm hội viên..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-white font-bold outline-none focus:border-blue-500 shadow-inner" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase font-black border-b border-white/5">
                      <th className="px-6 py-4">Hội viên</th>
                      <th className="px-6 py-4 text-center">Số dư</th>
                      <th className="px-6 py-4 text-center">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.filter(u => u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                      <tr key={u.id} className={`border-b border-white/5 hover:bg-white/[0.02] ${u.isBanned ? 'bg-red-900/5' : ''}`}>
                        <td className="px-6 py-6">
                           <div className="font-black text-white italic text-base uppercase">{u.fullname}</div>
                           <div className="text-[10px] text-slate-500 font-bold uppercase">{u.email}</div>
                        </td>
                        <td className="px-6 py-6 text-center font-black text-emerald-500 italic text-lg">{formatK(u.balance)} P</td>
                        <td className="px-6 py-6 text-center">
                           {u.isBanned ? (
                             <div className="flex flex-col items-center">
                               <span className="px-3 py-1 bg-red-600/10 text-red-500 text-[8px] font-black rounded-full border border-red-500/20">BỊ KHÓA</span>
                               {u.banReason?.includes('SENTINEL') && <span className="text-[7px] text-red-400 font-bold mt-1 uppercase">Sentinel Auto-Ban</span>}
                             </div>
                           ) : (
                             <span className="px-3 py-1 bg-emerald-600/10 text-emerald-500 text-[8px] font-black rounded-full border border-emerald-500/20">HOẠT ĐỘNG</span>
                           )}
                        </td>
                        <td className="px-6 py-6 text-right">
                           <button onClick={() => handleToggleBan(u)} className={`p-4 rounded-xl transition-all ${u.isBanned ? 'bg-emerald-600/10 text-emerald-400' : 'bg-red-600/10 text-red-500'}`}>
                             {u.isBanned ? <Unlock size={20} /> : <Ban size={20} />}
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        )}

        {tab === 'withdrawals' && (
           <div className="space-y-6 animate-in slide-in-from-right-4">
             {filteredWithdrawals.map(w => (
               <div key={w.id} className="glass-card p-8 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex gap-6 items-center flex-1">
                     <div className={`p-5 rounded-2xl ${w.type==='bank'?'bg-emerald-600/10 text-emerald-400':'bg-purple-600/10 text-purple-400'}`}>
                        {w.type==='bank'?<Building2 size={32}/>:<Gamepad2 size={32}/>}
                     </div>
                     <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <div className="text-[10px] font-black text-blue-400 uppercase italic">Gmail/User: {w.userName}</div>
                          <div onClick={() => handleCopyId(w.id)} className="px-2 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-black text-slate-500 cursor-pointer flex items-center gap-1 group/id">
                             <Hash size={10} /> TXID: {w.id.substring(0, 13)}... <Copy size={8} className="opacity-40 group-hover/id:opacity-100" />
                          </div>
                        </div>
                        <h4 className="font-black text-2xl text-white italic tracking-tighter">{w.amount.toLocaleString()}đ ({w.type.toUpperCase()})</h4>
                        <div className="text-[10px] text-slate-400 font-bold italic bg-white/5 px-3 py-1 rounded-full mt-2 inline-block">
                           <span className="text-[8px] uppercase tracking-widest text-slate-500">Thông tin:</span> {w.details}
                        </div>
                     </div>
                  </div>
                  {w.status === 'pending' ? (
                    <div className="flex gap-4">
                       <button onClick={() => handleWithdrawAction(w.id, 'completed')} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase italic tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 transition-transform">DUYỆT CHI</button>
                       <button onClick={() => handleWithdrawAction(w.id, 'rejected')} className="px-8 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase italic tracking-widest hover:bg-red-600 hover:text-white transition-all">HỦY BỎ</button>
                    </div>
                  ) : (
                    <span className={`px-6 py-3 rounded-full text-[10px] font-black uppercase italic border ${w.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {w.status === 'completed' ? 'ĐÀ THỰC HIỆN' : 'ĐÃ TỪ CHỐI'}
                    </span>
                  )}
               </div>
             ))}
           </div>
        )}

        {tab === 'logs' && (
           <div className="space-y-4 animate-in slide-in-from-right-4">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <History className="text-blue-500" /> NHẬT KÝ HỆ THỐNG
              </h3>
              {logs.map((log, i) => (
                <div key={i} className={`flex items-center gap-5 p-5 rounded-2xl border border-white/5 text-[11px] hover:bg-white/[0.05] transition-all ${log.action?.includes('BAN') ? 'bg-red-600/5' : 'bg-white/[0.02]'}`}>
                   <span className="text-slate-600 font-bold shrink-0">{new Date(log.createdAt).toLocaleTimeString('vi-VN')}</span>
                   <span className={`font-black uppercase shrink-0 ${log.action?.includes('BAN') ? 'text-red-500' : 'text-blue-400'}`}>[{log.action}]</span>
                   <span className="text-slate-300 font-medium italic flex-1">{log.userName}: {log.details}</span>
                   {log.action?.includes('SENTINEL') && <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />}
                </div>
              ))}
           </div>
        )}

        {tab === 'setup' && (
           <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="p-10 rounded-[3rem] border border-blue-500/20 bg-blue-500/5 space-y-6">
                 <div className="flex items-center gap-4 text-amber-500">
                    <AlertTriangle className="w-8 h-8" />
                    <h4 className="text-xl font-black text-white italic uppercase">BẢO TRÌ DATABASE NOA VISION 1.4</h4>
                 </div>
                 <p className="text-slate-400 text-sm font-medium italic leading-relaxed">Đảm bảo DB của bạn đã có cột <b>total_giftcode_earned</b>. Chạy SQL dưới đây để đồng bộ.</p>
                 <div className="relative group">
                    <pre className="w-full bg-black/80 border border-slate-800 rounded-2xl p-8 text-blue-400 font-mono text-[10px] overflow-x-auto max-h-72 italic">
                       {`ALTER TABLE public.users_data ADD COLUMN IF NOT EXISTS total_giftcode_earned NUMERIC DEFAULT 0;`}
                    </pre>
                    <button onClick={copySql} className="absolute top-4 right-4 p-4 bg-slate-900/80 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all shadow-2xl flex items-center gap-2 font-black uppercase text-[10px]">
                       {sqlCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                       {sqlCopied ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP SQL'}
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
