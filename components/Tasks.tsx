
import React, { useState, useEffect } from 'react';
import { User } from '../types.ts';
import { TASK_RATES, formatK, DAILY_TASK_LIMIT } from '../constants.tsx';
import { dbService } from '../services/dbService.ts';
import { openTaskLink } from '../services/taskService.ts';
import { 
  Zap, 
  Loader2, 
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  LockKeyhole,
  MousePointer2,
  Terminal,
  Activity
} from 'lucide-react';

interface Props {
  user: User;
  onUpdateUser: (user: User) => void;
}

interface PendingTask {
  gateId: number;
  gateName: string;
  points: number;
  token: string;
  timestamp: number;
}

const Tasks: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [activeTask, setActiveTask] = useState<PendingTask | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [generatingGate, setGeneratingGate] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nova_pending_task');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Giới hạn 30 phút cho một phiên nhiệm vụ
      if (Date.now() - parsed.timestamp < 1800 * 1000) {
        setActiveTask(parsed);
      } else {
        localStorage.removeItem('nova_pending_task');
      }
    }
  }, []);

  const generateToken = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return `NOVA-${Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")}`;
  };

  const startTask = async (id: number) => {
    const gate = TASK_RATES[id];
    const currentCount = user.taskCounts[gate.name] || 0;
    
    if (currentCount >= gate.limit) return;
    if (user.tasksToday >= DAILY_TASK_LIMIT) return alert(`Hệ thống từ chối: Bạn đã đạt giới hạn ${DAILY_TASK_LIMIT} nhiệm vụ/ngày!`);

    setGeneratingGate(id);
    const token = generateToken();
    
    const taskData: PendingTask = { 
      gateId: id, 
      gateName: gate.name, 
      points: gate.reward, 
      token, 
      timestamp: Date.now() 
    };
    
    localStorage.setItem('nova_pending_task', JSON.stringify(taskData));
    setActiveTask(taskData);
    
    dbService.logActivity(user.id, user.fullname, 'Mining Start', `Node: ${gate.name}`);

    // Mở link nhiệm vụ chuẩn nhà cung cấp
    openTaskLink(id, user.id, token);
    
    setTimeout(() => setGeneratingGate(null), 1000);
  };

  const verifyTask = () => {
    if (!activeTask || !inputToken.trim()) return;
    setStatus('loading');

    setTimeout(() => {
      const input = inputToken.trim().toUpperCase();
      // Chấp nhận cả mã full NOVA-XXXX và mã chỉ phần đuôi
      if (input === activeTask.token || input === activeTask.token.replace('NOVA-', '')) {
        const newTaskCounts = { ...user.taskCounts };
        newTaskCounts[activeTask.gateName] = (newTaskCounts[activeTask.gateName] || 0) + 1;

        const updatedUser = {
          ...user,
          balance: user.balance + activeTask.points,
          totalEarned: (user.totalEarned || 0) + activeTask.points,
          tasksToday: (user.tasksToday || 0) + 1,
          taskCounts: newTaskCounts,
          lastTaskDate: new Date().toISOString()
        };

        onUpdateUser(updatedUser);
        dbService.logActivity(user.id, user.fullname, 'Mining Success', `Earned +${activeTask.points} P from ${activeTask.gateName}`);
        
        setStatus('success');
        localStorage.removeItem('nova_pending_task');
        setTimeout(() => {
          setActiveTask(null);
          setInputToken('');
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    }, 1500);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      {/* Header Cyber luxury */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] italic animate-pulse">
           <Activity className="w-4 h-4" /> MINING CORE 2.0 ACTIVE
        </div>
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          SUPREME <span className="text-white">NODE</span>
        </h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] italic">Encrypted Authentication & Point Extraction</p>
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
        {Object.entries(TASK_RATES).map(([idStr, gate]) => {
          const id = parseInt(idStr);
          const currentCount = user.taskCounts[gate.name] || 0;
          const isFull = currentCount >= gate.limit;
          const isGenerating = generatingGate === id;

          return (
            <div key={id} className={`group relative bg-gradient-to-br from-blue-900/20 to-black border-2 rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-2xl ${isFull ? 'border-red-500/10 grayscale opacity-40' : 'hover:border-cyan-400/50 border-white/5 hover:shadow-cyan-500/20 active:scale-[0.98]'}`}>
              <div className="p-10 flex flex-col justify-between h-full bg-[#0a0f1e]/80 backdrop-blur-md">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="font-black text-3xl text-white uppercase italic tracking-tighter group-hover:text-cyan-400 transition-colors">{gate.name}</h3>
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">CHANNEL ID #{id.toString().padStart(2, '0')}</span>
                    </div>
                    <div className={`p-4 rounded-2xl bg-black border-2 ${isFull ? 'border-red-500/20 text-red-500' : 'border-cyan-500/20 text-cyan-500'}`}>
                      {isFull ? <Lock className="w-6 h-6" /> : <Zap className="w-6 h-6 animate-pulse" />}
                    </div>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">Yield Point</span>
                      <span className="text-3xl font-black text-white italic tracking-tighter drop-shadow-md">+{formatK(gate.reward)} P</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">Efficiency</span>
                      <span className="text-sm font-black text-cyan-500 italic">{currentCount} / {gate.limit} Lượt</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => startTask(id)} 
                  disabled={isFull || isGenerating}
                  className={`w-full h-16 rounded-2xl font-black uppercase italic text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn ${isFull ? 'bg-slate-900 text-slate-700' : 'bg-white text-black hover:bg-cyan-500 hover:text-white shadow-xl shadow-cyan-500/20'}`}
                >
                  {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : isFull ? 'QUOTA FULL' : (
                    <>
                      <span>KHỞI CHẠY NODE</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                </button>
              </div>
              
              {/* Animation hiệu ứng ở nền */}
              {!isFull && (
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity">
                   <Cpu className="w-24 h-24" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security Terminal Luxury Panel */}
      <div className="relative pt-20 max-w-4xl mx-auto">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#02040a] px-8 z-10 border-x border-cyan-500/30 py-1">
          <span className="text-[11px] font-black text-cyan-500 tracking-[0.5em] uppercase italic flex items-center gap-3">
             <Terminal className="w-4 h-4" /> SECURITY TERMINAL
          </span>
        </div>
        
        <div className="glass-card p-12 md:p-20 rounded-[4rem] border-2 border-cyan-500/20 bg-gradient-to-b from-blue-950/20 to-black/80 backdrop-blur-3xl shadow-[0_0_100px_rgba(6,182,212,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="flex flex-col items-center text-center gap-10 relative z-10">
             <div className="w-28 h-28 bg-cyan-500/10 rounded-[2.5rem] flex items-center justify-center border-2 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                {status === 'loading' ? (
                  <Loader2 className="w-14 h-14 text-cyan-500 animate-spin" />
                ) : (
                  <LockKeyhole className="w-14 h-14 text-cyan-500 animate-pulse" />
                )}
             </div>
             
             <div className="space-y-4">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">AUTHENTICATE KEY</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic max-w-md mx-auto leading-relaxed">Nhập mã định danh (KEY) thu thập được từ Blog để kích hoạt phần thưởng</p>
             </div>

             <div className="w-full max-w-lg space-y-8">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="NOVA-XXXX-XXXX" 
                    className="w-full bg-black border-2 border-slate-900 rounded-3xl px-10 py-8 text-cyan-400 text-center font-black tracking-[0.4em] outline-none transition-all text-2xl uppercase focus:border-cyan-500 shadow-[inset_0_0_20px_rgba(0,0,0,1)] group-hover:border-slate-800"
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-500 animate-ping shadow-[0_0_10px_cyan]"></div>
                </div>

                <button 
                  onClick={verifyTask}
                  disabled={status === 'loading' || !inputToken.trim() || !activeTask}
                  className={`w-full py-8 rounded-3xl font-black text-[12px] tracking-[0.4em] transition-all flex items-center justify-center gap-4 italic shadow-2xl ${
                    status === 'loading' || !activeTask
                    ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5' 
                    : 'bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 text-white hover:brightness-125 active:scale-95 shadow-cyan-600/30'
                  }`}
                >
                  {status === 'loading' ? 'XÁC THỰC DỮ LIỆU...' : 'KÍCH HOẠT QUY TRÌNH NHẬN THƯỞNG'}
                </button>

                {status === 'success' && (
                  <div className="bg-emerald-500/10 border-2 border-emerald-500/20 p-6 rounded-3xl flex items-center justify-center gap-4 text-emerald-400 font-black uppercase italic text-xs tracking-[0.2em] animate-bounce shadow-glow-emerald">
                    <CheckCircle2 className="w-6 h-6" /> 💎 TRÍCH XUẤT THÀNH CÔNG! ĐÃ CỘNG {activeTask?.points} P
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="bg-red-500/10 border-2 border-red-500/20 p-6 rounded-3xl flex items-center justify-center gap-4 text-red-400 font-black uppercase italic text-xs tracking-[0.2em] shadow-glow-red">
                    <ShieldAlert className="w-6 h-6" /> MÃ KEY KHÔNG HỢP LỆ! KIỂM TRA LẠI TRÊN BLOG.
                  </div>
                )}

                {!activeTask && status !== 'success' && (
                   <div className="flex items-center justify-center gap-3 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] italic bg-slate-950/50 py-4 rounded-2xl border border-white/5">
                      <MousePointer2 className="w-4 h-4" /> VUI LÒNG KHỞI CHẠY 1 NODE ĐỂ BẮT ĐẦU
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .shadow-glow-emerald { box-shadow: 0 0 30px rgba(16, 185, 129, 0.2); }
        .shadow-glow-red { box-shadow: 0 0 30px rgba(239, 68, 68, 0.2); }
        .shadow-glow-blue { box-shadow: 0 0 30px rgba(6, 182, 212, 0.2); }
      `}</style>
    </div>
  );
};

export default Tasks;
