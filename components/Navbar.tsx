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

  if (pathname === "/") {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center">
          <Image 
            src="/CoFoundUE_banner.png" 
            alt="CoFound UE Logo" 
            width={200} 
            height={50} 
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
        
        {user && (
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-[#E60000] transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/nuevo" className="text-sm font-medium hover:text-[#E60000] transition-colors">
              Nuevo Proyecto
            </Link>
            <Link href="/perfil" className="text-sm font-medium hover:text-[#E60000] transition-colors">
              Mi Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
