import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuración para evitar problemas con rutas que contienen espacios
  // Turbopack se desactiva desde package.json para evitar problemas con espacios
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
