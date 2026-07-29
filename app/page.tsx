"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import ParticleBackground from "@/components/particle-background";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import HowItWorks from "@/components/how-it-works";
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
        toast.success("Cuenta creada. Por favor revisa tu correo institucional para verificar tu cuenta.");
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

        <div className="max-w-7xl mx-auto px-6 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 flex-grow">
          {/* Hero */}
          <HeroSection />

          {/* Formulario de Auth */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-2xl relative overflow-hidden border border-zinc-200">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#E60000]"></div>
              
              {currentUser ? (
                <div className="text-center py-6">
                  <h2 className="text-3xl font-bold text-black mb-3">
                    ¡Hola de nuevo!
                  </h2>
                  <p className="text-gray-500 mb-8 text-sm">
                    Has iniciado sesión con tu cuenta institucional de la universidad.
                  </p>
                  <Link
                    href="/dashboard"
                    className="w-full bg-[#E60000] hover:bg-red-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    Ir al Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              ) : isResetPassword ? (
                <>
                  <h2 className="text-3xl font-bold text-black mb-2">
                    Recuperar Contraseña
                  </h2>
                  <p className="text-gray-500 mb-8 text-sm">
                    Te enviaremos un correo para que puedas restablecerla.
                  </p>

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Institucional</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-colors text-black"
                          placeholder="estudiante@live.uem.es"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-[#E60000] text-sm rounded-xl flex items-start gap-2 border border-red-100">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E60000] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                      {loading ? "Enviando..." : "Enviar Correo"}
                      {!loading && <ArrowRight className="h-5 w-5" />}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetPassword(false);
                        setError("");
                      }}
                      className="text-sm text-gray-600 hover:text-black font-medium transition-colors"
                    >
                      Volver a iniciar sesión
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-black mb-2">
                    {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                  </h2>
                  <p className="text-gray-500 mb-8 text-sm">
                    Usa tu correo @live.uem.es o @universidadeuropea.es
                  </p>

                  <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Institucional</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-colors text-black"
                          placeholder="estudiante@live.uem.es"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#E60000] focus:border-[#E60000] outline-none transition-colors text-black"
                          placeholder="••••••••"
                        />
                      </div>
                      {isLogin && (
                        <div className="text-right mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsResetPassword(true);
                              setError("");
                            }}
                            className="text-xs text-[#E60000] hover:underline"
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-[#E60000] text-sm rounded-xl flex items-start gap-2 border border-red-100">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#E60000] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                      {loading ? "Procesando..." : (isLogin ? "Entrar" : "Registrarse")}
                      {!loading && <ArrowRight className="h-5 w-5" />}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError("");
                      }}
                      className="text-sm text-gray-600 hover:text-black font-medium transition-colors"
                    >
                      {isLogin ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Adicional con Scroll */}
      <div className="relative z-10">
        <FeaturesSection />
        <HowItWorks />

        {/* CTA Final */}
        <section className="py-24 border-t border-zinc-900 text-center bg-transparent relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#E60000] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h3 className="text-3xl lg:text-5xl font-extrabold text-white mb-6">
              ¿Listo para encontrar a tu <span className="text-[#E60000]">Co-Founder</span>?
            </h3>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 text-base leading-relaxed">
              Regístrate hoy mismo de forma gratuita y empieza a conectar con el mejor talento de la Universidad Europea.
            </p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                if (emailInput) emailInput.focus();
              }}
              className="bg-[#E60000] hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              Comenzar Ahora
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
}
