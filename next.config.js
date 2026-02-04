const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://cdn.channel.io https://*.sentry.io https://static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://spoqa.github.io",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.bestcome.org https://*.unipivot.kr https://api.unipivot.kr https://*.sentry.io https://*.google-analytics.com https://cdn.channel.io wss://cdn.channel.io https://cdn.jsdelivr.net",
              "frame-src 'self' https://accounts.google.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
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
      // /mypage/* → /my/* 레거시 라우트 리다이렉트
      { source: '/mypage', destination: '/my', permanent: true },
      { source: '/mypage/profile', destination: '/my/profile', permanent: true },
      { source: '/mypage/settings', destination: '/my/settings', permanent: true },
      { source: '/mypage/programs', destination: '/my/programs', permanent: true },
      { source: '/mypage/applications', destination: '/my/applications', permanent: true },
      { source: '/mypage/likes', destination: '/my/likes', permanent: true },
      { source: '/mypage/points', destination: '/my/points', permanent: true },
      { source: '/mypage/notifications', destination: '/my/notifications', permanent: true },
      { source: '/mypage/reports', destination: '/my/reports', permanent: true },
    ]
  },
}

const sentryConfig = withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
})

module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN ? sentryConfig : withBundleAnalyzer(nextConfig)
