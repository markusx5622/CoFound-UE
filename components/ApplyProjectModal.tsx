"use client";

import { useEffect, useState } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ApplyProjectModalProps {
  isOpen: boolean;
  projectTitle: string;
  profiles: string[];
  submitting: boolean;
  onClose: () => void;
  onConfirm: (payload: { selectedProfile: string; note: string }) => void;
}

export default function ApplyProjectModal({
  isOpen,
  projectTitle,
  profiles,
  submitting,
  onClose,
  onConfirm,
}: ApplyProjectModalProps) {
  const { t } = useLanguage();
  const [selectedProfile, setSelectedProfile] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProfile("");
    setNote("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    onConfirm({ selectedProfile, note: note.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!submitting) onClose();
        }}
        aria-hidden="true"
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E60000] to-transparent" />

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label={t("projectDetail.applyModalCancel")}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 id="apply-modal-title" className="text-xl font-bold text-white mb-1 pr-6">
          {t("projectDetail.applyModalTitle")}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mb-6 line-clamp-2">{projectTitle}</p>

        {profiles.length > 0 && (
          <div className="mb-5">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5">
              {t("projectDetail.applyModalRoleLabel")}
            </label>
            <div className="flex flex-wrap gap-2">
              {profiles.map((profile) => {
                const isSelected = selectedProfile === profile;
                return (
                  <button
                    key={profile}
                    type="button"
                    disabled={submitting}
                    onClick={() => setSelectedProfile(isSelected ? "" : profile)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-[#E60000] text-white border-[#E60000] shadow-sm"
                        : "bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {profile}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-5">
          <label
            htmlFor="apply-intro-note"
            className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2"
          >
            {t("projectDetail.applyModalNoteLabel")}
          </label>
          <textarea
            id="apply-intro-note"
            rows={4}
            maxLength={600}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={submitting}
            placeholder={t("projectDetail.applyModalNotePlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-950 text-white text-sm focus:ring-2 focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-all resize-none placeholder:text-zinc-600"
          />
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
              <MessageSquare className="h-3 w-3 shrink-0" />
              {t("projectDetail.applyModalNoteHint")}
            </span>
            <span className="text-xs text-zinc-500 shrink-0">{note.length}/600</span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
          >
            {t("projectDetail.applyModalCancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[#E60000] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
          >
            {submitting ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{t("projectDetail.applyModalSubmit")}</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
