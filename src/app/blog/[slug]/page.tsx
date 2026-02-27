'use client';

import { useEffect, useState, use, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, User, Share2, Twitter, Linkedin, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [processedHtml, setProcessedHtml] = useState<string | null>(null);
  const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        const data = await response.json();
        
        if (data.success) {
          setPost(data.post);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPost();
  }, [slug]);

  // Process HTML to add heading IDs and build TOC
  useEffect(() => {
    if (!post?.content) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h1,h2,h3')) as HTMLElement[];

    const newToc: Array<{ id: string; text: string; level: number }> = [];
    const seen: Record<string, number> = {};
    headings.forEach((h, index) => {
      const text = h.textContent?.trim() || 'heading';
      const baseId = (h.id && h.id) || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `heading-${index}`;
      let id = baseId;
      if (seen[id]) {
        let counter = seen[id] + 1;
        while (seen[`${baseId}-${counter}`]) counter++;
        id = `${baseId}-${counter}`;
        seen[baseId] = counter;
        seen[id] = 1;
      } else {
        seen[id] = 1;
      }
      h.id = id;
      newToc.push({ id, text, level: Number(h.tagName.replace('H', '')) });
    });

    setToc(newToc);
    setProcessedHtml(doc.body.innerHTML);
  }, [post?.content]);

  // Reading progress within the article content
  useEffect(() => {
    function onScroll() {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const total = Math.max(1, el.scrollHeight - windowHeight);
      const scrolled = Math.min(Math.max(0, windowHeight - rect.top), el.scrollHeight);
      const pct = Math.min(100, Math.max(0, (scrolled / (el.scrollHeight - windowHeight)) * 100));
      setProgress(Number.isFinite(pct) ? Math.round(pct) : 0);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [processedHtml]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryColors: { [key: string]: string } = {
    Guide: 'bg-emerald-100 text-emerald-700',
    Education: 'bg-blue-100 text-blue-700',
    Security: 'bg-red-100 text-red-700',
    Tutorial: 'bg-purple-100 text-purple-700',
    SEO: 'bg-indigo-100 text-indigo-700',
    News: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Reading progress bar */}
        <div className="fixed left-0 right-0 top-0 z-50">
          <div className="h-1 bg-white/0">
            <div style={{ width: `${progress}%` }} className="h-1 bg-blue-600 transition-[width] duration-150" />
          </div>
        </div>
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-gray-100">
            <Badge className={categoryColors[post.category] || 'bg-gray-100 text-gray-700'}>
              {post.category}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mt-4 mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime} read
              </span>
            </div>

            {/* Share / quick actions */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={async () => {
                  try { await navigator.clipboard.writeText(window.location.href); }
                  catch { /* ignore */ }
                }}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                title="Copy link"
              >
                <Copy className="w-4 h-4" /> Copy link
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-800 transition-colors"
              >
                <Twitter className="w-4 h-4" /> Tweet
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Linkedin className="w-4 h-4" /> Share
              </a>
            </div>
          </div>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="w-full h-[400px] overflow-hidden">
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Table of Contents + Content */}
          <div className="md:flex md:gap-10">
            {/* TOC */}
            <aside className="hidden md:block md:w-56 sticky top-28 self-start">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm">
                <div className="font-semibold mb-2">On this page</div>
                {toc.length ? (
                  <nav className="space-y-2">
                    {toc.map((t, i) => (
                      <a
                        key={`${t.id}-${i}`}
                        href={`#${t.id}`}
                        className="block text-slate-700 hover:text-blue-600"
                        style={{ paddingLeft: `${(t.level - 1) * 12}px` }}
                      >
                        {t.text}
                      </a>
                    ))}
                  </nav>
                ) : (
                  <div className="text-slate-500">No sections</div>
                )}
              </div>
            </aside>

            <div className="flex-1">
              <div ref={contentRef} 
                className="p-8 md:p-12 prose prose-lg max-w-none
                  prose-headings:text-[#111111] prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                  prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                  prose-li:text-gray-700 prose-li:mb-2
                  prose-strong:text-[#111111] prose-strong:font-semibold
                  prose-em:text-gray-700"
                dangerouslySetInnerHTML={{ __html: processedHtml || post.content }}
              />
            </div>
          </div>
        </motion.article>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-3">Ready to Register Your Domain?</h3>
          <p className="text-primary-100 mb-6">Get started with the cheapest domain prices in Kenya</p>
          <Link href="/search">
            <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-50">
              Search Domains Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
