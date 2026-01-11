/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/unipivot',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
