"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Sparkles, ArrowRight } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function StudentFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Primera abierta por defecto

  const faqs: FAQItem[] = [
    {
      question: "¿CoFound UE es totalmente gratis?",
      answer: "Sí, 100% gratuito. No hay suscripciones, costes ocultos ni comisiones. CoFound UE nace como una herramienta de apoyo a la comunidad de la Universidad Europea de Valencia para potenciar proyectos reales.",
    },
    {
      question: "¿Puedo entrar si aún no tengo una idea de proyecto?",
      answer: "¡Por supuesto! Más del 60% de los estudiantes entran para aportar su talento (programación, diseño UX/UI, marketing, finanzas, gestión) a proyectos iniciados por otros compañeros del campus.",
    },
    {
      question: "¿Quién organiza y está detrás de CoFound UE?",
      answer: "Es una iniciativa independiente impulsada por estudiantes de la Universidad Europea de Valencia. El objetivo es derribar las barreras entre facultades y conectar a futuros fundadores antes de graduarse.",
    },
    {
      question: "¿Quién puede ver mis datos y cómo se contacta?",
      answer: "El acceso está blindado exclusivamente a estudiantes con correo institucional verificado (@live.uem.es o @universidadeuropea.es). Dentro de la plataforma puedes postularte a proyectos y chatear directamente con otros miembros de forma segura.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleCtaClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) {
      emailInput.focus();
    }
  };

  return (
    <section id="faq" className="py-20 border-t border-zinc-900 bg-zinc-950/80 relative overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-80 bg-[#E60000]/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header de Sección */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-300 backdrop-blur-md shadow-inner">
            <HelpCircle className="h-3.5 w-3.5 text-[#E60000]" />
            <span>Dudas Frecuentes de Estudiantes</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Respuestas claras, <span className="text-[#E60000]">sin rodeos</span>
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Todo lo que necesitas saber antes de crear tu perfil y empezar a conectar en el campus.
          </p>
        </div>

        {/* Acordeón de FAQs */}
        <div className="space-y-3 mb-12">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? "bg-zinc-900/90 border-zinc-700/80 shadow-lg shadow-black/40" 
                    : "bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full py-4 px-5 sm:px-6 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.question}
                  </span>
                  <div 
                    className={`w-7 h-7 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#E60000]/20 text-[#E60000] border-red-500/40" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/60 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Mini Banner CTA final */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-950/60 border border-red-500/30 text-[#E60000] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                ¿Listo para conectar en el Campus?
              </h4>
              <p className="text-xs text-zinc-400">
                El registro toma 30 segundos con tu correo de la universidad.
              </p>
            </div>
          </div>

          <button
            onClick={handleCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E60000] hover:bg-red-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-[0_0_20px_rgba(230,0,0,0.35)] shrink-0"
          >
            <span>Crear mi perfil ahora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
