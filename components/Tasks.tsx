
import React, { useState, useEffect } from 'react';
import { User, TaskGate } from '../types.ts';
import { TASK_GATES, formatK } from '../constants.tsx';
import { dbService } from '../services/dbService.ts';
import { 
  Zap, 
  ExternalLink, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Cpu,
  Lock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface Props {
  user: User;
  onUpdateUser: (user: User) => void;
}

interface PendingTask {
  gate: string;
  points: number;
  token: string;
  timestamp: number;
}

const Tasks: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [activeTask, setActiveTask] = useState<PendingTask | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'verifying_url'>('idle');
  const [generatingGate, setGeneratingGate] = useState<string | null>(null);

  useEffect(() => {
    const savedTask = localStorage.getItem('nova_pending_task');
    let pending: PendingTask | null = null;
    
    if (savedTask) {
      const parsed = JSON.parse(savedTask);
      if (Date.now() - parsed.timestamp < 1500 * 1000) {
        pending = parsed;
        setActiveTask(parsed);
      } else {
        localStorage.removeItem('nova_pending_task');
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlKey = urlParams.get('key');

    if (urlKey && pending && urlKey === pending.token) {
      setStatus('verifying_url');
      setInputToken(urlKey);
      const timer = setTimeout(() => {
        handleVerify(urlKey, pending!);
      }, 1200);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      return () => clearTimeout(timer);
    }
  }, []);

  const generateSecureToken = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return `NOVA-${Array.from({ length: 12 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")}`;
  };

  const startTask = async (gate: TaskGate) => {
    if (user.tasksToday >= 10) return;
    const currentCount = user.taskCounts[gate.name] || 0;
    if (currentCount >= gate.quota) return;

    setGeneratingGate(gate.name);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const token = generateSecureToken();
    const currentUrl = window.location.origin + window.location.pathname;
    const target_url = `${currentUrl}?key=${token}`;
    const url_encoded = encodeURIComponent(target_url);
    
    const api_key = gate.apiKey || "demo_key";
    let api_url = `https://link4m.com/st?api=${api_key}&url=${url_encoded}`;
    if (gate.name === 'LayMaNgay') api_url = `https://laymangay.com/st?api=${api_key}&url=${url_encoded}`;

    const taskData: PendingTask = { gate: gate.name, points: gate.rate, token, timestamp: Date.now() };
    localStorage.setItem('nova_pending_task', JSON.stringify(taskData));
    setActiveTask(taskData);
    
    dbService.logActivity(user.id, user.fullname, 'Bắt đầu nhiệm vụ', `Gate: ${gate.name} - ${formatK(gate.rate)}P`);
    
    window.location.href = api_url;
  };

  const handleVerify = (tokenToVerify: string, taskInfo: PendingTask) => {
    if (!tokenToVerify || status === 'loading') return;
    setStatus('loading');
    setTimeout(() => {
      if (tokenToVerify.trim().toUpperCase() === taskInfo.token) {
        const newTaskCounts = { ...user.taskCounts };
        newTaskCounts[taskInfo.gate] = (newTaskCounts[taskInfo.gate] || 0) + 1;

        const updatedUser = {
          ...user,
          balance: user.balance + taskInfo.points,
          totalEarned: (user.totalEarned || 0) + taskInfo.points,
          tasksToday: user.tasksToday + 1,
          tasksWeek: (user.tasksWeek || 0) + 1,
          taskCounts: newTaskCounts,
          lastTaskDate: new Date().toISOString()
        };
        
        onUpdateUser(updatedUser);
        localStorage.removeItem('nova_pending_task');
        
        dbService.logActivity(user.id, user.fullname, 'Hoàn thành nhiệm vụ', `Nhận +${taskInfo.points.toLocaleString()} P từ ${taskInfo.gate}`);
        
        setStatus('success');
        setTimeout(() => { 
          setActiveTask(null); 
          setStatus('idle'); 
          setInputToken('');
          setGeneratingGate(null);
        }, 3000);
      } else { 
        setStatus('error'); 
        setTimeout(() => setStatus('idle'), 3000);
      }
    }, 1500);
  };

  const dailyProgress = (user.tasksToday / 10) * 100;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Banner */}
      <div className="relative overflow-hidden glass-card p-12 md:p-16 rounded-[4rem] border border-white/5 shadow-3xl bg-[#0a0f18] group">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
          <Cpu className="w-80 h-80 text-blue-500" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 text-xs font-black uppercase tracking-[0.4em] italic shadow-glow-sm">
              <ShieldCheck className="w-4 h-4" /> NOVA SYSTEM VERIFIED
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter italic drop-shadow-2xl">
              MINING <br />
              <span className="nova-gradient">CORE</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed italic max-w-lg">
              Khai thác tài nguyên điểm thưởng thông qua các cổng liên kết an toàn. Mỗi nhiệm vụ hoàn thành sẽ gia tăng cấp độ tin cậy của bạn.
            </p>
          </div>

          <div className="w-full lg:w-[400px] glass-card p-10 rounded-[3.5rem] border border-white/10 bg-slate-950/50 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-1.5 transition-all duration-1000 ${user.tasksToday >= 10 ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.8)]'}`} style={{ width: `${dailyProgress}%` }}></div>
            
            <div className="flex justify-between items-end mb-8">
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block italic">Hệ suất khai thác</span>
                <div className="flex items-baseline gap-3">
                  <h2 className={`text-6xl font-black italic tracking-tighter leading-none ${user.tasksToday >= 10 ? 'text-red-500' : 'text-white'}`}>{user.tasksToday}</h2>
                  <span className="text-slate-600 font-black text-xl uppercase tracking-widest">/ 10</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <TrendingUp className={`w-8 h-8 ${user.tasksToday >= 10 ? 'text-red-500' : 'text-blue-500 animate-pulse'}`} />
              </div>
            </div>

            <div className="h-4 w-full bg-black rounded-full overflow-hidden border border-white/5 p-1">
              <div 
                className={`h-full transition-all duration-1000 rounded-full ${user.tasksToday >= 10 ? 'bg-gradient-to-r from-red-600 to-rose-700' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`} 
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            <p className="mt-4 text-[10px] font-black text-slate-700 text-center uppercase tracking-[0.3em]">RESETS AT 00:00 AM</p>
          </div>
        </div>
      </div>

      {/* Task Gates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {TASK_GATES.map((gate) => {
          const currentCount = user.taskCounts[gate.name] || 0;
          const isFull = currentCount >= gate.quota;
          const isDisabled = isFull || user.tasksToday >= 10;
          const isGenerating = generatingGate === gate.name;
          const gateProgress = (currentCount / gate.quota) * 100;

          return (
            <div key={gate.name} className={`glass-card p-10 rounded-[3.5rem] border-2 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between shadow-2xl ${isDisabled ? 'border-red-500/10 opacity-40 grayscale pointer-events-none' : 'hover:border-blue-500/50 border-white/5 bg-[#0d121c] hover:bg-[#111827]'}`}>
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] group-hover:bg-blue-600/10 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-2">
                    <h3 className="font-black text-3xl text-white uppercase italic tracking-tighter group-hover:nova-gradient transition-all">{gate.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[8px] font-black rounded uppercase tracking-widest italic">VERIFIED GATE</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl bg-slate-950 border border-white/10 ${isDisabled ? 'text-slate-700' : 'text-blue-500'}`}>
                    {isFull ? <Lock className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                  </div>
                </div>

                <div className="space-y-6 mb-12">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reward</span>
                      <span className="text-2xl font-black text-white italic tracking-tighter">+{formatK(gate.rate)} <span className="text-xs text-slate-600 uppercase">Points</span></span>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase italic tracking-widest">
                         <span className="text-slate-600">Mining Quota</span>
                         <span className="text-blue-400">{currentCount} / {gate.quota}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${gateProgress}%` }} />
                      </div>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => startTask(gate)} 
                disabled={isDisabled || isGenerating} 
                className={`w-full h-16 rounded-2xl font-black uppercase italic text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${isDisabled ? 'bg-slate-900 text-slate-600' : 'bg-white text-black hover:bg-blue-600 hover:text-white shadow-xl active:scale-95'}`}
              >
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : isFull ? 'QUOTA REACHED' : (
                  <>
                    <span>KHỞI CHẠY CORE</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Verification Terminal Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setActiveTask(null)}></div>
          <div className="glass-card w-full max-w-xl p-12 md:p-16 rounded-[4rem] border border-blue-500/30 relative animate-in zoom-in-95 shadow-[0_0_150px_rgba(59,130,246,0.2)] bg-[#0a0f18]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            
            <div className="text-center space-y-8 mb-12">
               <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-blue-500/20 shadow-glow-sm">
                  <ShieldCheck className="w-12 h-12 text-blue-500 animate-pulse" />
               </div>
               <div>
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-3">SECURE TERMINAL</h2>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] italic">Dán mã định danh nhiệm vụ bên dưới</p>
               </div>
            </div>

            <div className="space-y-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-blue-600/20 rounded-2xl blur-lg group-focus-within:bg-blue-600/40 transition-all"></div>
                <input 
                  type="text" 
                  value={inputToken} 
                  onChange={e => setInputToken(e.target.value)} 
                  placeholder="NOVA-XXXX-XXXX-XXXX" 
                  className="relative w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-10 py-8 text-white text-center font-black tracking-[0.3em] outline-none transition-all text-xl uppercase focus:border-blue-600 shadow-3xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => setActiveTask(null)}
                  className="py-6 rounded-2xl bg-slate-900 border border-white/5 text-slate-500 font-black uppercase italic tracking-widest text-[10px] hover:bg-slate-800 transition-all"
                >
                  HỦY BỎ GIAO DỊCH
                </button>
                <button 
                  onClick={() => handleVerify(inputToken, activeTask)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl shadow-2xl shadow-blue-600/40 uppercase tracking-[0.2em] transition-all italic active:scale-95 flex items-center justify-center gap-3"
                >
                  {status === 'loading' ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                    <>
                      <span>XÁC THỰC MÃ</span>
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {status === 'error' && (
              <div className="mt-8 flex items-center justify-center gap-3 text-red-500 font-black uppercase italic text-[10px] tracking-widest animate-bounce">
                <ShieldAlert className="w-5 h-5" />
                MÃ XÁC THỰC KHÔNG HỢP LỆ!
              </div>
            )}
            
            <div className="mt-12 opacity-10 text-center">
               <span className="text-[9px] font-black uppercase tracking-[0.8em] text-white">ENCRYPTION ACTIVE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
