import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// CSP «Without Nonces» della guida di Next (docs/01-app/02-guides/content-security-policy.md): tutto dal sito stesso.
// ponytail: 'unsafe-inline' negli script serve agli script inline di Next nelle pagine statiche; il sito non ha input
// degli utenti né script di terzi. Se ne arrivano, passare ai nonce (pagine dinamiche) o all'SRI quando non è più
// sperimentale. Niente upgrade-insecure-requests: gli e2e girano su http://localhost; in produzione c'è HSTS.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  // Monorepo: la root è quella del repository, che contiene package-lock.json e agents/.
  turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
