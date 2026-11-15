import type { MetadataRoute } from "next";

// Solo installabile: niente service worker, quindi senza rete il sito non si apre (scelta confermata).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agentrica · Consulenza agentica",
    short_name: "Agentrica",
    description: "Reparti e agenti IA specializzati in business, design, privacy, software e sicurezza.",
    lang: "it",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1020",
    theme_color: "#0b1020",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
