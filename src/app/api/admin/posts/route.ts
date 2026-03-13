import { NextResponse } from 'next/server';
import { createBlogPost, toSlug } from '@/lib/blog-store';

export async function POST(req: Request) {
  try {
    const post = await req.json();
    const title = String(post.title || '').trim();
    const excerpt = String(post.excerpt || '').trim();
    const content = String(post.content || '').trim();
    if (!title || !excerpt || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const created = await createBlogPost({
      title,
      slug: toSlug(String(post.slug || title)),
      excerpt,
      content,
      category: String(post.category || 'Guide'),
      status: post.status,
      featuredImage: String(post.featuredImage || ''),
      readTime: String(post.readTime || '5 min'),
      tags: String(post.tags || ''),
      metaDescription: String(post.metaDescription || excerpt.slice(0, 160)),
      scheduledDate: post.scheduledDate ? String(post.scheduledDate) : undefined,
      author: String(post.author || 'TrueHost Team'),
      date: String(post.date || ''),
    });

    return NextResponse.json({ success: true, post: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
