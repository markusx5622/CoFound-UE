"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!loading) onCancel();
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E60000] to-transparent" />

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label={cancelLabel}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-900/50 flex items-center justify-center text-[#E60000] mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h2 id="confirm-modal-title" className="text-xl font-bold text-white mb-2 pr-6">
          {title}
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6">{description}</p>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-[#E60000] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
