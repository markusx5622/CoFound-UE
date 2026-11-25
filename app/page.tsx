"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, ChevronDown, Sparkles, Eye, EyeOff } from "lucide-react";
import HeroSection from "@/components/hero-section";
import CampusFeedPreview from "@/components/campus-feed-preview";
import HowItWorks from "@/components/how-it-works";
import StudentFaq from "@/components/student-faq";
import Footer from "@/components/footer";
import LanguageSelector from "@/components/LanguageSelector";
import { getAuthErrorKey } from "@/lib/auth-errors";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser || currentUser.emailVerified) return;

    const checkVerificationOnFocus = async () => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      try {
        await currentUser.reload();
        if (auth.currentUser?.emailVerified) {
          await auth.currentUser.getIdToken(true);
          router.push("/dashboard");
        }
      } catch {
        // Ignorar errores silenciosos en autofoco
      }
    };

    window.addEventListener("focus", checkVerificationOnFocus);
    document.addEventListener("visibilitychange", checkVerificationOnFocus);
    return () => {
      window.removeEventListener("focus", checkVerificationOnFocus);
      document.removeEventListener("visibilitychange", checkVerificationOnFocus);
    };
  }, [currentUser, router]);

  const handleCheckVerifiedLanding = async () => {
    if (!currentUser || checkingVerification) return;
    setCheckingVerification(true);
    try {
      await currentUser.reload();
      if (auth.currentUser?.emailVerified) {
        await auth.currentUser.getIdToken(true);
        router.push("/dashboard");
      } else {
        toast.error(t("protectedRoute.notYetVerified"));
      }
    } catch {
      window.location.reload();
    } finally {
      setCheckingVerification(false);
    }
  };

  const validateEmail = (email: string) => {
    const domainCheck = email.endsWith("@live.uem.es") || email.endsWith("@universidadeuropea.es");
    return domainCheck;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const normalizedEmail = email.toLowerCase().trim();

    if (!validateEmail(normalizedEmail)) {
      setError(t("landing.auth.restrictedEmail"));
      return;
    }

    if (!isLogin) {
      if (password.length < 8) {
        setError(t("auth.errors.weakPassword"));
        return;
      }
      if (!acceptedPrivacy) {
        setError(t("landing.auth.acceptLegalRequired"));
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        await userCredential.user.reload();
        if (userCredential.user.emailVerified) {
          await userCredential.user.getIdToken(true);
          router.push("/dashboard");
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        auth.languageCode = language;
        await sendEmailVerification(userCredential.user);
        toast.success(t("landing.auth.accountCreated"), { duration: 8000 });
      }
    } catch (err: any) {
      const errorKey = getAuthErrorKey(err?.code || "");
      setError(t(errorKey));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail) {
      setError(t("landing.auth.enterInstitutionalEmail"));
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError(t("landing.auth.restrictedEmail"));
      return;
    }

    setLoading(true);
    try {
      auth.languageCode = language;
      await sendPasswordResetEmail(auth, normalizedEmail);
      setError(t("landing.auth.recoveryEmailSent"));
    } catch (err: any) {
      const errorKey = getAuthErrorKey(err?.code || "");
      setError(t(errorKey));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative">
      {/* Sección Hero + Formulario */}
      <div id="join" className="relative z-10 flex flex-col justify-center min-h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Language Selector Flotante */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
          <LanguageSelector />
        </div>

        {/* Glows de ambientación traseros */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#E60000] rounded-full blur-[150px] opacity-15"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-white rounded-full blur-[150px] opacity-5"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-4 md:py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center relative z-10 flex-grow">
          {/* Hero Content */}
          <HeroSection />

          {/* Formulario de Auth Estilo App Social */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-zinc-900/90 backdrop-blur-2xl p-5 sm:p-8 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden border border-zinc-800/90 transition-all duration-300">
              {/* Subtle top accent gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E60000] to-transparent"></div>
              
              {currentUser ? (
                currentUser.emailVerified ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-red-950/60 border border-[#E60000]/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#E60000] shadow-inner">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {t("landing.auth.sessionStarted")}
                    </h2>
                    <p className="text-zinc-400 mb-8 text-sm">
                      {t("landing.auth.connectedWithEmail")}
                    </p>
                    <Link
                      href="/dashboard"
                      className="w-full bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_25px_rgba(230,0,0,0.4)] cursor-pointer"
                    >
                      <span>{t("landing.auth.enterDashboard")}</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-7 w-7 text-[#E60000]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {t("landing.auth.verifyEmailTitle")}
                    </h2>
                    <p className="text-zinc-400 mb-6 text-sm">
                      {t("landing.auth.verifyEmailDesc", { email: currentUser.email || "" })}
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={handleCheckVerifiedLanding}
                        disabled={checkingVerification}
                        className="w-full bg-[#E60000] hover:bg-red-700 disabled:opacity-70 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_25px_rgba(230,0,0,0.4)]"
                      >
                        <CheckCircle2 className={`h-5 w-5 ${checkingVerification ? "animate-pulse" : ""}`} />
                        <span>{t("landing.auth.alreadyVerified")}</span>
                      </button>
                      
                      <button
                        onClick={async () => {
                          const { signOut } = await import("firebase/auth");
                          await signOut(auth);
                        }}
                        className="w-full bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {t("landing.auth.logout")}
                      </button>
                    </div>
                  </div>
                )
              ) : isResetPassword ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {t("landing.auth.recoverPasswordTitle")}
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm">
                      {t("landing.auth.recoverPasswordDesc")}
                    </p>
                  </div>

                    <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">{t("landing.auth.institutionalEmailLabel")}</label>
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
                      {loading ? t("landing.auth.sending") : t("landing.auth.sendRecoveryEmail")}
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
                      {t("landing.auth.backToLogin")}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Top Campus Tag */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/50 border border-red-800/40 text-[11px] font-semibold text-red-300 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E60000] animate-pulse" />
                      <span>{t("landing.auth.campusTag")}</span>
                    </div>
                  </div>

                  {/* Switch Tab (Iniciar Sesión / Crear Cuenta) */}
                  <div className="flex rounded-xl bg-zinc-950 p-1 mb-6 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setShowPassword(false);
                        setError("");
                      }}
                      className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                        isLogin ? "bg-[#E60000] text-white shadow-md" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {t("landing.auth.loginTab")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setShowPassword(false);
                        setAcceptedPrivacy(false);
                        setError("");
                      }}
                      className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                        !isLogin ? "bg-[#E60000] text-white shadow-md" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {t("landing.auth.createAccountTab")}
                    </button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        {t("landing.auth.institutionalEmailLabel")}
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="auth-password" className="block text-xs font-semibold text-zinc-300">
                          {t("landing.auth.passwordLabel")}
                        </label>
                        {!isLogin && (
                          <span className="text-[11px] text-zinc-500">
                            {t("landing.auth.passwordMinHint")}
                          </span>
                        )}
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#E60000] transition-colors duration-200">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          id="auth-password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={isLogin ? undefined : 8}
                          autoComplete={isLogin ? "current-password" : "new-password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-11 py-3 border border-zinc-800 bg-zinc-950 rounded-xl focus:ring-2 focus:ring-[#E60000]/25 focus:border-[#E60000] outline-none transition-all duration-200 text-white text-sm placeholder:text-zinc-600 shadow-inner"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? t("landing.auth.hidePassword") : t("landing.auth.showPassword")}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
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
                            {t("landing.auth.forgotPassword")}
                          </button>
                        </div>
                      )}
                    </div>

                    {!isLogin && (
                      <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer select-none pt-1">
                        <input
                          type="checkbox"
                          checked={acceptedPrivacy}
                          onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-950 accent-[#E60000] shrink-0 cursor-pointer"
                        />
                        <span className="leading-relaxed">
                          {t("landing.auth.acceptLegalPrefix")}
                          <Link href="/legal/privacidad" target="_blank" className="text-zinc-200 hover:text-[#E60000] underline transition-colors">
                            {t("landing.auth.acceptLegalPrivacy")}
                          </Link>
                          {t("landing.auth.acceptLegalAnd")}
                          <Link href="/legal/aviso-legal" target="_blank" className="text-zinc-200 hover:text-[#E60000] underline transition-colors">
                            {t("landing.auth.acceptLegalNotice")}
                          </Link>.
                        </span>
                      </label>
                    )}

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
                        ? t("landing.auth.processing")
                        : isLogin
                        ? t("landing.auth.enterApp")
                        : t("landing.auth.createStudentAccount")}
                      {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </form>

                  {/* Trust guarantees footer */}
                  <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>{t("landing.auth.verificationGuarantee")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>{t("landing.auth.campusGuarantee")}</span>
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
        {/* Sección de Cómo Funciona (Rápida visualización de onboarding) */}
        <HowItWorks />

        {/* Mobile "Saber más" Toggle con alta reactividad táctil */}
        <div className="md:hidden flex justify-center py-6 px-4">
          <button
            onClick={() => setShowMore(!showMore)}
            className="group relative flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-900/95 hover:bg-zinc-850 active:scale-[0.97] transition-all duration-200 border border-zinc-800 hover:border-red-500/40 shadow-lg shadow-black/60 hover:shadow-[0_0_25px_rgba(230,0,0,0.18)] cursor-pointer w-full max-w-xs backdrop-blur-md"
            aria-expanded={showMore}
          >
            <div className="flex items-center gap-3 text-left">
              {/* Micro-baliza de actividad viva */}
              {!showMore ? (
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E60000]"></span>
                </span>
              ) : (
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-600 shrink-0"></span>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200 group-hover:text-white transition-colors">
                  {showMore ? t("landing.showMore.hideTitle") : t("landing.showMore.showTitle")}
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  {showMore ? t("landing.showMore.hideSubtitle") : t("landing.showMore.showSubtitle")}
                </span>
              </div>
            </div>

            {/* Chevron interactivo con micro-rebote al hover */}
            <div className={`w-7 h-7 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-red-500/40 transition-all duration-300 shrink-0 ${showMore ? "rotate-180 bg-zinc-800 text-white" : "group-hover:translate-y-0.5"}`}>
              <ChevronDown className="w-4 h-4 transition-transform duration-300" />
            </div>
          </button>
        </div>

        {/* Marketing Sections */}
        <div className={`${showMore ? "block" : "hidden"} md:block`}>
          {/* Showcase de Sinergias Multidisciplinares (Ejemplos densos de proyectos) */}
          <CampusFeedPreview
            onSelectProject={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
              if (emailInput) {
                emailInput.focus();
              }
            }}
          />
          
          {/* Preguntas frecuentes y resolución de objeciones para estudiantes */}
          <StudentFaq />
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
