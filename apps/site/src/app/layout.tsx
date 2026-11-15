import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { loadCatalog } from "@agentrica/catalog";
import { NetworkBackground } from "@/components/network-background";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// next/font scarica i font al build e li serve dal sito: nessuna richiesta a Google dai visitatori.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const departments = loadCatalog().map(({ code, name, slug }) => ({ code, name, slug }));

export const metadata: Metadata = {
  title: "Agentrica · Consulenza agentica",
  description:
    "Agentrica è una società fittizia di consulenza agentica: reparti e agenti specializzati in business, design, privacy, software e sicurezza.",
  openGraph: { type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <a
          href="#contenuto"
          className="absolute -top-12 left-4 z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:top-4"
        >
          Vai al contenuto
        </a>
        <NetworkBackground />
        <SiteHeader departments={departments} />
        {children}
      </body>
    </html>
  );
}
