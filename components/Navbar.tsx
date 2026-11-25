"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

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
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

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


  if (pathname === "/" || pathname.startsWith("/legal")) {
    return null;
  }

  const navLinks = [
    { href: "/dashboard", label: t("navbar.explore") },
    { href: "/dashboard/mis-proyectos", label: t("navbar.myProjects") },
    { href: "/dashboard/mis-postulaciones", label: t("navbar.myApplications") },
    { href: "/dashboard/mensajes", label: t("navbar.messages") },
    { href: "/dashboard/nuevo", label: t("navbar.newProject") },
    { href: "/perfil", label: t("navbar.myProfile") },
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
                    className={`text-xs lg:text-sm font-medium px-3.5 py-2 rounded-xl transition-colors duration-200 border relative flex items-center shadow-sm select-none ${
                      isActive
                        ? "text-white border-zinc-700"
                        : "bg-zinc-900/60 text-zinc-300 hover:text-white hover:bg-zinc-800/80 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-pill"
                        transition={{ type: "spring", stiffness: 460, damping: 34 }}
                        className="absolute inset-0 bg-zinc-800 rounded-xl shadow-inner -z-0"
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                    {link.href === "/dashboard/mis-proyectos" && pendingCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 z-20 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-md">
                        {pendingCount}
                      </span>
                    )}
                    {link.href === "/dashboard/mensajes" && unreadMessagesCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 z-20 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-md">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              <div className="ml-1 flex items-center gap-1.5">
                {!isStandalone && (
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-pwa-install-modal"))}
                    title={t("navbar.installApp")}
                    aria-label={t("navbar.installApp")}
                    className="p-2 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white hover:bg-zinc-800/80 border border-zinc-800 hover:border-red-500/40 active:scale-[0.96] transition-all shadow-sm"
                  >
                    <Smartphone className="h-4 w-4 text-[#E60000]" />
                  </button>
                )}
                <LanguageSelector />
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              type="button"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="md:hidden text-zinc-300 hover:text-white active:scale-[0.95] p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/60 transition-all touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {user && isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 flex flex-col items-center py-5 px-4 gap-2.5 shadow-2xl"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`text-sm font-medium transition-all active:scale-[0.98] w-full text-center py-3 px-4 rounded-xl border relative flex justify-between items-center shadow-sm touch-manipulation ${
                    isActive
                      ? "bg-zinc-800 text-white border-zinc-700"
                      : "bg-zinc-900/70 text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-800"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <div className="flex items-center gap-1.5">
                    {link.href === "/dashboard/mis-proyectos" && pendingCount > 0 && (
                      <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-sm">
                        {pendingCount}
                      </span>
                    )}
                    {link.href === "/dashboard/mensajes" && unreadMessagesCount > 0 && (
                      <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-[#E60000] text-[10px] font-bold text-white shadow-sm">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
            <div className="w-full mt-2 flex justify-center">
              <LanguageSelector />
            </div>
            {!isStandalone && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.dispatchEvent(new CustomEvent("open-pwa-install-modal"));
                }}
                className="text-xs font-semibold text-zinc-300 hover:text-white active:scale-[0.98] bg-zinc-900/80 border border-zinc-800 hover:border-red-500/40 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 touch-manipulation"
              >
                <Smartphone className="h-4 w-4 text-[#E60000]" />
                <span>{t("navbar.installApp")}</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
