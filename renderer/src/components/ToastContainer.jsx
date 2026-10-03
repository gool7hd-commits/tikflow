import React from 'react';
import { useApp } from '../store/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((t) => {
        let borderClass = 'border-purple-500/40 bg-[#12172D]/95 text-purple-300';
        let Icon = Info;

        if (t.type === 'success') {
          borderClass = 'border-emerald-500/50 bg-[#0F2223]/95 text-emerald-300';
          Icon = CheckCircle2;
        } else if (t.type === 'error') {
          borderClass = 'border-rose-500/50 bg-[#25131C]/95 text-rose-300';
          Icon = AlertCircle;
        } else if (t.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-[#261E13]/95 text-amber-300';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3 animate-in slide-in-from-right duration-200 ${borderClass}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white tracking-wide">{t.title}</div>
              <div className="text-xs text-slate-300 mt-0.5 leading-snug whitespace-pre-line">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 hover:text-white text-slate-400 rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
