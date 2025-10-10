import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/zoeken/:slug',
        destination: '/search/:slug',
      },
    ];
  },
};

export default nextConfig;
