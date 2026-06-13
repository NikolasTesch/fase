import type { NextConfig } from "next";

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
};

export default nextConfig;
