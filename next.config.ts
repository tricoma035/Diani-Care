import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuración optimizada para Next.js 15
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Configuración para mejorar el rendimiento
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  // Configuración de imágenes optimizada
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
