import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://beautylooksmumbai.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/admin/', '/checkout/', '/cart/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
