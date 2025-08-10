import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: string; type: "success" | "error" | "info"; message: string };
type ToastContextType = {
  notify: (type: Toast["type"], message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToasterProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((type: Toast["type"], message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-2 z-50 mx-auto flex w-full max-w-xl flex-col gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded border px-4 py-3 shadow ${
              t.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200"
                : t.type === "error"
                ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
                : "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200"
            }`}
          >
            <p className="text-sm">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToaster() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToaster must be used within ToasterProvider");
  return ctx;
}
