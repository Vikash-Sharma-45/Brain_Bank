import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, description, variant = 'default', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 flex flex-col space-y-2 pointer-events-none"
      >
        {toasts.map((toast) => {
          const isError = toast.variant === 'destructive' || toast.variant === 'error';
          const isSuccess = toast.variant === 'success';

          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex items-start p-4 rounded-xl shadow-floating border backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 fade-in duration-200',
                isError && 'bg-red-50/95 dark:bg-red-950/90 border-red-200 dark:border-red-900 text-red-900 dark:text-red-100',
                isSuccess && 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100',
                !isError && !isSuccess && 'bg-surface/95 border-border text-foreground'
              )}
            >
              <div className="mr-3 mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                {isError && <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                {!isSuccess && !isError && <Info className="h-5 w-5 text-brand-600 dark:text-brand-400" />}
              </div>
              <div className="flex-1">
                {toast.title && <h5 className="text-sm font-semibold">{toast.title}</h5>}
                {toast.description && (
                  <p className="text-xs opacity-90 mt-0.5">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
