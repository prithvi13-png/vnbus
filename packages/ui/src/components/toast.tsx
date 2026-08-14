"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";

import { cn } from "../lib/cn";

export type ToastTone = "default" | "success" | "warning" | "danger";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  notify: (toast: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = React.useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
    setToasts((current) => [...current, { id, ...toast }].slice(-4));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={cn(
              "grid gap-1 rounded-md border bg-white p-4 text-sm shadow-lg dark:bg-gray-950",
              toast.tone === "success" &&
                "border-brand-200 text-brand-900 dark:border-brand-600/30 dark:text-brand-100",
              toast.tone === "warning" &&
                "border-gold-200 text-gold-700 dark:border-gold-500/30 dark:text-gold-100",
              toast.tone === "danger" &&
                "border-red-200 text-red-900 dark:border-red-400/30 dark:text-red-100",
              (!toast.tone || toast.tone === "default") &&
                "border-gray-200 text-gray-950 dark:border-gray-800 dark:text-gray-50",
            )}
            onOpenChange={(open) => {
              if (!open) {
                dismiss(toast.id);
              }
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <ToastPrimitive.Title className="font-semibold tracking-normal">
                {toast.title}
              </ToastPrimitive.Title>
              <ToastPrimitive.Close className="rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500">
                <X className="h-4 w-4" aria-hidden="true" />
              </ToastPrimitive.Close>
            </div>
            {toast.description ? (
              <ToastPrimitive.Description className="text-gray-600 dark:text-gray-400">
                {toast.description}
              </ToastPrimitive.Description>
            ) : null}
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 grid w-[calc(100vw-2rem)] max-w-sm gap-2" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
