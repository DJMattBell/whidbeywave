import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/', '/admin/', '/auth/'] },
    ],
    sitemap: 'https://www.whidbeywave.com/sitemap.xml',
    host: 'https://www.whidbeywave.com',
  }
}
