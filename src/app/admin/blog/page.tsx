'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  Tag,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
const statuses = ['All', 'Published', 'Draft', 'Scheduled'];

const categoryColors: Record<string, string> = {
  Guide: 'bg-blue-100 text-blue-700',
  Education: 'bg-purple-100 text-purple-700',
  Security: 'bg-red-100 text-red-700',
  Tutorial: 'bg-green-100 text-green-700',
  SEO: 'bg-orange-100 text-orange-700',
  News: 'bg-indigo-100 text-indigo-700',
};

const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
};

export default function AdminBlogPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.email === 'admin@truehost.co.ke') {
      fetchPosts();
    }
  }, [isAuthenticated, user]);

  async function fetchPosts() {
    try {
      const response = await fetch('/api/blog');
      const data = await response.json();
      if (data.success) {
        setBlogPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  }

  if (isLoading || isLoadingPosts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'admin@truehost.co.ke') {
    router.push('/login?redirect=/admin/blog');
    return null;
  }

  // Calculate stats
  const totalPosts = blogPosts.length;
  const publishedPosts = blogPosts.filter(p => p.status === 'published').length;
  const totalViews = 0; // Views tracking can be added later
  const avgViews = 0; // Views tracking can be added later

  // Filter posts
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesStatus = activeStatus === 'All' || post.status === activeStatus.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-12">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    ← Back to Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#111111] flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary-600" />
                Blog Management
              </h1>
              <p className="text-gray-500 mt-2">
                Create, edit, and manage your blog posts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
              <Link href="/admin/blog/new">
                <Button size="sm" className="gap-2 bg-primary-600 hover:bg-primary-700">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Posts', value: totalPosts, icon: FileText, color: 'text-blue-600 bg-blue-50', change: '+' + blogPosts.filter(p => {
              const postDate = new Date(p.date);
              const now = new Date();
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
              return postDate >= monthAgo;
            }).length + ' this month' },
            { label: 'Published', value: publishedPosts, icon: CheckCircle2, color: 'text-green-600 bg-green-50', change: `${publishedPosts}/${totalPosts} posts` },
            { label: 'Drafts', value: blogPosts.filter(p => p.status === 'draft').length, icon: AlertCircle, color: 'text-yellow-600 bg-yellow-50', change: 'unpublished' },
            { label: 'Scheduled', value: blogPosts.filter(p => p.status === 'scheduled').length, icon: Calendar, color: 'text-purple-600 bg-purple-50', change: 'upcoming' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#111111] mb-1">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.change}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'whitespace-nowrap rounded-full transition-all',
                    activeCategory === category
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'whitespace-nowrap rounded-full transition-all',
                    activeStatus === status
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Publish
                </Button>
                <Button variant="outline" size="sm">
                  Unpublish
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  Delete
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Posts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts(filteredPosts.map(p => p.id));
                        } else {
                          setSelectedPosts([]);
                        }
                      }}
                      checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPosts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => togglePostSelection(post.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {post.featuredImage ? (
                            <img 
                              src={post.featuredImage} 
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={cn(
                              "w-full h-full bg-gradient-to-br flex items-center justify-center",
                              categoryColors[post.category]
                            )}>
                              <FileText className="w-6 h-6 opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#111111] truncate">
                            {post.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {post.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn('text-xs', categoryColors[post.category])}>
                        {post.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={cn('text-xs', statusColors[post.status])}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{post.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/edit/${post.id}`}>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No posts found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-between mt-6"
          >
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold">{filteredPosts.length}</span> of{' '}
              <span className="font-semibold">{totalPosts}</span> posts
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary-600 text-white border-primary-600">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
