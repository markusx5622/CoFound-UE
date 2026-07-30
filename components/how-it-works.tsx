"use client";

import { UserCheck, PlusCircle, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <UserCheck className="h-6 w-6 text-[#E60000]" />,
      title: "Regístrate en Segundos",
      description: "Crea tu cuenta usando tu correo institucional de la Universidad Europea. Filtro seguro de comunidad.",
    },
    {
      num: "02",
      icon: <PlusCircle className="h-6 w-6 text-[#E60000]" />,
      title: "Publica tu Proyecto o Perfil",
      description: "Describe tu idea de negocio o detalla tus habilidades (código, diseño, marketing) para que otros te encuentren.",
    },
    {
      num: "03",
      icon: <Users className="h-6 w-6 text-[#E60000]" />,
      title: "Conecta y Emprende",
      description: "Explora perfiles del campus, chatea con estudiantes complementarios y formad el equipo fundador ideal.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-zinc-900 bg-transparent relative overflow-hidden">
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
            ¿Cómo Funciona <span className="text-[#E60000]">CoFound UE</span>?
          </h2>
          <p className="text-gray-400 text-lg">
            De la idea al producto en tres sencillos pasos. Diseñado específicamente para el ecosistema universitario.
          </p>
        </motion.div>

        {/* Pasos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Línea conectora horizontal (solo desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-zinc-800 via-[#E60000]/30 to-zinc-800 -translate-y-8 z-0"></div>
          
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Círculo del Icono */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:border-[#E60000]/60 transition-all duration-300 shadow-xl group-hover:shadow-[0_0_20px_rgba(230,0,0,0.2)] relative"
              >
                {step.icon}
                <span className="absolute -top-3 -right-3 text-xs font-black bg-zinc-950 px-2 py-1 rounded-full border border-zinc-800 text-zinc-400">
                  {step.num}
                </span>
              </motion.div>

              {/* Título y Descripción */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#E60000] transition-colors">
                {step.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
