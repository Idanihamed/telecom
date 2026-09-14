/** @type {import('next').NextConfig} */
const nextConfig = {
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
