import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { listBlogPosts } from '@/lib/blog-store';
import type { BlogPost } from '@/lib/blog-store';

// Refresh sitemap every 5 minutes so newly published posts are discoverable quickly.
export const revalidate = 300;

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/search', changeFrequency: 'daily', priority: 0.9 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/transfer', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/registrars', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/promos', changeFrequency: 'daily', priority: 0.8 },
  { path: '/whois', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let blogPages: MetadataRoute.Sitemap = [];

  try {
    const posts: BlogPost[] = await listBlogPosts('published');
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt || now),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch {
    // Keep sitemap generation resilient even when blog storage is unavailable.
    blogPages = [];
  }

  return [...staticPages, ...blogPages];
}
