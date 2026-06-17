"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (pathname === "/" || pathname.startsWith("/legal")) {
    return null;
  }

  return (
    <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden shadow-sm border border-zinc-800 hover:shadow-[0_0_15px_rgba(230,0,0,0.15)] hover:border-zinc-700 transition-all duration-300">
            <Image 
              src="/CoFoundUE_logo.png" 
              alt="CoFound UE Logo" 
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        </Link>
        
        {user && (
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/nuevo" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Nuevo Proyecto
            </Link>
            <Link href="/perfil" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Mi Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all duration-200 shadow-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
