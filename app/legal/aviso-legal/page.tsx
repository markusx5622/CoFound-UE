import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Aviso Legal | CoFound UE",
  description: "Aviso legal y condiciones de uso de la plataforma CoFound UE para estudiantes de la Universidad Europea.",
};

export default function AvisoLegal() {
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
        
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Aviso Legal</h1>
        <p className="text-zinc-500 mb-10 pb-6 border-b border-zinc-800/50">Última actualización: 17 de Junio de 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Datos Identificativos</h2>
            <p>
              En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se hace constar que esta plataforma web ha sido desarrollada por el equipo de M&C Web Solutions, operando bajo el nombre de proyecto universitario <strong className="text-white">CoFound UE</strong>.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li><strong className="text-zinc-200">Denominación del proyecto:</strong> CoFound UE</li>
              <li><strong className="text-zinc-200">Email de contacto:</strong> contacto@cofoundue.com</li>
              <li><strong className="text-zinc-200">Ubicación orientativa:</strong> Campus Universitario, Universidad Europea</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Usuarios y Condiciones Generales</h2>
            <p>
              El acceso y/o uso de este portal web atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento. 
            </p>
            <p className="mt-2">
              CoFound UE es una plataforma estrictamente orientada al ecosistema estudiantil de la Universidad Europea. El acceso a la creación de cuenta y visualización de perfiles está reservado exclusivamente para cuentas de correo institucionales (@live.uem.es, @universidadeuropea.es).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Uso del Portal</h2>
            <p>
              El usuario asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro que fuese necesario para acceder a determinados servicios o contenidos. En dicho registro el usuario será responsable de aportar información veraz y lícita.
            </p>
            <p className="mt-2">
              El usuario se compromete a hacer un uso adecuado de los contenidos y servicios (como por ejemplo servicios de chat, foros de discusión o grupos de noticias) que CoFound UE ofrece a través de su portal y con carácter enunciativo pero no limitativo, a no emplearlos para:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-zinc-400">
              <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
              <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos.</li>
              <li>Provocar daños en los sistemas físicos y lógicos de la plataforma, de sus proveedores o de terceras personas, introducir o difundir en la red virus informáticos o cualesquiera otros sistemas.</li>
              <li>Intentar acceder y, en su caso, utilizar las cuentas de correo electrónico de otros usuarios y modificar o manipular sus mensajes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Propiedad Intelectual e Industrial</h2>
            <p>
              CoFound UE por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, etc.).
            </p>
            <p className="mt-2">
              Todos los derechos reservados. Cualquier uso no autorizado previamente será considerado un incumplimiento grave de los derechos de propiedad intelectual o industrial del autor. Quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública de la totalidad o parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de CoFound UE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Exclusión de Garantías y Responsabilidad</h2>
            <p>
              CoFound UE no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Modificaciones</h2>
            <p>
              CoFound UE se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Legislación Aplicable y Jurisdicción</h2>
            <p>
              La relación entre CoFound UE y el USUARIO se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Valencia, España.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
