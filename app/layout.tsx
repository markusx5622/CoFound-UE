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
  metadataBase: new URL("https://cofound-ue.vercel.app"),
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
    title: "CoFound UE - Conecta con talento en el Campus",
    description: "La red exclusiva para conectar talento de ADE, Marketing, Tech y Diseño de la Universidad Europea.",
    url: "https://cofound-ue.vercel.app",
    siteName: "CoFound UE",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/CoFoundUE_banner.png",
        width: 1200,
        height: 630,
        alt: "CoFound UE - Conecta con talento en la Universidad Europea",
      },
      {
        url: "/CoFoundUE_logo.png",
        width: 500,
        height: 500,
        alt: "CoFound UE Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoFound UE - Conecta con talento en el Campus",
    description: "La red exclusiva para conectar talento de ADE, Marketing, Tech y Diseño de la Universidad Europea.",
    images: ["/CoFoundUE_banner.png"],
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
