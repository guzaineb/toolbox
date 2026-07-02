import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://api:3000/uploads/:path*',
      },
    ];
  },
  images: {
    domains: ['localhost','91.134.139.163'],
  },
};

export default nextConfig;
