
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
  Flame,
  MousePointer2,
  LockKeyhole
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
      if (Date.now() - parsed.timestamp < 1800 * 1000) {
        setActiveTask(parsed);
      } else {
        localStorage.removeItem('nova_pending_task');
      }
    }
  }, []);

  const generateToken = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    // Tạo mã bảo mật duy nhất cho mỗi phiên nhiệm vụ
    return `NOVA-${Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")}`;
  };

  const startTask = async (id: number) => {
    const gate = TASK_RATES[id];
    const currentCount = user.taskCounts[gate.name] || 0;
    
    if (currentCount >= gate.limit) return;
    if (user.tasksToday >= DAILY_TASK_LIMIT) return alert(`Bạn đã đạt giới hạn tối đa ${DAILY_TASK_LIMIT} nhiệm vụ/ngày!`);

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
    
    dbService.logActivity(user.id, user.fullname, 'Bắt đầu nhiệm vụ', `Gate: ${gate.name}`);

    // Mở link nhiệm vụ qua API nhà cung cấp
    openTaskLink(id, user.id, token);
    
    setTimeout(() => setGeneratingGate(null), 1000);
  };

  const verifyTask = () => {
    if (!activeTask || !inputToken.trim()) return;
    setStatus('loading');

    setTimeout(() => {
      // Đối soát mã Key từ người dùng nhập với Token bảo mật được tạo lúc đầu
      const input = inputToken.trim().toUpperCase();
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
        dbService.logActivity(user.id, user.fullname, 'Hoàn thành nhiệm vụ', `Nhận +${activeTask.points} P từ ${activeTask.gateName}`);
        
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
    }, 1200);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Banner Khai Thác Cyber-Luxury */}
      <div className="relative overflow-hidden glass-card p-12 md:p-16 rounded-[4rem] border border-white/5 shadow-[0_0_50px_rgba(59,130,246,0.1)] bg-[#0a0f18] group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
          <Cpu className="w-80 h-80 text-blue-500" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] italic shadow-glow-blue">
              <ShieldCheck className="w-4 h-4" /> SECURE MINING VISION 2.0
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter italic drop-shadow-2xl">
              MINING <span className="nova-gradient">CORE</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed italic">
              Hệ thống khai thác điểm thưởng (P) thông qua các Node xác thực bảo mật. Đảm bảo KEY nhập vào khớp với Security Token để nhận thưởng.
            </p>
          </div>
          
          <div className="w-full lg:w-[380px] glass-card p-10 rounded-[3.5rem] border border-white/10 bg-slate-950/50 backdrop-blur-3xl shadow-2xl">
             <div className="flex justify-between items-end mb-8">
                <div className="space-y-1">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">Tiến độ hôm nay ({user.tasksToday}/{DAILY_TASK_LIMIT})</span>
                   <h2 className="text-6xl font-black text-white italic tracking-tighter">{user.tasksToday || 0}</h2>
                </div>
                <div className="p-4 bg-blue-600/20 rounded-2xl text-blue-500 border border-blue-500/20">
                   <Flame className="w-8 h-8 animate-pulse" />
                </div>
             </div>
             <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all" style={{ width: `${Math.min((user.tasksToday / DAILY_TASK_LIMIT) * 100, 100)}%` }} />
             </div>
          </div>
        </div>
      </div>

      {/* Grid Danh sách Nhiệm vụ Node */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(TASK_RATES).map(([idStr, gate]) => {
          const id = parseInt(idStr);
          const currentCount = user.taskCounts[gate.name] || 0;
          const isFull = currentCount >= gate.limit;
          const isGenerating = generatingGate === id;

          return (
            <div key={id} className={`glass-card p-10 rounded-[3.5rem] border-2 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between shadow-2xl ${isFull ? 'border-red-500/10 opacity-50 grayscale' : 'hover:border-blue-500/50 border-white/5 bg-[#0d121c]'}`}>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-black text-3xl text-white uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">{gate.name}</h3>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">NODE #{id.toString().padStart(2, '0')} ACCESS</span>
                  </div>
                  <div className={`p-3 rounded-2xl bg-slate-950 border border-white/10 ${isFull ? 'text-red-500' : 'text-blue-500 shadow-glow-blue'}`}>
                    {isFull ? <Lock className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[11px] font-black text-slate-500 uppercase italic tracking-widest">Lợi nhuận</span>
                    <span className="text-2xl font-black text-white italic tracking-tighter">+{formatK(gate.reward)} P</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[11px] font-black text-slate-500 uppercase italic tracking-widest">Giới hạn</span>
                    <span className="text-sm font-black text-slate-300 italic">{currentCount} / {gate.limit} Lượt</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => startTask(id)} 
                disabled={isFull || isGenerating}
                className={`w-full h-16 rounded-2xl font-black uppercase italic text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden ${isFull ? 'bg-slate-900 text-slate-600' : 'bg-white text-black hover:bg-blue-600 hover:text-white shadow-xl active:scale-95'}`}
              >
                {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : isFull ? 'NODE EXHAUSTED' : (
                  <>
                    <span>KHỞI CHẠY NODE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Security Terminal (Verification Panel) */}
      <div className="relative pt-10">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#06080c] px-6 z-10 border border-blue-500/20 rounded-full py-1">
          <span className="text-[10px] font-black text-blue-500 tracking-[0.4em] uppercase italic">SECURITY TERMINAL</span>
        </div>
        
        <div className="glass-card p-10 md:p-14 rounded-[4rem] border border-blue-500/20 bg-gradient-to-b from-blue-900/10 to-transparent backdrop-blur-3xl shadow-3xl">
          <div className="flex flex-col items-center text-center gap-8 max-w-2xl mx-auto">
             <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center border border-blue-500/20 shadow-glow-blue">
                {status === 'loading' ? <Loader2 className="w-12 h-12 text-blue-500 animate-spin" /> : <LockKeyhole className="w-12 h-12 text-blue-500 animate-pulse" />}
             </div>
             
             <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">XÁC THỰC MÃ KEY</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">NHẬP MÃ SECURITY KEY TỪ BLOG ĐỂ KÍCH HOẠT NODE</p>
             </div>

             <div className="w-full space-y-6">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="NOVA-XXXX-XXXX" 
                    className="w-full bg-slate-950 border-2 border-slate-900 rounded-3xl px-8 py-7 text-white text-center font-black tracking-[0.3em] outline-none transition-all text-xl uppercase focus:border-blue-600 shadow-inner group-hover:border-blue-900"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                </div>

                <button 
                  onClick={verifyTask}
                  disabled={status === 'loading' || !inputToken.trim() || !activeTask}
                  className={`w-full py-7 rounded-3xl font-black text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-4 italic shadow-2xl ${
                    status === 'loading' || !activeTask
                    ? 'bg-slate-900 text-slate-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-800 text-white hover:brightness-125 active:scale-95'
                  }`}
                >
                  {status === 'loading' ? 'XÁC THỰC...' : 'KÍCH HOẠT NODE NHẬN THƯỞNG'}
                </button>

                {status === 'success' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex items-center justify-center gap-3 text-emerald-500 font-black uppercase italic text-xs tracking-widest animate-bounce">
                    <CheckCircle2 className="w-5 h-5" /> 💎 XÁC THỰC THÀNH CÔNG! ĐÃ CỘNG {activeTask?.points} P
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-center justify-center gap-3 text-red-500 font-black uppercase italic text-xs tracking-widest">
                    <ShieldAlert className="w-5 h-5" /> MÃ KEY KHÔNG CHÍNH XÁC! THỬ LẠI TRÊN BLOG.
                  </div>
                )}

                {!activeTask && status !== 'success' && (
                   <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest italic animate-pulse">VUI LÒNG KHỞI CHẠY 1 NODE ĐỂ BẮT ĐẦU XÁC THỰC</p>
                )}
             </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .shadow-glow-blue { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
      `}</style>
    </div>
  );
};

export default Tasks;
