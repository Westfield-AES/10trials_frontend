import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

function origin(value: string | undefined) {
  if (!value) return null;
  try {
    const withScheme = /^https?:\/\//.test(value) ? value : `https://${value}`;
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

const connectSources = Array.from(
  new Set(
    [
      "'self'",
      origin(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"),
      origin(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
      origin(
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      ),
      origin(process.env.NEXT_PUBLIC_SENTRY_DSN),
      "https://accounts.google.com",
      "https://apis.google.com",
      "https://identitytoolkit.googleapis.com",
      "https://securetoken.googleapis.com",
      "https://www.google.com",
      "https://www.googleapis.com",
      "https://*.firebaseio.com",
      "wss://*.firebaseio.com",
    ].filter((value): value is string => Boolean(value)),
  ),
);

const frameSources = Array.from(
  new Set(
    [
      "'self'",
      origin(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
      "https://accounts.google.com",
      "https://www.google.com/recaptcha/",
      "https://recaptcha.google.com/recaptcha/",
    ].filter((value): value is string => Boolean(value)),
  ),
);

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://apis.google.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(" ")}`,
  `frame-src ${frameSources.join(" ")}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "0" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
