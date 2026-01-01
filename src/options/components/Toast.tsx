import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'info' | 'error' | 'success';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = type === 'error' 
    ? 'bg-rose-50 border-rose-100 text-rose-900 dark:bg-rose-900/20 dark:border-rose-900/30 dark:text-rose-200' 
    : type === 'success'
    ? 'bg-teal-50 border-teal-100 text-teal-900 dark:bg-teal-900/20 dark:border-teal-900/30 dark:text-teal-200'
    : 'bg-slate-50 border-slate-100 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200';

  const Icon = type === 'error' ? AlertCircle : type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgColor} min-w-[320px] max-w-md`}>
        <Icon size={18} className="shrink-0 opacity-80" />
        <p className="text-xs font-medium flex-1">{message}</p>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors opacity-50 hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
