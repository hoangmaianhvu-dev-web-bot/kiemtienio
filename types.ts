
export enum AppView {
  DASHBOARD = 'dashboard',
  TASKS = 'tasks',
  WITHDRAW = 'withdraw',
  LEADERBOARD = 'leaderboard',
  SUPPORT = 'support',
  PROFILE = 'profile',
  GIFTCODE = 'giftcode',
  ADMIN = 'admin',
  VIP = 'vip',
  HISTORY = 'history',
  NOTIFICATIONS = 'notifications',
  REFERRAL = 'referral',
  GUIDE = 'guide'
}

export enum VipTier {
  NONE = 'none',
  BASIC = 'basic',
  PRO = 'pro',
  ELITE = 'elite'
}

export interface User {
  id: string;
  email: string;
  fullname: string;
  balance: number;
  totalEarned: number;
  tasksToday: number;
  isBanned: boolean;
  isAdmin: boolean;
  isVip: boolean;
  vipTier: VipTier;
  vipUntil?: string;
  bankInfo?: string;
  idGame?: string;
  avatarUrl?: string;
  joinDate: string;
  // Extended fields used in various components
  taskCounts: Record<string, number>;
  lastTaskDate?: string;
  securityScore?: number;
  referralCount?: number;
  referralBonus?: number;
  phoneNumber?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'bank' | 'game';
  status: 'pending' | 'completed' | 'rejected';
  details: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'high';
  isActive: boolean;
  createdAt: string;
}

export interface AdBanner {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
}

export interface Giftcode {
  id: string;
  code: string;
  amount: number;
  maxUses: number;
  usedBy: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId?: string;
  userName?: string;
  title: string;
  content: string;
  message?: string; // used for toasts
  type: 'success' | 'error' | 'warning' | 'info' | 'security' | 'withdrawal' | 'referral' | 'auth' | 'feedback';
  duration?: number;
  createdAt: string;
}

export interface AdminNotification extends Notification {}
