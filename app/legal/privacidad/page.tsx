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
        <p className="text-zinc-500 mb-10 pb-6 border-b border-zinc-800/50">Última actualización: 18 de Septiembre de 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Responsable del Tratamiento</h2>
            <p>
              <strong className="text-white">Marc Cubero Cantavella</strong> (en adelante, el RESPONSABLE), titular de la plataforma <strong className="text-white">CoFound UE</strong>, con email de contacto <strong className="text-white">cofoundue@gmail.com</strong> y radicado en Valencia (España), es el Responsable del tratamiento de los datos personales del Usuario y le informa de que estos datos serán tratados de conformidad con lo dispuesto en el Reglamento (UE) 2016/679 de 27 de abril de 2016 (RGPD) y la Ley Orgánica 3/2018, de 5 de diciembre (LOPDGDD).
            </p>
            <p className="text-zinc-400 mt-3 text-sm bg-zinc-800/40 p-3 rounded-lg border border-zinc-800">
              <strong className="text-zinc-200">Nota de independencia:</strong> CoFound UE es una iniciativa estudiantil independiente y no mantiene relación institucional, patrocinio ni afiliación oficial con la Universidad Europea.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Finalidad del Tratamiento de los Datos</h2>
            <p>
              Los datos personales recabados a través de la plataforma serán utilizados única y exclusivamente para los siguientes fines:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li><strong className="text-zinc-200">Gestión de Usuarios:</strong> Para identificar al usuario mediante su correo institucional de la Universidad Europea y garantizar un entorno cerrado de estudiantes reales.</li>
              <li><strong className="text-zinc-200">Creación de Perfil y Directorio:</strong> Para permitir la publicación y búsqueda de proyectos de emprendimiento dentro del ecosistema universitario.</li>
              <li><strong className="text-zinc-200">Mensajería Privada:</strong> La plataforma incluye una funcionalidad de mensajería privada directa entre el creador del proyecto y los postulantes para coordinar detalles de colaboración e intercambio entre las partes.</li>
              <li><strong className="text-zinc-200">Comunicación y Notificaciones:</strong> Para gestionar notificaciones, interacciones, solicitudes de match y correos de carácter operativo sobre la actividad del usuario en la plataforma.</li>
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
              Los datos se conservarán durante el tiempo que el usuario mantenga su cuenta activa en CoFound UE. Cuando el usuario decida darse de baja o solicitar la supresión de su cuenta, sus datos personales serán eliminados con medidas de seguridad adecuadas, excepto en los supuestos en los que una obligación legal requiera su conservación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Comunicación y Alojamiento de los Datos</h2>
            <p>
              Los datos personales no se cederán ni venderán a terceros para fines comerciales. La plataforma hace uso de infraestructuras en la nube proporcionadas por <strong className="text-white">Google Firebase</strong> (Firebase Authentication y Cloud Firestore) y <strong className="text-white">Vercel Inc.</strong>, las cuales actúan como encargadas del tratamiento bajo estrictas medidas de seguridad y privacidad conformes al RGPD.
            </p>
            <p className="mt-2">
              Dado que los servidores de Google Firebase pueden operar a escala global, se contempla la posibilidad de transferencias internacionales de datos fuera del Espacio Económico Europeo (EEE), las cuales se realizan con las debidas garantías legales mediante Cláusulas Contractuales Tipo (SCC) aprobadas por la Comisión Europea y bajo los marcos de adecuación correspondientes.
            </p>
            <p className="mt-2">
              El correo institucional, nombre, titulación y habilidades introducidos por el usuario serán visibles de forma interna para otros usuarios registrados de la plataforma con el exclusivo fin de facilitar la colaboración en proyectos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Derechos del Usuario (ARCO)</h2>
            <p>
              Conforme al RGPD y la LOPDGDD, cualquier persona tiene derecho a obtener confirmación sobre si en CoFound UE estamos tratando datos personales que le conciernan. Las personas interesadas tienen derecho a:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li><strong className="text-zinc-200">Acceso:</strong> Consultar qué datos personales disponemos sobre ti.</li>
              <li><strong className="text-zinc-200">Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
              <li><strong className="text-zinc-200">Supresión:</strong> Solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
              <li><strong className="text-zinc-200">Limitación y Oposición:</strong> Solicitar la limitación u oponerse al tratamiento de tus datos bajo circunstancias específicas.</li>
              <li><strong className="text-zinc-200">Portabilidad:</strong> Recibir tus datos en un formato estructurado y de uso común.</li>
            </ul>
            <p className="mt-4">
              Para ejercer cualquiera de estos derechos, el usuario puede enviar una solicitud por escrito a nuestro correo electrónico: <strong className="text-white">cofoundue@gmail.com</strong>, acreditando su identidad e indicando el derecho que desea ejercer.
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
