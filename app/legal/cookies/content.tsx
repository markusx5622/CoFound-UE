"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PoliticaCookiesContent() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-transparent py-16 px-6 relative z-10">
      <div className="max-w-4xl mx-auto bg-zinc-900/60 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-zinc-800">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#E60000] transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("legal.backToHome")}
        </Link>
        
        {language === 'en' && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500/90 text-sm">
            {t("legal.disclaimer")}
          </div>
        )}

        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">{t("legal.cookies.title")}</h1>
        <p className="text-zinc-500 mb-10 pb-6 border-b border-zinc-800/50">{t("legal.lastUpdated")}</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.cookies.s1Title")}</h2>
            <p>
              {t("legal.cookies.s1P1")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.cookies.s2Title")}</h2>
            <p>
              {t("legal.cookies.s2P1")}
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-4 text-zinc-400">
              <li>
                <strong className="text-zinc-200">{t("legal.cookies.s2L1T")}</strong>{t("legal.cookies.s2L1D")}
              </li>
              <li>
                <strong className="text-zinc-200">{t("legal.cookies.s2L2T")}</strong>{t("legal.cookies.s2L2D")}<strong className="text-zinc-200">{t("legal.cookies.s2L2B")}</strong>{t("legal.cookies.s2L2D2")}
              </li>
              <li>
                <strong className="text-zinc-200">{t("legal.cookies.s2L3T")}</strong>{t("legal.cookies.s2L3D")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.cookies.s3Title")}</h2>
            <p>
              {t("legal.cookies.s3P1")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.cookies.s4Title")}</h2>
            <p>
              {t("legal.cookies.s4P1")}
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li><a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" rel="noopener noreferrer" className="text-[#E60000] hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-[#E60000] hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#E60000] hover:underline">Safari</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.cookies.s5Title")}</h2>
            <p>
              {t("legal.cookies.s5P1")}<strong className="text-white">cofoundue@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
