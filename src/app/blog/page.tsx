 'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, TrendingUp, Bookmark, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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

const categories = ['All', 'Guide', 'Education', 'Security', 'Tutorial', 'SEO', 'News'];

const categoryColors: Record<string, string> = {
  Guide: 'bg-blue-100 text-blue-700',
  Education: 'bg-purple-100 text-purple-700',
  Security: 'bg-red-100 text-red-700',
  Tutorial: 'bg-green-100 text-green-700',
  SEO: 'bg-orange-100 text-orange-700',
  News: 'bg-indigo-100 text-indigo-700',
};

const categoryGradients: Record<string, string> = {
  Guide: 'from-blue-400 to-blue-600',
  Education: 'from-purple-400 to-purple-600',
  Security: 'from-red-400 to-red-600',
  Tutorial: 'from-green-400 to-green-600',
  SEO: 'from-orange-400 to-orange-600',
  News: 'from-indigo-400 to-indigo-600',
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/ghost/posts');
        const data = await response.json();
        if (data.success) {
          setBlogPosts(data.posts);
        } else {
          console.error('Ghost API error:', data.error);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPosts();
  }, []);

  const featuredPost = blogPosts[0]; // First post is most recent
  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogPosts.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesQuery =
        !q || [p.title, p.excerpt, p.tags, p.author].join(' ').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [blogPosts, activeCategory, search]);

  const featuredPostFromFiltered = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / perPage));
  const pagePosts = filteredPosts.slice((page - 1) * perPage, page * perPage);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Simplified */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-blue-600 rounded-full" />
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Blog</span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <label htmlFor="lang" className="text-sm text-slate-600">Enter Language</label>
                <select id="lang" aria-label="Select language/country" className="px-3 py-2 rounded-full border border-slate-200 bg-white text-sm">
                  <option value="ke-en">Kenya — English</option>
                  <option value="in-en">India — English</option>
                  <option value="us-en">United States — English</option>
                  <option value="uk-en">United Kingdom — English</option>
                  <option value="ng-en">Nigeria — English</option>
                  <option value="za-en">South Africa — English</option>
                  <option value="more">More languages...</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-slate-900">CheapestDomains Blog</h1>
                <p className="text-lg md:text-xl text-slate-600 mb-4">Find and register domain names at the lowest prices globally. Trusted tips on domains, SEO, and getting online.</p>
                <p className="text-sm text-slate-500 mb-6">Learn everything about domain registration, branding, DNS, transfers, and business growth.</p>
              </div>

              <aside className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="text-sm mb-3 text-slate-500">Build Something Beautiful</div>
                <h3 className="font-bold text-xl mb-2">With a .Co.ke Domain</h3>
                <div className="text-slate-700 mb-4">Just <span className="font-bold">KES 2500</span> / year</div>
                <ul className="text-sm text-slate-600 mb-4 space-y-2">
                  <li>Cheapest domain prices</li>
                  <li>Local payment options (M-PESA)</li>
                  <li>Fast activation and support</li>
                  <li>Free DNS management</li>
                </ul>
                <div className="flex gap-3">
                  <Link href="/search"><Button className="w-full">Search Domains</Button></Link>
                  <Link href="/search"><Button variant="ghost" className="w-full">Register Now</Button></Link>
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm" aria-labelledby="blog-filters">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="blog-search" className="sr-only">Search blog posts</label>
              <input
                id="blog-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts, tags, authors..."
                className="w-full px-4 py-2 rounded-full border border-slate-200 focus:ring-2 focus:ring-blue-200"
                aria-label="Search blog posts"
              />
            </div>

            <nav id="blog-filters" className="flex gap-2 overflow-x-auto" aria-label="Blog categories">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1 text-sm transition-all focus:outline-none focus:ring-2',
                    activeCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Post */}
            {featuredPostFromFiltered && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <Link href={`/blog/${featuredPostFromFiltered.slug}`}>
                  <div className="flex gap-6 items-center bg-white rounded-xl border border-slate-200 overflow-hidden p-6 hover:shadow-lg transition">
                    <div className="w-44 h-28 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                      {featuredPostFromFiltered.featuredImage ? (
                        <img src={featuredPostFromFiltered.featuredImage} alt={featuredPostFromFiltered.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={cn('w-full h-full', categoryGradients[featuredPostFromFiltered.category])} />
                      )}
                    </div>
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <Badge className={cn('mb-0', categoryColors[featuredPostFromFiltered.category])}>{featuredPostFromFiltered.category}</Badge>
                        <span className="text-xs text-slate-500 uppercase tracking-wide">Featured Guide</span>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-3">{featuredPostFromFiltered.title}</h2>
                      <p className="text-slate-600 mb-4 max-w-prose">{featuredPostFromFiltered.excerpt.replace(/<[^>]*>/g, '')}</p>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{featuredPostFromFiltered.date}</span></span>
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{featuredPostFromFiltered.readTime} read</span></span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Button>Read More</Button>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {pagePosts.length === 0 ? (
                <div className="p-8 text-center text-slate-600">No posts match your search or selected category.</div>
              ) : (
                pagePosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden p-5 hover:shadow-md transition">
                    <div className="flex gap-4 items-start">
                      <div className="w-36 h-24 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className={cn('w-full h-full', categoryGradients[post.category])} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge className={cn('mb-0', categoryColors[post.category])}>{post.category}</Badge>
                          <span className="text-xs text-slate-500">{post.tags?.split(',')[0] ?? ''}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">{post.title}</h3>
                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{post.excerpt.replace(/<[^>]*>/g, '')}</p>

                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-2"><User className="w-4 h-4" /><span>{post.author}</span></span>
                          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{post.date}</span></span>
                          <span className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{post.readTime} read</span></span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <Link href={`/blog/${post.slug}`}><Button variant="ghost">Read More</Button></Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} aria-current={page === i + 1} className={cn('px-3 py-1 rounded', page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700')}>{i + 1}</button>
              ))}
              <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-32 space-y-8">
              {/* Trending Topics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900">Trending Topics</h3>
                </div>
                <div className="space-y-3">
                  {['Domain Registration Tips', 'Privacy & Security', 'SEO Best Practices', 'Transfer Guides', 'New Extensions'].map((topic, index) => (
                    <Link
                      key={index}
                      href="#"
                      className="block text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-semibold mt-0.5">#{index + 1}</span>
                        <span>{topic}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Newsletter Box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white"
              >
                <Bookmark className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-xl mb-2">Never Miss an Update</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Get the latest domain tips and news delivered to your inbox.
                </p>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2.5 rounded-lg text-slate-900 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  Subscribe
                </Button>
              </motion.div>

              {/* Categories Overview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 border border-slate-200"
              >
                <h3 className="font-bold text-slate-900 mb-4">Browse by Category</h3>
                <div className="space-y-2">
                  {categories.filter(c => c !== 'All').map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                    >
                      <span>{category}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
