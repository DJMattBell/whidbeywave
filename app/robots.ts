import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/auth/'],
    },
    sitemap: 'https://whidbeywave.com/sitemap.xml',
    host: 'https://whidbeywave.com',
  }
}
