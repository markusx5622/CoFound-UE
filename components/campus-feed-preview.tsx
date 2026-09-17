"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Code2, TrendingUp, Palette, CheckCircle2, ShieldCheck, ArrowUpRight } from "lucide-react";

interface CampusFeedPreviewProps {
  onSelectProject?: () => void;
}

export default function CampusFeedPreview({ onSelectProject }: CampusFeedPreviewProps) {
  const collaborationModels = [
    {
      id: "model-1",
      icon: <Code2 className="h-6 w-6 text-[#E60000]" />,
      badge: "Tecnología & Software",
      title: "Desarrollo técnico busca visión de negocio",
      faculty: "Ingeniería Informática / Tech",
      whatTheyOffer: "Desarrollo web y móvil, bases de datos, APIs y arquitectura de software funcional.",
      whatTheyNeed: "Estudiantes de ADE o Marketing para validar el modelo de negocio, diseñar la estrategia comercial y liderar la captación.",
      tags: ["Desarrollo Web", "Apps", "IA", "MVP"],
      synergy: "Informática + ADE",
    },
    {
      id: "model-2",
      icon: <TrendingUp className="h-6 w-6 text-[#E60000]" />,
      badge: "Negocio & Validación",
      title: "Idea de mercado busca equipo técnico",
      faculty: "ADE / Marketing / IOI",
      whatTheyOffer: "Validación de mercado, modelo financiero, análisis de competencia, pitch y estrategia de lanzamiento.",
      whatTheyNeed: "Desarrolladores y diseñadores para construir el prototipo funcional y llevar la idea de la teoría a la realidad.",
      tags: ["Finanzas", "Marketing", "Estrategia", "Startups"],
      synergy: "ADE + Ingeniería",
    },
    {
      id: "model-3",
      icon: <Palette className="h-6 w-6 text-[#E60000]" />,
      badge: "Diseño & Experiencia",
      title: "Diseño UX/UI busca proyectos que escalar",
      faculty: "Diseño Digital / Comunicación",
      whatTheyOffer: "Diseño de interfaces intuitivas, prototipos en Figma, experiencia de usuario (UX) e identidad visual sólida.",
      whatTheyNeed: "Equipos de desarrollo y negocio que busquen profesionalizar su producto antes de presentarlo a concursos o inversores.",
      tags: ["UI/UX", "Figma", "Branding", "Multimedia"],
      synergy: "Diseño + Tech",
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#E60000]" />
            <span>Colaboración Multidisciplinar • Campus Turia</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Sinergias reales entre <span className="text-[#E60000]">Titulaciones</span>
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            En la universidad, el talento suele quedar aislado en sus propias aulas. CoFound UE nace para conectar perfiles complementarios y formar equipos de trabajo sólidos.
          </p>
        </div>

        {/* Informative Campus Trust Bar */}
        <div className="mb-12 p-3.5 sm:p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-[#E60000] shrink-0" />
            <span className="font-semibold text-white">Comunidad Verificada:</span>
            <span className="text-zinc-400">Acceso restringido a estudiantes de la Universidad Europea</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Campus Turia (Valencia)</span>
            </span>
          </div>
        </div>

        {/* Synergy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {collaborationModels.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden backdrop-blur-sm shadow-lg"
            >
              <div>
                {/* Icon & Badge Header */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:border-[#E60000]/40 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                    {item.synergy}
                  </span>
                </div>

                {/* Role and Title */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E60000]">
                    {item.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mb-4">
                    Área: {item.faculty}
                  </p>
                </div>

                {/* What they offer & need */}
                <div className="space-y-3 mb-5 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                    <p className="font-semibold text-zinc-300 mb-1">Aportación clave:</p>
                    <p className="text-zinc-400 leading-relaxed">{item.whatTheyOffer}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                    <p className="font-semibold text-zinc-300 mb-1">Perfil que busca:</p>
                    <p className="text-zinc-400 leading-relaxed">{item.whatTheyNeed}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800/60">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 border-t border-zinc-800/80">
                <button
                  onClick={handleActionClick}
                  className="w-full inline-flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white py-2 px-3 rounded-xl hover:bg-zinc-800/60 transition-colors"
                >
                  <span>Crear iniciativa similar</span>
                  <ArrowUpRight className="h-4 w-4 text-[#E60000]" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="text-center p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            ¿Tienes una idea o quieres unirte a un equipo?
          </h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Regístrate con tu correo institucional de la Universidad Europea y publica tu propuesta o perfil para empezar a colaborar.
          </p>
          <button
            onClick={handleActionClick}
            className="bg-[#E60000] hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2 text-sm"
          >
            <span>Crear mi Cuenta de Estudiante</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
