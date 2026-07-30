"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Network, Sparkles } from "lucide-react";

export default function VisionSection() {
  return (
    <section className="py-32 relative overflow-hidden bg-zinc-950 border-t border-zinc-900">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-[#E60000]/5 to-transparent blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="flex-1 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300">
              <Sparkles className="h-4 w-4 text-[#E60000]" />
              Fase 1: El Origen
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              De un Campus a un <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E60000] to-red-400">Ecosistema Global</span>.
            </h2>
            
            <p className="text-lg text-zinc-400 leading-relaxed">
              CoFound UE nace para solucionar un problema real: el talento universitario está fragmentado en sus propias facultades. Nuestra visión es destruir esos silos y conectar a la próxima generación de fundadores antes de que siquiera se gradúen.
            </p>
            
            <ul className="space-y-4 text-zinc-300">
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E60000]/10 flex items-center justify-center border border-[#E60000]/20">
                  <MapPin className="h-4 w-4 text-[#E60000]" />
                </div>
                <span>Primero dominaremos el campus de Valencia.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Network className="h-4 w-4 text-zinc-500" />
                </div>
                <span className="text-zinc-500">Pronto conectaremos con Madrid y Canarias.</span>
              </li>
            </ul>
            
          </motion.div>

          {/* Right Visual Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 w-full relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm aspect-square md:aspect-[4/3] flex items-center justify-center group shadow-2xl">
              
              {/* Central glowing core */}
              <div className="absolute w-32 h-32 bg-[#E60000] rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
              
              {/* Connecting nodes visual */}
              <div className="relative w-64 h-64">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-zinc-700/50 rounded-full border-dashed"
                ></motion.div>
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-8 border border-zinc-800 rounded-full"
                ></motion.div>
                
                {/* Center Node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg z-20">
                  <span className="font-bold text-white tracking-tighter">UEV</span>
                </div>
                
                {/* Orbiting Node 1 */}
                <motion.div 
                  animate={{ 
                    x: [0, 80, 0, -80, 0],
                    y: [-80, 0, 80, 0, -80]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 w-10 h-10 -ml-5 -mt-5 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center shadow-lg z-10"
                >
                  <span className="text-[10px] font-bold text-zinc-400">Tech</span>
                </motion.div>

                {/* Orbiting Node 2 */}
                <motion.div 
                  animate={{ 
                    x: [0, -70, 0, 70, 0],
                    y: [70, 0, -70, 0, 70]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 w-10 h-10 -ml-5 -mt-5 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center shadow-lg z-10"
                >
                  <span className="text-[10px] font-bold text-zinc-400">ADE</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
