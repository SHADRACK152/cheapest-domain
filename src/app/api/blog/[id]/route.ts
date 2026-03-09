import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'scheduled';
  featuredImage: string;
  author: string;
  date: string;
  readTime: string;
  tags: string;
  metaDescription: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

const BLOG_DATA_FILE = join(process.cwd(), 'data', 'blog-posts.json');

async function loadPosts(): Promise<BlogPost[]> {
  try {
    if (existsSync(BLOG_DATA_FILE)) {
      const data = await readFile(BLOG_DATA_FILE, 'utf-8');
      if (!data || data.trim() === '') return [];
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
  }
  return [];
}

async function savePosts(posts: BlogPost[]) {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true });
  await writeFile(BLOG_DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

// GET single post by ID or slug
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const posts = await loadPosts();
  const post = posts.find((p) => p.id === id) ?? posts.find((p) => p.slug === id);
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
    const posts = await loadPosts();
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check slug uniqueness (allow same slug as current post)
    if (body.slug && body.slug !== posts[index].slug) {
      const slugExists = posts.some((p, i) => i !== index && p.slug === body.slug);
      if (slugExists) {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 });
      }
    }

    const updated: BlogPost = {
      ...posts[index],
      ...body,
      id,                              // never overwrite id
      updatedAt: new Date().toISOString(),
    };

    posts[index] = updated;
    await savePosts(posts);

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
    const posts = await loadPosts();
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    posts.splice(index, 1);
    await savePosts(posts);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
