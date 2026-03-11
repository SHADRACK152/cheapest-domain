'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Newspaper,
  FolderOpen,
  Layers,
  Globe,
  ShoppingCart,
  Users,
  BarChart3,
  Hash,
  ScanSearch,
  RefreshCw,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'Content',
    items: [
      { label: 'Dashboard',            href: '/admin',               icon: LayoutDashboard },
      { label: 'Content Manager',      href: '/admin/content',       icon: Newspaper       },
      { label: 'Media Library',        href: '/admin/media',         icon: FolderOpen      },
      { label: 'Content Type Builder', href: '/admin/content-types', icon: Layers          },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Domains', href: '/admin/domains', icon: Globe        },
      { label: 'Orders',  href: '/admin/orders',  icon: ShoppingCart },
      { label: 'Users',   href: '/admin/users',   icon: Users        },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Auto Slug Manager', href: '/admin/slug-manager', icon: Hash       },
      { label: 'SEO',               href: '/admin/seo',          icon: ScanSearch },
      { label: 'TLD-Sync',          href: '/admin/tld-sync',     icon: RefreshCw  },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
    }
    if (!isLoading && isAuthenticated && user?.email !== 'admin@truehost.co.ke') {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.email !== 'admin@truehost.co.ke') return null;

  const firstName = user?.name?.split(' ')[0] || 'Admin';

  function SidebarContent({ mobile = false }: { mobile?: boolean }) {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn('flex items-center gap-2.5 px-5 py-5 border-b border-gray-100', mobile && 'justify-between')}>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Globe2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm leading-tight">
              Cheapest<br />
              <span className="text-blue-600">Domains</span>
            </span>
          </Link>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-5' : ''}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink key={item.href} item={item} pathname={pathname} onClick={() => setSidebarOpen(false)} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: user + logout */}
        <div className="border-t border-gray-100 px-3 py-4 space-y-1">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 mt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name || firstName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allNavItems = NAV_GROUPS.flatMap(g => g.items);
  const activeItem = allNavItems.find(n => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href))) ?? { label: 'Admin' };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-gray-200 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-50 lg:hidden flex flex-col"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
            <Link href="/admin" className="hover:text-gray-900 transition-colors font-medium">Admin</Link>
            {pathname !== '/admin' && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <span className="text-gray-900 font-semibold truncate">{activeItem.label}</span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back to site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  pathname: string;
  onClick: () => void;
}) {
  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-blue-600' : 'text-gray-400')} />
      {item.label}
      {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-blue-400" />}
    </Link>
  );
}
