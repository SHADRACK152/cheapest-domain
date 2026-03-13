'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
}

interface MonthlyPoint {
  month: string;
  published: number;
  created: number;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabelFromKey(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short' });
}

function percentDelta(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

export default function AdminAnalyticsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.posts) setPosts(data.posts);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const publishedPosts = useMemo(() => posts.filter((p) => p.status === 'published'), [posts]);
  const draftPosts = useMemo(() => posts.filter((p) => p.status === 'draft'), [posts]);
  const scheduledPosts = useMemo(() => posts.filter((p) => p.status === 'scheduled'), [posts]);

  const monthlyData = useMemo<MonthlyPoint[]>(() => {
    const now = new Date();
    const keys: string[] = [];

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(monthKey(d));
    }

    const bucket = new Map<string, { published: number; created: number }>();
    keys.forEach((k) => bucket.set(k, { published: 0, created: 0 }));

    for (const post of posts) {
      const createdDate = new Date(post.createdAt || post.updatedAt);
      if (Number.isNaN(createdDate.getTime())) continue;
      const key = monthKey(createdDate);
      if (!bucket.has(key)) continue;

      const target = bucket.get(key);
      if (!target) continue;
      target.created += 1;
      if (post.status === 'published') {
        target.published += 1;
      }
    }

    return keys.map((k) => ({
      month: monthLabelFromKey(k),
      published: bucket.get(k)?.published ?? 0,
      created: bucket.get(k)?.created ?? 0,
    }));
  }, [posts]);

  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();

    for (const post of posts) {
      const key = post.category || 'Uncategorized';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [posts]);

  const thisMonth = monthlyData[monthlyData.length - 1] ?? { month: 'Now', published: 0, created: 0 };
  const lastMonth = monthlyData[monthlyData.length - 2] ?? { month: 'Prev', published: 0, created: 0 };

  const publishedDelta = percentDelta(thisMonth.published, lastMonth.published);
  const createdDelta = percentDelta(thisMonth.created, lastMonth.created);

  const metrics = [
    {
      label: 'Total Articles',
      value: posts.length,
      delta: createdDelta,
      icon: FileText,
    },
    {
      label: 'Published',
      value: publishedPosts.length,
      delta: publishedDelta,
      icon: CheckCircle2,
    },
    {
      label: 'Drafts',
      value: draftPosts.length,
      delta: 0,
      icon: AlertCircle,
    },
    {
      label: 'Scheduled',
      value: scheduledPosts.length,
      delta: 0,
      icon: Calendar,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#111111] mb-1">Blog Analytics</h1>
            <p className="text-gray-500 text-sm">Live metrics from your actual blog posts</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">Last 6 Months</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const positive = metric.delta >= 0;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary-50 text-primary-600">
                    <metric.icon className="h-6 w-6" />
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                      positive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    )}
                  >
                    {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(metric.delta).toFixed(1)}%
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-[#111111]">{metric.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              Published Articles by Month
            </h2>
            <div className="h-64 flex items-end justify-between gap-3">
              {monthlyData.map((data) => {
                const maxPublished = Math.max(...monthlyData.map((d) => d.published), 1);
                const height = (data.published / maxPublished) * 100;
                return (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative group w-full">
                      <div className="w-full bg-primary-600 rounded-t-lg" style={{ height: `${height}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.published} published
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Categories
            </h2>
            <div className="space-y-4">
              {topCategories.length === 0 ? (
                <p className="text-sm text-gray-500">No category data yet.</p>
              ) : (
                topCategories.map((item, index) => {
                  const maxCount = topCategories[0]?.count || 1;
                  return (
                    <div key={item.category} className="flex items-center gap-4">
                      <div className="w-10 text-center">
                        <span className="text-lg font-bold text-[#111111]">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-[#111111]">{item.category}</span>
                          <span className="text-sm text-gray-600">{item.count} posts</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary-600 h-full rounded-full transition-all"
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
