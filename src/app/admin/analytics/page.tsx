'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  Globe,
  DollarSign,
  ArrowLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getStats, getMonthlyRevenue, getTopExtensions, getAllDomains } from '@/lib/system-data';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/analytics');
    }
    
    if (!isLoading && isAuthenticated && user?.email !== 'admin@truehost.co.ke') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
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
    return null;
  }

  // Get real data from system
  const stats = getStats();
  const monthlyRevenueData = getMonthlyRevenue();
  const topPerformers = getTopExtensions();
  
  const monthlyData = monthlyRevenueData.map(item => ({
    month: item.month.split(' ')[0], // Extract month name
    revenue: item.revenue,
    domains: Math.floor(item.revenue / 15), // Estimate domains from revenue
    users: Math.floor(item.revenue / 100), // Estimate users
  }));

  const totalRevenue = stats.revenue.total;
  const avgOrderValue = stats.orders.completed > 0 ? totalRevenue / stats.orders.completed : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#111111] mb-2">Analytics & Reports</h1>
              <p className="text-gray-500">Track your platform&apos;s performance</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">Last 30 Days</Button>
              <Button size="sm" className="gap-2">
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, change: '+12.5%', icon: DollarSign, positive: true },
              { label: 'Total Domains', value: stats.domains.total.toString(), change: '+8.2%', icon: Globe, positive: true },
              { label: 'Active Users', value: stats.users.total.toString(), change: '+15.3%', icon: Users, positive: true },
              { label: 'Avg. Order Value', value: `$${avgOrderValue.toFixed(2)}`, change: '-2.1%', icon: TrendingUp, positive: false },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    metric.positive ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-600'
                  )}>
                    <metric.icon className="h-6 w-6" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                    metric.positive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                  )}>
                    {metric.positive ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-[#111111]">{metric.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                Monthly Revenue
              </h2>
              <div className="h-64 flex items-end justify-between gap-3">
                {monthlyData.map((data, index) => {
                  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
                  const height = (data.revenue / maxRevenue) * 100;
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative group w-full">
                        <div
                          className="w-full bg-primary-600 rounded-t-lg transition-all hover:bg-primary-700 cursor-pointer"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            ${data.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Domain Registrations Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Domain Registrations
              </h2>
              <div className="h-64 flex items-end justify-between gap-3">
                {monthlyData.map((data, index) => {
                  const maxDomains = Math.max(...monthlyData.map(d => d.domains));
                  const height = (data.domains / maxDomains) * 100;
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative group w-full">
                        <div
                          className="w-full bg-green-600 rounded-t-lg transition-all hover:bg-green-700 cursor-pointer"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {data.domains} domains
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-[#111111] mb-6">Top Performing Extensions</h2>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => {
                const maxDomains = topPerformers[0]?.domains || 1;
                return (
                  <div key={performer.extension} className="flex items-center gap-4">
                    <div className="w-16 text-center">
                      <span className="text-2xl font-bold text-[#111111]">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg text-[#111111]">{performer.extension}</span>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Registrations</p>
                            <p className="font-semibold text-[#111111]">{performer.domains.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Revenue</p>
                            <p className="font-semibold text-primary-600">${performer.revenue.toFixed(2)}</p>
                          </div>
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            performer.growth >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                          )}>
                            {performer.growth >= 0 ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                            {Math.abs(performer.growth).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary-600 h-full rounded-full transition-all"
                          style={{ width: `${(performer.domains / maxDomains) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
