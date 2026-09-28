"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Mail, Compass, HelpCircle, UserPlus, Scale, ShieldCheck, Cookie } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-transparent border-t border-zinc-900 pt-16 pb-8 relative z-10 text-zinc-400">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image 
                src="/CoFoundUE_logo.png" 
                alt="CoFound UE Logo" 
                width={60} 
                height={60} 
                className="h-12 w-auto object-contain rounded-xl"
              />
            </Link>
            <p className="text-sm mb-6 text-zinc-500">
              La red exclusiva de talento para estudiantes de la Universidad Europea. Conecta, crea y lanza tu próximo gran proyecto.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com/markusx5622/CoFound-UE" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#E60000] transition-colors inline-flex items-center gap-2" 
                aria-label="GitHub de CoFound UE"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Secciones Col */}
          <div>
            <h3 className="text-white font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/#how-it-works"
                  className="group flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Compass className="h-4 w-4 text-[#E60000] shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span>Cómo funciona</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/#faq"
                  className="group flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-[#E60000] shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span>Preguntas frecuentes</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/#join"
                  className="group flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-[#E60000] shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span>Unirme a la red</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  href="/legal/aviso-legal" 
                  className="group flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Scale className="h-4 w-4 text-[#E60000] shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span>Aviso Legal</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/privacidad" 
                  className="group flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[#E60000] shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span>Política de Privacidad</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal/cookies" 
                  className="group flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Cookie className="h-4 w-4 text-[#E60000] shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span>Política de Cookies</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="mailto:cofoundue@gmail.com" 
                  className="group flex items-center gap-2.5 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-[#E60000] shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span>cofoundue@gmail.com</span>
                </a>
              </li>
              <li className="mt-4">
                <p className="text-zinc-500 text-xs">
                  Campus Turia y Alameda<br />
                  Universidad Europea de Valencia
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <p>© {currentYear} Marc Cubero Cantavella · CoFound UE. Todos los derechos reservados.</p>
          <p className="text-zinc-400 text-sm mb-4 md:mb-0">
            Diseñado y desarrollado por Marc Cubero Cantavella
          </p>
        </div>
      </div>
    </footer>
  );
}
