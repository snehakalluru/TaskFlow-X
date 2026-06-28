import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
};

type ToastContextValue = {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'> & { id?: string; durationMs?: number }) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const push = useCallback((t: Omit<Toast, 'id'> & { id?: string; durationMs?: number }) => {
    const id = t.id ?? makeId();
    const toast: Toast = {
      id,
      title: t.title,
      description: t.description,
      variant: t.variant ?? 'info',
    };

    setToasts((prev) => [toast, ...prev].slice(0, 5));

    const durationMs = t.durationMs ?? 3500;
    if (durationMs > 0) {
      window.setTimeout(() => remove(id), durationMs);
    }
  }, [remove]);

  const value = useMemo(() => ({ toasts, push, remove, clear }), [toasts, push, remove, clear]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex w-[92vw] max-w-sm flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t) => {
          const variant = t.variant ?? 'info';
          const bg =
            variant === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-100'
              : variant === 'error'
                ? 'bg-red-500/15 border-red-500/30 text-red-100'
                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-100';

          return (
            <div
              key={t.id}
              className={`rounded-2xl border ${bg} shadow-glass px-4 py-3 backdrop-blur`}
              role="status"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {t.title && <div className="text-sm font-semibold">{t.title}</div>}
                  {t.description && <div className="text-sm/5 mt-0.5 text-white/80">{t.description}</div>}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded-lg p-1 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  aria-label="Dismiss toast"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

