"use client";

import { Target, Cpu, Palette, GraduationCap, Zap, Rocket } from "lucide-react";

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
    <section className="py-24 border-t border-zinc-900 bg-zinc-950/40 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Construye Equipos de <span className="text-[#E60000]">Alto Rendimiento</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Conecta con perfiles complementarios de tu misma universidad y saca adelante proyectos reales.
          </p>
        </div>

        {/* Grid de Roles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {roles.map((role, idx) => (
            <div 
              key={idx}
              className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-8 rounded-2xl transition-all duration-300 hover:border-[#E60000]/50 hover:shadow-[0_0_30px_rgba(230,0,0,0.15)] group"
            >
              <div className="bg-zinc-950 p-4 rounded-xl inline-block mb-6 border border-zinc-800 group-hover:border-[#E60000]/30 transition-colors">
                {role.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{role.title}</h3>
              <p className="text-[#E60000] text-xs font-semibold uppercase tracking-wider mb-4">{role.subtitle}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Beneficios breves */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-zinc-900/20 border border-zinc-900 rounded-3xl p-10 lg:p-12">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2">{benefit.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
