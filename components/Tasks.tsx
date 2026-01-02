
import React, { useState, useEffect } from 'react';
import { User } from '../types.ts';
import { TASK_RATES, formatK, DAILY_TASK_LIMIT, VIP_TASK_LIMIT } from '../constants.tsx';
import { dbService } from '../services/dbService.ts';
import { openTaskLink } from '../services/taskService.ts';
import { 
  Zap, 
  Loader2, 
  Lock, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  LockKeyhole, 
  Terminal, 
  Activity, 
  MousePointer2,
  LayoutGrid,
  RefreshCw,
  ShieldBan,
  Crown
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

  const currentLimit = user.isVip ? VIP_TASK_LIMIT : DAILY_TASK_LIMIT;

  const checkAndResetDailyLimits = () => {
    if (!user.lastTaskDate) return;
    const lastDate = new Date(user.lastTaskDate).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    if (today > lastDate) {
      onUpdateUser({
        ...user,
        tasksToday: 0,
        taskCounts: {},
        lastTaskDate: new Date().toISOString() 
      });
    }
  };

  useEffect(() => {
    checkAndResetDailyLimits();
    const saved = localStorage.getItem('nova_pending_task');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Date.now() - parsed.timestamp < 1800 * 1000) {
        setActiveTask(parsed);
      } else {
        localStorage.removeItem('nova_pending_task');
      }
    }
    const interval = setInterval(checkAndResetDailyLimits, 60000);
    return () => clearInterval(interval);
  }, [user.lastTaskDate]);

  const generateToken = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return `NOVA-${Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")}`;
  };

  const startTask = async (id: number) => {
    const gate = TASK_RATES[id];
    const currentCount = user.taskCounts[gate.name] || 0;
    if (currentCount >= gate.limit) return;
    if (user.tasksToday >= currentLimit) return alert(`Bạn đã đạt giới hạn ${currentLimit} nhiệm vụ/ngày!`);

    setGeneratingGate(id);
    const token = generateToken();
    const taskData: PendingTask = { gateId: id, gateName: gate.name, points: gate.reward, token, timestamp: Date.now() };
    
    localStorage.setItem('nova_pending_task', JSON.stringify(taskData));
    setActiveTask(taskData);
    
    await dbService.logActivity(user.id, user.fullname, 'Bắt đầu nhiệm vụ', gate.name);
    await openTaskLink(id, user.id, token);
    setGeneratingGate(null);
  };

  const verifyTask = () => {
    if (!activeTask || !inputToken.trim()) return;
    setStatus('loading');

    setTimeout(async () => {
      const input = inputToken.trim().toUpperCase();
      const cleanToken = activeTask.token.replace('NOVA-', '');
      
      if (input === activeTask.token || input === cleanToken) {
        const timeElapsed = Math.floor((Date.now() - activeTask.timestamp) / 1000);
        const { error } = await dbService.addPointsSecurely(user.id, timeElapsed, activeTask.points, activeTask.gateName);
        
        if (error) {
           setStatus('error');
           if (error === 'SENTINEL_SECURITY_VIOLATION') alert("Phát hiện gian lận!");
           return;
        }

        setStatus('success');
        localStorage.removeItem('nova_pending_task');
        
        setTimeout(() => {
          setActiveTask(null);
          setInputToken('');
          setStatus('idle');
        }, 2500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    }, 1200);
  };

  const handleCancel = () => {
    if (window.confirm("Hủy bỏ nhiệm vụ?")) {
      localStorage.removeItem('nova_pending_task');
      setActiveTask(null);
      setInputToken('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-24 px-2">
      <div className="relative pt-4 max-w-2xl mx-auto">
        <div className={`glass-card p-6 md:p-10 rounded-[2.5rem] border ${user.isVip ? 'border-amber-500/40' : 'border-cyan-500/20'} bg-gradient-to-b from-slate-900/50 to-black/95 backdrop-blur-3xl shadow-2xl overflow-hidden text-center relative`}>
             {user.isVip && <div className="absolute top-4 left-8"><Crown className="text-amber-500 w-6 h-6 fill-amber-500/20 animate-pulse" /></div>}
             
             <div className="space-y-6">
                <div>
                  <h2 className={`text-2xl font-black uppercase italic tracking-tighter ${user.isVip ? 'text-amber-500' : 'text-white'}`}>XÁC THỰC MÃ KEY</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] italic mt-1">
                    {activeTask ? `ĐANG CHỜ MÃ TỪ CỔNG: ${activeTask.gateName}` : 'HÃY CHỌN CỔNG NHIỆM VỤ PHÍA DƯỚI'}
                  </p>
                </div>

                <div className="relative group">
                  <input 
                    type="text" 
                    value={inputToken} 
                    disabled={!activeTask || status === 'loading' || status === 'success'}
                    onChange={(e) => setInputToken(e.target.value)} 
                    placeholder={activeTask ? "NHẬP MÃ TẠI ĐÂY..." : "CHƯA KÍCH HOẠT"} 
                    className={`w-full bg-black/80 border border-slate-800 rounded-3xl px-8 py-5 text-center font-black tracking-[0.3em] outline-none transition-all text-xl focus:border-blue-500 shadow-inner uppercase ${user.isVip ? 'text-amber-500' : 'text-cyan-400'}`} 
                  />
                </div>

                <button 
                  onClick={verifyTask} 
                  disabled={!activeTask || status !== 'idle' || !inputToken.trim()} 
                  className={`w-full py-5 rounded-2xl font-black text-white uppercase italic tracking-widest shadow-xl transition-all ${user.isVip ? 'bg-gradient-to-r from-amber-600 to-yellow-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} disabled:opacity-30`}
                >
                  {status === 'loading' ? 'ĐANG KIỂM TRA...' : 'KÍCH HOẠT NHẬN ĐIỂM'}
                </button>
             </div>
        </div>
      </div>

      <div className="space-y-8 pt-8">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
           <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl border shadow-glow ${user.isVip ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
                 <LayoutGrid className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">CÁC CỔNG NHIỆM VỤ</h3>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">
                   HẠN MỨC CÒN LẠI: <span className={user.isVip ? 'text-amber-500' : 'text-cyan-400'}>{currentLimit - user.tasksToday}</span> LƯỢT / NGÀY
                 </p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(TASK_RATES).map(([idStr, gate]) => {
            const id = parseInt(idStr);
            const currentCount = user.taskCounts[gate.name] || 0;
            const isFull = currentCount >= gate.limit;
            const isGenerating = generatingGate === id;
            const isCurrentGate = activeTask?.gateId === id;
            const reward = user.isVip ? Math.floor(gate.reward * 1.2) : gate.reward;

            return (
              <div key={id} className={`glass-card p-10 rounded-[3rem] border transition-all duration-500 flex flex-col justify-between shadow-2xl ${isFull ? 'grayscale opacity-40' : isCurrentGate ? 'border-cyan-400 bg-cyan-500/5' : 'border-white/5 bg-[#0a0f1e]/90'}`}>
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <h4 className="font-black text-2xl text-white uppercase italic tracking-tighter leading-none mb-1">{gate.name}</h4>
                    {user.isVip && <div className="text-[8px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded italic">VIP BONUS</div>}
                  </div>
                  <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase italic">THƯỞNG ĐIỂM</span>
                      <span className={`text-2xl font-black italic tracking-tighter ${user.isVip ? 'text-amber-500' : 'text-emerald-500'}`}>+{formatK(reward)} P</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => startTask(id)} 
                  disabled={isFull || isGenerating || (activeTask !== null && !isCurrentGate)} 
                  className={`w-full py-5 rounded-[1.5rem] font-black uppercase italic text-[11px] tracking-widest transition-all ${isFull ? 'bg-slate-900 text-slate-700' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}
                >
                  {isGenerating ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : isFull ? 'HẾT LƯỢT' : 'MỞ LINK NHIỆM VỤ'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
