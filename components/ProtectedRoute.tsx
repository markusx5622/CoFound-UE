"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Mail, LogOut, RefreshCw, CheckCircle2 } from "lucide-react";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!user || countdown > 0 || isSending) return;
    
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast.success("Correo de verificación reenviado. Revisa tu bandeja de entrada.");
      setCountdown(60);
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        toast.error("Has solicitado demasiados reenvíos. Por favor, espera un momento.");
        setCountdown(60);
      } else {
        toast.error("Error al enviar el correo. Inténtalo de nuevo más tarde.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      toast.error("Error al cerrar sesión.");
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-zinc-950 min-h-screen z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
      </div>
    );
  }

  if (!user) return null;

  if (!user.emailVerified) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative z-50">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E60000] to-transparent"></div>
          
          <div className="w-16 h-16 bg-red-950/40 border border-red-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-[#E60000]" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Verifica tu correo
          </h2>
          
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Hemos enviado un enlace de verificación a <span className="text-white font-medium">{user.email}</span>. 
            Debes confirmar tu identidad para acceder a la plataforma.
          </p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 text-left flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-500/90">
              Si acabas de verificarlo, recarga la página. Si no encuentras el correo, revisa tu carpeta de Spam o Correo no deseado.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_25px_rgba(230,0,0,0.4)]"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Ya lo he verificado</span>
            </button>
            
            <button
              onClick={handleResendEmail}
              disabled={countdown > 0 || isSending}
              className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:text-zinc-500 active:scale-[0.98] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-zinc-700 disabled:border-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 ${isSending ? 'animate-spin' : ''}`} />
              <span>
                {countdown > 0 ? `Reenviar correo en ${countdown}s` : 'Reenviar correo de verificación'}
              </span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-4"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full relative z-10">
      {children}
    </div>
  );
}
