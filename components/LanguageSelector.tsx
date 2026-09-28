"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-xs font-semibold text-zinc-300 hover:text-white"
        aria-label="Seleccionar idioma / Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{language}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
          <button
            onClick={() => {
              setLanguage("es");
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
              language === "es" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            🇪🇸 Español
          </button>
          <button
            onClick={() => {
              setLanguage("en");
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
              language === "en" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      )}
    </div>
  );
}
