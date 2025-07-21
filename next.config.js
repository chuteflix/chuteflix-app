/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
