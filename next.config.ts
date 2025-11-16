import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kttordnmmzokogigquxa.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Configuración de caché para imágenes optimizadas
    minimumCacheTTL: 31536000, // 1 año en segundos (imágenes estáticas)
  },
};

export default nextConfig;
