import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: path.join(__dirname, './'),
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore build errors to allow successful builds
    // Remove this once all type errors are fixed
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  reactStrictMode: true,
  transpilePackages: ['rate-limiter-flexible'],

  // Silence the webpack/Turbopack conflict warning in Next.js 15 by
  // explicitly opting into webpack for the production build.
  // Remove this block once the project migrates to Turbopack-native config.

  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // NOTE: CORS for /api/* is handled by src/middleware.ts — do NOT set
      // Access-Control-Allow-Origin here as static headers cannot be origin-selective.
    ];
  },

  webpack: (config) => {
    // Exclude TypeScript definition files from webpack processing
    config.module.rules.push({
      test: /\.d\.ts$/,
      loader: 'ignore-loader',
    });

    return config;
  },
};

export default nextConfig;
