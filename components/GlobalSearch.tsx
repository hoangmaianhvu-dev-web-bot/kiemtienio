
import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight, X } from 'lucide-react';
import { NAV_ITEMS } from '../constants.tsx';
import { AppView } from '../types.ts';

interface Props {
  onNavigate: (view: AppView) => void;
  isAdmin: boolean;
}

const GlobalSearch: React.FC<Props> = ({ onNavigate, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Phím tắt Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Xử lý tìm kiếm - BẢO MẬT: Chỉ admin mới thấy item adminOnly
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const filtered = NAV_ITEMS.filter(item => {
      const match = item.label.toLowerCase().includes(query.toLowerCase());
      // RÀO CHẮN BẢO MẬT: Nếu item là AdminOnly mà user không phải Admin thì trả về false ngay lập tức
      if (item.adminOnly && !isAdmin) return false;
      return match;
    });
    setResults(filtered);
  }, [query, isAdmin]);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (view: AppView) => {
    onNavigate(view);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div 
        className={`flex items-center gap-3 px-5 py-3 rounded-[1.5rem] border transition-all duration-300 ${
          isOpen ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10' : 'bg-white/5 border-white/5 hover:border-white/10'
        }`}
      >
        <Search className={`w-4 h-4 ${isOpen ? 'text-blue-500' : 'text-slate-500'}`} />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tính năng hệ thống..."
          className="bg-transparent border-none outline-none text-[11px] font-black text-white placeholder-slate-600 flex-1 italic uppercase tracking-wider"
        />
        <div className="flex items-center gap-2">
           {query && (
             <button onClick={() => setQuery('')} className="text-slate-600 hover:text-white p-1">
               <X size={14} />
             </button>
           )}
           <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
             <Command size={10} className="text-slate-500" />
             <span className="text-[9px] font-black text-slate-500">K</span>
           </div>
        </div>
      </div>

      {isOpen && (results.length > 0 || query) && (
        <div className="absolute top-full left-0 right-0 mt-3 glass-card rounded-[2rem] border border-white/10 overflow-hidden z-[100] shadow-3xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-3 space-y-1">
            {results.length > 0 ? (
              results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-blue-600 group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white/5 rounded-xl text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                      {React.cloneElement(item.icon as any, { size: 18 })}
                    </div>
                    <span className="text-[11px] font-black text-slate-300 group-hover:text-white uppercase italic tracking-[0.1em]">
                      {item.label}
                    </span>
                  </div>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))
            ) : query ? (
              <div className="p-10 text-center space-y-2">
                <Search size={24} className="mx-auto text-slate-800 mb-2" />
                <p className="text-[10px] font-black uppercase text-slate-600 italic tracking-widest">Không tìm thấy mục nào khớp yêu cầu!</p>
              </div>
            ) : null}
          </div>
          
          <div className="bg-black/40 p-4 border-t border-white/5">
             <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] text-center italic">DIAMOND NOVA SECURITY OS</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
