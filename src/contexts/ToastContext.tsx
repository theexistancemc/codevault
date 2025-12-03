import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);

    // auto‑dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed inset-x-0 top-4 z-[60] flex justify-center pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-col gap-2 w-full max-w-sm px-4">
          {toasts.map((toast) => {
            const base =
              'pointer-events-auto rounded-lg px-4 py-3 text-sm shadow-lg border flex items-start gap-2';
            const styles =
              toast.variant === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toast.variant === 'error'
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-slate-800 text-white border-slate-700';

            return (
              <div key={toast.id} className={`${base} ${styles}`}>
                <span>{toast.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
