import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
              isSuccess
                ? "bg-emerald-950/95 border-emerald-700/60 text-white"
                : isError
                ? "bg-rose-950/95 border-rose-700/60 text-white"
                : "bg-slate-900/95 border-slate-700 text-white"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="text-emerald-400" size={18} />}
              {isError && <AlertCircle className="text-rose-400" size={18} />}
              {!isSuccess && !isError && <Info className="text-brand-400" size={18} />}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs leading-snug">{t.title}</h5>
              {t.description && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed whitespace-pre-line">
                  {t.description}
                </p>
              )}
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
