
import React, { useState, useEffect, useMemo } from 'react';
import { User, WithdrawalRequest, Giftcode, AdBanner, Announcement, Notification, VipTier } from '../types.ts';
import { dbService } from '../services/dbService.ts';
import { formatK, RATE_VND_TO_POINT } from '../constants.tsx';
import { 
  Users, CreditCard, Ticket, Megaphone, ImageIcon, Eye, EyeOff, Trash2, 
  PlusCircle, Search, CheckCircle2, XCircle, Settings, UserMinus, 
  UserPlus, ShieldAlert, Ban, Unlock, Wallet, Activity, TrendingUp, DollarSign,
  RefreshCcw, UserX, X, ShieldCheck, Edit, Calendar, Clock,
  Building2, Gamepad2, FileText, Crown, Cpu, AlertCircle, HardDriveDownload
} from 'lucide-react';

interface AdminProps {
  user: User;
  onUpdateUser: (user: User) => void;
  setSecurityModal: (state: { isOpen: boolean; score: number }) => void;
  showToast: (title: string, message: string, type: Notification['type']) => void;
  showGoldSuccess: (title: string, description: string) => void;
}

export default function Admin({ user, onUpdateUser, setSecurityModal, showToast, showGoldSuccess }: AdminProps) {
  if (!user.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-10 animate-in zoom-in-95">
        <div className="glass-card p-16 rounded-[4rem] border-2 border-red-500/30 text-center space-y-6">
          <ShieldAlert className="w-24 h-24 text-red-500 mx-auto animate-bounce" />
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">TRUY CẬP BỊ NGĂN CHẶN</h2>
          <p className="text-slate-500 font-bold italic uppercase tracking-widest text-xs">Bạn không có quyền hạn truy cập khu vực HỆ THỐNG.</p>
          <button onClick={() => window.location.reload()} className="px-10 py-4 bg-red-600 text-white font-black rounded-2xl uppercase italic text-[10px] tracking-widest">QUAY LẠI AN TOÀN</button>
        </div>
      </div>
    );
  }

  const [tab, setTab] = useState<'users' | 'withdrawals' | 'payments' | 'ads' | 'giftcodes' | 'announcements' | 'system'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [vipRequests, setVipRequests] = useState<any[]>([]);
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [giftcodes, setGiftcodes] = useState<Giftcode[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const [showAddGc, setShowAddGc] = useState(false);
  const [editingGc, setEditingGc] = useState<Giftcode | null>(null);

  const [showAddAd, setShowAddAd] = useState(false);
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [viewBill, setViewBill] = useState<string | null>(null);
  
  const [newGc, setNewGc] = useState({ 
    code: '', 
    amount: 10000, 
    maxUses: 100, 
    startDate: '', 
    endDate: '' 
  });
  
  const [newAd, setNewAd] = useState({ title: '', imageUrl: '', targetUrl: '' });
  const [newAnn, setNewAnn] = useState({ title: '', content: '', priority: 'low' as 'low' | 'high' });
  
  const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmResetText, setConfirmResetText] = useState('');

  const refreshData = async () => {
    try {
      const [u, w, v, a, g, ann] = await Promise.all([
        dbService.getAllUsers(),
        dbService.getWithdrawals(),
        dbService.getVipRequests(),
        dbService.getAds(true), 
        dbService.getGiftcodes(),
        dbService.getAnnouncements(true)
      ]);
      setUsers(u);
      setWithdrawals(w);
      setVipRequests(v);
      setAds(a);
      setGiftcodes(g);
      setAnnouncements(ann);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { refreshData(); }, []);

  const stats = useMemo(() => {
    const totalPoints = users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0);
    return {
      totalUsers: users.length,
      totalPoints,
      realMoney: Math.floor(totalPoints / RATE_VND_TO_POINT),
      pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
      activeUsers: users.filter(u => u.lastTaskDate && (Date.now() - new Date(u.lastTaskDate).getTime()) < 86400000).length
    };
  }, [users, withdrawals]);

  const statsItems = [
    { label: 'Tổng Hội viên', val: stats.totalUsers, color: 'border-l-blue-600', bg: 'bg-blue-600/5', icon: Users },
    { label: 'Kho Điểm Nova', val: formatK(stats.totalPoints), color: 'border-l-amber-600', bg: 'bg-amber-600/5', icon: Wallet },
    { label: 'Dự chi (VND)', val: `${stats.realMoney.toLocaleString()}đ`, color: 'border-l-emerald-600', bg: 'bg-emerald-600/5', icon: DollarSign },
    { label: 'Đơn Rút Chờ', val: stats.pendingWithdrawals, color: 'border-l-rose-600', bg: 'bg-rose-600/5', icon: Activity },
    { label: 'Online 24h', val: stats.activeUsers, color: 'border-l-indigo-600', bg: 'bg-indigo-600/5', icon: TrendingUp }
  ];

  const filteredUsers = useMemo(() => users.filter(u => u.fullname.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase())), [users, searchUser]);

  const handleToggleBan = async (u: User) => {
    const reason = u.isBanned ? '' : prompt('Lý do khóa?') || 'Vi phạm chính sách';
    if (!u.isBanned && !(await confirm('KHÓA người dùng này?'))) return;
    setIsActionLoading(true);
    const res = await dbService.updateUser(u.id, { isBanned: !u.isBanned, banReason: reason });
    if (res.success) { showToast('ADMIN', `Đã cập nhật trạng thái ${u.fullname}`, 'info'); await refreshData(); }
    setIsActionLoading(false);
  };

  const handleAdjustPoints = async (uid: string, isAdd: boolean) => {
    const amt = parseInt(prompt(`Số điểm muốn ${isAdd ? 'CỘNG' : 'TRỪ'}?`) || '0');
    if (isNaN(amt) || amt === 0) return;
    setIsActionLoading(true);
    const res = await dbService.adjustBalance(uid, isAdd ? amt : -amt);
    if (res.success) { showToast('ADMIN', res.message, 'success'); await refreshData(); }
    setIsActionLoading(false);
  };

  const handleDeleteUser = async (u: User) => {
    if (u.id === user.id) return alert("Bạn không thể tự xóa chính mình!");
    if (u.email === 'adminavudev@gmail.com') return alert("Không thể xóa tài khoản Admin hệ thống!");
    
    if (!(await confirm(`CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn xóa VĨNH VIỄN hội viên ${u.fullname}?`))) return;
    
    setIsActionLoading(true);
    const res = await dbService.deleteUser(u.id);
    if (res.success) {
      setUsers(prev => prev.filter(item => item.id !== u.id));
      setActiveUserMenu(null);
      showGoldSuccess("XÓA HỘI VIÊN THÀNH CÔNG", `Đã xóa ${u.fullname}.`);
    } else {
      showToast('LỖI HỆ THỐNG', res.message || "Lỗi", 'error');
    }
    setIsActionLoading(false);
  };

  const handleWithdrawAction = async (id: string, s: string) => {
    if (!confirm(`Xác nhận ${s === 'completed' ? 'DUYỆT' : 'TỪ CHỐI'}?`)) return;
    setIsActionLoading(true);
    await dbService.updateWithdrawalStatus(id, s);
    showToast('ADMIN', `Đơn rút: ${s.toUpperCase()}`, 'info');
    await refreshData();
    setIsActionLoading(false);
  };
  
  const updatePayment = async (billId: string, status: 'approved' | 'refunded', req?: any) => {
    if (!req && vipRequests) {
        req = vipRequests.find(v => String(v.id) === billId);
    }
    if (!req) return;
    if (!(await confirm(`Xác nhận ${status === 'approved' ? 'DUYỆT' : 'HOÀN TIỀN'}?`))) return;
    setIsActionLoading(true);
    const dbStatus = status === 'approved' ? 'completed' : 'refunded';
    const res = await dbService.updateVipRequestStatus(req.id, dbStatus, req.user_id, req.vip_tier);
    setIsActionLoading(false);
    if (res.success) {
        showToast('ADMIN', `Đã xử lý đơn nạp VIP`, 'success');
        await refreshData();
    } else {
        alert(res.message);
    }
  };

  const handleCreateGiftcode = async () => {
    if (!newGc.code || !newGc.amount) return alert("Nhập đủ thông tin.");
    setIsActionLoading(true);
    const res = await dbService.addGiftcode(newGc.code, newGc.amount, newGc.maxUses, newGc.startDate, newGc.endDate);
    setIsActionLoading(false);
    if (!res.error) { 
      showToast('ADMIN', "Đã tạo Giftcode!", 'success'); 
      setShowAddGc(false); 
      setNewGc({ code: '', amount: 10000, maxUses: 100, startDate: '', endDate: '' });
      refreshData(); 
    } else {
      alert("Lỗi: " + (res.error as any).message);
    }
  };

  const handleFactoryReset = async () => {
    if (confirmResetText !== 'CONFIRM RESET') return alert("Nhập chính xác 'CONFIRM RESET'.");
    if (!confirm("CẢNH BÁO: Xóa toàn bộ dữ liệu?")) return;
    setIsActionLoading(true);
    const res = await dbService.factoryResetSystem(user.id);
    setIsActionLoading(false);
    if (res.success) {
      showGoldSuccess("RESET THÀNH CÔNG", "Hệ thống sẽ tải lại.");
      setTimeout(() => { dbService.logout(); window.location.reload(); }, 2000);
    } else {
      showToast("LỖI RESET", res.message || "Lỗi", "error");
    }
  };

  const getVipRichStyle = (tier: VipTier) => {
    switch(tier) {
      case VipTier.ELITE: return 'elite-border-rich';
      case VipTier.PRO: return 'pro-border-rich';
      case VipTier.BASIC: return 'basic-border-rich';
      default: return 'border-white/10';
    }
  };

  const getVipCrownColor = (tier: VipTier) => {
    switch(tier) {
      case VipTier.ELITE: return 'text-purple-400 fill-purple-400';
      case VipTier.PRO: return 'text-amber-400 fill-amber-400';
      case VipTier.BASIC: return 'text-blue-400 fill-blue-400';
      default: return 'text-slate-400 fill-slate-400';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in pb-32">
      <div className="glass-card p-8 rounded-[3.5rem] border border-blue-500/20 bg-blue-600/5 flex items-center justify-between shadow-2xl flex-wrap gap-4">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-600 rounded-3xl shadow-lg">
               <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div>
               <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">NOVA COMMAND CENTER</h1>
               <p className="text-[10px] font-black text-slate-500 uppercase italic">Admin: <span className="text-blue-400">{user.fullname}</span></p>
            </div>
         </div>
         <button onClick={refreshData} className="px-8 py-3 bg-slate-900 text-slate-500 rounded-2xl hover:text-white border border-white/5 transition-all font-black text-[10px] uppercase italic flex items-center gap-3"><RefreshCcw size={14} /> TẢI LẠI</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        {statsItems.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`glass-card p-7 rounded-[2.5rem] border-l-8 ${s.color} ${s.bg} shadow-lg group hover:scale-105 transition-all`}>
               <Icon size={24} className='mb-4 group-hover:rotate-12 transition-transform' />
               <p className="text-[9px] font-black text-slate-600 uppercase mb-1 italic">{s.label}</p>
               <h3 className="text-2xl font-black text-white italic tracking-tighter">{s.val}</h3>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 overflow-x-auto no-scrollbar pb-2">
        {['users', 'withdrawals', 'payments', 'ads', 'giftcodes', 'announcements', 'system'].map(t => (
          <button key={t} onClick={() => setTab(t as any)} className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase italic tracking-widest transition-all whitespace-nowrap ${tab === t ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="glass-card p-10 rounded-[3.5rem] border border-white/5 bg-slate-950/40 min-h-[600px] shadow-3xl">
        {tab === 'users' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center gap-4">
               <h3 className="text-2xl font-black text-white italic uppercase">HỘI VIÊN</h3>
               <div className="relative flex-1 max-w-sm">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                 <input type="text" placeholder="Tìm..." value={searchUser} onChange={e => setSearchUser(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-xs font-bold text-white outline-none" />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="text-[10px] font-black text-slate-500 uppercase italic border-b border-white/5"><th className="px-6 py-6">Thành viên</th><th className="px-6 py-6">Cấp độ</th><th className="px-6 py-6">Số dư</th><th className="px-6 py-6 text-right">Quản trị</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={`text-xs group hover:bg-white/[0.03] transition-all ${u.isBanned ? 'bg-red-500/5' : ''}`}>
                      <td className="px-6 py-7">
                         <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center relative border ${getVipRichStyle(u.vipTier)}`}>
                              {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover rounded-lg" /> : <span className="font-black text-white">{u.fullname.charAt(0).toUpperCase()}</span>}
                              {u.isVip && <Crown className={`absolute -top-3 -right-3 w-5 h-5 ${getVipCrownColor(u.vipTier)}`} />}
                           </div>
                           <div>
                              <div className="font-black text-white uppercase italic">{u.fullname} {u.isBanned && <span className="text-red-500 text-[8px] bg-red-500/10 px-2 py-0.5 rounded ml-2">BỊ KHÓA</span>}</div>
                              <div className="text-[10px] text-slate-600 font-bold">{u.email}</div>
                           </div>
                         </div>
                      </td>
                      <td className="px-6 py-7"><span className="px-4 py-1.5 rounded-xl text-[9px] font-black italic border text-slate-600 bg-slate-900">{u.vipTier.toUpperCase()}</span></td>
                      <td className="px-6 py-7 font-black text-emerald-500">{u.balance.toLocaleString()} P</td>
                      <td className="px-6 py-7 text-right relative">
                        <button onClick={() => setActiveUserMenu(activeUserMenu === u.id ? null : u.id)} className={`p-3 rounded-xl transition-all ${activeUserMenu === u.id ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}><Settings size={18} /></button>
                        {activeUserMenu === u.id && (
                          <div className="absolute right-6 top-16 z-[100] w-64 glass-card border border-white/10 rounded-3xl p-3 shadow-3xl animate-in fade-in">
                             <button onClick={() => handleToggleBan(u)} className={`w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left text-xs font-black italic uppercase ${u.isBanned ? 'text-emerald-500' : 'text-rose-500'}`}>{u.isBanned ? <Unlock size={16} /> : <Ban size={16} />} {u.isBanned ? 'Mở Khóa' : 'Khóa'}</button>
                             <button onClick={() => handleAdjustPoints(u.id, true)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left text-xs font-black italic uppercase text-emerald-400"><UserPlus size={16} /> Cộng Điểm</button>
                             <button onClick={() => handleAdjustPoints(u.id, false)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-left text-xs font-black italic uppercase text-amber-500"><UserMinus size={16} /> Trừ Điểm</button>
                             <button onClick={() => handleDeleteUser(u)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 text-left text-xs font-black italic uppercase text-red-500"><UserX size={16} /> Xóa Hội Viên</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'withdrawals' && (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-white italic uppercase">RÚT TIỀN</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="text-[10px] font-black text-slate-500 uppercase italic border-b border-white/5"><th className="px-6 py-6">Hội viên</th><th className="px-6 py-6">Loại & Số tiền</th><th className="px-6 py-6">Chi tiết</th><th className="px-6 py-6 text-right">Xử lý</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="text-xs hover:bg-white/[0.03]">
                      <td className="px-6 py-7">
                        <div className="font-black text-white uppercase">{w.userName}</div>
                        <div className="text-[9px] text-blue-500">{new Date(w.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-7">
                        <div className="font-black italic uppercase text-blue-500">{w.type.toUpperCase()}</div>
                        <div className="text-lg font-black text-white">{w.amount.toLocaleString()}đ</div>
                      </td>
                      <td className="px-6 py-7 text-slate-300 italic">{w.details}</td>
                      <td className="px-6 py-7 text-right">
                         {w.status === 'pending' ? (
                           <div className="flex justify-end gap-2">
                              <button onClick={() => handleWithdrawAction(w.id, 'completed')} className="p-3 bg-emerald-500 text-white rounded-xl"><CheckCircle2 size={18} /></button>
                              <button onClick={() => handleWithdrawAction(w.id, 'rejected')} className="p-3 bg-red-500 text-white rounded-xl"><XCircle size={18} /></button>
                           </div>
                         ) : <span className="font-black uppercase">{w.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'system' && (
          <div className="space-y-12">
            <h3 className="text-2xl font-black text-white italic uppercase flex items-center gap-4"><Cpu /> HỆ THỐNG</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass-card p-10 rounded-[3rem] border border-red-500/20 bg-red-500/5 space-y-6">
                  <h4 className="font-black text-red-500 uppercase italic flex items-center gap-3 text-lg"><AlertCircle /> DANGER ZONE</h4>
                  <input type="text" placeholder="CONFIRM RESET" value={confirmResetText} onChange={e => setConfirmResetText(e.target.value)} className="w-full bg-black border border-red-500/30 rounded-2xl px-6 py-4 text-xs font-black text-red-500 outline-none" />
                  <button onClick={handleFactoryReset} disabled={isActionLoading || confirmResetText !== 'CONFIRM RESET'} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase italic text-[10px]">RESET SYSTEM</button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
