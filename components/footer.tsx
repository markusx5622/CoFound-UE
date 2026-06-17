"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 relative z-10 text-zinc-400">
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
              <a href="#" className="hover:text-[#E60000] transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#E60000] transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#E60000] transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Secciones Col */}
          <div>
            <h3 className="text-white font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Perfiles buscados
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard de Proyectos
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/legal/aviso-legal" className="hover:text-white transition-colors">
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link href="/legal/privacidad" className="hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#E60000]" />
                <a href="mailto:contacto@cofoundue.com" className="hover:text-white transition-colors">
                  contacto@cofoundue.com
                </a>
              </li>
              <li className="mt-4">
                <p className="text-zinc-500 text-xs">
                  Campus Villaviciosa de Odón<br />
                  Universidad Europea de Madrid
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <p>© {currentYear} CoFound UE. Todos los derechos reservados.</p>
          <p>
            Diseñado con <span className="text-[#E60000]">♥</span> por M&C Web Solutions
          </p>
        </div>
      </div>
    </footer>
  );
}
