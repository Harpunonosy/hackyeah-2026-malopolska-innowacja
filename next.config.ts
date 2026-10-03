import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy bez nonce (strony są dynamiczne, Next wstawia skrypty inline): tylko własne zasoby,
// odtwarzacz youtube-nocookie po kliknięciu. Osadzanie w ramce: Splot tylko u siebie, widżet wszędzie.
const csp = (ramki: string) => [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "frame-src https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `frame-ancestors ${ramki}`,
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // dostęp do trybu dev przez adres sieciowy (np. z telefonu); w razie zmiany IP dopisz nowy
  allowedDevOrigins: ["10.250.193.255"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      {
        source: "/((?!widzet).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: csp("'self'") },
        ],
      },
      {
        source: "/widzet",
        headers: [{ key: "Content-Security-Policy", value: csp("*") }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
