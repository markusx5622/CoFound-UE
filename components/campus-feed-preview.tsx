"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Code2, TrendingUp, Palette, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CampusFeedPreviewProps {
  onSelectProject?: () => void;
}

export default function CampusFeedPreview({ onSelectProject }: CampusFeedPreviewProps) {
  const { t } = useLanguage();

  const collaborationModels = [
    {
      id: "model-1",
      icon: <Code2 className="h-6 w-6 text-[#E60000]" />,
      badge: t("feedPreview.model1Badge"),
      title: t("feedPreview.model1Title"),
      faculty: t("feedPreview.model1Faculty"),
      whatTheyOffer: t("feedPreview.model1Offer"),
      whatTheyNeed: t("feedPreview.model1Need"),
      tags: (t("feedPreview.model1Tags", { returnObjects: true }) as string[]) || ["Desarrollo Web", "Apps", "IA", "MVP"],
      synergy: t("feedPreview.model1Synergy"),
    },
    {
      id: "model-2",
      icon: <TrendingUp className="h-6 w-6 text-[#E60000]" />,
      badge: t("feedPreview.model2Badge"),
      title: t("feedPreview.model2Title"),
      faculty: t("feedPreview.model2Faculty"),
      whatTheyOffer: t("feedPreview.model2Offer"),
      whatTheyNeed: t("feedPreview.model2Need"),
      tags: (t("feedPreview.model2Tags", { returnObjects: true }) as string[]) || ["Finanzas", "Marketing", "Estrategia", "Startups"],
      synergy: t("feedPreview.model2Synergy"),
    },
    {
      id: "model-3",
      icon: <Palette className="h-6 w-6 text-[#E60000]" />,
      badge: t("feedPreview.model3Badge"),
      title: t("feedPreview.model3Title"),
      faculty: t("feedPreview.model3Faculty"),
      whatTheyOffer: t("feedPreview.model3Offer"),
      whatTheyNeed: t("feedPreview.model3Need"),
      tags: (t("feedPreview.model3Tags", { returnObjects: true }) as string[]) || ["UI/UX", "Figma", "Branding", "Multimedia"],
      synergy: t("feedPreview.model3Synergy"),
    },
  ];

  const handleActionClick = () => {
    if (onSelectProject) {
      onSelectProject();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.focus();
      }
    }
  };

  return (
    <section className="py-24 border-t border-zinc-900 bg-zinc-950/60 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-[#E60000]/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-300 backdrop-blur-md shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-[#E60000]" />
            <span>{t("feedPreview.tag")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {t("feedPreview.title1")}<span className="text-[#E60000]">{t("feedPreview.titleHighlight")}</span>
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            {t("feedPreview.subtitle")}
          </p>
        </div>

        {/* Informative Dual-Profile Trust Bar */}
        <div className="mb-12 p-3.5 sm:p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm shadow-md">
          <div className="flex items-center gap-2.5 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-semibold text-white">{t("feedPreview.trustBarQ")}</span>
            <span className="text-zinc-400">{t("feedPreview.trustBarA")}</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t("feedPreview.trustBarLoc")}</span>
            </span>
          </div>
        </div>

        {/* Synergy Cards Grid with Spring Physics and Reactive States */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {collaborationModels.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 350, damping: 25, delay: idx * 0.08 }}
              className="bg-zinc-900/70 hover:bg-zinc-900/95 border border-zinc-800/90 hover:border-zinc-700 rounded-3xl p-6 sm:p-7 transition-colors duration-300 flex flex-col justify-between group relative overflow-hidden backdrop-blur-md shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] cursor-default"
            >
              {/* Subtle top edge gradient line highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E60000]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div>
                {/* Icon & Badge Header */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:border-[#E60000]/50 group-hover:bg-[#E60000]/10 group-hover:scale-105 transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-200 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 group-hover:border-zinc-700 transition-colors duration-300">
                    {item.synergy}
                  </span>
                </div>

                {/* Role and Title */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E60000]">
                    {item.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-red-400 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mb-4">
                    {t("feedPreview.cardArea")}{item.faculty}
                  </p>
                </div>

                {/* What they offer & need */}
                <div className="space-y-3 mb-5 text-xs">
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 group-hover:border-zinc-800 transition-colors duration-200">
                    <p className="font-semibold text-zinc-300 mb-1">{t("feedPreview.cardOfferTitle")}</p>
                    <p className="text-zinc-400 leading-relaxed">{item.whatTheyOffer}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 group-hover:border-zinc-800 transition-colors duration-200">
                    <p className="font-semibold text-zinc-300 mb-1">{t("feedPreview.cardNeedTitle")}</p>
                    <p className="text-zinc-400 leading-relaxed">{item.whatTheyNeed}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] text-zinc-500 group-hover:text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800/60 transition-colors duration-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 border-t border-zinc-800/80">
                <button
                  onClick={handleActionClick}
                  className="w-full group/btn inline-flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white py-2.5 px-3.5 rounded-xl bg-zinc-950/50 hover:bg-zinc-800 border border-zinc-800/60 hover:border-zinc-700 transition-all duration-200 shadow-sm"
                >
                  <span>{t("feedPreview.createSimilarBtn")}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#E60000] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="text-center p-8 sm:p-10 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl max-w-2xl mx-auto relative overflow-hidden backdrop-blur-md">
          {/* Ambient subtle glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#E60000]/10 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 relative z-10">
            {t("feedPreview.bottomTitle")}
          </h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto leading-relaxed relative z-10">
            {t("feedPreview.bottomDesc")}
          </p>
          <button
            onClick={handleActionClick}
            className="bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white font-semibold py-3.5 px-7 rounded-xl transition-all duration-200 shadow-md hover:shadow-[0_0_25px_rgba(230,0,0,0.4)] inline-flex items-center gap-2 text-sm relative z-10"
          >
            <span>{t("feedPreview.bottomBtn")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
