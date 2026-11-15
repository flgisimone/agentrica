import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentrica · Consulenza fatta di agenti IA",
  description:
    "Agentrica è una società di consulenza fittizia fatta di agenti IA: reparti e agenti specializzati in business, design, privacy, software e sicurezza.",
  openGraph: { type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0b1020",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        <a
          href="#contenuto"
          className="absolute -top-12 left-4 z-10 rounded-lg bg-foreground px-4 py-2 text-background focus:top-4"
        >
          Vai al contenuto
        </a>
        {children}
      </body>
    </html>
  );
}
