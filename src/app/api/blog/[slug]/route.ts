import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
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
      if (!data || data.trim() === '') {
        console.warn('Blog data file is empty, returning empty array');
        return [];
      }
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
  }
  return [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const posts = await loadPosts();
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
