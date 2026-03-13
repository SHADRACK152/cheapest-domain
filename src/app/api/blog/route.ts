import { NextRequest, NextResponse } from 'next/server';
import { createBlogPost, listBlogPosts, slugExists, toSlug } from '@/lib/blog-store';

// GET - Fetch all blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const posts = await listBlogPosts(status || undefined);

    return NextResponse.json({
      success: true,
      posts,
      total: posts.length,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    const message = error instanceof Error ? error.message : '';
    const details = message.includes('DATABASE_URL is not set')
      ? 'DATABASE_URL is missing in this environment.'
      : undefined;
    return NextResponse.json(
      { error: 'Failed to fetch posts', details },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const excerpt = String(body.excerpt || '').trim();
    const content = String(body.content || '').trim();
    const slug = toSlug(String(body.slug || title));

    // Validation
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    if (await slugExists(slug)) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }
    const newPost = await createBlogPost({
      title,
      slug,
      excerpt,
      content,
      category: String(body.category || 'Guide').trim(),
      status: body.status,
      featuredImage: String(body.featuredImage || '').trim(),
      readTime: String(body.readTime || '').trim() || '5 min',
      tags: String(body.tags || '').trim(),
      metaDescription: String(body.metaDescription || '').trim() || excerpt.substring(0, 160),
      scheduledDate: body.scheduledDate ? String(body.scheduledDate) : undefined,
      author: 'TrueHost Team',
    });

    return NextResponse.json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    const message = error instanceof Error ? error.message : '';
    const details = message.includes('DATABASE_URL is not set')
      ? 'DATABASE_URL is missing in this environment.'
      : undefined;
    return NextResponse.json(
      { error: 'Failed to create post', details },
      { status: 500 }
    );
  }
}
