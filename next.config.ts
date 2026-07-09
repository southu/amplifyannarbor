import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stamp the deploying commit SHA at build time so /version can report it.
  // CF_PAGES_COMMIT_SHA is injected by Cloudflare Pages builds; "local" otherwise.
  env: {
    COMMIT_SHA: process.env.CF_PAGES_COMMIT_SHA ?? "local",
  },

  // Image optimization - use unoptimized for Cloudflare Pages
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirects (if needed)
  async redirects() {
    return [
      {
        source: "/lineup",
        destination: "/events",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
