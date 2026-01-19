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
  async redirects() {
    return [
      {
        source: '/p/about-us',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/p/history',
        destination: '/history',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
