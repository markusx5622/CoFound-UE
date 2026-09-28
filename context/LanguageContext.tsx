"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { es, Dictionary } from "@/lib/i18n/es";
import { en } from "@/lib/i18n/en";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("cofoundue_lang") as Language;
    if (savedLang && (savedLang === "es" || savedLang === "en")) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
    } else {
      const browserLang = navigator.language.startsWith("en") ? "en" : "es";
      setLanguageState(browserLang);
      localStorage.setItem("cofoundue_lang", browserLang);
      document.documentElement.lang = browserLang;
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("cofoundue_lang", lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string, params?: Record<string, any>): any => {
    // Para simplificar y evitar problemas con TypeScript, usaremos un acceso dinámico
    const keys = key.split(".");
    let current: any = language === "en" ? en : es;
    
    // Fallback a español si la clave falta en inglés
    let fallbackCurrent: any = es;

    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }
    
    if (current === undefined && language === "en") {
      current = fallbackCurrent;
      for (const k of keys) {
        if (current && current[k] !== undefined) {
          current = current[k];
        } else {
          return key;
        }
      }
    }

    if (current === undefined) {
      return key;
    }

    if (typeof current !== "string") {
      return current;
    }

    let result = current;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (typeof v === 'string' || typeof v === 'number') {
          result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
        }
      });
    }
    return result;
  };

  // Para evitar hydration mismatch
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: "es", setLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
