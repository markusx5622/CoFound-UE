"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-zinc-950 min-h-screen z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60000]"></div>
      </div>
    );
  }

  return user ? (
    <div className="flex flex-col min-h-screen w-full relative z-10">
      {!user.emailVerified && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-3 text-center relative z-50">
          <p className="text-sm text-yellow-500 flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Por favor, verifica tu correo electrónico institucional. Es posible que algunas funciones estén limitadas hasta que lo hagas.
          </p>
        </div>
      )}
      {children}
    </div>
  ) : null;
}
