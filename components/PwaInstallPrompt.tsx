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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in">
      {/* Click outside to close (recordar más tarde) */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={handleDismissLater}
        aria-hidden="true"
      />

      {/* Modal Card / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-10 max-h-[90vh] overflow-y-auto">
        {/* Subtle top accent gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E60000] to-transparent"></div>

        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header con botón de cierre */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-950/40 border border-red-500/30 flex items-center justify-center text-[#E60000] shadow-inner shrink-0">
              <Smartphone className="w-6 h-6 text-[#E60000]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[#E60000] text-[10px] font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Experiencia App Nativa (PWA)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                Instala CoFound UE en tu móvil
              </h3>
            </div>
          </div>
          <button
            onClick={handleDismissLater}
            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800/80 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-zinc-300 text-xs sm:text-sm mb-5 leading-relaxed">
          CoFound UE funciona como una aplicación nativa. Instálala en tu pantalla de inicio sin descargas de tiendas de apps.
        </p>

        {/* Ventajas PWA */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 mb-5">
          <div className="flex flex-col items-center text-center">
            <Zap className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[11px] font-medium text-zinc-200">1 Toque</span>
            <span className="text-[9px] text-zinc-400">Acceso directo</span>
          </div>
          <div className="flex flex-col items-center text-center border-x border-zinc-800/80 px-1">
            <Maximize2 className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[11px] font-medium text-zinc-200">Sin barras</span>
            <span className="text-[9px] text-zinc-400">Pantalla completa</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-[11px] font-medium text-zinc-200">Sin peso</span>
            <span className="text-[9px] text-zinc-400">0 MB en tu tienda</span>
          </div>
        </div>

        {/* Selector de SO (Tabs) */}
        <div className="flex rounded-xl bg-zinc-950/80 p-1 border border-zinc-800 mb-5">
          <button
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "ios"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>📱</span>
            <span>iPhone (iOS Safari)</span>
          </button>
          <button
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "android"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>🤖</span>
            <span>Android / Chrome</span>
          </button>
        </div>

        {/* Instrucciones según SO */}
        {activeTab === "ios" ? (
          <div className="space-y-3 mb-6 bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/60">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Share className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-200 font-semibold mb-0.5">1. Pulsa el botón Compartir</p>
                <p className="text-[11px] text-zinc-400">En la barra inferior de navegación de Safari (icono de cuadrado con flecha).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-200 font-semibold mb-0.5">2. Selecciona &quot;Añadir a pantalla de inicio&quot;</p>
                <p className="text-[11px] text-zinc-400">Baja en la lista de opciones de Safari hasta encontrar el icono de más (+).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-red-500/10 border border-red-500/30 text-[#E60000] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-200 font-semibold mb-0.5">3. Confirma pulsando &quot;Añadir&quot;</p>
                <p className="text-[11px] text-zinc-400">Arriba a la derecha. ¡El icono de CoFound UE aparecerá en tu móvil!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-6 bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/60">
            {deferredPrompt && (
              <div className="mb-3">
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 hover:shadow-[0_0_20px_rgba(230,0,0,0.35)] text-xs sm:text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar aplicación directamente (1 toque)</span>
                </button>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <MoreVertical className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-200 font-semibold mb-0.5">1. Abre el menú del navegador</p>
                <p className="text-[11px] text-zinc-400">Toca los tres puntos (⋮) en la esquina superior derecha de Google Chrome o Edge.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-200 font-semibold mb-0.5">2. Selecciona &quot;Instalar aplicación&quot;</p>
                <p className="text-[11px] text-zinc-400">O también &quot;Añadir a la pantalla principal&quot; en las opciones de Chrome.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-red-500/10 border border-red-500/30 text-[#E60000] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-200 font-semibold mb-0.5">3. Confirma la instalación</p>
                <p className="text-[11px] text-zinc-400">¡Listo! Se añadirá como app independiente en tu teléfono.</p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones Finales */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleDismissPermanent}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-xs sm:text-sm text-center border border-zinc-700/60 shadow-sm"
          >
            ¡Entendido, ya la tengo!
          </button>
          <button
            onClick={handleDismissLater}
            className="py-2.5 px-4 text-xs text-zinc-400 hover:text-zinc-200 transition-colors text-center"
          >
            Recordármelo más tarde
          </button>
        </div>
      </div>
    </div>
  );
}
