import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import ParticleBackground from "@/components/particle-background";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#E60000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cofoundue.es"),
  title: "CoFound UE - Encuentra tu Co-Founder",
  description: "Conecta con talento de ADE, Marketing, Tech y Diseño en el Campus de la Universidad Europea de Valencia para crear tu startup.",
  appleWebApp: {
    capable: true,
    title: "CoFound UE",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
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
    title: "CoFound UE - Conecta con talento en el Campus",
    description: "La red exclusiva para conectar talento de ADE, Marketing, Tech y Diseño de la Universidad Europea.",
    url: "https://cofound-ue.vercel.app",
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
    title: "CoFound UE - Conecta con talento en el Campus",
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
        <AuthProvider>
          <ServiceWorkerRegister />
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
      </body>
    </html>
  );
}
