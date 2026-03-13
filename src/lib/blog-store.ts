import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getNeonSql } from '@/lib/neon';

export interface BlogPost {
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

interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category?: string;
  status?: 'draft' | 'published' | 'scheduled';
  featuredImage?: string;
  author?: string;
  date?: string;
  readTime?: string;
  tags?: string;
  metaDescription?: string;
  scheduledDate?: string;
}

const BLOG_DATA_FILE = join(process.cwd(), 'data', 'blog-posts.json');

let schemaReady: Promise<void> | null = null;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeStatus(status?: string): BlogPost['status'] {
  if (status === 'published' || status === 'scheduled' || status === 'draft') {
    return status;
  }
  return 'draft';
}

function toIsoOrUndefined(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function mapRowToBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: String(row.excerpt),
    content: String(row.content),
    category: String(row.category ?? 'Guide'),
    status: normalizeStatus(String(row.status ?? 'draft')),
    featuredImage: String(row.featured_image ?? ''),
    author: String(row.author ?? 'TrueHost Team'),
    date: String(row.display_date ?? ''),
    readTime: String(row.read_time ?? '5 min'),
    tags: String(row.tags ?? ''),
    metaDescription: String(row.meta_description ?? ''),
    scheduledDate: row.scheduled_date ? new Date(String(row.scheduled_date)).toISOString() : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

async function migrateFromJsonIfNeeded() {
  const sql = getNeonSql();
  const [{ count }] = await sql<{ count: string }[]>`select count(*)::text as count from blog_posts`;
  if (Number(count) > 0) return;
  if (!existsSync(BLOG_DATA_FILE)) return;

  let legacy: BlogPost[] = [];
  try {
    const raw = await readFile(BLOG_DATA_FILE, 'utf-8');
    legacy = JSON.parse(raw || '[]') as BlogPost[];
  } catch {
    return;
  }

  for (const post of legacy) {
    const title = String(post.title || '').trim();
    const excerpt = String(post.excerpt || '').trim();
    const content = String(post.content || '').trim();
    if (!title || !excerpt || !content) continue;

    const id = String(post.id || `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    const slug = toSlug(String(post.slug || title));
    const status = normalizeStatus(post.status);
    const createdAt = toIsoOrUndefined(post.createdAt) || new Date().toISOString();
    const updatedAt = toIsoOrUndefined(post.updatedAt) || createdAt;

    await sql`
      insert into blog_posts (
        id, title, slug, excerpt, content, category, status,
        featured_image, author, display_date, read_time, tags,
        meta_description, scheduled_date, created_at, updated_at
      )
      values (
        ${id}, ${title}, ${slug}, ${excerpt}, ${content}, ${post.category || 'Guide'}, ${status},
        ${post.featuredImage || ''}, ${post.author || 'TrueHost Team'}, ${post.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })},
        ${post.readTime || '5 min'}, ${post.tags || ''}, ${post.metaDescription || excerpt.slice(0, 160)},
        ${toIsoOrUndefined(post.scheduledDate) || null}, ${createdAt}, ${updatedAt}
      )
      on conflict (id) do nothing
    `;
  }
}

export async function ensureBlogSchema() {
  if (schemaReady) {
    await schemaReady;
    return;
  }

  const sql = getNeonSql();
  schemaReady = (async () => {
    await sql`
      create table if not exists blog_posts (
        id text primary key,
        title text not null,
        slug text not null unique,
        excerpt text not null,
        content text not null,
        category text not null default 'Guide',
        status text not null default 'draft',
        featured_image text not null default '',
        author text not null default 'TrueHost Team',
        display_date text not null,
        read_time text not null default '5 min',
        tags text not null default '',
        meta_description text not null default '',
        scheduled_date timestamptz,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;

    await sql`create index if not exists idx_blog_posts_status on blog_posts(status)`;
    await sql`create index if not exists idx_blog_posts_created_at on blog_posts(created_at desc)`;
    await migrateFromJsonIfNeeded();
  })();

  await schemaReady;
}

async function autoPublishScheduledPosts() {
  const sql = getNeonSql();
  await sql`
    update blog_posts
    set status = 'published', updated_at = now()
    where status = 'scheduled'
      and scheduled_date is not null
      and scheduled_date <= now()
  `;
}

export async function listBlogPosts(status?: string) {
  await ensureBlogSchema();
  await autoPublishScheduledPosts();
  const sql = getNeonSql();

  const rows = status && status !== 'all'
    ? await sql`select * from blog_posts where status = ${status} order by created_at desc`
    : await sql`select * from blog_posts order by created_at desc`;

  return rows.map((row: Record<string, unknown>) => mapRowToBlogPost(row));
}

export async function findBlogPostByIdOrSlug(value: string) {
  await ensureBlogSchema();
  await autoPublishScheduledPosts();
  const sql = getNeonSql();

  const rows = await sql`
    select * from blog_posts
    where id = ${value} or slug = ${value}
    limit 1
  `;

  if (!rows.length) return null;
  return mapRowToBlogPost(rows[0] as Record<string, unknown>);
}

export async function createBlogPost(input: BlogPostInput) {
  await ensureBlogSchema();
  const sql = getNeonSql();

  const now = new Date().toISOString();
  const title = String(input.title || '').trim();
  const excerpt = String(input.excerpt || '').trim();
  const content = String(input.content || '').trim();
  const slug = toSlug(String(input.slug || title));
  const status = normalizeStatus(input.status);

  const postDate =
    String(input.date || '').trim() ||
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const id = `post-${Date.now()}`;

  const inserted = await sql`
    insert into blog_posts (
      id, title, slug, excerpt, content, category, status,
      featured_image, author, display_date, read_time, tags,
      meta_description, scheduled_date, created_at, updated_at
    )
    values (
      ${id}, ${title}, ${slug}, ${excerpt}, ${content}, ${input.category || 'Guide'}, ${status},
      ${input.featuredImage || ''}, ${input.author || 'TrueHost Team'}, ${postDate}, ${input.readTime || '5 min'},
      ${input.tags || ''}, ${input.metaDescription || excerpt.slice(0, 160)},
      ${toIsoOrUndefined(input.scheduledDate) || null}, ${now}, ${now}
    )
    returning *
  `;

  return mapRowToBlogPost(inserted[0] as Record<string, unknown>);
}

export async function updateBlogPostById(id: string, patch: Partial<BlogPostInput>) {
  await ensureBlogSchema();
  const sql = getNeonSql();

  const existingRows = await sql`select * from blog_posts where id = ${id} limit 1`;
  if (!existingRows.length) return null;

  const current = mapRowToBlogPost(existingRows[0] as Record<string, unknown>);

  const nextTitle =
    typeof patch.title === 'string' && patch.title.trim()
      ? patch.title.trim()
      : current.title;

  const nextSlug = toSlug(String(patch.slug || nextTitle || current.slug));

  const updated = await sql`
    update blog_posts
    set
      title = ${nextTitle},
      slug = ${nextSlug},
      excerpt = ${typeof patch.excerpt === 'string' ? patch.excerpt.trim() : current.excerpt},
      content = ${typeof patch.content === 'string' ? patch.content.trim() : current.content},
      category = ${typeof patch.category === 'string' ? patch.category : current.category},
      status = ${normalizeStatus(patch.status || current.status)},
      featured_image = ${typeof patch.featuredImage === 'string' ? patch.featuredImage.trim() : current.featuredImage},
      author = ${typeof patch.author === 'string' ? patch.author.trim() : current.author},
      display_date = ${typeof patch.date === 'string' && patch.date.trim() ? patch.date.trim() : current.date},
      read_time = ${typeof patch.readTime === 'string' ? patch.readTime.trim() : current.readTime},
      tags = ${typeof patch.tags === 'string' ? patch.tags.trim() : current.tags},
      meta_description = ${
        typeof patch.metaDescription === 'string' && patch.metaDescription.trim()
          ? patch.metaDescription.trim()
          : current.metaDescription
      },
      scheduled_date = ${
        Object.prototype.hasOwnProperty.call(patch, 'scheduledDate')
          ? toIsoOrUndefined(patch.scheduledDate) || null
          : current.scheduledDate || null
      },
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return mapRowToBlogPost(updated[0] as Record<string, unknown>);
}

export async function deleteBlogPostById(id: string) {
  await ensureBlogSchema();
  const sql = getNeonSql();
  const deleted = await sql`delete from blog_posts where id = ${id} returning id`;
  return deleted.length > 0;
}

export async function slugExists(slug: string, ignoreId?: string) {
  await ensureBlogSchema();
  const sql = getNeonSql();
  const normalizedSlug = toSlug(slug);

  const rows = ignoreId
    ? await sql`select id from blog_posts where slug = ${normalizedSlug} and id <> ${ignoreId} limit 1`
    : await sql`select id from blog_posts where slug = ${normalizedSlug} limit 1`;

  return rows.length > 0;
}

export { normalizeStatus, toSlug };
