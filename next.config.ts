import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${BACKEND_URL.replace(/\/+$/, '')}/:path*`,
      },
    ];
  },
};

export default nextConfig;
