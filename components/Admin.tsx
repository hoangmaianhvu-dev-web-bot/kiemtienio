
import React, { useState, useEffect, useMemo } from 'react';
import { User, WithdrawalRequest, Giftcode, AdBanner, Announcement, Notification } from '../types.ts';
import { dbService, supabase } from '../services/dbService.ts';
import { formatK, RATE_VND_TO_POINT } from '../constants.tsx';
import { 
  Users, CreditCard, Ticket, Megaphone, ImageIcon, Eye, EyeOff, Trash2, 
  PlusCircle, Search, CheckCircle2, XCircle, Settings, UserMinus, 
  UserPlus, ShieldAlert, Ban, Unlock, Wallet, Activity, TrendingUp, DollarSign,
  RefreshCcw, UserX, AlertTriangle, Loader2, X
} from 'lucide-react';

interface AdminProps {
  user: User;
  onUpdateUser: (user: User) => void;
  setSecurityModal: (state: { isOpen: boolean; score: number }) => void;
  showToast: (title: string, message: string, type: Notification['type']) => void;
}

export default function Admin({ user, onUpdateUser, setSecurityModal, showToast }: AdminProps) {
  const [tab, setTab] = useState<'users' | 'withdrawals' | 'ads' | 'giftcodes' | 'announcements'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [giftcodes, setGiftcodes] = useState<Giftcode[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const [showAddGc, setShowAddGc] = useState(false);
  const [showAddAd, setShowAddAd] = useState(false);
  const [showAddAnn, setShowAddAnn] = useState(false);
  
  const [newGc, setNewGc] = useState({ code: '', amount: 10000, maxUses: 100 });
  const [newAd, setNewAd] = useState({ title: '', imageUrl: '', targetUrl: '' });
  const [newAnn, setNewAnn] = useState({ title: '', content: '', priority: 'low' as 'low' | 'high' });
  
  const [activeUserMenu, setActiveUserMenu] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const refreshData = async () => {
    try {
      const [u, w, a, g, ann] = await Promise.all([
        dbService.getAllUsers(),
        dbService.getWithdrawals(),
        dbService.getAds(true), 
        dbService.getGiftcodes(),
        dbService.getAnnouncements(true)
      ]);
      setUsers(u);
      setWithdrawals(w);
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

  const filteredUsers = useMemo(() => users.filter(u => u.fullname.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase())), [users, searchUser]);

  const handleToggleBan = async (u: User) => {
    const reason = u.isBanned ? '' : prompt('Lý do khóa?') || 'Vi phạm chính sách';
    if (!u.isBanned && !confirm('KHÓA người dùng này?')) return;
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

  const handleWithdrawAction = async (id: string, s: string) => {
    await dbService.updateWithdrawalStatus(id, s);
    showToast('ADMIN', `Đơn rút ${s.toUpperCase()}`, 'info');
    await refreshData();
  };

  const handleCreateGiftcode = async () => {
    if (!newGc.code || !newGc.amount) return alert("Nhập đủ thông tin.");
    const res = await dbService.addGiftcode({ ...newGc, max_uses: newGc.maxUses });
    if (!res.error) { showToast('ADMIN', "Đã tạo Giftcode!", 'success'); setShowAddGc(false); refreshData(); }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-24">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Hội viên', val: stats.totalUsers, color: 'border-l-blue-600', bg: 'bg-blue-600/5', icon: <Users className="text-blue-500" /> },
          { label: 'Tổng Điểm', val: formatK(stats.totalPoints), color: 'border-l-amber-600', bg: 'bg-amber-600/5', icon: <Wallet className="text-amber-500" /> },
          { label: 'Tiền mặt', val: `${stats.realMoney.toLocaleString()}đ`, color: 'border-l-emerald-600', bg: 'bg-emerald-600/5', icon: <DollarSign className="text-emerald-500" /> },
          { label: 'Đơn Chờ', val: stats.pendingWithdrawals, color: 'border-l-rose-600', bg: 'bg-rose-600/5', icon: <Activity className="text-rose-500" /> },
          { label: 'Online 24h', val: stats.activeUsers, color: 'border-l-indigo-600', bg: 'bg-indigo-600/5', icon: <TrendingUp className="text-indigo-500" /> }
        ].map((s, i) => (
          <div key={i} className={`glass-card p-6 rounded-[2rem] border-l-4 ${s.color} ${s.bg}`}>
             {React.cloneElement(s.icon as any, { size: 20, className: 'mb-2' })}
             <p className="text-[9px] font-black text-slate-500 uppercase italic">{s.label}</p>
             <h3 className="text-xl font-black text-white italic">{s.val}</h3>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {['users', 'withdrawals', 'ads', 'giftcodes', 'announcements'].map(t => (
          <button key={t} onClick={() => setTab(t as any)} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase italic transition-all ${tab === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}>
            {t === 'users' ? 'Hội viên' : t === 'withdrawals' ? 'Rút tiền' : t === 'ads' ? 'Quảng cáo' : t === 'giftcodes' ? 'Giftcodes' : 'Thông báo'}
          </button>
        ))}
        <button onClick={refreshData} className="ml-auto p-3 bg-slate-900 text-slate-500 rounded-xl hover:text-white"><RefreshCcw size={14} /></button>
      </div>

      <div className="glass-card p-8 rounded-[3rem] border border-white/5 bg-slate-950/40 min-h-[500px]">
        {tab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
               <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">DANH SÁCH HỘI VIÊN</h3>
               <div className="relative flex-1 max-w-xs">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                 <input type="text" placeholder="Tìm tên..." value={searchUser} onChange={e => setSearchUser(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs text-white outline-none" />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="text-[10px] font-black text-slate-500 uppercase italic border-b border-white/5"><th className="px-4 py-4">Tên / Gmail</th><th className="px-4 py-4">Hạng</th><th className="px-4 py-4">Số dư</th><th className="px-4 py-4 text-right">Menu</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className={`text-xs group hover:bg-white/[0.02] ${u.isBanned ? 'bg-red-500/5' : ''}`}>
                      <td className="px-4 py-6">
                         <div className="font-bold text-white uppercase flex items-center gap-2">{u.fullname} {u.isBanned && <span className="text-red-500 text-[8px] animate-pulse">BỊ KHÓA</span>}</div>
                         <div className="text-[9px] text-slate-500 mt-1">{u.email}</div>
                      </td>
                      <td className="px-4 py-6"><span className={`px-2 py-1 rounded text-[9px] font-black ${u.isVip ? 'text-amber-500 bg-amber-500/10' : 'text-slate-500'}`}>{u.vipTier.toUpperCase()}</span></td>
                      <td className="px-4 py-6 font-black text-emerald-500">{u.balance.toLocaleString()} P</td>
                      <td className="px-4 py-6 text-right relative">
                        <button onClick={() => setActiveUserMenu(activeUserMenu === u.id ? null : u.id)} className="p-2 rounded-lg bg-slate-900 text-slate-400 border border-white/5"><Settings size={14} /></button>
                        {activeUserMenu === u.id && (
                          <div className="absolute right-4 top-14 z-[100] w-48 glass-card border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                             <button onClick={() => handleToggleBan(u)} className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left text-[10px] font-bold ${u.isBanned ? 'text-emerald-500' : 'text-rose-500'}`}>{u.isBanned ? <Unlock size={14} /> : <Ban size={14} />} {u.isBanned ? 'Mở Khóa' : 'Khóa Tài Khoản'}</button>
                             <button onClick={() => handleAdjustPoints(u.id, true)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-[10px] text-emerald-400 font-bold"><UserPlus size={14} /> Cộng Điểm</button>
                             <button onClick={() => handleAdjustPoints(u.id, false)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-[10px] text-amber-500 font-bold"><UserMinus size={14} /> Trừ Điểm</button>
                             <button onClick={() => { setActiveUserMenu(null); setSecurityModal({ isOpen: true, score: u.securityScore || 100 }); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-[10px] text-blue-400 font-bold"><ShieldAlert size={14} /> Kiểm Tra Sentinel</button>
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
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">YÊU CẦU THANH TOÁN</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="text-[10px] font-black text-slate-500 uppercase italic border-b border-white/5"><th className="px-4 py-4">Mã</th><th className="px-4 py-4">Hội Viên</th><th className="px-4 py-4">Tiền</th><th className="px-4 py-4">Duyệt</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="text-xs hover:bg-white/[0.02]">
                      <td className="px-4 py-6 font-black text-blue-500">#{w.id.slice(0, 6)}</td>
                      <td className="px-4 py-6"><div className="font-bold text-white uppercase">{w.user_name}</div><div className="text-[9px] text-slate-500 truncate max-w-[120px]">{w.details}</div></td>
                      <td className="px-4 py-6 font-black text-white">{w.amount.toLocaleString()}đ</td>
                      <td className="px-4 py-6 text-right">
                         {w.status === 'pending' ? (
                           <div className="flex justify-end gap-2"><button onClick={() => handleWithdrawAction(w.id, 'completed')} className="p-2 bg-emerald-600/10 text-emerald-400 rounded-lg"><CheckCircle2 size={16} /></button><button onClick={() => handleWithdrawAction(w.id, 'rejected')} className="p-2 bg-red-600/10 text-red-500 rounded-lg"><XCircle size={16} /></button></div>
                         ) : <span className="text-[9px] font-black uppercase text-slate-500">{w.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'giftcodes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h3 className="text-xl font-black text-white italic uppercase tracking-tighter">GIFTCODE</h3><button onClick={() => setShowAddGc(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-emerald-600/20">+ TẠO MÃ</button></div>
            <table className="w-full text-left">
              <thead><tr className="text-[10px] font-black text-slate-500 uppercase border-b border-white/5"><th className="px-4 py-4">Code</th><th className="px-4 py-4">Thưởng</th><th className="px-4 py-4">Dùng/Max</th><th className="px-4 py-4 text-right">Trạng Thái</th></tr></thead>
              <tbody>
                {giftcodes.map(g => (
                  <tr key={g.code} className="text-xs hover:bg-white/[0.02]">
                    <td className="px-4 py-6 font-black text-rose-500 tracking-widest">{g.code}</td>
                    <td className="px-4 py-6 font-black text-emerald-500">{g.amount.toLocaleString()} P</td>
                    <td className="px-4 py-6 text-slate-400 font-bold">{(g.usedBy || []).length} / {g.maxUses}</td>
                    <td className="px-4 py-6 text-right"><span className={`px-2 py-1 rounded text-[8px] font-black italic ${g.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>{g.isActive ? 'ONLINE' : 'HẾT HẠN'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'ads' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center"><h3 className="text-xl font-black text-white italic uppercase tracking-tighter">BANNER QUẢNG CÁO</h3><button onClick={() => setShowAddAd(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase italic shadow-lg">+ THÊM QUẢNG CÁO</button></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ads.map(ad => (
                  <div key={ad.id} className="glass-card p-4 rounded-3xl border border-white/5 flex gap-4 items-center">
                     <img src={ad.imageUrl} className="w-20 h-14 object-cover rounded-xl" />
                     <div className="flex-1 overflow-hidden"><h4 className="text-[11px] font-black text-white uppercase truncate">{ad.title}</h4><p className="text-[9px] text-slate-500 truncate">{ad.targetUrl}</p></div>
                     <div className="flex gap-1"><button onClick={() => dbService.updateAdStatus(ad.id, !ad.isActive).then(refreshData)} className="p-2 text-slate-500">{ad.isActive ? <Eye size={16} /> : <EyeOff size={16} />}</button><button onClick={() => dbService.deleteAd(ad.id).then(refreshData)} className="p-2 text-red-500"><Trash2 size={16} /></button></div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {tab === 'announcements' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center"><h3 className="text-xl font-black text-white italic uppercase tracking-tighter">THÔNG BÁO HỆ THỐNG</h3><button onClick={() => setShowAddAnn(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase italic shadow-lg">+ ĐĂNG TIN</button></div>
             <div className="space-y-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-5 glass-card rounded-[2rem] border border-white/5 flex justify-between items-center">
                     <div><span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${ann.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-400'}`}>{ann.priority}</span><h4 className="text-sm font-bold text-white uppercase mt-1">{ann.title}</h4></div>
                     <div className="flex gap-2"><button onClick={() => dbService.updateAnnouncementStatus(ann.id, !ann.isActive).then(refreshData)} className="p-2 text-slate-500">{ann.isActive ? <Eye size={16} /> : <EyeOff size={16} />}</button><button onClick={() => dbService.deleteAnnouncement(ann.id).then(refreshData)} className="p-2 text-red-500"><Trash2 size={16} /></button></div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {showAddGc && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"><div className="glass-card w-full max-w-md p-10 rounded-[4rem] border border-white/10 animate-in zoom-in-95 relative"><button onClick={() => setShowAddGc(false)} className="absolute top-8 right-8 text-slate-500"><X /></button><h4 className="text-xl font-black text-white italic uppercase mb-8">TẠO GIFTCODE</h4><div className="space-y-4"><input type="text" placeholder="MÃ CODE" value={newGc.code} onChange={e => setNewGc({...newGc, code: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" /><input type="number" placeholder="ĐIỂM THƯỞNG" value={newGc.amount} onChange={e => setNewGc({...newGc, amount: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" /><input type="number" placeholder="LƯỢT DÙNG (MAX)" value={newGc.maxUses} onChange={e => setNewGc({...newGc, maxUses: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" /><button onClick={handleCreateGiftcode} className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl uppercase italic tracking-widest shadow-lg shadow-emerald-600/20">KÍCH HOẠT MÃ</button></div></div></div>
      )}

      {showAddAd && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"><div className="glass-card w-full max-w-md p-10 rounded-[4rem] border border-white/10 relative"><button onClick={() => setShowAddAd(false)} className="absolute top-8 right-8 text-slate-500"><X /></button><h4 className="text-xl font-black text-white italic uppercase mb-8">THÊM QUẢNG CÁO</h4><div className="space-y-4"><input type="text" placeholder="TIÊU ĐỀ" value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" /><input type="text" placeholder="URL ẢNH" value={newAd.imageUrl} onChange={e => setNewAd({...newAd, imageUrl: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" /><input type="text" placeholder="LINK ĐÍCH" value={newAd.targetUrl} onChange={e => setNewAd({...newAd, targetUrl: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" /><button onClick={() => { dbService.saveAd(newAd).then(() => { setShowAddAd(false); refreshData(); showToast('ADMIN', 'Đã thêm Ads!', 'success'); }); }} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase italic shadow-lg">LƯU QUẢNG CÁO</button></div></div></div>
      )}

      {showAddAnn && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"><div className="glass-card w-full max-w-md p-10 rounded-[4rem] border border-white/10 relative"><button onClick={() => setShowAddAnn(false)} className="absolute top-8 right-8 text-slate-500"><X /></button><h4 className="text-xl font-black text-white italic uppercase mb-8">ĐĂNG TIN MỚI</h4><div className="space-y-4"><input type="text" placeholder="TIÊU ĐỀ" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" /><textarea placeholder="NỘI DUNG" value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold" rows={3}></textarea><select value={newAnn.priority} onChange={e => setNewAnn({...newAnn, priority: e.target.value as any})} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white font-black uppercase italic text-xs outline-none"><option value="low">ƯU TIÊN: THẤP</option><option value="high">ƯU TIÊN: KHẨN CẤP</option></select><button onClick={() => { dbService.saveAnnouncement(newAnn).then(() => { setShowAddAnn(false); refreshData(); showToast('ADMIN', 'Đã đăng tin!', 'success'); }); }} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl uppercase italic shadow-lg">GỬI THÔNG BÁO</button></div></div></div>
      )}
    </div>
  );
}
