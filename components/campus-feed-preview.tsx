"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Flame, Users, Clock, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";

interface CampusFeedPreviewProps {
  onSelectProject?: () => void;
}

export default function CampusFeedPreview({ onSelectProject }: CampusFeedPreviewProps) {
  const liveProjects = [
    {
      id: "proj-1",
      title: "EduTrack IA",
      category: "EdTech & Inteligencia Artificial",
      author: "Marc R.",
      degree: "4º Grado en Ing. de la Organización",
      initials: "MR",
      avatarBg: "from-rose-600 to-red-500",
      lookingFor: ["Desarrollador/a Fullstack (Next.js)", "Diseñador/a UI/UX"],
      description: "Plataforma web con IA adaptativa para generar síntesis de apuntes y simulacros de examen para asignaturas de la UE. 45 alumnos ya registrados en la lista de espera.",
      tags: ["Inteligencia Artificial", "Next.js", "EdTech"],
      spots: "2 plazas abiertas",
      time: "Hace 2h",
      campus: "Campus Turia",
    },
    {
      id: "proj-2",
      title: "MatchFit UE",
      category: "SportsTech & Comunidad",
      author: "Sofía L.",
      degree: "3º Marketing Digital & Comunicación",
      initials: "SL",
      avatarBg: "from-blue-600 to-indigo-500",
      lookingFor: ["App Developer (Mobile)", "Backend Developer"],
      description: "Red social para coordinar partidos de pádel, running y torneos universitarios entre estudiantes de Valencia. Buscamos socio técnico para programar la beta.",
      tags: ["SportsTech", "Mobile", "Comunidad"],
      spots: "1 plaza abierta",
      time: "Hace 4h",
      campus: "Campus Turia",
    },
    {
      id: "proj-3",
      title: "EcoCup Valencia",
      category: "Sostenibilidad & Eventos",
      author: "Javier G.",
      degree: "2º Grado en ADE",
      initials: "JG",
      avatarBg: "from-emerald-600 to-teal-500",
      lookingFor: ["Growth Marketer", "Desarrollador IoT / Software"],
      description: "Sistema circular de vasos reutilizables inteligentes para cafeterías y festivales universitarios con recompensas automáticas. Modelo validado en campus.",
      tags: ["Sostenibilidad", "Fintech", "Startups"],
      spots: "3 plazas abiertas",
      time: "Publicado ayer",
      campus: "Campus Turia",
    },
  ];

  const handleApplyClick = () => {
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-800/40 text-xs font-semibold text-red-300 backdrop-blur-md">
            <Flame className="h-3.5 w-3.5 text-[#E60000]" />
            <span>Muro en Tiempo Real • Campus Turia</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Proyectos reales buscando <span className="text-[#E60000]">Co-Founder</span> hoy
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Ideas creadas por compañeros de la Universidad Europea de Valencia. Elige un proyecto para unirte como socio o publica el tuyo en 2 minutos.
          </p>
        </div>

        {/* Live Ticker Bar */}
        <div className="mb-12 p-3 sm:p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="font-semibold text-white">Actividad reciente:</span>
            <span className="text-zinc-400 hidden sm:inline">Marc R. acaba de recibir 2 postulaciones para EduTrack IA</span>
            <span className="text-zinc-400 sm:hidden">Nuevas solicitudes enviadas</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verificados con @live.uem.es</span>
            </span>
            <span className="hidden md:inline text-zinc-600">•</span>
            <span className="hidden md:inline text-zinc-300 font-medium">Campus Turia</span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {liveProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800 hover:border-[#E60000]/40 rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(230,0,0,0.15)] flex flex-col justify-between group relative overflow-hidden backdrop-blur-sm"
            >
              {/* Subtle accent hover line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E60000] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div>
                {/* Author Info */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${project.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-md ring-1 ring-white/10`}>
                      {project.initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                        {project.author}
                      </h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{project.degree}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded-full whitespace-nowrap">
                    {project.spots}
                  </span>
                </div>

                {/* Project Header */}
                <div className="mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E60000]">
                    {project.category}
                  </span>
                  <h4 className="text-xl font-extrabold text-white mt-0.5 mb-2">
                    {project.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                    {project.description}
                  </p>
                </div>

                {/* Looking for badges */}
                <div className="mb-4 bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 mb-1.5">
                    <Briefcase className="h-3 w-3 text-[#E60000]" />
                    <span>Perfiles buscados:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.lookingFor.map((role, rIdx) => (
                      <span
                        key={rIdx}
                        className="bg-zinc-900 text-zinc-200 text-[10px] px-2.5 py-1 rounded-lg border border-zinc-800 font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] text-zinc-500 bg-zinc-900/50 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {project.time} • {project.campus}
                </span>
                <button
                  onClick={handleApplyClick}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-[#E60000] transition-colors py-1.5 px-3 rounded-xl hover:bg-zinc-800/60"
                >
                  <span>Postularme</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA bar */}
        <div className="text-center p-8 rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 shadow-xl max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            ¿Tienes una idea de startup o proyecto?
          </h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
            Regístrate con tu correo de la Universidad Europea y publica tu proyecto en el tablón del Campus Turia en menos de 2 minutos.
          </p>
          <button
            onClick={handleApplyClick}
            className="bg-[#E60000] hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2 text-sm"
          >
            <span>Publicar mi Proyecto</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
