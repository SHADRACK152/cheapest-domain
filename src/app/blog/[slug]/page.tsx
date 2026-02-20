'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react';
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

          {/* Content */}
          <div 
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
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
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
