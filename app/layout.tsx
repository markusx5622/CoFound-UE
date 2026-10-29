import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import ParticleBackground from "@/components/particle-background";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Analytics } from "@vercel/analytics/react";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import { SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#E60000",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "CoFound UE",
      alternateName: ["cofoundue", "CoFoundUE", "CoFound UE Valencia", "CoFound Universidad Europea"],
      description: "La Plataforma Exclusiva de Co-Founders y Talento para la Universidad Europea.",
      inLanguage: ["es-ES", "en-US"],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "CoFound UE",
      alternateName: ["cofoundue", "CoFoundUE"],
      url: SITE_URL,
      logo: `${SITE_URL}/CoFoundUE_logo.png`,
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CoFound UE | Plataforma de Co-Founders y Talento - Universidad Europea",
    template: "%s | CoFound UE",
  },
  description: "Conecta con talento de ADE, Marketing, Tech y Diseño en el Campus de la Universidad Europea de Valencia para crear tu startup.",
  keywords: [
    "cofoundue",
    "cofound ue",
    "CoFound UE",
    "CoFoundUE",
    "co founder universidad europea",
    "startups universidad europea",
    "talento universidad europea",
    "tfg universidad europea emprendimiento",
    "emprendimiento universidad europea valencia",
    "estudiantes universidad europea startups",
    "marketplace talento universidad europea",
  ],
  authors: [{ name: "CoFound UE Team" }],
  creator: "CoFound UE",
  publisher: "CoFound UE",
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    title: "CoFound UE",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "CoFound UE",
    title: "CoFound UE | Plataforma de Co-Founders y Talento - Universidad Europea",
    description: "La red exclusiva para conectar talento de ADE, Marketing, Tech y Diseño de la Universidad Europea.",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "CoFound UE - Plataforma de talento y co-founders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoFound UE | Plataforma de Co-Founders y Talento - Universidad Europea",
    description: "La red exclusiva para conectar talento de ADE, Marketing, Tech y Diseño de la Universidad Europea.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CoFound UE - Plataforma de talento y co-founders",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-white flex flex-col relative`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          <AuthProvider>
            <ServiceWorkerRegister />
            <PwaInstallPrompt />
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
              <ParticleBackground />
            </div>
            <Navbar />
            <main className="flex-grow flex flex-col relative z-10">
              {children}
            </main>
            <Toaster position="top-center" richColors theme="dark" />
            <Analytics />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
