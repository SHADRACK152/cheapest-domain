// Lightweight Ghost Content API client and mapper
// Requires environment variables: GHOST_API_URL (e.g. https://your-site.com)
// and GHOST_CONTENT_API_KEY (Ghost Content API key)

type GhostPost = {
  id: string;
  title: string;
  slug: string;
  html?: string;
  custom_excerpt?: string;
  excerpt?: string;
  feature_image?: string;
  published_at?: string;
  primary_author?: { name?: string } | null;
  authors?: Array<{ name?: string }>;
  primary_tag?: { name?: string } | null;
  tags?: Array<{ name?: string }>;
};

export type BlogPostShape = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: 'published' | 'draft' | 'scheduled';
  featuredImage: string;
  author: string;
  date: string;
  readTime: string; // e.g. "5 min"
  tags: string;
  metaDescription?: string;
};

export async function fetchGhostPosts({ limit = 50 } = {}): Promise<BlogPostShape[]> {
  const apiUrl = process.env.GHOST_API_URL;
  const apiKey = process.env.GHOST_CONTENT_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('GHOST_API_URL and GHOST_CONTENT_API_KEY must be set in environment');
  }

  const url = new URL('/ghost/api/content/posts/', apiUrl);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('include', 'authors,tags');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('fields', 'id,title,slug,html,custom_excerpt,excerpt,feature_image,published_at');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Ghost API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const posts: GhostPost[] = data?.posts || [];

  return posts.map((p) => {
    const text = (p.html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = text ? text.split(' ').length : 0;
    const readMinutes = Math.max(1, Math.ceil(words / 200));

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: (p.custom_excerpt || p.excerpt || '').replace(/<[^>]*>/g, ''),
      content: p.html || '',
      category: p.primary_tag?.name || (p.tags && p.tags[0]?.name) || 'Guide',
      status: 'published',
      featuredImage: p.feature_image || '',
      author: p.primary_author?.name || p.authors?.[0]?.name || 'Staff',
      date: p.published_at ? new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      readTime: `${readMinutes} min`,
      tags: (p.tags || []).map((t) => t.name).join(','),
      metaDescription: p.custom_excerpt || p.excerpt || '',
    };
  });
}
