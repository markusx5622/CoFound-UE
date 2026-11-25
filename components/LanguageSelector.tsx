"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:bg-zinc-800 active:scale-[0.97] transition-all text-xs font-semibold text-zinc-300 hover:text-white touch-manipulation"
        aria-label="Seleccionar idioma / Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{language}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="absolute right-0 mt-2 w-36 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 origin-top-right"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setLanguage("es");
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                language === "es" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
              }`}
            >
              🇪🇸 Español
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setLanguage("en");
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                language === "en" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
              }`}
            >
              🇬🇧 English
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
