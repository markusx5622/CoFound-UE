"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 relative z-10"
    >
      {/* Background glowing blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#E60000]/10 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none animate-pulse duration-1000"></div>

      <motion.div variants={itemVariants}>
        <Image 
          src="/CoFoundUE_logo.png" 
          alt="CoFound UE Square Logo" 
          width={220} 
          height={220} 
          className="-mt-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] mb-6 animate-float hover:scale-105 hover:rotate-1 hover:shadow-[0_0_50px_rgba(230,0,0,0.5)] cursor-pointer transition-all duration-500 ease-out border border-zinc-800"
          priority
        />
      </motion.div>
      
      <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
        Encuentra a tu <br />
        <span className="text-[#E60000] drop-shadow-[0_0_20px_rgba(230,0,0,0.4)]">Co-Founder</span> <br />
        en el Campus.
      </motion.h1>
      
      <motion.p variants={itemVariants} className="text-xl text-gray-300 max-w-xl leading-relaxed">
        La red exclusiva para conectar talento de ADE, Marketing, Tech y Diseño de la Universidad Europea.
      </motion.p>
      
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
        <span className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-zinc-800 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          Comunidad Activa
        </span>
        <span className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-zinc-800 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.8)]"></span>
          Solo UE
        </span>
      </motion.div>
    </motion.div>
  );
}
