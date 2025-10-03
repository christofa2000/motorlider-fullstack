"use client";

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ToastVariant = "default" | "success" | "destructive";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-expect-error - types vary across runtimes
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

type ToastProviderProps = {
  children: ReactNode;
};

const AUTO_DISMISS_MS = 3000;

const variantClasses: Record<ToastVariant, string> = {
  default: "bg-[var(--color-primary)] text-[var(--color-contrast)]",
  success: "bg-emerald-600 text-white",
  destructive: "bg-red-600 text-white",
};

const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutRefs = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));

    const timeoutId = timeoutRefs.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutRefs.current[id];
    }
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = generateId();
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? "default",
    };

    setToasts((current) => [...current, item]);

    if (typeof window !== "undefined") {
      const timeoutId = window.setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
      timeoutRefs.current[id] = timeoutId;
    }
  }, [removeToast]);

  useEffect(() => {
    const { current: storedTimeouts } = timeoutRefs;
    return () => {
      Object.values(storedTimeouts).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[60] flex max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-full rounded-lg px-4 py-3 text-sm shadow-md ${variantClasses[t.variant ?? "default"]}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold leading-5">{t.title}</p>
                {t.description && (
                  <p className="mt-1 text-[0.85rem] opacity-90">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                aria-label="Cerrar notificación"
                className="ml-2 rounded p-1 text-current/80 transition hover:bg-black/10 hover:text-current"
                onClick={() => removeToast(t.id)}
              >
                ×
              </button>
            </div>
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
