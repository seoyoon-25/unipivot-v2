const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

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
    serverComponentsExternalPackages: ['isomorphic-dompurify', 'jsdom', 'dompurify'],
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

module.exports = withBundleAnalyzer(nextConfig)
