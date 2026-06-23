import type { NextConfig } from "next";

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.google-analytics.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://media.fasesport.com https://pub-*.r2.dev https://*.r2.cloudflarestorage.com https://maps.googleapis.com https://maps.gstatic.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://*.upstash.io https://*.google-analytics.com https://*.googletagmanager.com https://maps.googleapis.com`,
  `frame-src 'self' https://www.google.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.fasesport.com",
        pathname: "/**",
      },
      {
        // R2 endpoint direto (upload via SDK)
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        // R2 public URL (acesso público via pub-*.r2.dev)
        protocol: "https",
        hostname: "pub-8527c7f1798646e28d4279e70d4b901e.r2.dev",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
