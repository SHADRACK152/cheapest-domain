'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  Globe, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getStats, getRecentActivity, getTopExtensions } from '@/lib/system-data';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
    }
    
    // Check if user is admin
    if (!isLoading && isAuthenticated && user?.email !== 'admin@truehost.co.ke') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'admin@truehost.co.ke') {
    return null;
  }

  // Get real stats from system data
  const systemStats = getStats();
  
  // Transform recent activity for display
  const recentActivity = getRecentActivity(5).map(activity => {
    const timestamp = new Date(activity.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let timeAgo;
    if (diffMins < 1) timeAgo = 'just now';
    else if (diffMins < 60) timeAgo = `${diffMins} min ago`;
    else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    else timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return {
      type: activity.type === 'purchase' ? 'registration' : 'pending',
      user: activity.user,
      domain: activity.description,
      time: timeAgo,
      status: activity.type === 'purchase' ? 'completed' : 'pending',
    };
  });
  
  // Transform top domains for display
  const topDomains = getTopExtensions().map(ext => ({
    extension: ext.extension,
    count: ext.domains,
    revenue: `$${ext.revenue.toFixed(2)}`,
  }));

  const stats = [
    { 
      label: 'Total Users', 
      value: systemStats.users.total.toString(), 
      change: '+12.5%', 
      icon: Users, 
      color: 'text-blue-600 bg-blue-50',
      trending: 'up'
    },
    { 
      label: 'Active Domains', 
      value: systemStats.domains.active.toString(), 
      change: '+8.2%', 
      icon: Globe, 
      color: 'text-green-600 bg-green-50',
      trending: 'up'
    },
    { 
      label: 'Revenue (Total)', 
      value: `$${systemStats.revenue.total.toFixed(2)}`, 
      change: '+15.3%', 
      icon: DollarSign, 
      color: 'text-primary-600 bg-primary-50',
      trending: 'up'
    },
    { 
      label: 'Pending Orders', 
      value: systemStats.orders.pending.toString(), 
      change: '-5.1%', 
      icon: ShoppingCart, 
      color: 'text-orange-600 bg-orange-50',
      trending: 'down'
    },
  ];

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
                <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  ADMIN
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#111111]">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-500">
                Manage your platform, users, and domains from here
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </Button>
              <Link href="/admin/settings">
                <Button size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  stat.trending === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                )}>
                  <TrendingUp className={cn("h-3 w-3", stat.trending === 'down' && 'rotate-180')} />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-[#111111] mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Manage Users', icon: Users, href: '/admin/users', color: 'bg-blue-600 hover:bg-blue-700' },
                  { label: 'All Domains', icon: Globe, href: '/admin/domains', color: 'bg-green-600 hover:bg-green-700' },
                  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders', color: 'bg-orange-600 hover:bg-orange-700' },
                  { label: 'Blog Posts', icon: FileText, href: '/admin/blog', color: 'bg-indigo-600 hover:bg-indigo-700' },
                  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-purple-600 hover:bg-purple-700' },
                ].map((action, index) => (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="group"
                    >
                      <div className={`${action.color} text-white rounded-xl p-6 text-center transition-all hover:scale-105 cursor-pointer`}>
                        <action.icon className="h-8 w-8 mx-auto mb-3" />
                        <p className="text-sm font-medium">{action.label}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111111] flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary-600" />
                  Recent Activity
                </h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "p-2 rounded-lg",
                        activity.status === 'completed' && 'bg-green-50',
                        activity.status === 'pending' && 'bg-orange-50',
                        activity.status === 'failed' && 'bg-red-50'
                      )}>
                        {activity.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {activity.status === 'pending' && <Clock className="h-5 w-5 text-orange-600" />}
                        {activity.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#111111] text-sm truncate">
                          {activity.domain}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {activity.type} • {activity.user}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs text-gray-400">{activity.time}</p>
                      <span className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        activity.status === 'completed' && 'bg-green-100 text-green-700',
                        activity.status === 'pending' && 'bg-orange-100 text-orange-700',
                        activity.status === 'failed' && 'bg-red-100 text-red-700'
                      )}>
                        {activity.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Domain Extensions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-[#111111] mb-4">Top Domain Extensions</h3>
              <div className="space-y-4">
                {topDomains.map((domain, index) => {
                  const maxCount = topDomains[0]?.count || 1; // First item has highest count
                  return (
                    <div key={domain.extension}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[#111111]">{domain.extension}</span>
                        <span className="text-sm text-primary-600 font-medium">{domain.revenue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary-600 h-full rounded-full transition-all"
                            style={{ width: `${(domain.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-16 text-right">{domain.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-500 rounded-full h-3 w-3 animate-pulse"></div>
                <h3 className="font-bold text-[#111111]">System Status</h3>
              </div>
              <div className="space-y-3">
                {[
                  { service: 'API Server', status: 'Operational', uptime: '99.99%' },
                  { service: 'Database', status: 'Operational', uptime: '99.98%' },
                  { service: 'Payment Gateway', status: 'Operational', uptime: '99.97%' },
                  { service: 'DNS Servers', status: 'Operational', uptime: '100%' },
                ].map((item) => (
                  <div key={item.service} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-700">{item.service}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.uptime}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="font-bold text-[#111111] mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transfers in progress</span>
                  <span className="font-semibold text-[#111111]">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Domains expiring (30d)</span>
                  <span className="font-semibold text-orange-600">234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Support tickets</span>
                  <span className="font-semibold text-[#111111]">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. response time</span>
                  <span className="font-semibold text-green-600">2.3 min</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
