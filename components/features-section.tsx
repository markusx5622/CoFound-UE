"use client";

import { Target, Cpu, Palette, GraduationCap, Zap, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const roles = [
    {
      icon: <Target className="h-8 w-8 text-[#E60000]" />,
      title: "Negocios y Marketing",
      subtitle: "ADE, Marketing, IOI",
      description: "Define el modelo de negocio, estudia el mercado y lidera el pitch. Encuentra socios técnicos para dar vida a tus ideas de negocio.",
    },
    {
      icon: <Cpu className="h-8 w-8 text-[#E60000]" />,
      title: "Tecnología y Código",
      subtitle: "Ingeniería Informática, Web & App",
      description: "Desarrolla el MVP, programa la plataforma y escala la tecnología. Conecta con mentes de marketing para validar tu producto con usuarios reales.",
    },
    {
      icon: <Palette className="h-8 w-8 text-[#E60000]" />,
      title: "Diseño y UX/UI",
      subtitle: "Diseño de Producto, Gráfico, Multimedia",
      description: "Diseña flujos de usuario intuitivos, crea prototipos interactivos y dale una identidad visual única a la startup antes de escribir la primera línea de código.",
    },
  ];

  const benefits = [
    {
      icon: <GraduationCap className="h-6 w-6 text-white" />,
      title: "Solo Universidad Europea",
      description: "Acceso exclusivo y verificado mediante correo de la UE. Emprende con compañeros de tu mismo campus.",
    },
    {
      icon: <Zap className="h-6 w-6 text-[#E60000]" />,
      title: "Conexión Multidisciplinar",
      description: "Une negocios, tecnología y diseño de forma orgánica. El complemento ideal para tus proyectos universitarios.",
    },
    {
      icon: <Rocket className="h-6 w-6 text-white" />,
      title: "Proyectos Reales",
      description: "Lleva tus ideas más allá de las aulas. Crea equipos para participar en hackathons, incubadoras o lanzar tu startup.",
    },
  ];

  return (
    <section id="features" className="py-24 border-t border-zinc-900 bg-zinc-950/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header de Sección */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Construye Equipos de <span className="text-[#E60000]">Alto Rendimiento</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Conecta con perfiles complementarios de tu misma universidad y saca adelante proyectos reales.
          </p>
        </motion.div>

        {/* Grid de Roles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {roles.map((role, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-8 rounded-2xl transition-all duration-300 hover:border-[#E60000]/50 hover:shadow-[0_0_40px_rgba(230,0,0,0.15)] hover:-translate-y-2 group"
            >
              <div className="bg-zinc-950 p-4 rounded-xl inline-block mb-6 border border-zinc-800 group-hover:border-[#E60000]/50 group-hover:bg-[#E60000]/5 transition-all duration-300">
                {role.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#E60000] transition-colors">{role.title}</h3>
              <p className="text-[#E60000] text-xs font-semibold uppercase tracking-wider mb-4">{role.subtitle}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{role.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Beneficios breves */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-gradient-to-br from-zinc-900/40 to-zinc-900/10 border border-zinc-800/50 rounded-3xl p-10 lg:p-12 shadow-2xl backdrop-blur-sm"
        >
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex gap-4 items-start group">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 shrink-0 group-hover:border-zinc-700 transition-colors">
                {benefit.icon}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
