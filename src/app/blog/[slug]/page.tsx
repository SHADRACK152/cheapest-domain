'use client';

import { useEffect, useState, use, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, User, Twitter, Linkedin, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Manrope, Source_Serif_4 } from 'next/font/google';

const uiFont = Manrope({
  subsets: ['latin'],
  variable: '--font-ui-manrope',
});

const readingFont = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-reading-lora',
  weight: ['400', '500', '600', '700'],
});

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
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [processedHtml, setProcessedHtml] = useState<string | null>(null);
  const [toc, setToc] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState<string>('');

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
      const scrollTop = window.scrollY;
      const start = scrollTop + rect.top;
      const readable = Math.max(1, el.scrollHeight - window.innerHeight * 0.45);
      const consumed = Math.min(Math.max(0, scrollTop - start + window.innerHeight * 0.35), readable);
      const pct = Math.min(100, Math.max(0, (consumed / readable) * 100));
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

  // Track active section for TOC highlighting
  useEffect(() => {
    if (!toc.length) return;

    const headingElements = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!headingElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length) {
          setActiveHeading((visible[0].target as HTMLElement).id);
        }
      },
      {
        rootMargin: '-24% 0px -62% 0px',
        threshold: [0.15, 1],
      }
    );

    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

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
    <div className={`${uiFont.variable} ${readingFont.variable} min-h-screen bg-gradient-to-br from-amber-50/40 via-white to-sky-50/40 py-10 md:py-12`}>
      <div className="container mx-auto max-w-6xl px-4 lg:px-6">
        {/* Reading progress bar */}
        <div className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur">
          <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-4 text-xs font-semibold text-slate-600" style={{ fontFamily: 'var(--font-ui-manrope)' }}>
            <span>Reading progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-200/70">
            <div
              style={{ width: `${progress}%` }}
              className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-[width] duration-200"
            />
          </div>
        </div>
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-6 mt-8 gap-2 rounded-full text-slate-700 hover:bg-white/80" style={{ fontFamily: 'var(--font-ui-manrope)' }}>
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        {/* Article */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_35px_-18px_rgba(15,23,42,0.35)]"
        >
          {/* Header */}
          <div className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/70 p-7 md:p-12" style={{ fontFamily: 'var(--font-ui-manrope)' }}>
            <Badge className={categoryColors[post.category] || 'bg-gray-100 text-gray-700'}>
              {post.category}
            </Badge>
            
            <h1 className="mt-4 mb-6 text-balance text-3xl font-extrabold leading-tight text-[#111111] md:text-5xl">
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
            <div className="relative w-full h-[400px] overflow-hidden">
              <Image 
                src={post.featuredImage} 
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Table of Contents + Content */}
          <div className="md:flex md:gap-7 lg:gap-12">
            {/* TOC */}
            <aside className="hidden md:block md:w-64 lg:w-72 sticky top-24 self-start pl-6 pt-8">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm shadow-sm" style={{ fontFamily: 'var(--font-ui-manrope)' }}>
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">On this page</div>
                {toc.length ? (
                  <nav className="space-y-1.5 max-h-[60vh] overflow-auto pr-1">
                    {toc.map((t, i) => (
                      <a
                        key={`${t.id}-${i}`}
                        href={`#${t.id}`}
                        className={`block rounded-md py-1 text-[13px] leading-5 transition-colors ${activeHeading === t.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-600'}`}
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
                className="blog-reading-content p-7 md:p-11 lg:p-14 prose prose-lg max-w-none
                  prose-headings:text-[#111111] prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-[1.95rem] prose-h2:mt-12 prose-h2:mb-5 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2
                  prose-h3:text-[1.4rem] prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-slate-700 prose-p:text-[1.14rem] prose-p:leading-[2] prose-p:mb-6
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                  prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                  prose-li:text-slate-700 prose-li:text-[1.08rem] prose-li:mb-2 prose-li:leading-[1.9]
                  prose-strong:text-[#111111] prose-strong:font-semibold prose-em:text-slate-700
                  prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-50/60 prose-blockquote:py-3 prose-blockquote:pl-5 prose-blockquote:pr-4 prose-blockquote:italic
                  prose-hr:border-slate-200 prose-img:rounded-xl prose-img:shadow-sm
                  [&_h1]:font-[var(--font-ui-manrope)] [&_h2]:font-[var(--font-ui-manrope)] [&_h3]:font-[var(--font-ui-manrope)] [&_h4]:font-[var(--font-ui-manrope)] [&_figcaption]:font-[var(--font-ui-manrope)]"
                style={{ fontFamily: 'var(--font-reading-lora)' }}
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
          className="mt-8 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-center text-white"
          style={{ fontFamily: 'var(--font-ui-manrope)' }}
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
