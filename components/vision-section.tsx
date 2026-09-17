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
                <span>Primero consolidaremos la comunidad en Campus Turia (Valencia).</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Network className="h-4 w-4 text-zinc-500" />
                </div>
                <span className="text-zinc-500">Pronto conectaremos con Campus Villaviciosa, Alcobendas y Canarias.</span>
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
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md p-6 md:p-10 flex flex-col items-center justify-center gap-4 shadow-2xl">
              
              {/* Glow */}
              <div className="absolute w-full h-full bg-[#E60000] rounded-full blur-[100px] opacity-[0.08] pointer-events-none"></div>
              
              {/* Project Card Mockup */}
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-sm bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 shadow-lg relative z-10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300">CM</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Carlos M.</h4>
                      <p className="text-xs text-zinc-500">ADE • Buscando Tech</p>
                    </div>
                  </div>
                  <span className="bg-[#E60000]/10 text-[#E60000] text-[10px] font-bold px-2 py-1 rounded-full border border-[#E60000]/20">Proyecto</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">App de Gestión Financiera</h3>
                <p className="text-xs text-zinc-400 mb-4 line-clamp-2">Buscamos un co-founder técnico para desarrollar el MVP en Next.js y Firebase...</p>
                <div className="flex gap-2">
                  <span className="bg-zinc-900 text-zinc-400 text-[10px] px-2.5 py-1 rounded-md border border-zinc-800">Finanzas</span>
                  <span className="bg-zinc-900 text-zinc-400 text-[10px] px-2.5 py-1 rounded-md border border-zinc-800">SaaS</span>
                </div>
              </motion.div>

              {/* Connection Link */}
              <div className="flex items-center justify-center h-6 relative z-0">
                <div className="w-px h-full bg-gradient-to-b from-zinc-700 to-[#E60000]/60"></div>
                <div className="absolute w-3 h-3 rounded-full bg-[#E60000] shadow-[0_0_10px_rgba(230,0,0,0.8)] border-2 border-zinc-950"></div>
              </div>

              {/* Match Card Mockup */}
              <motion.div 
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-sm bg-gradient-to-br from-zinc-950/90 to-[#E60000]/5 border border-[#E60000]/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(230,0,0,0.1)] relative z-10"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E60000]/10 border border-[#E60000]/30 flex items-center justify-center text-sm font-bold text-[#E60000]">AG</div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Ana G.</h4>
                      <p className="text-xs text-[#E60000]/80 font-medium">Ing. Informática • Tech</p>
                    </div>
                  </div>
                  <button className="bg-[#E60000] hover:bg-[#CC0000] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transition-colors">
                    Conectar
                  </button>
                </div>
              </motion.div>

            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
