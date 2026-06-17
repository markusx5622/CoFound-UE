import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad | CoFound UE",
  description: "Política de privacidad y protección de datos personales de la plataforma CoFound UE.",
};

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-transparent py-16 px-6 relative z-10">
      <div className="max-w-4xl mx-auto bg-zinc-900/60 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.3)] border border-zinc-800">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#E60000] transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a inicio
        </Link>
        
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Política de Privacidad</h1>
        <p className="text-zinc-500 mb-10 pb-6 border-b border-zinc-800/50">Última actualización: 17 de Junio de 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Información al Usuario</h2>
            <p>
              El equipo detrás de <strong className="text-white">CoFound UE</strong> (en adelante, el RESPONSABLE), es el Responsable del tratamiento de los datos personales del Usuario y le informa de que estos datos serán tratados de conformidad con lo dispuesto en el Reglamento (UE) 2016/679 de 27 de abril de 2016 (GDPR) relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Finalidad del Tratamiento de los Datos</h2>
            <p>
              Los datos personales recabados a través de la plataforma serán utilizados única y exclusivamente para los siguientes fines:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li><strong className="text-zinc-200">Gestión de Usuarios:</strong> Para identificar al usuario mediante su correo institucional de la Universidad Europea y garantizar un entorno cerrado de estudiantes reales.</li>
              <li><strong className="text-zinc-200">Creación de Perfil:</strong> Para permitir la publicación y búsqueda de proyectos de emprendimiento dentro del ecosistema universitario.</li>
              <li><strong className="text-zinc-200">Comunicación:</strong> Para gestionar notificaciones, interacciones, solicitudes de match y correos electrónicos de carácter informativo sobre la actividad del usuario en la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Base Legitimadora del Tratamiento</h2>
            <p>
              La base legal para el tratamiento de los datos es el <strong className="text-white">consentimiento expreso</strong> del usuario. El registro en la plataforma CoFound UE y el uso de la misma implican la aceptación de esta Política de Privacidad y el consentimiento inequívoco para que los datos proporcionados sean tratados conforme a las finalidades aquí expuestas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Criterios de Conservación de los Datos</h2>
            <p>
              Los datos se conservarán durante el tiempo que el usuario mantenga su cuenta activa en CoFound UE. Cuando el usuario decida darse de baja, sus datos personales serán suprimidos con medidas de seguridad adecuadas, excepto en los casos en los que una obligación legal requiera su conservación por un tiempo estipulado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Comunicación de los Datos</h2>
            <p>
              Los datos personales no se cederán ni venderán a terceros. La plataforma hace uso de infraestructuras de terceros en formato de computación en la nube (ej. Firebase/Google Cloud, Vercel) que actúan como Encargados de Tratamiento de los datos bajo las estrictas directrices de seguridad y cumplimiento del RGPD de sus respectivas compañías. 
            </p>
            <p className="mt-2">
              El correo electrónico institucional, las habilidades y el nombre introducido serán visibles para otros miembros de la plataforma a la hora de hacer "match" en proyectos, pues este es el propósito fundamental de la red social.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Derechos del Usuario</h2>
            <p>
              Cualquier persona tiene derecho a obtener confirmación sobre si en CoFound UE estamos tratando datos personales que le conciernan o no. Las personas interesadas tienen derecho a:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li>Solicitar el acceso a sus datos personales.</li>
              <li>Solicitar su rectificación o supresión.</li>
              <li>Solicitar la limitación de su tratamiento.</li>
              <li>Oponerse al tratamiento.</li>
              <li>Solicitar la portabilidad de los datos.</li>
            </ul>
            <p className="mt-4">
              Para ejercer cualquiera de estos derechos, el usuario puede enviar una solicitud detallada a nuestro correo electrónico de soporte: <strong className="text-white">contacto@cofoundue.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Medidas de Seguridad</h2>
            <p>
              CoFound UE ha adoptado las medidas de índole técnica y organizativa necesarias para garantizar la seguridad de los datos de carácter personal y evitar su alteración, pérdida, tratamiento o acceso no autorizado, habida cuenta del estado de la tecnología, la naturaleza de los datos almacenados y los riesgos a que están expuestos. Todo el tráfico de la web se encuentra cifrado bajo protocolo SSL/HTTPS.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
