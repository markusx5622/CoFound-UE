"use client";

import { motion } from "framer-motion";
import {
  Network,
  Activity,
  Code2,
  HeartPulse,
  TrendingUp,
  Cpu,
  Briefcase,
  Palette,
  Users,
  CheckCircle2,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CampusFeedPreviewProps {
  onSelectProject?: () => void;
}

export default function CampusFeedPreview({ onSelectProject }: CampusFeedPreviewProps) {
  const { t } = useLanguage();

  const teamEquations = [
    {
      id: "eq-health-tech",
      leftIcon: <Activity className="h-4 w-4 text-[#E60000] shrink-0" />,
      leftLabel: t("feedPreview.eq1Left"),
      rightIcon: <Code2 className="h-4 w-4 text-[#E60000] shrink-0" />,
      rightLabel: t("feedPreview.eq1Right"),
      campus: t("feedPreview.eq1Campus"),
      result: t("feedPreview.eq1Result"),
      points: [
        { label: t("feedPreview.eq1Point1Label"), text: t("feedPreview.eq1Point1Text") },
        { label: t("feedPreview.eq1Point2Label"), text: t("feedPreview.eq1Point2Text") },
      ],
    },
    {
      id: "eq-biotech-business",
      leftIcon: <HeartPulse className="h-4 w-4 text-[#E60000] shrink-0" />,
      leftLabel: t("feedPreview.eq2Left"),
      rightIcon: <TrendingUp className="h-4 w-4 text-[#E60000] shrink-0" />,
      rightLabel: t("feedPreview.eq2Right"),
      campus: t("feedPreview.eq2Campus"),
      result: t("feedPreview.eq2Result"),
      points: [
        { label: t("feedPreview.eq2Point1Label"), text: t("feedPreview.eq2Point1Text") },
        { label: t("feedPreview.eq2Point2Label"), text: t("feedPreview.eq2Point2Text") },
      ],
    },
    {
      id: "eq-eng-ade",
      leftIcon: <Cpu className="h-4 w-4 text-[#E60000] shrink-0" />,
      leftLabel: t("feedPreview.eq3Left"),
      rightIcon: <Briefcase className="h-4 w-4 text-[#E60000] shrink-0" />,
      rightLabel: t("feedPreview.eq3Right"),
      campus: t("feedPreview.eq3Campus"),
      result: t("feedPreview.eq3Result"),
      points: [
        { label: t("feedPreview.eq3Point1Label"), text: t("feedPreview.eq3Point1Text") },
        { label: t("feedPreview.eq3Point2Label"), text: t("feedPreview.eq3Point2Text") },
      ],
    },
    {
      id: "eq-design-any",
      leftIcon: <Palette className="h-4 w-4 text-[#E60000] shrink-0" />,
      leftLabel: t("feedPreview.eq4Left"),
      rightIcon: <Users className="h-4 w-4 text-[#E60000] shrink-0" />,
      rightLabel: t("feedPreview.eq4Right"),
      campus: t("feedPreview.eq4Campus"),
      result: t("feedPreview.eq4Result"),
      points: [
        { label: t("feedPreview.eq4Point1Label"), text: t("feedPreview.eq4Point1Text") },
        { label: t("feedPreview.eq4Point2Label"), text: t("feedPreview.eq4Point2Text") },
      ],
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
    <section className="py-20 bg-transparent relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-[#E60000]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-300 backdrop-blur-md shadow-inner">
            <Network className="h-3.5 w-3.5 text-[#E60000]" />
            <span>{t("feedPreview.tag")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {t("feedPreview.title1")}
            <span className="text-[#E60000]">{t("feedPreview.titleHighlight")}</span>
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            {t("feedPreview.subtitle")}
          </p>
        </motion.div>

        {/* Barra compacta Turia & Alameda */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 p-3.5 sm:px-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm shadow-md"
        >
          <div className="flex items-center gap-2.5 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-semibold text-white">{t("feedPreview.trustBarQ")}</span>
            <span className="text-zinc-400">{t("feedPreview.trustBarA")}</span>
          </div>
          <span className="flex items-center gap-1.5 text-zinc-300 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>{t("feedPreview.trustBarLoc")}</span>
          </span>
        </motion.div>

        {/* Grid 2x2 de Ecuaciones de Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamEquations.map((eq, idx) => (
            <motion.div
              key={eq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: idx * 0.06 },
              }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 420, damping: 28, delay: 0 } }}
              transition={{ type: "spring", stiffness: 420, damping: 28, delay: 0 }}
              className="bg-zinc-900/70 hover:bg-zinc-900/95 border border-zinc-800/90 hover:border-zinc-700 rounded-3xl p-6 transition-[background-color,border-color,box-shadow] duration-300 flex flex-col justify-between group relative overflow-hidden backdrop-blur-md shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E60000]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div>
                {/* Cabecera: Campus + Ecuación visual */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-800">
                    {eq.campus}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-200">
                    {eq.leftIcon}
                    <span>{eq.leftLabel}</span>
                  </span>
                  <Plus className="h-4 w-4 text-zinc-500 shrink-0" />
                  <span className="inline-flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-200">
                    {eq.rightIcon}
                    <span>{eq.rightLabel}</span>
                  </span>
                </div>

                {/* Resultado directo en 1 línea */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors leading-snug">
                  {eq.result}
                </h3>

                {/* 2 micro-líneas de aportación */}
                <ul className="space-y-2 mb-5 text-xs sm:text-sm">
                  {eq.points.map((pt) => (
                    <li key={pt.label} className="flex items-start gap-2 text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E60000] mt-1.5 shrink-0" />
                      <span>
                        <strong className="text-zinc-200 font-semibold">{pt.label}:</strong> {pt.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handleActionClick}
                className="w-full group/btn inline-flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white active:scale-[0.98] py-3 px-3.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 transition-[background-color,border-color,color,transform] duration-200 touch-manipulation"
              >
                <span>{t("feedPreview.createSimilarBtn")}</span>
                <ArrowUpRight className="h-4 w-4 text-[#E60000] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
