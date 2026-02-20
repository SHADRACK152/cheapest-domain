'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Search,
  Filter,
  MoreVertical,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Download,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getAllOrders } from '@/lib/system-data';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/orders');
    }
    
    if (!isLoading && isAuthenticated && user?.email !== 'admin@truehost.co.ke') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Get real orders from system data
  const systemOrders = getAllOrders().map(o => ({
    id: o.id,
    customer: o.userEmail,
    domains: o.domains,
    total: o.total,
    status: o.status,
    date: new Date(o.createdAt).toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    paymentMethod: o.paymentMethod,
  }));

  const filteredOrders = systemOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.domains.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const totalRevenue = systemOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

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
              <h1 className="text-3xl font-bold text-[#111111] mb-2">Order Management</h1>
              <p className="text-gray-500">{filteredOrders.length} total orders</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search orders by ID, customer, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { 
                label: 'Total Orders', 
                value: systemOrders.length, 
                color: 'text-blue-600 bg-blue-50',
                icon: Package
              },
              { 
                label: 'Completed', 
                value: systemOrders.filter(o => o.status === 'completed').length, 
                color: 'text-green-600 bg-green-50',
                icon: CheckCircle2
              },
              { 
                label: 'Pending', 
                value: systemOrders.filter(o => o.status === 'pending').length, 
                color: 'text-orange-600 bg-orange-50',
                icon: Clock
              },
              { 
                label: 'Total Revenue', 
                value: `$${totalRevenue.toFixed(2)}`, 
                color: 'text-primary-600 bg-primary-50',
                icon: DollarSign
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Domains</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Payment</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-semibold text-primary-600">{order.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{order.customer}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          {order.domains.map((domain, i) => (
                            <div key={i} className="truncate max-w-[200px]">{domain}</div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-[#111111]">${order.total.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full capitalize flex items-center gap-1 w-fit",
                          order.status === 'completed' && 'bg-green-100 text-green-700',
                          order.status === 'pending' && 'bg-orange-100 text-orange-700',
                          order.status === 'failed' && 'bg-red-100 text-red-700'
                        )}>
                          {order.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                          {order.status === 'pending' && <Clock className="h-3 w-3" />}
                          {order.status === 'failed' && <XCircle className="h-3 w-3" />}
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="whitespace-nowrap">{order.date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
