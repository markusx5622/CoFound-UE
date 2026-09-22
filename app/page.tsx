"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import HeroSection from "@/components/hero-section";
import CampusFeedPreview from "@/components/campus-feed-preview";
import FeaturesSection from "@/components/features-section";
import HowItWorks from "@/components/how-it-works";
import VisionSection from "@/components/vision-section";
import Footer from "@/components/footer";
import { getFriendlyErrorMessage } from "@/lib/auth-errors";

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const domainCheck = email.endsWith("@live.uem.es") || email.endsWith("@universidadeuropea.es");
    return domainCheck;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const normalizedEmail = email.toLowerCase().trim();

    if (!validateEmail(normalizedEmail)) {
      setError("Acceso restringido. Utiliza tu correo institucional de la Universidad Europea.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await sendEmailVerification(userCredential.user);
        toast.success("Cuenta creada. Para poder acceder al Dashboard, debes verificar tu cuenta haciendo clic en el enlace que hemos enviado a tu correo institucional.", { duration: 8000 });
      }
    } catch (err: any) {
      const friendlyMessage = getFriendlyErrorMessage(err?.code || "");
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail) {
      setError("Por favor, introduce tu correo institucional.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setError("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
    } catch (err: any) {
      const friendlyMessage = getFriendlyErrorMessage(err?.code || "");
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative">
      {/* Sección Hero + Formulario */}
      <div id="join" className="relative z-10 flex flex-col justify-center min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Glows de ambientación traseros */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#E60000] rounded-full blur-[150px] opacity-15"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-white rounded-full blur-[150px] opacity-5"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 flex-grow">
          {/* Hero Content */}
          <HeroSection />

          {/* Formulario de Auth Estilo App Social */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-zinc-900/90 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden border border-zinc-800/90 transition-all duration-300">
              {/* Subtle top accent gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E60000] to-transparent"></div>
              
              {currentUser ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-red-950/60 border border-[#E60000]/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#E60000] shadow-inner">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    ¡Sesión Iniciada!
                  </h2>
                  <p className="text-zinc-400 mb-8 text-sm">
                    Estás conectado con tu cuenta de la Universidad Europea.
                  </p>
                  <Link
                    href="/dashboard"
                    className="w-full bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_25px_rgba(230,0,0,0.4)] cursor-pointer"
                  >
                    <span>Entrar al Dashboard de Proyectos</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              ) : isResetPassword ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Recuperar Contraseña
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm">
                      Te enviaremos un correo institucional para que puedas restablecerla.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Correo Institucional</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#E60000] transition-colors duration-200">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3.5 py-3 border border-zinc-800 bg-zinc-950 rounded-xl focus:ring-2 focus:ring-[#E60000]/25 focus:border-[#E60000] outline-none transition-all duration-200 text-white text-sm placeholder:text-zinc-600 shadow-inner"
                          placeholder="estudiante@live.uem.es"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-950/40 text-red-300 text-xs rounded-xl flex items-start gap-2 border border-red-900/50">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#E60000]" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_20px_rgba(230,0,0,0.35)] disabled:opacity-70 text-sm cursor-pointer"
                    >
                      {loading ? "Enviando..." : "Enviar Correo de Recuperación"}
                      {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetPassword(false);
                        setError("");
                      }}
                      className="text-xs text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer"
                    >
                      Volver a iniciar sesión
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Top Campus Tag */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/50 border border-red-800/40 text-[11px] font-semibold text-red-300 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E60000] animate-pulse" />
                      <span>Campus Turia • Registro Oficial</span>
                    </div>
                  </div>

                  {/* Switch Tab (Iniciar Sesión / Crear Cuenta) */}
                  <div className="flex rounded-xl bg-zinc-950 p-1 mb-6 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setError("");
                      }}
                      className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                        isLogin ? "bg-[#E60000] text-white shadow-md" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setError("");
                      }}
                      className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                        !isLogin ? "bg-[#E60000] text-white shadow-md" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Crear Cuenta
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Correo Institucional UE
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#E60000] transition-colors duration-200">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3.5 py-3 border border-zinc-800 bg-zinc-950 rounded-xl focus:ring-2 focus:ring-[#E60000]/25 focus:border-[#E60000] outline-none transition-all duration-200 text-white text-sm placeholder:text-zinc-600 shadow-inner"
                          placeholder="ej: estudiante@live.uem.es"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Contraseña
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#E60000] transition-colors duration-200">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-3.5 py-3 border border-zinc-800 bg-zinc-950 rounded-xl focus:ring-2 focus:ring-[#E60000]/25 focus:border-[#E60000] outline-none transition-all duration-200 text-white text-sm placeholder:text-zinc-600 shadow-inner"
                          placeholder="••••••••"
                        />
                      </div>
                      {isLogin && (
                        <div className="text-right mt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setIsResetPassword(true);
                              setError("");
                            }}
                            className="text-xs text-zinc-400 hover:text-[#E60000] transition-colors cursor-pointer"
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="p-3 bg-red-950/40 text-red-300 text-xs rounded-xl flex items-start gap-2 border border-red-900/50">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#E60000]" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_25px_rgba(230,0,0,0.4)] disabled:opacity-70 text-sm mt-2 cursor-pointer"
                    >
                      {loading
                        ? "Procesando..."
                        : isLogin
                        ? "Entrar a CoFound UE"
                        : "Crear mi Cuenta de Estudiante"}
                      {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </form>

                  {/* Trust guarantees footer */}
                  <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>Verificación automática para @live.uem.es</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>Acceso libre para alumnos del Campus Turia</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Adicional con Scroll */}
      <div className="relative z-10">
        {/* Showcase de Sinergias Multidisciplinares */}
        <CampusFeedPreview
          onSelectProject={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
            if (emailInput) {
              emailInput.focus();
            }
          }}
        />

        <FeaturesSection />
        <HowItWorks />
        <VisionSection />

        {/* CTA Final */}
        <section className="py-24 border-t border-zinc-900 text-center bg-transparent relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#E60000] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h3 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
              ¿Listo para encontrar a tu <span className="text-[#E60000]">Co-Founder</span>?
            </h3>
            <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-base leading-relaxed">
              Regístrate hoy mismo de forma gratuita y empieza a conectar con el mejor talento de la Universidad Europea en el Campus Turia.
            </p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                if (emailInput) emailInput.focus();
              }}
              className="bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-[0_0_30px_rgba(230,0,0,0.45)] inline-flex items-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              <span>Comenzar Ahora en Campus Turia</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
}
