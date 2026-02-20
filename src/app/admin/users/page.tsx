'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Ban,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getAllUsers, getDomainsByUserEmail } from '@/lib/system-data';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/users');
    }
    
    if (!isLoading && isAuthenticated && user?.email !== 'admin@truehost.co.ke') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Get real users from system data
  const systemUsers = getAllUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    status: u.status,
    domains: getDomainsByUserEmail(u.email).length,
    joined: new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    type: u.accountType,
  }));

  const filteredUsers = systemUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
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
          {/* Header */}
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#111111] mb-2">User Management</h1>
              <p className="text-gray-500">{filteredUsers.length} total users</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Domains</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Joined</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-[#111111]">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {user.phone}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full capitalize",
                          user.type === 'business' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {user.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-[#111111]">{user.domains}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 w-fit",
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        )}>
                          {user.status === 'active' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Ban className="h-3 w-3" />
                          )}
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(user.joined).toLocaleDateString()}
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
