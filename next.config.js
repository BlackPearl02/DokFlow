/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optymalizacje dla Vercel
  poweredByHeader: false,
  
  // Kompresja i optymalizacja obrazów
  compress: true,
  
  // Ustawienia dla API routes
  experimental: {
    // Optymalizacja dla Vercel Edge Runtime (opcjonalne)
    // serverActions: {
    //   bodySizeLimit: '50mb',
    // },
  },
};

module.exports = nextConfig;
