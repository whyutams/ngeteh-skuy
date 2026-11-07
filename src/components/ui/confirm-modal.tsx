"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  icon?: ReactNode;
  confirmMatchValue?: string;
  confirmInputPlaceholder?: string;
}

// Modal dialog konfirmasi untuk aksi sensitif dan destruktif
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
  icon,
  confirmMatchValue,
  confirmInputPlaceholder,
}: ConfirmModalProps) {
  const [typedValue, setTypedValue] = useState("");

  // reset input saat modal dibuka atau ditutup
  useEffect(() => {
    if (isOpen) {
      setTypedValue("");
    }
  }, [isOpen]);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isMatchValid =
    !confirmMatchValue || typedValue.trim().toLowerCase() === confirmMatchValue.trim().toLowerCase();
  const isConfirmDisabled = isLoading || !isMatchValid;

  const confirmColors = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    primary: "bg-tea-700 hover:bg-tea-800 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* header modal: ikon dan judul sebaris */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full shrink-0 flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5 ${
                variant === "danger"
                  ? "bg-rose-50 text-rose-600"
                  : variant === "warning"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-tea-50 text-tea-700"
              }`}
            >
              {icon || <AlertTriangle className="h-5 w-5" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {title}
            </h3>
          </div>

          {/* deskripsi di bawah judul & ikon */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>

        {confirmMatchValue && (
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-medium text-slate-700">
              Ketik <span className="font-bold text-slate-900 select-all">&quot;{confirmMatchValue}&quot;</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={confirmInputPlaceholder || `Masukkan "${confirmMatchValue}"`}
              disabled={isLoading}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-lg py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${confirmColors[variant]}`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isLoading ? "Memproses..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

