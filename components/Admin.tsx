
import React, { useState, useEffect, useMemo } from 'react';
import { User, WithdrawalRequest, Giftcode, Announcement, AdBanner, ActivityLog, AdminNotification } from '../types.ts';
import { dbService, supabase } from '../services/dbService.ts';
import { formatK } from '../constants.tsx';
import { 
  Users, CreditCard, Search, Ban, Unlock, Trash2, Megaphone, ShieldCheck, 
  Ticket, History, Activity, Database, Copy, CheckCircle2, 
  PlusCircle, Gamepad2, Building2, Eye, EyeOff,
  TrendingUp, SearchIcon, Image as ImageIcon, Wallet, Bell, Trash
} from 'lucide-react';

interface Props {
  user: User;
  onUpdateUser: (user: User) => void;
}

export default function Admin({ user, onUpdateUser }: Props) {
  const [tab, setTab] = useState<'users' | 'withdrawals' | 'ads' | 'announcements' | 'giftcodes' | 'logs' | 'notifs'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [withdrawSearchTerm, setWithdrawSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [giftcodes, setGiftcodes] = useState<Giftcode[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [notifs, setNotifs] = useState<AdminNotification[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [newAd, setNewAd] = useState({ title: '', imageUrl: '', targetUrl: '' });
  const [newAnn, setNewAnn] = useState({ title: '', content: '', priority: 'low' as 'low' | 'high' });
  const [newGc, setNewGc] = useState({ code: '', amount: 10000, maxUses: 100 });
  const [editBalanceUser, setEditBalanceUser] = useState<User | null>(null);
  const [balanceAdjustAmount, setBalanceAdjustAmount] = useState<number>(0);

  const stats = useMemo(() => {
    const totalBalance = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
    return {
      totalUsers: allUsers.length,
      totalBalance,
      pendingWithdrawals
    };
  }, [allUsers, withdrawals]);

  const refreshData = async () => {
    setIsSyncing(true);
    try {
      const [u, w, g, a, adsData, l, n] = await Promise.all([
        dbService.getAllUsers(),
        dbService.getWithdrawals(),
        dbService.getGiftcodes(true),
        dbService.getAnnouncements(true),
        dbService.getAds(true),
        dbService.getActivityLogs(),
        dbService.getNotifications()
      ]);
      setAllUsers(u || []);
      setWithdrawals(w || []);
      setGiftcodes(g || []);
      setAnnouncements(a || []);
      setAds(adsData || []);
      setLogs(l || []);
      setNotifs(n || []);
    } catch (err) { console.error(err); } finally { setIsSyncing(false); }
  };

  useEffect(() => {
    refreshData();
    const adminChannel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'giftcodes' }, refreshData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, refreshData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users_data' }, refreshData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, refreshData)
      .subscribe();
    return () => { supabase.removeChannel(adminChannel); };
  }, [tab]);

  const filteredUsers = useMemo(() => allUsers.filter(u => u.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || u.id?.toLowerCase().includes(searchTerm.toLowerCase())), [allUsers, searchTerm]);
  const filteredWithdrawals = useMemo(() => withdrawals.filter(w => w.userName?.toLowerCase().includes(withdrawSearchTerm.toLowerCase()) || w.details?.toLowerCase().includes(withdrawSearchTerm.toLowerCase()) || w.id?.toString().includes(withdrawSearchTerm.toLowerCase())), [withdrawals, withdrawSearchTerm]);

  const handleWithdrawAction = async (id: string, status: 'completed' | 'rejected') => {
    if (!window.confirm(status === 'completed' ? 'Xác nhận duyệt chi?' : 'Từ chối yêu cầu?')) return;
    await dbService.updateWithdrawalStatus(id, status);
    refreshData();
  };

  const handleCreateGc = async () => {
    if (!newGc.code || !newGc.amount) return alert("Vui lòng điền đủ thông tin");
    await dbService.addGiftcode(newGc);
    setNewGc({ code: '', amount: 10000, maxUses: 100 });
    setShowAddModal(null);
    refreshData();
  };

  const handleCreateAd = async () => {
    if (!newAd.title || !newAd.imageUrl) return alert("Vui lòng điền đủ thông tin");
    await dbService.saveAd(newAd);
    setNewAd({ title: '', imageUrl: '', targetUrl: '' });
    setShowAddModal(null);
    refreshData();
  };

  const handleCreateAnn = async () => {
    if (!newAnn.title || !newAnn.content) return alert("Vui lòng điền đủ thông tin");
    await dbService.saveAnnouncement(newAnn);
    setNewAnn({ title: '', content: '', priority: 'low' });
    setShowAddModal(null);
    refreshData();
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-24">
      {/* Admin Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[2rem] border border-blue-500/20 bg-blue-600/5">
           <div className="flex items-center gap-4 mb-2">
             <Users className="text-blue-500" />
             <span className="text-[10px] font-black uppercase text-slate-500 italic">Tổng hội viên</span>
           </div>
           <div className="text-3xl font-black text-white italic tracking-tighter">{stats.totalUsers.toLocaleString()}</div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] border border-emerald-500/20 bg-emerald-600/5">
           <div className="flex items-center gap-4 mb-2">
             <Wallet className="text-emerald-500" />
             <span className="text-[10px] font-black uppercase text-slate-500 italic">Tổng số dư hệ thống</span>
           </div>
           <div className="text-3xl font-black text-emerald-500 italic tracking-tighter">{formatK(stats.totalBalance)} P</div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] border border-amber-500/20 bg-amber-600/5">
           <div className="flex items-center gap-4 mb-2">
             <Activity className="text-amber-500" />
             <span className="text-[10px] font-black uppercase text-slate-500 italic">Lệnh rút chờ duyệt</span>
           </div>
           <div className="text-3xl font-black text-amber-500 italic tracking-tighter">{stats.pendingWithdrawals}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'users', label: 'Hội viên', icon: <Users size={16} /> },
          { id: 'withdrawals', label: 'Rút tiền', icon: <CreditCard size={16} /> },
          { id: 'giftcodes', label: 'Giftcode', icon: <Ticket size={16} /> },
          { id: 'ads', label: 'Quảng cáo', icon: <ImageIcon size={16} /> },
          { id: 'announcements', label: 'Thông báo', icon: <Megaphone size={16} /> },
          { id: 'logs', label: 'Hoạt động', icon: <History size={16} /> },
          { id: 'notifs', label: 'Hộp thư', icon: <Bell size={16} /> }
        ].map(i => (
          <button key={i.id} onClick={() => setTab(i.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${tab === i.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'}`}>
            {i.icon} <span>{i.label}</span>
          </button>
        ))}
      </div>

      <div className="glass-card p-6 rounded-[2rem] border border-white/5 bg-slate-950/40 min-h-[500px]">
        {tab === 'users' && (
           <div className="space-y-6">
              <div className="relative w-full max-w-md"><SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm hội viên..." className="w-full bg-slate-900 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white text-sm outline-none focus:border-blue-500" /></div>
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500 uppercase font-black border-b border-white/5"><tr><th className="px-4 py-3">Hội viên</th><th className="px-4 py-3">Số dư</th><th className="px-4 py-3">Rank</th><th className="px-4 py-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-white/5">{filteredUsers.map(u => (<tr key={u.id} className="hover:bg-white/[0.02]"><td className="px-4 py-4"><div className="font-bold text-white">{u.fullname}</div><div className="text-[10px] text-slate-500">#{u.id} • {u.email}</div></td><td className="px-4 py-4 font-black text-emerald-500">{Number(u.balance).toLocaleString()} P</td><td className="px-4 py-4"><span className={`${u.isVip ? 'text-amber-400 font-black' : 'text-slate-500'}`}>{u.isVip ? 'VIP' : 'Thường'}</span></td><td className="px-4 py-4 text-right flex justify-end gap-2"><button onClick={() => dbService.updateUser(u.id, { isBanned: !u.isBanned }).then(refreshData)} className={`p-2 rounded-lg ${u.isBanned ? 'bg-emerald-600/10 text-emerald-400' : 'bg-red-600/10 text-red-500'}`}>{u.isBanned ? <Unlock size={16} /> : <Ban size={16} />}</button></td></tr>))}</tbody></table></div>
           </div>
        )}

        {tab === 'ads' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase italic">Quản lý quảng cáo</h3>
              <button onClick={() => setShowAddModal('ad')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"><PlusCircle size={16} /> THÊM QC</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.map(ad => (
                <div key={ad.id} className="p-5 rounded-2xl border border-white/5 bg-slate-900/40 flex items-center justify-between gap-4">
                  <img src={ad.imageUrl} className="w-16 h-16 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-white">{ad.title}</h4>
                    <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{ad.targetUrl}</p>
                  </div>
                  <button onClick={() => dbService.deleteAd(ad.id).then(refreshData)} className="p-2 text-red-500"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase italic">Thông báo hệ thống</h3>
              <button onClick={() => setShowAddModal('ann')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"><PlusCircle size={16} /> THÊM TB</button>
            </div>
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="p-5 rounded-2xl border border-white/5 bg-slate-900/40 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white">{ann.title}</h4>
                    <p className="text-xs text-slate-500 italic">{ann.content}</p>
                  </div>
                  <button onClick={() => dbService.deleteAnnouncement(ann.id).then(refreshData)} className="p-2 text-red-500"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'logs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white uppercase italic">Nhật ký hoạt động</h3>
            <div className="space-y-2">
              {logs.map(log => (
                <div key={log.id} className="text-xs p-3 rounded-lg bg-black/20 border border-white/5 flex justify-between">
                  <div>
                    <span className="text-blue-400 font-bold">[{log.userName}]</span> {log.action}: {log.details}
                  </div>
                  <span className="text-slate-600 italic">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'notifs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase italic">Xóa bớt hộp thư Admin</h3>
              <button 
                onClick={async () => {
                  if(!confirm('Xóa tất cả thông báo?')) return;
                  for(const n of notifs) await dbService.deleteNotification(n.id);
                  refreshData();
                }} 
                className="px-4 py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase italic"
              >
                XÓA TẤT CẢ
              </button>
            </div>
            <div className="space-y-2">
              {notifs.map(n => (
                <div key={n.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black text-blue-500 uppercase">{n.type}</span>
                      <span className="text-[9px] text-slate-600">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <h5 className="text-xs font-black text-white italic">{n.title}</h5>
                    <p className="text-[10px] text-slate-400">{n.content}</p>
                  </div>
                  <button onClick={() => dbService.deleteNotification(n.id).then(refreshData)} className="p-2 text-red-500/50 hover:text-red-500 transition-colors">
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ... existing giftcodes and withdrawals ... */}
      </div>

      {showAddModal === 'ad' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-xl font-black text-white uppercase italic">Thêm quảng cáo</h2>
            <input type="text" placeholder="Tiêu đề" value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-sm" />
            <input type="text" placeholder="Link ảnh (imageUrl)" value={newAd.imageUrl} onChange={e => setNewAd({...newAd, imageUrl: e.target.value})} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-sm" />
            <input type="text" placeholder="Link đích (targetUrl)" value={newAd.targetUrl} onChange={e => setNewAd({...newAd, targetUrl: e.target.value})} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-sm" />
            <div className="flex gap-4">
              <button onClick={() => setShowAddModal(null)} className="flex-1 py-4 bg-slate-800 text-white font-black rounded-xl uppercase text-xs">Hủy</button>
              <button onClick={handleCreateAd} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl uppercase text-xs">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal === 'ann' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-xl font-black text-white uppercase italic">Tạo thông báo</h2>
            <input type="text" placeholder="Tiêu đề" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-sm" />
            <textarea placeholder="Nội dung" value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white text-sm h-32" />
            <div className="flex gap-4">
              <button onClick={() => setShowAddModal(null)} className="flex-1 py-4 bg-slate-800 text-white font-black rounded-xl uppercase text-xs">Hủy</button>
              <button onClick={handleCreateAnn} className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl uppercase text-xs">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal === 'gc' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-xl font-black text-white uppercase italic">Tạo Giftcode</h2>
            <input type="text" placeholder="Mã Code" value={newGc.code} onChange={e => setNewGc({...newGc, code: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white outline-none" />
            <input type="number" placeholder="Số tiền tặng (P)" value={newGc.amount} onChange={e => setNewGc({...newGc, amount: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white outline-none" />
            <input type="number" placeholder="Giới hạn lượt dùng" value={newGc.maxUses} onChange={e => setNewGc({...newGc, maxUses: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl text-white outline-none" />
            <button onClick={handleCreateGc} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase">Tạo ngay</button>
            <button onClick={() => setShowAddModal(null)} className="w-full text-slate-500 font-bold uppercase text-[10px]">Hủy bỏ</button>
          </div>
        </div>
      )}
    </div>
  );
}
