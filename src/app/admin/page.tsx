'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Package,
  LayoutGrid,
  Languages,
  Webhook,
  Key,
  Plus,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'published' | 'scheduled';
  featuredImage: string;
  updatedAt: string;
  createdAt: string;
  author: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.posts) setPosts(data.posts); })
      .catch(() => {})
      .finally(() => setIsLoadingPosts(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Admin';

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor(diff / 60000);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  }

  const allPosts = posts;
  const publishedPosts = allPosts.filter(p => p.status === 'published');
  const draftCount = allPosts.filter(p => p.status === 'draft').length;
  const scheduledCount = allPosts.filter(p => p.status === 'scheduled').length;
  const publishedCount = publishedPosts.length;
  const postsWithImages = allPosts.filter(p => p.featuredImage).length;
  const uniqueCategories = new Set(allPosts.map((p) => p.category).filter(Boolean)).size;
  const uniqueAuthors = new Set(allPosts.map((p) => p.author).filter(Boolean)).size;

  const recentEdited = [...allPosts]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);
  const recentPublished = [...publishedPosts]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 5);

  const projectStats = [
    { label: 'Entries',        value: allPosts.length,       icon: FileText,    color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Assets',         value: postsWithImages,       icon: Package,     color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Content-Types',  value: uniqueCategories,      icon: LayoutGrid,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Published',      value: publishedCount,        icon: Globe,       color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Drafts',         value: draftCount,            icon: Languages,   color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Authors',        value: uniqueAuthors,         icon: Users,       color: 'text-red-600',    bg: 'bg-red-50'    },
    { label: 'Scheduled',      value: scheduledCount,        icon: Webhook,     color: 'text-gray-500',   bg: 'bg-gray-100'  },
    { label: 'Recent edits',   value: recentEdited.length,   icon: Key,         color: 'text-teal-600',   bg: 'bg-teal-50'   },
  ];

  function EntryRow({ post }: { post: BlogPost }) {
    return (
      <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors group">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-gray-900 truncate">{post.title || post.slug}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400">Dynamic Pages</span>
            <span className="text-gray-300 text-xs">•</span>
            <span className={cn(
              'text-xs font-medium',
              post.status === 'published' ? 'text-green-600' : 'text-orange-500'
            )}>
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </span>
            <span className="text-gray-300 text-xs">•</span>
            <span className="text-xs text-gray-400">{timeAgo(post.updatedAt || post.createdAt)}</span>
          </div>
        </div>
        <Link href={`/admin/blog/edit/${post.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-7 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Edit
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Hello {firstName}</h1>
            <p className="text-gray-500 mt-1 text-sm">Welcome to your administration panel</p>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Add Widget
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left / main area ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Last edited entries */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Last edited entries</h2>
                <Link
                  href="/admin/blog"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium"
                >
                  See all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="px-2 py-2">
                {isLoadingPosts ? (
                  <p className="text-sm text-gray-400 px-4 py-6 text-center">Loading entries...</p>
                ) : recentEdited.length > 0 ? (
                  recentEdited.map(post => <EntryRow key={post.id} post={post} />)
                ) : (
                  <p className="text-sm text-gray-400 px-4 py-6 text-center">No entries yet</p>
                )}
              </div>
            </motion.div>

            {/* Last published entries */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Last published entries</h2>
                <Link
                  href="/admin/blog"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium"
                >
                  See all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="px-2 py-2">
                {isLoadingPosts ? (
                  <p className="text-sm text-gray-400 px-4 py-6 text-center">Loading entries...</p>
                ) : recentPublished.length > 0 ? (
                  recentPublished.map(post => <EntryRow key={post.id} post={post} />)
                ) : (
                  <p className="text-sm text-gray-400 px-4 py-6 text-center">No published entries yet</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────── */}
          <div className="space-y-6">

            {/* Profile */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Profile</h3>
                <Link href="/admin/settings" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Profile settings
                </Link>
              </div>
              <div className="px-5 py-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">{user?.name || firstName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  </div>
                </div>

                {/* Role badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Editor', 'Author', 'Super Admin'].map(role => (
                    <span
                      key={role}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100"
                    >
                      {role}
                    </span>
                  ))}
                </div>

                {/* Entry stats */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">Entries</span>
                    <span className="font-bold text-gray-900 text-2xl leading-none">{allPosts.length}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                      Draft ({draftCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      Published ({publishedCount})
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Project statistics */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Project statistics</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {projectStats.map(stat => (
                  <div key={stat.label} className={cn('rounded-xl p-3', stat.bg)}>
                    <div className="flex items-center justify-between mb-1.5">
                      <stat.icon className={cn('h-4 w-4', stat.color)} />
                      <span className={cn('text-xl font-bold leading-none', stat.color)}>{stat.value}</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
    </div>
  );
}

