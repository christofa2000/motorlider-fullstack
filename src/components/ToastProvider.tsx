"use client";

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type Toast = {
  id: string;
  message: string;
};

type ToastContextValue = {
  show: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

type ToastProviderProps = {
  children: ReactNode;
};

const AUTO_DISMISS_MS = 3000;

const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timeoutId = timeoutRefs.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutRefs.current[id];
    }
  }, []);

  const show = useCallback(
    (message: string) => {
      const id = generateId();

      setToasts((current) => [...current, { id, message }]);

      if (typeof window !== "undefined") {
        const timeoutId = window.setTimeout(() => {
          removeToast(id);
        }, AUTO_DISMISS_MS);

        timeoutRefs.current[id] = timeoutId;
      }
    },
    [removeToast]
  );

  useEffect(() => {
    const { current: storedTimeouts } = timeoutRefs;

    return () => {
      Object.values(storedTimeouts).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ show }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[60] flex max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-[var(--color-contrast)] shadow-md"
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }

  return context;
};

export default ToastProvider;
