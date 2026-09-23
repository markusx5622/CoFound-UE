"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  X, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Download, 
  MoreVertical, 
  Sparkles,
  Zap,
  Maximize2
} from "lucide-react";

export default function PwaInstallPrompt() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ios" | "android">("ios");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Comprobar si ya está instalada en modo standalone
    const checkStandalone = () => {
      const isStandaloneMode = 
        (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    if (checkStandalone()) {
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

    // 4. Permitir abrir el modal manualmente desde cualquier lugar con un evento personalizado
    const handleOpenModal = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-pwa-install-modal", handleOpenModal);

    // 5. Mostrar automáticamente solo cuando el usuario ya esté DENTRO de la app (ej. /dashboard o /perfil),
    // NUNCA en la landing page ni páginas públicas, y tras 3.5 segundos de haber entrado.
    const isInsideApp = pathname.startsWith("/dashboard") || pathname.startsWith("/perfil");
    const hasDismissed = localStorage.getItem("cofoundue_pwa_dismissed");

    if (isInsideApp && user && user.emailVerified && !hasDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500); // 3.5 segundos tras entrar propiamente a la app

      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("open-pwa-install-modal", handleOpenModal);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("open-pwa-install-modal", handleOpenModal);
    };
  }, [user, pathname]);

  // Si ya está ejecutándose como PWA instalada, no renderizamos
  if (isStandalone || !isOpen) return null;

  const handleDismissPermanent = () => {
    localStorage.setItem("cofoundue_pwa_dismissed", "true");
    setIsOpen(false);
  };

  const handleDismissLater = () => {
    setIsOpen(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("cofoundue_pwa_dismissed", "true");
      setIsOpen(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in">
      {/* Click outside to close (recordar más tarde) */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={handleDismissLater}
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
                Instala CoFound UE en tu móvil
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-none">
                Acceso rápido en 1 toque y pantalla completa
              </p>
            </div>
          </div>
          <button
            onClick={handleDismissLater}
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
                1. Toca <strong className="text-white">Compartir</strong> en la barra inferior de Safari.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <PlusSquare className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                2. Elige <strong className="text-white">&quot;Añadir a pantalla de inicio&quot;</strong> (+).
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/30 text-[#E60000] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                3. Pulsa <strong className="text-white">&quot;Añadir&quot;</strong> arriba a la derecha.
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
                  <span>Instalar aplicación directamente</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <MoreVertical className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                1. Toca los <strong className="text-white">tres puntos (⋮)</strong> en Chrome.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Download className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                2. Selecciona <strong className="text-white">&quot;Instalar aplicación&quot;</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/30 text-[#E60000] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-zinc-300">
                3. Confirma la instalación en tu teléfono.
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
            ¡Entendido, ya la tengo!
          </button>
          <button
            onClick={handleDismissLater}
            className="py-2 px-3 text-xs text-zinc-400 hover:text-zinc-200 transition-colors text-center"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
