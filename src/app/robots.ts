import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/club/admin/',
          '/club/settings/',
          '/api/',
          '/my/',
          '/admin/',
          '/api-docs',
        ],
      },
    ],
    sitemap: 'https://bestcome.org/sitemap.xml',
  }
}
