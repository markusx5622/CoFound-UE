"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "applications"),
      where("creatorId", "==", user.uid),
      where("status", "==", "pending")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.size);
    });
    
    return () => unsubscribe();
  }, [user]);

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

  const navLinks = [
    { href: "/dashboard", label: "Explorar" },
    { href: "/dashboard/mis-proyectos", label: "Mis Proyectos" },
    { href: "/dashboard/mis-postulaciones", label: "Mis Postulaciones" },
    { href: "/dashboard/mensajes", label: "Mensajes" },
    { href: "/dashboard/nuevo", label: "Nuevo Proyecto" },
    { href: "/perfil", label: "Mi Perfil" },
  ];

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
          <>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors relative">
                  {link.label}
                  {link.label === "Mis Proyectos" && pendingCount > 0 && (
                    <span className="absolute -top-2 -right-4 flex h-4 w-4 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-sm">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all duration-200 shadow-sm"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-zinc-300 hover:text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {user && isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 flex flex-col items-center py-4 gap-4 shadow-xl">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors w-full text-center py-2 relative flex justify-center items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
              {link.label === "Mis Proyectos" && pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-sm">
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="mt-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all duration-200 shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}
