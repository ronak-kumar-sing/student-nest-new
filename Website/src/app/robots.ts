import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://student-nest.live';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/student/dashboard/',
          '/owner/dashboard/',
          '/admin/',
          '/*.json$',
          '/*?*utm_*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
