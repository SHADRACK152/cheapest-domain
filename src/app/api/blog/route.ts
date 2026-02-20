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

async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

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

async function savePosts(posts: BlogPost[]) {
  await ensureDataDir();
  await writeFile(BLOG_DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

// GET - Fetch all blog posts
export async function GET(request: NextRequest) {
  try {
    const posts = await loadPosts();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let filteredPosts = posts;
    
    if (status && status !== 'all') {
      filteredPosts = posts.filter(post => post.status === status);
    }

    return NextResponse.json({
      success: true,
      posts: filteredPosts,
      total: filteredPosts.length,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      status,
      featuredImage,
      readTime,
      tags,
      metaDescription,
      scheduledDate,
    } = body;

    // Validation
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const posts = await loadPosts();

    // Check for duplicate slug
    const existingPost = posts.find(p => p.slug === slug);
    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title,
      slug,
      excerpt,
      content,
      category: category || 'Guide',
      status: status || 'draft',
      featuredImage: featuredImage || '',
      author: 'TrueHost Team',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      readTime: readTime || '5 min',
      tags: tags || '',
      metaDescription: metaDescription || excerpt.substring(0, 160),
      scheduledDate,
      createdAt: now,
      updatedAt: now,
    };

    posts.unshift(newPost);
    await savePosts(posts);

    return NextResponse.json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
