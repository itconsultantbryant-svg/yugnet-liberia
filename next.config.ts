import type { NextConfig } from "next";

const backend = process.env.API_BACKEND_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Secondary path: proxy.ts (API_BACKEND_URL) is the primary same-origin bridge.
  // Config rewrites help static /uploads when the App Router handler is not used.
  async rewrites() {
    if (!backend) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backend}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
