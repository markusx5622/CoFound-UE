"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Sparkles, Users, Rocket, ShieldCheck } from "lucide-react";

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
    hidden: { opacity: 0, y: 25 },
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

      {/* Live Campus Badge */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-200 backdrop-blur-md shadow-inner">
          <MapPin className="h-3.5 w-3.5 text-[#E60000]" />
          <span>Campus Turia • Valencia</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-xs font-medium text-emerald-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          <span>+18 estudiantes buscando equipo hoy</span>
        </div>
      </motion.div>

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
      
      {/* Subtitle with Campus Turia focus */}
      <motion.p variants={itemVariants} className="text-lg md:text-xl text-zinc-300 max-w-xl leading-relaxed">
        La red social y profesional exclusiva para conectar talento de <strong className="text-white font-semibold">ADE, Marketing, Tech y Diseño</strong> de la Universidad Europea de Valencia.
      </motion.p>

      {/* Social Proof with Active Student Avatars */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2">
        <div className="flex -space-x-2 overflow-hidden">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-zinc-950 bg-gradient-to-tr from-red-600 to-rose-400 text-white font-bold text-xs shadow-md">
            MR
          </div>
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-zinc-950 bg-gradient-to-tr from-blue-600 to-indigo-400 text-white font-bold text-xs shadow-md">
            SL
          </div>
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-zinc-950 bg-gradient-to-tr from-amber-600 to-yellow-400 text-white font-bold text-xs shadow-md">
            JG
          </div>
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-zinc-950 bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold text-xs shadow-md">
            AP
          </div>
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-white">+180 estudiantes conectados</p>
          <p className="text-zinc-400">Creando startups y proyectos en Valencia</p>
        </div>
      </motion.div>
      
      {/* Value Proposition Pills */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 text-zinc-300 text-xs sm:text-sm pt-2">
        <span className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-zinc-800 shadow-inner">
          <Rocket className="h-3.5 w-3.5 text-[#E60000]" />
          <span>+45 Proyectos activos</span>
        </span>
        <span className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-zinc-800 shadow-inner">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>100% Exclusivo Comunidad UE</span>
        </span>
      </motion.div>
    </motion.div>
  );
}
