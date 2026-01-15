/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Skip pages that fail to prerender
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
