'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, TrendingUp, Bookmark } from 'lucide-react';
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

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog?status=published');
        const data = await response.json();
        if (data.success) {
          setBlogPosts(data.posts);
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
  const regularPosts = blogPosts.slice(1);

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
            className="max-w-4xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-12 bg-blue-600 rounded-full" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-slate-900">
              Domain Insights & Tips
            </h1>
            <p className="text-lg md:text-xl text-slate-600">
              Expert advice, guides, and news to help you succeed online
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setActiveCategory(category)}
                variant="ghost"
                size="sm"
                className={cn(
                  'whitespace-nowrap rounded-full transition-all',
                  activeCategory === category
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Post */}
            {featuredPost && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 group"
              >
                <Link href={`/blog/${featuredPost.slug}`}>
                  <div className="relative h-[400px] rounded-2xl overflow-hidden mb-6">
                    {featuredPost.featuredImage ? (
                      <img 
                        src={featuredPost.featuredImage} 
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
                        categoryGradients[featuredPost.category]
                      )}>
                        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:30px_30px]" />
                      </div>
                    )}
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 border-0">
                        Featured
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                      <Badge className={cn('mb-4', categoryColors[featuredPost.category])}>
                        {featuredPost.category}
                      </Badge>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-white/90 text-lg mb-4 line-clamp-2">
                        {featuredPost.excerpt.replace(/<[^>]*>/g, '')}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {featuredPost.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {featuredPost.readTime} read
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* Regular Posts Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {regularPosts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={item}
                  className="group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        {post.featuredImage ? (
                          <img 
                            src={post.featuredImage} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className={cn(
                            "absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-110",
                            categoryGradients[post.category]
                          )}>
                            <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <Badge className={cn('mb-3', categoryColors[post.category])}>
                          {post.category}
                        </Badge>

                        <h3 className="text-lg font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {post.excerpt.replace(/<[^>]*>/g, '')}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {post.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {post.readTime}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
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
