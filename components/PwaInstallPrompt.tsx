"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  X, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Download, 
  MoreVertical
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const DISMISSED_KEY = "cofoundue_pwa_prompt_dismissed";
const LEGACY_DISMISSED_KEY = "cofoundue_pwa_dismissed";
const INSTALLED_KEY = "cofoundue_pwa_installed";
const SESSION_SHOWN_KEY = "cofoundue_pwa_session_shown";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    (window.navigator as any).standalone === true ||
    localStorage.getItem(INSTALLED_KEY) === "true"
  );
}

function isDismissedWithin30Days(): boolean {
  if (typeof window === "undefined") return false;
  const dismissed = localStorage.getItem(DISMISSED_KEY) || localStorage.getItem(LEGACY_DISMISSED_KEY);
  if (!dismissed) return false;
  const ts = Number(dismissed);
  if (isNaN(ts)) return true; // Si es el valor legado "true", se respeta como descartado
  return Date.now() - ts < THIRTY_DAYS_MS;
}

function isShownInCurrentSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_SHOWN_KEY) === "true";
}

export default function PwaInstallPrompt() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ios" | "android">("ios");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 1. Comprobar si ya está instalada en modo standalone o marcada como instalada
    if (isStandaloneMode()) {
      setIsStandalone(true);
      return;
    }

    // 2. Detectar Sistema Operativo
    const userAgent = window.navigator.userAgent || "";
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/i.test(userAgent);

    if (isIOSDevice) {
      setActiveTab("ios");
    } else if (isAndroidDevice) {
      setActiveTab("android");
    }

    // 3. Capturar evento de instalación nativa en navegadores compatibles (Android / Chromium)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Capturar evento appinstalled para marcar permanentemente
    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "true");
      setIsStandalone(true);
      setIsOpen(false);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // 5. Permitir abrir el modal manualmente desde cualquier lugar con un evento personalizado
    const handleOpenModal = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-pwa-install-modal", handleOpenModal);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install-modal", handleOpenModal);
    };
  }, []);

  useEffect(() => {
    // Si ya está instalada, descartada hace menos de 30 días o mostrada en esta sesión -> no programar
    if (isStandaloneMode()) {
      setIsStandalone(true);
      return;
    }

    if (isDismissedWithin30Days() || isShownInCurrentSession()) {
      return;
    }

    const isInsideApp = pathname.startsWith("/dashboard") || pathname.startsWith("/perfil");

    if (isInsideApp && user && user.emailVerified) {
      // Si ya hay un timer corriendo (ej. navegación rápida entre /dashboard y /perfil), lo mantenemos
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          if (!isStandaloneMode() && !isDismissedWithin30Days() && !isShownInCurrentSession()) {
            sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
            setIsOpen(true);
          }
          timerRef.current = null;
        }, 3500);
      }
    } else if (!isInsideApp) {
      // Si el usuario sale de la app a una página pública antes de cumplirse el timer, lo cancelamos
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [user, pathname]);

  // Limpieza del timer al desmontar el componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Si ya está ejecutándose como PWA instalada, no renderizamos
  if (isStandalone || !isOpen) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
    setIsOpen(false);
  };

  const handleDismissPermanent = () => {
    localStorage.setItem(INSTALLED_KEY, "true");
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
    setIsOpen(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "true");
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
      sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
      setIsOpen(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in">
      {/* Click outside to close (recordar más tarde) */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Card Compacta y Coherente */}
      <div className="relative w-full max-w-sm sm:max-w-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.85)] z-10 overflow-hidden">
        {/* Subtle top accent gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E60000] to-transparent"></div>

        {/* Header compacto con icono y botón de cierre */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-[#E60000] shadow-inner shrink-0">
              <Smartphone className="w-4 h-4 text-[#E60000]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {t("pwaPrompt.title")}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-none">
                {t("pwaPrompt.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/80 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de SO (Tabs compactas) */}
        <div className="flex rounded-lg bg-zinc-950 p-1 border border-zinc-800/80 mb-3">
          <button
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ios"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>📱</span>
            <span>iPhone (Safari)</span>
          </button>
          <button
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "android"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>🤖</span>
            <span>Android (Chrome)</span>
          </button>
        </div>

        {/* Instrucciones compactas según SO */}
        {activeTab === "ios" ? (
          <div className="space-y-2 mb-4 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <Share className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                {t("pwaPrompt.iosStep1")}<strong className="text-white">{t("pwaPrompt.iosStep1Bold")}</strong>{t("pwaPrompt.iosStep1Suffix")}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <PlusSquare className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                {t("pwaPrompt.iosStep2")}<strong className="text-white">{t("pwaPrompt.iosStep2Bold")}</strong>{t("pwaPrompt.iosStep2Suffix")}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/30 text-[#E60000] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                {t("pwaPrompt.iosStep3")}<strong className="text-white">{t("pwaPrompt.iosStep3Bold")}</strong>{t("pwaPrompt.iosStep3Suffix")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 mb-4 bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/60">
            {deferredPrompt && (
              <div className="mb-2">
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t("pwaPrompt.androidDirectInstall")}</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <MoreVertical className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                {t("pwaPrompt.androidStep1")}<strong className="text-white">{t("pwaPrompt.androidStep1Bold")}</strong>{t("pwaPrompt.androidStep1Suffix")}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Download className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                {t("pwaPrompt.androidStep2")}<strong className="text-white">{t("pwaPrompt.androidStep2Bold")}</strong>{t("pwaPrompt.androidStep2Suffix")}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/30 text-[#E60000] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                {t("pwaPrompt.androidStep3")}
              </p>
            </div>
          </div>
        )}

        {/* Acciones Finales compactas */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDismissPermanent}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-semibold py-2 px-3 rounded-xl transition-all duration-200 text-xs text-center border border-zinc-700/60 shadow-sm"
          >
            {t("pwaPrompt.understoodBtn")}
          </button>
          <button
            onClick={handleDismiss}
            className="py-2 px-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors text-center"
          >
            {t("pwaPrompt.notNowBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
