"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface AlertBannerProps {
  message?: string | null;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

// komponen banner notifikasi aksi crud
export function AlertBanner({
  message,
  type = "success",
  onClose,
  autoClose = true,
  duration = 6000,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(Boolean(message));

  useEffect(() => {
    setIsVisible(Boolean(message));

    if (message && autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, autoClose, duration, onClose]);

  if (!isVisible || !message) {
    return null;
  }

  const styles = {
    success: {
      wrapper: "bg-emerald-50 border-emerald-200 text-emerald-800",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
      closeBtn: "text-emerald-500 hover:text-emerald-800 hover:bg-emerald-100/70",
    },
    error: {
      wrapper: "bg-rose-50 border-rose-200 text-rose-800",
      icon: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
      closeBtn: "text-rose-500 hover:text-rose-800 hover:bg-rose-100/70",
    },
    info: {
      wrapper: "bg-sky-50 border-sky-200 text-sky-800",
      icon: <Info className="h-5 w-5 text-sky-600 shrink-0" />,
      closeBtn: "text-sky-500 hover:text-sky-800 hover:bg-sky-100/70",
    },
  }[type];

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 p-4 rounded-xl border text-sm font-medium transition-all shadow-xs ${styles.wrapper}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {styles.icon}
        <span className="truncate">{message}</span>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${styles.closeBtn}`}
        aria-label="Tutup pemberitahuan"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

