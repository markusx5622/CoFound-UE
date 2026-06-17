"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const validateEmail = (email: string) => {
    return email.endsWith("@live.uem.es") || email.endsWith("@universidadeuropea.es");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateEmail(email)) {
      setError("Acceso restringido. Utiliza tu correo institucional de la Universidad Europea.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Redirect happens in useEffect
    } catch (err: any) {
      setError(err.message || "Error en la autenticación. Por favor revisa tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E60000] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-white rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Hero Section */}
        <div className="space-y-8">
          <Image 
            src="/CoFoundUE_logo.png" 
            alt="CoFound UE Square Logo" 
            width={160} 
            height={160} 
            className="rounded-3xl shadow-2xl mb-8 animate-float hover:scale-105 hover:rotate-1 hover:shadow-[0_0_50px_rgba(230,0,0,0.5)] cursor-pointer transition-all duration-500 ease-out"
            priority
          />
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Encuentra a tu <br />
            <span className="text-[#E60000]">Co-Founder</span> <br />
            en el Campus.
          </h1>
          <p className="text-xl text-gray-300 max-w-xl leading-relaxed">
            La red exclusiva para conectar talento de ADE, Marketing, Tech y Diseño de la Universidad Europea.
          </p>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Comunidad Activa
            </span>
            <span className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-[#E60000]"></span>
              Solo UE
            </span>
          </div>
        </div>

        {/* Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#E60000]"></div>
            
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
          </div>
        </div>

      </div>
    </div>
  );
}
