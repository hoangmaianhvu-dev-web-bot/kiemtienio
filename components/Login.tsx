
import React, { useState } from 'react';
import { dbService } from '../services/dbService.ts';
import { User } from '../types.ts';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  User as UserIcon,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (view === 'login') {
        const res = await dbService.login(email, password, rememberMe);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setError(res.message || 'Sai email hoặc mật khẩu.');
        }
      } else if (view === 'register') {
        if (!fullname.trim()) {
          setError('Vui lòng nhập họ tên.');
          setIsLoading(false);
          return;
        }
        const res = await dbService.register(fullname, email, password);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setError(res.message || 'Đăng ký thất bại.');
        }
      } else if (view === 'forgot') {
        setError('Tính năng khôi phục qua OTP đang được bảo trì. Vui lòng liên hệ Admin.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#03050a] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 relative z-10">
        <div className="glass-card rounded-[3.5rem] border border-white/5 p-10 md:p-14 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/10 rounded-3xl mb-6 border border-blue-500/20 shadow-inner">
              <Sparkles className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
              {view === 'login' ? 'DIAMOND NOVA' : view === 'register' ? 'GIA NHẬP NOVA' : 'KHÔI PHỤC'}
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase italic tracking-widest mt-2">
              {view === 'login' ? 'Hệ thống nhận thưởng game số 1' : view === 'register' ? 'Kiếm tiền online 2026' : 'Cấp lại quyền truy cập'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {view === 'register' && (
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type="text" 
                  placeholder="HỌ VÀ TÊN" 
                  value={fullname} 
                  onChange={e => setFullname(e.target.value)} 
                  required 
                  className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white font-black text-[11px] outline-none focus:border-blue-500 transition-all uppercase italic" 
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input 
                type="email" 
                placeholder="ĐỊA CHỈ GMAIL" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-14 pr-6 py-5 text-white font-black text-[11px] outline-none focus:border-blue-500 transition-all uppercase italic" 
              />
            </div>

            {view !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="MẬT KHẨU" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="w-full bg-black/40 border border-slate-800 rounded-2xl pl-14 pr-16 py-5 text-white font-black text-[11px] outline-none focus:border-blue-500 transition-all uppercase italic tracking-[0.2em]" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {view === 'login' && (
              <div className="flex items-center justify-between px-2 pt-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="peer sr-only" />
                    <div className="w-5 h-5 rounded-lg border border-slate-800 bg-black/40 flex items-center justify-center transition-all peer-checked:bg-blue-600 peer-checked:border-blue-500">
                      {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase italic group-hover:text-slate-400">Ghi nhớ tôi</span>
                </label>
                <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase italic">Quên mật khẩu?</button>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-[10px] font-black text-center uppercase italic bg-red-500/10 p-4 rounded-2xl border border-red-500/20 animate-in shake duration-300">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] italic transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50 mt-6"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                view === 'login' ? (
                  <><LogIn size={18} /> ĐĂNG NHẬP NGAY</>
                ) : view === 'register' ? (
                  <><UserPlus size={18} /> TẠO TÀI KHOẢN</>
                ) : (
                  <><LogIn size={18} /> KHÔI PHỤC NGAY</>
                )
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            {view === 'login' ? (
              <p className="text-[10px] font-black text-slate-600 uppercase italic">
                Bạn chưa có tài khoản?{' '}
                <button onClick={() => setView('register')} className="text-blue-500 hover:underline">Đăng ký ngay</button>
              </p>
            ) : (
              <button 
                onClick={() => setView('login')} 
                className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase italic transition-colors"
              >
                <ArrowLeft size={12} /> Quay lại đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
