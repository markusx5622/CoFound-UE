"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { reportClientError } from "@/lib/error-logger";
import { useLanguage } from "@/context/LanguageContext";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    reportClientError("react_error_boundary", error);
  }, [error]);

  return (
    <div className="flex-grow flex items-center justify-center p-6 relative z-10 min-h-[calc(100vh-5rem)]">
      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E60000] to-transparent"></div>

        <div className="w-16 h-16 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-[#E60000]" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          {t("errorBoundary.title")}
        </h2>

        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          {t("errorBoundary.description")}
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t("errorBoundary.retryBtn")}</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Home className="h-4 w-4" />
            <span>{t("errorBoundary.homeBtn")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
