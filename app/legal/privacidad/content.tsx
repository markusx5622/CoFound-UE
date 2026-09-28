"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PoliticaPrivacidadContent() {
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

        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">{t("legal.privacidad.title")}</h1>
        <p className="text-zinc-500 mb-10 pb-6 border-b border-zinc-800/50">{t("legal.lastUpdated")}</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacidad.s1Title")}</h2>
            <p>
              {t("legal.privacidad.s1P1_1")}<strong className="text-white">{t("legal.privacidad.s1P1_2")}</strong>{t("legal.privacidad.s1P1_3")}<strong className="text-white">{t("legal.privacidad.s1P1_4")}</strong>{t("legal.privacidad.s1P1_5")}<strong className="text-white">{t("legal.privacidad.s1P1_6")}</strong>{t("legal.privacidad.s1P1_7")}
            </p>
            <p className="text-zinc-400 mt-3 text-sm bg-zinc-800/40 p-3 rounded-lg border border-zinc-800">
              <strong className="text-zinc-200">{t("legal.privacidad.s1NoteLabel")}</strong>{t("legal.privacidad.s1Note")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacidad.s2Title")}</h2>
            <p>
              {t("legal.privacidad.s2P1")}
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li><strong className="text-zinc-200">{t("legal.privacidad.s2L1T")}</strong>{t("legal.privacidad.s2L1D")}</li>
              <li><strong className="text-zinc-200">{t("legal.privacidad.s2L2T")}</strong>{t("legal.privacidad.s2L2D")}</li>
              <li><strong className="text-zinc-200">{t("legal.privacidad.s2L3T")}</strong>{t("legal.privacidad.s2L3D")}</li>
              <li><strong className="text-zinc-200">{t("legal.privacidad.s2L4T")}</strong>{t("legal.privacidad.s2L4D")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacidad.s3Title")}</h2>
            <p>
              {t("legal.privacidad.s3P1_1")}<strong className="text-white">{t("legal.privacidad.s3P1_2")}</strong>{t("legal.privacidad.s3P1_3")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacidad.s4Title")}</h2>
            <p>
              {t("legal.privacidad.s4P1")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacidad.s5Title")}</h2>
            <p>
              {t("legal.privacidad.s5P1_1")}<strong className="text-white">{t("legal.privacidad.s5P1_2")}</strong>{t("legal.privacidad.s5P1_3")}<strong className="text-white">{t("legal.privacidad.s5P1_4")}</strong>{t("legal.privacidad.s5P1_5")}
            </p>
            <p className="mt-2">
              {t("legal.privacidad.s5P2")}
            </p>
            <p className="mt-2">
              {t("legal.privacidad.s5P3")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacidad.s6Title")}</h2>
            <p>
              {t("legal.privacidad.s6P1")}
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li><strong className="text-zinc-200">{t("legal.privacidad.s6L1T")}</strong>{t("legal.privacidad.s6L1D")}</li>
              <li><strong className="text-zinc-200">{t("legal.privacidad.s6L2T")}</strong>{t("legal.privacidad.s6L2D")}</li>
              <li><strong className="text-zinc-200">{t("legal.privacidad.s6L3T")}</strong>{t("legal.privacidad.s6L3D")}</li>
              <li><strong className="text-zinc-200">{t("legal.privacidad.s6L4T")}</strong>{t("legal.privacidad.s6L4D")}</li>
              <li><strong className="text-zinc-200">{t("legal.privacidad.s6L5T")}</strong>{t("legal.privacidad.s6L5D")}</li>
            </ul>
            <p className="mt-4">
              {t("legal.privacidad.s6P2_1")}<strong className="text-white">{t("legal.privacidad.s6P2_2")}</strong>{t("legal.privacidad.s6P2_3")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.privacidad.s7Title")}</h2>
            <p>
              {t("legal.privacidad.s7P1")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
