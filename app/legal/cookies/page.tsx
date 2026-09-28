import PoliticaCookiesContent from "./content";

export const metadata = {
  title: "Política de Cookies | CoFound UE",
  description: "Información sobre el uso de cookies en la plataforma CoFound UE.",
  alternates: {
    canonical: "/legal/cookies",
  },
};

export default function PoliticaCookies() {
  return <PoliticaCookiesContent />;
}
