import React from 'react';
import { useToast } from '../../hooks/use-toast';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const isDestructive = t.variant === 'destructive';
        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform animate-in slide-in-from-top-3 duration-200 ${
              isDestructive
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
            }`}
          >
            <div className={`mt-0.5 shrink-0 ${isDestructive ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isDestructive ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              {t.title && (
                <div className="text-sm font-semibold leading-snug">
                  {t.title}
                </div>
              )}
              {t.description && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {t.description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors shrink-0 -mr-1 -mt-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toaster;
