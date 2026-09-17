"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Rocket, ShieldCheck, UserPlus } from "lucide-react";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 relative z-10"
    >
      {/* Background glowing blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] md:w-[620px] h-[320px] md:h-[620px] bg-[#E60000]/10 rounded-full blur-[110px] md:blur-[160px] -z-10 pointer-events-none animate-pulse duration-1000"></div>

      {/* Logo container: squircle curvature without rectangular box-shadow artifacts */}
      <motion.div variants={itemVariants} className="relative inline-block group">
        {/* Soft radial circular ambient glow behind the logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#E60000]/25 rounded-full blur-3xl group-hover:bg-[#E60000]/45 group-hover:scale-125 transition-all duration-700 pointer-events-none -z-10" />

        {/* Clean squircle wrapper with filter drop-shadow */}
        <div className="relative rounded-[22%] overflow-hidden filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.7)] group-hover:drop-shadow-[0_18px_36px_rgba(230,0,0,0.45)] transition-all duration-500 ease-out cursor-pointer group-hover:scale-[1.03] group-hover:-translate-y-1">
          <Image 
            src="/CoFoundUE_logo.png" 
            alt="CoFound UE Logo" 
            width={180} 
            height={180} 
            className="w-40 h-40 md:w-44 md:h-44 object-contain rounded-[22%]"
            priority
          />
        </div>
      </motion.div>
      
      {/* Main Title */}
      <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
        Encuentra a tu <br />
        <span className="text-[#E60000] drop-shadow-[0_0_25px_rgba(230,0,0,0.45)]">Co-Founder</span> <br />
        en el Campus.
      </motion.h1>
      
      {/* Subtitle */}
      <motion.p variants={itemVariants} className="text-lg md:text-xl text-zinc-300 max-w-xl leading-relaxed">
        La plataforma para conectar estudiantes de <strong className="text-white font-semibold">ADE, Marketing, Ingeniería y Diseño</strong> de la Universidad Europea de Valencia.
      </motion.p>

      {/* Honest Early-Adopter Callout */}
      <motion.div variants={itemVariants} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md max-w-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-[#E60000]/30 flex items-center justify-center text-[#E60000] shrink-0 mt-0.5">
            <UserPlus className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Lanzamiento en Campus Turia</h3>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Sé de los primeros en publicar tu idea o registrar tu perfil para formar equipo con compañeros de otras facultades.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Value Proposition Badges */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 text-zinc-300 text-xs sm:text-sm pt-1">
        <span className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-zinc-800 shadow-inner">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Acceso solo con @live.uem.es</span>
        </span>
        <span className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-zinc-800 shadow-inner">
          <Rocket className="h-3.5 w-3.5 text-[#E60000]" />
          <span>Startups, Hackathons y Proyectos</span>
        </span>
      </motion.div>
    </motion.div>
  );
}
