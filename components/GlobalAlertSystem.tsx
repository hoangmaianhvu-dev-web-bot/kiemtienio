
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, ShieldCheck } from 'lucide-react';

/* 
  HỆ THỐNG THÔNG BÁO DIAMOND NOVA LUXURY
  - Ghi đè window.alert & window.confirm
  - Hỗ trợ Dark/Light mode tự động
  - Hiệu ứng Confetti khi thành công
*/

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  isConfirm: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const GlobalAlertSystem: React.FC = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    isConfirm: false
  });

  // Hàm kích hoạt pháo hoa
  const fireConfetti = () => {
    if ((window as any).confetti) {
      (window as any).confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e2b13c', '#ffffff', '#3b82f6'],
        zIndex: 100001
      });
    }
  };

  // Đóng modal
  const handleClose = useCallback((confirmed: boolean) => {
    setAlertState(prev => {
      if (prev.isConfirm) {
        if (confirmed && prev.onConfirm) prev.onConfirm();
        if (!confirmed && prev.onCancel) prev.onCancel();
      }
      return { ...prev, isOpen: false };
    });
  }, []);

  useEffect(() => {
    // 1. Ghi đè window.alert
    (window as any).originalAlert = window.alert;
    window.alert = (message: any) => {
      // Tự động detect loại thông báo dựa trên nội dung
      let type: AlertType = 'info';
      let title = 'THÔNG BÁO';
      const msgStr = String(message).toLowerCase();
      
      if (msgStr.includes('lỗi') || msgStr.includes('error') || msgStr.includes('thất bại')) {
        type = 'error'; title = 'RẤT TIẾC';
      } else if (msgStr.includes('thành công') || msgStr.includes('success')) {
        type = 'success'; title = 'TUYỆT VỜI';
      } else if (msgStr.includes('cảnh báo') || msgStr.includes('lưu ý')) {
        type = 'warning'; title = 'CẢNH BÁO';
      }

      setAlertState({
        isOpen: true,
        type,
        title,
        message: String(message),
        isConfirm: false
      });
      
      if (type === 'success') fireConfetti();
    };

    // 2. Ghi đè window.confirm (Chuyển sang Promise)
    (window as any).originalConfirm = window.confirm;
    window.confirm = (message: any): any => {
      return new Promise((resolve) => {
        setAlertState({
          isOpen: true,
          type: 'warning',
          title: 'XÁC NHẬN',
          message: String(message),
          isConfirm: true,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        });
      });
    };

    // 3. Hàm Nova Custom (window.novaNotify)
    (window as any).novaNotify = (type: AlertType, title: string, message: string) => {
      setAlertState({ isOpen: true, type, title, message, isConfirm: false });
      if (type === 'success') fireConfetti();
    };

    return () => {
      // Restore khi unmount (nếu cần)
      // window.alert = (window as any).originalAlert;
      // window.confirm = (window as any).originalConfirm;
    };
  }, []);

  if (!alertState.isOpen) return null;

  // Cấu hình giao diện theo loại
  const configs = {
    success: { color: '#e2b13c', icon: <CheckCircle2 size={56} />, btnText: 'HOÀN TẤT' },
    error:   { color: '#ff4d4d', icon: <XCircle size={56} />, btnText: 'ĐÓNG LẠI' },
    warning: { color: '#f1c40f', icon: <AlertTriangle size={56} />, btnText: 'ĐỒNG Ý' },
    info:    { color: '#3b82f6', icon: <Info size={56} />, btnText: 'ĐÃ HIỂU' }
  };
  const cfg = configs[alertState.type];

  return (
    <div className="nova-alert-overlay">
      <div className="nova-alert-card animate-zoom">
        {/* Glow Border Effect */}
        <div className="nova-glow" style={{ borderColor: cfg.color, boxShadow: `0 0 25px ${cfg.color}33` }}></div>
        
        <div className="nova-content">
          <div className="nova-header">
            <span className="nova-brand">DIAMOND NOVA SYSTEM</span>
            <button onClick={() => handleClose(false)} className="nova-close"><X size={20} /></button>
          </div>

          <div className="nova-body">
            <div className="nova-icon-wrapper" style={{ color: cfg.color, filter: `drop-shadow(0 0 15px ${cfg.color}66)` }}>
              {cfg.icon}
            </div>
            
            <h2 className="nova-title" style={{ color: cfg.color }}>{alertState.title}</h2>
            <div className="nova-divider" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}></div>
            <p className="nova-message">{alertState.message}</p>
          </div>

          <div className="nova-footer">
            {alertState.isConfirm ? (
              <>
                <button 
                  onClick={() => handleClose(false)} 
                  className="nova-btn nova-btn-cancel"
                >
                  HỦY BỎ
                </button>
                <button 
                  onClick={() => handleClose(true)} 
                  className="nova-btn nova-btn-confirm"
                  style={{ background: `linear-gradient(135deg, ${cfg.color}, #d35400)` }}
                >
                  ĐỒNG Ý
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleClose(true)} 
                className="nova-btn nova-btn-full"
                style={{ background: cfg.color, boxShadow: `0 5px 20px ${cfg.color}44` }}
              >
                {cfg.btnText}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .nova-alert-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .nova-alert-card {
          position: relative; width: 100%; max-width: 420px;
          background: rgba(13, 17, 23, 0.95); 
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .animate-zoom { animation: novaZoom 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes novaZoom { from { transform: scale(0.8) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        
        .nova-glow {
          position: absolute; inset: 0; border: 1px solid; border-radius: 28px;
          pointer-events: none; opacity: 0.6;
        }
        .nova-content { position: relative; z-index: 10; padding: 32px; }
        
        .nova-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .nova-brand { font-size: 9px; font-weight: 900; letter-spacing: 2px; color: #64748b; text-transform: uppercase; }
        .nova-close { color: #64748b; transition: 0.2s; padding: 4px; border-radius: 50%; }
        .nova-close:hover { color: white; background: rgba(255,255,255,0.1); }

        .nova-body { text-align: center; margin-bottom: 32px; }
        .nova-icon-wrapper { margin-bottom: 20px; display: inline-flex; animation: novaFloat 3s ease-in-out infinite; }
        @keyframes novaFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        
        .nova-title { font-size: 26px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; letter-spacing: -0.5px; font-style: italic; line-height: 1; }
        .nova-divider { height: 1px; width: 60%; margin: 0 auto 16px; opacity: 0.5; }
        .nova-message { font-size: 15px; color: #cbd5e1; line-height: 1.6; font-weight: 500; }

        .nova-footer { display: flex; gap: 12px; }
        .nova-btn {
          padding: 16px; border-radius: 16px; font-weight: 800; font-size: 12px;
          text-transform: uppercase; letter-spacing: 1.5px; color: white;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .nova-btn:hover { transform: translateY(-3px); filter: brightness(1.2); }
        .nova-btn:active { transform: scale(0.96); }
        
        .nova-btn-cancel { background: #1e293b; color: #94a3b8; flex: 1; border: 1px solid rgba(255,255,255,0.05); }
        .nova-btn-cancel:hover { background: #334155; color: white; border-color: rgba(255,255,255,0.1); }
        .nova-btn-confirm { flex: 1; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .nova-btn-full { width: 100%; color: #000; font-weight: 900; }
        
        /* Light Mode Support */
        :global(html.light) .nova-alert-card { background: rgba(255, 255, 255, 0.95); }
        :global(html.light) .nova-message { color: #475569; }
        :global(html.light) .nova-btn-cancel { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; }
        :global(html.light) .nova-close:hover { background: rgba(0,0,0,0.05); color: #000; }
      `}</style>
    </div>
  );
};

export default GlobalAlertSystem;
