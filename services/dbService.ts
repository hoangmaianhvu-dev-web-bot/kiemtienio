
import { createClient } from '@supabase/supabase-js';
import { User, VipTier, WithdrawalRequest, Announcement, AdBanner, Giftcode, Notification } from '../types.ts';

const SUPABASE_URL = (window as any).process.env.SUPABASE_URL;
const SUPABASE_KEY = (window as any).process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const mapUser = (u: any): User => ({
  ...u,
  balance: Number(u.balance || 0),
  totalEarned: Number(u.total_earned || 0),
  tasksToday: Number(u.tasks_today || 0),
  isVip: Boolean(u.is_vip),
  isAdmin: Boolean(u.is_admin),
  isBanned: Boolean(u.is_banned),
  vipTier: (u.vip_tier || 'none') as VipTier,
  joinDate: u.created_at || new Date().toISOString(),
  taskCounts: u.task_counts || {},
  lastTaskDate: u.last_task_date,
  securityScore: u.security_score || 100,
  referralCount: u.referral_count || 0,
  referralBonus: u.referral_bonus || 0,
  phoneNumber: u.phone_number
});

export const dbService = {
  getCurrentUser: async () => {
    const id = localStorage.getItem('nova_session_id');
    if (!id) return null;
    const { data } = await supabase.from('users_data').select('*').eq('id', id).maybeSingle();
    return data ? mapUser(data) : null;
  },

  login: async (email: string, pass: string, rememberMe?: boolean) => {
    const { data } = await supabase.from('users_data')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('password_hash', pass.trim())
      .maybeSingle();
    if (data) {
      if (rememberMe) {
          localStorage.setItem('nova_session_id', data.id);
      } else {
          sessionStorage.setItem('nova_session_id', data.id);
          localStorage.setItem('nova_session_id', data.id); // for simplicity in this demo
      }
      return { success: true, user: mapUser(data) };
    }
    return { success: false, message: 'Sai thông tin đăng nhập.' };
  },

  register: async (fullname: string, email: string, pass: string) => {
    const { data: existing } = await supabase.from('users_data').select('id').eq('email', email.toLowerCase()).maybeSingle();
    if (existing) return { success: false, message: 'Email đã tồn tại.' };

    const newUser = {
      fullname,
      email: email.toLowerCase(),
      password_hash: pass,
      balance: 0,
      total_earned: 0,
      tasks_today: 0,
      is_vip: false,
      is_admin: false,
      is_banned: false,
      vip_tier: 'none',
      task_counts: {},
      security_score: 100,
      referral_count: 0,
      referral_bonus: 0
    };

    const { data, error } = await supabase.from('users_data').insert([newUser]).select().single();
    if (error) return { success: false, message: error.message };
    
    localStorage.setItem('nova_session_id', data.id);
    return { success: true, user: mapUser(data) };
  },

  logout: () => localStorage.removeItem('nova_session_id'),

  getAllUsers: async () => {
    const { data } = await supabase.from('users_data').select('*').order('balance', { ascending: false });
    return (data || []).map(mapUser);
  },

  updateUser: async (id: string, updates: any) => {
    const { error } = await supabase.from('users_data').update(updates).eq('id', id);
    return { success: !error, message: error?.message };
  },

  deleteUser: async (id: string) => {
    const { error } = await supabase.from('users_data').delete().eq('id', id);
    return { success: !error, message: error?.message };
  },

  adjustBalance: async (id: string, amount: number) => {
    const { data: user } = await supabase.from('users_data').select('balance').eq('id', id).single();
    if (!user) return { success: false, message: 'User not found' };
    const { error } = await supabase.from('users_data').update({ balance: user.balance + amount }).eq('id', id);
    return { success: !error, message: error ? error.message : 'Đã điều chỉnh số dư.' };
  },

  getAnnouncements: async (all = false) => {
    let query = supabase.from('announcements').select('*');
    if (!all) query = query.eq('is_active', true);
    const { data } = await query.order('created_at', { ascending: false });
    return (data || []).map(a => ({
      ...a,
      isActive: a.is_active,
      createdAt: a.created_at
    }));
  },

  saveAnnouncement: async (ann: any) => {
    const { error } = await supabase.from('announcements').insert([{
        ...ann,
        is_active: true,
        created_at: new Date().toISOString()
    }]);
    return { success: !error };
  },

  updateAnnouncementStatus: async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('announcements').update({ is_active: isActive }).eq('id', id);
    return { success: !error };
  },

  deleteAnnouncement: async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    return { success: !error };
  },

  getAds: async (all = false) => {
    let query = supabase.from('ads').select('*');
    if (!all) query = query.eq('is_active', true);
    const { data } = await query;
    return (data || []).map(a => ({
      ...a,
      isActive: a.is_active,
      imageUrl: a.image_url,
      targetUrl: a.target_url
    }));
  },

  saveAd: async (ad: any) => {
    const { error } = await supabase.from('ads').insert([{
        ...ad,
        is_active: true
    }]);
    return { success: !error };
  },

  updateAdStatus: async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('ads').update({ is_active: isActive }).eq('id', id);
    return { success: !error };
  },

  deleteAd: async (id: string) => {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    return { success: !error };
  },

  addPointsSecurely: async (userId: string, timeElapsed: number, points: number, gateName: string) => {
    // Security check mock
    if (timeElapsed < 5) return { error: 'SENTINEL_SECURITY_VIOLATION' };
    
    const { data: user } = await supabase.from('users_data').select('*').eq('id', userId).single();
    if (!user) return { error: 'User not found' };

    const taskCounts = user.task_counts || {};
    taskCounts[gateName] = (taskCounts[gateName] || 0) + 1;

    const { error } = await supabase.from('users_data').update({
      balance: user.balance + points,
      total_earned: user.total_earned + points,
      tasks_today: user.tasks_today + 1,
      task_counts: taskCounts,
      last_task_date: new Date().toISOString()
    }).eq('id', userId);

    return { success: !error, error };
  },

  getWithdrawals: async (userId?: string) => {
    let query = supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query;
    return (data || []).map(w => ({
      ...w,
      userId: w.user_id,
      userName: w.user_name,
      createdAt: w.created_at
    }));
  },

  addWithdrawal: async (request: any) => {
    const { data: user } = await supabase.from('users_data').select('balance').eq('id', request.userId).single();
    if (!user || user.balance < request.amount * 10) return { success: false, message: 'Số dư không đủ.' };

    const { error } = await supabase.from('withdrawals').insert([{
      user_id: request.userId,
      user_name: request.userName,
      amount: request.amount,
      type: request.type,
      status: request.status,
      details: request.details,
      created_at: request.createdAt
    }]);

    if (!error) {
        await supabase.from('users_data').update({ balance: user.balance - request.amount * 10 }).eq('id', request.userId);
    }

    return { success: !error, message: error?.message };
  },

  updateWithdrawalStatus: async (id: string, status: string) => {
    const { error } = await supabase.from('withdrawals').update({ status }).eq('id', id);
    return { success: !error };
  },

  getNotifications: async (userId: string) => {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return (data || []).map(n => ({
      ...n,
      userId: n.user_id,
      createdAt: n.created_at
    }));
  },

  addNotification: async (notif: any) => {
    const { error } = await supabase.from('notifications').insert([{
      user_id: notif.userId,
      user_name: notif.userName,
      type: notif.type,
      title: notif.title,
      content: notif.content,
      created_at: new Date().toISOString()
    }]);
    return { success: !error };
  },

  updatePassword: async (id: string, oldPass: string, newPass: string) => {
    const { data } = await supabase.from('users_data').select('password_hash').eq('id', id).single();
    if (!data || data.password_hash !== oldPass) return { success: false, message: 'Mật khẩu cũ không chính xác.' };
    
    const { error } = await supabase.from('users_data').update({ password_hash: newPass }).eq('id', id);
    return { success: !error, message: error ? error.message : 'Đã đổi mật khẩu.' };
  },

  claimGiftcode: async (userId: string, code: string) => {
    const { data: gc } = await supabase.from('giftcodes').select('*').eq('code', code).eq('is_active', true).maybeSingle();
    if (!gc) return { success: false, message: 'Mã không tồn tại hoặc đã hết hạn.' };
    
    if (gc.end_date && new Date() > new Date(gc.end_date)) return { success: false, message: 'Mã đã hết hạn.' };
    
    const usedBy = gc.used_by || [];
    if (usedBy.includes(userId)) return { success: false, message: 'Bạn đã sử dụng mã này rồi.' };
    
    if (gc.max_uses > 0 && usedBy.length >= gc.max_uses) return { success: false, message: 'Mã đã đạt giới hạn sử dụng.' };

    usedBy.push(userId);
    const { error } = await supabase.from('giftcodes').update({ used_by: usedBy }).eq('id', gc.id);
    
    if (!error) {
        const { data: user } = await supabase.from('users_data').select('balance').eq('id', userId).single();
        if (user) await supabase.from('users_data').update({ balance: user.balance + gc.amount }).eq('id', userId);
        return { success: true, amount: gc.amount, message: 'Nhận quà thành công!' };
    }
    return { success: false, message: 'Lỗi máy chủ.' };
  },

  getGiftcodes: async () => {
    const { data } = await supabase.from('giftcodes').select('*');
    return (data || []).map(g => ({
      ...g,
      isActive: g.is_active,
      usedBy: g.used_by || [],
      maxUses: g.max_uses,
      startDate: g.start_date,
      endDate: g.end_date
    }));
  },

  addGiftcode: async (code: string, amount: number, maxUses: number, start?: string, end?: string) => {
    const { data, error } = await supabase.from('giftcodes').insert([{
      code, amount, max_uses: maxUses, is_active: true, start_date: start, end_date: end, used_by: []
    }]);
    return { data, error };
  },

  updateGiftcode: async (id: string, updates: any) => {
    const { error } = await supabase.from('giftcodes').update({
        code: updates.code,
        amount: updates.amount,
        max_uses: updates.maxUses,
        start_date: updates.startDate,
        end_date: updates.endDate
    }).eq('id', id);
    return { success: !error, message: error?.message };
  },

  deleteGiftcode: async (id: string) => {
    const { error } = await supabase.from('giftcodes').delete().eq('id', id);
    return { success: !error };
  },

  getVipRequests: async (userId?: string) => {
    let query = supabase.from('vip_requests').select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query;
    return (data || []);
  },

  createVipDepositRequest: async (request: any) => {
    const { error } = await supabase.from('vip_requests').insert([request]);
    return { success: !error, message: error?.message };
  },

  updateVipRequestStatus: async (requestId: string, status: string, userId: string, tier: string) => {
    const { error } = await supabase.from('vip_requests').update({ status }).eq('id', requestId);
    if (!error && status === 'completed') {
        await supabase.from('users_data').update({
            is_vip: true,
            vip_tier: tier,
            vip_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }).eq('id', userId);
    }
    return { success: !error, message: error?.message };
  },

  getVipLeaderboard: async () => {
    const { data } = await supabase.from('vip_requests')
        .select('user_name, amount_vnd')
        .eq('status', 'completed')
        .order('amount_vnd', { ascending: false })
        .limit(10);
    const summary: Record<string, number> = {};
    (data || []).forEach(v => {
        summary[v.user_name] = (summary[v.user_name] || 0) + v.amount_vnd;
    });
    return Object.entries(summary).map(([name, total]) => ({ name, total })).sort((a,b) => b.total - a.total);
  },

  upgradeVipTiered: async (userId: string, vnd: number) => {
    const { data: user } = await supabase.from('users_data').select('balance').eq('id', userId).single();
    const points = vnd * 10;
    if (!user || user.balance < points) return { success: false, message: 'Không đủ điểm Nova.' };
    
    let tier = 'basic';
    if (vnd >= 500000) tier = 'elite';
    else if (vnd >= 100000) tier = 'pro';

    const { error } = await supabase.from('users_data').update({
        balance: user.balance - points,
        is_vip: true,
        vip_tier: tier
    }).eq('id', userId);

    return { success: !error, message: error?.message };
  },

  factoryResetSystem: async (adminId: string) => {
    // This is a dangerous mock operation. 
    // In a real app, this would be a single secure RPC or multiple deletes.
    try {
        await supabase.from('withdrawals').delete().neq('id', '0');
        await supabase.from('vip_requests').delete().neq('id', '0');
        await supabase.from('notifications').delete().neq('id', '0');
        await supabase.from('giftcodes').delete().neq('id', '0');
        await supabase.from('ads').delete().neq('id', '0');
        await supabase.from('announcements').delete().neq('id', '0');
        await supabase.from('users_data').delete().neq('id', adminId);
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
  }
};
