import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Cookies | CoFound UE",
  description: "Información sobre el uso de cookies en la plataforma CoFound UE.",
};

export default function PoliticaCookies() {
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
        
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Política de Cookies</h1>
        <p className="text-zinc-500 mb-10 pb-6 border-b border-zinc-800/50">Última actualización: 17 de Junio de 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. ¿Qué son las cookies?</h2>
            <p>
              Una cookie es un fichero que se descarga en su ordenador o dispositivo móvil al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. ¿Qué tipos de cookies utiliza esta página web?</h2>
            <p>
              CoFound UE utiliza cookies propias y de terceros con los siguientes fines:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-4 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Cookies Técnicas (Estrictamente Necesarias):</strong> Son aquellas que permiten al usuario la navegación a través de la página web y la utilización de las diferentes opciones o servicios que en ella existen. Son esenciales, por ejemplo, para mantener tu sesión iniciada de forma segura a través de la tecnología de Firebase Auth. Si desactivas estas cookies, la plataforma no podrá funcionar correctamente.
              </li>
              <li>
                <strong className="text-zinc-200">Cookies de Análisis o Medición:</strong> Son aquellas que, bien tratadas por nosotros o por terceros (como Google Analytics 4), nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios de la plataforma. Para ello se analiza su navegación en nuestra página web con el fin de mejorar la oferta de productos o servicios que le ofrecemos.
              </li>
              <li>
                <strong className="text-zinc-200">Cookies de Personalización:</strong> Son aquéllas que permiten recordar información para que el usuario acceda al servicio con determinadas características que pueden diferenciar su experiencia de la de otros usuarios, como, por ejemplo, las preferencias de interfaz (modo claro/oscuro) en caso de estar disponibles.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Consentimiento</h2>
            <p>
              Al acceder por primera vez a CoFound UE, te informamos sobre el uso de cookies mediante un banner donde puedes elegir aceptar o rechazar las cookies que no son estrictamente necesarias (como las de análisis). Las cookies estrictamente necesarias para el funcionamiento del inicio de sesión y la plataforma no pueden rechazarse si deseas utilizar el servicio, dado que sin ellas es imposible mantener tu cuenta activa y segura de página en página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Revocación y eliminación de cookies</h2>
            <p>
              Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador o dispositivo móvil. A continuación te ofrecemos enlaces en los que encontrarás información sobre cómo puedes activar tus preferencias en los principales navegadores:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li><a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" rel="noopener noreferrer" className="text-[#E60000] hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-[#E60000] hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-[#E60000] hover:underline">Microsoft Edge</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#E60000] hover:underline">Safari</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Modificaciones en la Política de Cookies</h2>
            <p>
              Es posible que actualicemos la Política de Cookies de nuestro Sitio Web, por ello te recomendamos revisar esta política cada vez que accedas a nuestro Sitio Web con el objetivo de estar adecuadamente informado sobre cómo y para qué usamos las cookies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
