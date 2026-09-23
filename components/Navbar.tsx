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

function getTimestampMillis(ts: any): number {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  if (ts instanceof Date) return ts.getTime();
  return 0;
}

function hasUnreadMessages(
  app: {
    creatorId: string;
    applicantId: string;
    lastMessageAt?: any;
    lastMessageSenderId?: string;
    lastReadByApplicant?: any;
    lastReadByCreator?: any;
  },
  userId: string
): boolean {
  if (!app.lastMessageAt || !app.lastMessageSenderId) return false;
  if (app.lastMessageSenderId === userId) return false;

  const isCreator = app.creatorId === userId;
  const lastRead = isCreator ? app.lastReadByCreator : app.lastReadByApplicant;

  if (!lastRead) return true;

  return getTimestampMillis(app.lastMessageAt) > getTimestampMillis(lastRead);
}

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

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

  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      return;
    }

    const qApplicant = query(
      collection(db, "applications"),
      where("applicantId", "==", user.uid)
    );
    const qCreator = query(
      collection(db, "applications"),
      where("creatorId", "==", user.uid)
    );

    let applicantApps: any[] = [];
    let creatorApps: any[] = [];

    const calculateUnread = () => {
      const allAppsMap = new Map<string, any>();
      applicantApps.forEach(doc => allAppsMap.set(doc.id, doc));
      creatorApps.forEach(doc => allAppsMap.set(doc.id, doc));

      let count = 0;
      allAppsMap.forEach(app => {
        if (hasUnreadMessages(app, user.uid)) {
          count++;
        }
      });
      setUnreadMessagesCount(count);
    };

    const unsubApp = onSnapshot(qApplicant, (snapshot) => {
      applicantApps = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      calculateUnread();
    });

    const unsubCreator = onSnapshot(qCreator, (snapshot) => {
      creatorApps = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      calculateUnread();
    });

    return () => {
      unsubApp();
      unsubCreator();
    };
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
            <div className="hidden md:flex items-center gap-2 lg:gap-2.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`text-xs lg:text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-200 border relative flex items-center shadow-sm select-none ${
                      isActive
                        ? "bg-zinc-800 text-white border-zinc-700 shadow-inner"
                        : "bg-zinc-900/60 text-zinc-300 hover:text-white hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.label === "Mis Proyectos" && pendingCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-md">
                        {pendingCount}
                      </span>
                    )}
                    {link.label === "Mensajes" && unreadMessagesCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-md">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-3.5 py-2 rounded-xl text-xs lg:text-sm font-medium hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all duration-200 shadow-sm ml-1"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-zinc-300 hover:text-white p-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {user && isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 flex flex-col items-center py-5 px-4 gap-2.5 shadow-2xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-sm font-medium transition-all w-full text-center py-2.5 px-4 rounded-xl border relative flex justify-between items-center shadow-sm ${
                  isActive
                    ? "bg-zinc-800 text-white border-zinc-700"
                    : "bg-zinc-900/70 text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{link.label}</span>
                <div className="flex items-center gap-1.5">
                  {link.label === "Mis Proyectos" && pendingCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-sm">
                      {pendingCount}
                    </span>
                  )}
                  {link.label === "Mensajes" && unreadMessagesCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-sm">
                      {unreadMessagesCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              window.dispatchEvent(new CustomEvent("open-pwa-install-modal"));
            }}
            className="text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 border border-zinc-800 hover:border-red-500/40 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <span>📱</span>
            <span>Instalar App en tu móvil</span>
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="mt-1 bg-zinc-900 border border-zinc-800 text-zinc-300 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all duration-200 shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}
