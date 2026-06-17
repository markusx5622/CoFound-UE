import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://cofound-ue.vercel.app"),
  title: "CoFound UE - Encuentra tu Co-Founder",
  description: "Conecta con talento de ADE, Marketing, Tech y Diseño en el Campus de la Universidad Europea de Valencia para crear tu startup.",
  icons: {
    icon: [
      { url: "/CoFoundUE_logo.png", sizes: "any" },
      { url: "/CoFoundUE_logo.png", type: "image/png" }
    ],
    apple: "/CoFoundUE_logo.png",
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
      }
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
      <body className={`${inter.className} min-h-screen bg-white text-black flex flex-col`}>
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
