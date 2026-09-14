/** @type {import('next').NextConfig} */
const nextConfig = {
  // En production, le site (vercel.app) et l'API (onrender.com) sont deux domaines
  // différents — un cookie de session posé par l'un n'est alors "tiers" pour l'autre, et de
  // nombreux navigateurs (Safari en tête, Chrome de plus en plus) bloquent ou effacent ces
  // cookies tiers par défaut, même avec SameSite=None/Secure. Ce proxy transparent fait que le
  // navigateur ne voit jamais l'API directement pour les appels authentifiés (voir
  // lib/auth.ts) : il croit parler à son propre domaine, donc le cookie devient "premier
  // parti" et n'est plus soumis à ce blocage. BACKEND_ORIGIN (sans NEXT_PUBLIC_, jamais
  // exposé au navigateur) pointe vers l'API réelle.
  async rewrites() {
    const backendOrigin = process.env.BACKEND_ORIGIN ?? 'http://localhost:3001';
    return [{ source: '/api/:path*', destination: `${backendOrigin}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3001', pathname: '/uploads/**' },
      // STORAGE_DRIVER=cloudinary (voir backend/src/media/media.service.ts) : les images
      // uploadées après activation sont servies depuis ce domaine plutôt que /uploads/...
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/dm8ouhbk/**' },
    ],
  },
};

export default nextConfig;
