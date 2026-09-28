"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AvisoLegalContent() {
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

        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">{t("legal.avisoLegal.title")}</h1>
        <p className="text-zinc-500 mb-10 pb-6 border-b border-zinc-800/50">{t("legal.lastUpdated")}</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.avisoLegal.s1Title")}</h2>
            <p className="text-zinc-400">
              {t("legal.avisoLegal.s1P1")}
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li><strong className="text-zinc-200">{t("legal.avisoLegal.s1Titular")}</strong> Marc Cubero Cantavella</li>
              <li><strong className="text-zinc-200">{t("legal.avisoLegal.s1Project")}</strong> CoFound UE (proyecto universitario independiente)</li>
              <li><strong className="text-zinc-200">{t("legal.avisoLegal.s1Email")}</strong> cofoundue@gmail.com</li>
              <li><strong className="text-zinc-200">{t("legal.avisoLegal.s1Location")}</strong> Valencia, España</li>
            </ul>
            <p className="text-zinc-400 mt-4 text-sm bg-zinc-800/40 p-3 rounded-lg border border-zinc-800">
              <strong className="text-zinc-200">{t("legal.avisoLegal.s1NoteLabel")}</strong>{t("legal.avisoLegal.s1Note")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.avisoLegal.s2Title")}</h2>
            <p>
              {t("legal.avisoLegal.s2P1")}
            </p>
            <p className="mt-2">
              {t("legal.avisoLegal.s2P2")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.avisoLegal.s3Title")}</h2>
            <p>
              {t("legal.avisoLegal.s3P1")}
            </p>
            <p className="mt-2">
              {t("legal.avisoLegal.s3P2")}
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li>{t("legal.avisoLegal.s3L1")}</li>
              <li>{t("legal.avisoLegal.s3L2")}</li>
              <li>{t("legal.avisoLegal.s3L3")}</li>
              <li>{t("legal.avisoLegal.s3L4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.avisoLegal.s4Title")}</h2>
            <p>
              {t("legal.avisoLegal.s4P1")}
            </p>
            <p className="mt-2">
              {t("legal.avisoLegal.s4P2")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.avisoLegal.s5Title")}</h2>
            <p>
              {t("legal.avisoLegal.s5P1")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.avisoLegal.s6Title")}</h2>
            <p>
              {t("legal.avisoLegal.s6P1")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">{t("legal.avisoLegal.s7Title")}</h2>
            <p>
              {t("legal.avisoLegal.s7P1")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
