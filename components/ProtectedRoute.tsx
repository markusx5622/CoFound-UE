"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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

  return user ? <>{children}</> : null;
}
