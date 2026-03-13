import { NextRequest, NextResponse } from 'next/server';
import { findBlogPostByIdOrSlug, slugExists, toSlug, updateBlogPostById, deleteBlogPostById } from '@/lib/blog-store';

// GET single post by ID or slug
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await findBlogPostByIdOrSlug(id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, post });
}

// PUT - Update existing post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await findBlogPostByIdOrSlug(id);
    if (!existing || existing.id !== id) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const nextTitle = typeof body.title === 'string' ? body.title.trim() : existing.title;
    const nextSlug = toSlug(String(body.slug || nextTitle || existing.slug));

    // Check slug uniqueness (allow same slug as current post)
    if (nextSlug && await slugExists(nextSlug, id)) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 });
    }

    const updated = await updateBlogPostById(id, {
      ...body,
      title: nextTitle,
      slug: nextSlug,
      excerpt: typeof body.excerpt === 'string' ? body.excerpt.trim() : undefined,
      content: typeof body.content === 'string' ? body.content.trim() : undefined,
      featuredImage: typeof body.featuredImage === 'string' ? body.featuredImage.trim() : undefined,
      tags: typeof body.tags === 'string' ? body.tags.trim() : undefined,
      metaDescription:
        typeof body.metaDescription === 'string' && body.metaDescription.trim()
          ? body.metaDescription.trim()
          : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE - Remove post
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteBlogPostById(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
