import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow build to succeed even with TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow build to succeed even with ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ...other config options here
};

export default nextConfig;
