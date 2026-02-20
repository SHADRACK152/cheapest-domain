'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Search,
  Filter,
  MoreVertical,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getAllDomains, getStats } from '@/lib/system-data';

export default function AdminDomainsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/domains');
    }
    
    if (!isLoading && isAuthenticated && user?.email !== 'admin@truehost.co.ke') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Get real domains from system data
  const systemDomains = getAllDomains().map(d => {
    const registeredDate = new Date(d.registrationDate);
    const expiryDate = new Date(d.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let displayStatus: 'active' | 'pending' | 'expired' | 'transferred' | 'expiring' = d.status;
    if (d.status === 'active' && daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      displayStatus = 'expiring';
    }
    
    return {
      id: d.id,
      domain: d.name,
      owner: d.userEmail,
      status: displayStatus,
      registered: registeredDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      expires: expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      price: d.price,
      autoRenew: d.autoRenew,
    };
  });

  const filteredDomains = systemDomains.filter(d => 
    d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.owner.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h1 className="text-3xl font-bold text-[#111111] mb-2">Domain Management</h1>
              <p className="text-gray-500">{filteredDomains.length} total domains</p>
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
                placeholder="Search domains by name or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active', value: systemDomains.filter(d => d.status === 'active').length, color: 'text-green-600 bg-green-50' },
              { label: 'Expiring Soon', value: systemDomains.filter(d => d.status === 'expiring').length, color: 'text-orange-600 bg-orange-50' },
              { label: 'Pending', value: systemDomains.filter(d => d.status === 'pending').length, color: 'text-blue-600 bg-blue-50' },
              { label: 'Transferred', value: systemDomains.filter(d => d.status === 'transferred').length, color: 'text-purple-600 bg-purple-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-[#111111]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Domains Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Domain</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Owner</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Registered</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Expires</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Price</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Auto-Renew</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDomains.map((domain, index) => (
                    <motion.tr
                      key={domain.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary-600" />
                          <span className="font-semibold text-[#111111]">{domain.domain}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{domain.owner}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full capitalize flex items-center gap-1 w-fit",
                          domain.status === 'active' && 'bg-green-100 text-green-700',
                          domain.status === 'expiring' && 'bg-orange-100 text-orange-700',
                          domain.status === 'pending' && 'bg-blue-100 text-blue-700',
                          domain.status === 'transferred' && 'bg-purple-100 text-purple-700'
                        )}>
                          {domain.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
                          {domain.status === 'expiring' && <Clock className="h-3 w-3" />}
                          {domain.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(domain.registered).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {new Date(domain.expires).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-[#111111]">${domain.price}</span>
                      </td>
                      <td className="py-4 px-6">
                        {domain.autoRenew ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
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
