import AvisoLegalContent from "./content";

export const metadata = {
  title: "Aviso Legal | CoFound UE",
  description: "Aviso legal y condiciones de uso de la plataforma CoFound UE para estudiantes de la Universidad Europea.",
  alternates: {
    canonical: "/legal/aviso-legal",
  },
};

export default function AvisoLegal() {
  return <AvisoLegalContent />;
}
