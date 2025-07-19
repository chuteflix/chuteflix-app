
import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // ADICIONADO: Garante que o build seja autocontido e otimizado para deploy.
  output: 'standalone',

  typescript: {
    // Permite o build mesmo que haja erros de tipo.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Pula a verificação de ESLint durante o build.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Mantido por enquanto para imagens antigas
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
