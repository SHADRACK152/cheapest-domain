'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Search, FileText, Users, Image as ImageIcon, Tag, Ticket, FileCode, User,
  Home, BookOpen, Mail, ShieldCheck, Lock, Percent, Store, AlignJustify,
  Globe, ArrowUpAZ, Layers, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COLLECTION_TYPES = [
  { label: 'Article',       href: '/admin/content/articles',      icon: FileText,   key: 'articles'      },
  { label: 'Author',        href: '/admin/content/authors',       icon: Users,      key: 'authors'       },
  { label: 'Banners',       href: '/admin/content/banners',       icon: ImageIcon,  key: 'banners'       },
  { label: 'Category',      href: '/admin/content/categories',    icon: Tag,        key: 'categories'    },
  { label: 'Coupons',       href: '/admin/content/coupons',       icon: Ticket,     key: 'coupons'       },
  { label: 'Dynamic Pages', href: '/admin/content/dynamic-pages', icon: FileCode,   key: 'dynamicPages'  },
  { label: 'User',          href: '/admin/users',                 icon: User,       key: 'users'         },
];

const SINGLE_TYPES = [
  { label: 'About Page',         href: '/admin/content/about',            icon: Users        },
  { label: 'Blog page',          href: '/admin/content/blog-page',        icon: BookOpen     },
  { label: 'Contact page',       href: '/admin/content/contact-page',     icon: Mail         },
  { label: 'Home Page',          href: '/admin/content/home-page',        icon: Home         },
  { label: 'Privacy Page',       href: '/admin/content/privacy-page',     icon: ShieldCheck  },
  { label: 'Promo codes Page',   href: '/admin/content/promo-codes',      icon: Percent      },
  { label: 'Registrars Page',    href: '/admin/content/registrars-page',  icon: Store        },
  { label: 'Terms Page',         href: '/admin/content/terms-page',       icon: Lock         },
  { label: 'Tlds Category Page', href: '/admin/content/tlds-category',    icon: Layers       },
  { label: 'Tlds From a-z Page', href: '/admin/content/tlds-az',          icon: ArrowUpAZ    },
  { label: 'Tlds Page',          href: '/admin/content/tlds-page',        icon: Globe        },
];

function NavItem({
  href,
  icon: Icon,
  label,
  count,
  pathname,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  pathname: string;
}) {
  const isActive = pathname === href || (href !== '/admin/content' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-[7px] rounded-lg text-[13px] transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-700 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className={cn('h-[14px] w-[14px] shrink-0', isActive ? 'text-blue-500' : 'text-gray-400')} />
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined ? (
        <span className={cn(
          'text-[11px] font-medium min-w-[18px] text-center px-1 py-0.5 rounded-full',
          isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
        )}>
          {count}
        </span>
      ) : isActive ? (
        <ChevronRight className="h-3 w-3 text-blue-400 shrink-0" />
      ) : null}
    </Link>
  );
}

export default function ContentManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({
    articles: 0, authors: 0, banners: 0, categories: 0, coupons: 0, dynamicPages: 0,
  });

  useEffect(() => {
    const endpoints: [string, string][] = [
      ['articles',    '/api/blog'],
      ['authors',     '/api/admin/collections/authors'],
      ['banners',     '/api/admin/collections/banners'],
      ['categories',  '/api/admin/collections/categories'],
      ['coupons',     '/api/admin/collections/coupons'],
      ['dynamicPages','/api/admin/collections/dynamicPages'],
    ];
    Promise.allSettled(
      endpoints.map(([key, url]) =>
        fetch(url)
          .then(r => r.json())
          .then(d => ({ key, count: Array.isArray(d) ? d.length : (d.posts?.length ?? 0) }))
          .catch(() => ({ key, count: 0 }))
      )
    ).then(results =>
      setCounts(prev => {
        const next = { ...prev };
        results.forEach(r => {
          if (r.status === 'fulfilled') next[r.value.key] = r.value.count;
        });
        return next;
      })
    );
  }, []);

  const q = search.toLowerCase();
  const filteredCollections = COLLECTION_TYPES.filter(i => !q || i.label.toLowerCase().includes(q));
  const filteredSingles     = SINGLE_TYPES.filter(i => !q || i.label.toLowerCase().includes(q));

  return (
    <div
      className="flex -m-6 bg-gray-50"
      style={{ minHeight: 'calc(100vh - 3.5rem)' }}
    >
      {/* ── Sub-sidebar ── */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col sticky top-0 overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {/* Title */}
        <div className="px-4 py-4 border-b border-gray-100 shrink-0">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Content Manager</p>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search types…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-[6px] text-[12px] border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pb-4 overflow-y-auto">
          {/* Collection Types */}
          {filteredCollections.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between px-3 mb-1.5 mt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Collection Types</span>
                <span className="text-[10px] text-gray-300 font-medium">{filteredCollections.length}</span>
              </div>
              <div className="space-y-0.5">
                {filteredCollections.map(item => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    count={counts[item.key] ?? 0}
                    pathname={pathname}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Single Types */}
          {filteredSingles.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 mb-1.5 mt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Single Types</span>
                <span className="text-[10px] text-gray-300 font-medium">{filteredSingles.length}</span>
              </div>
              <div className="space-y-0.5">
                {filteredSingles.map(item => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    pathname={pathname}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredCollections.length === 0 && filteredSingles.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6 px-3">No results for &quot;{search}&quot;</p>
          )}
        </nav>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 overflow-auto p-6 min-w-0">
        {children}
      </div>
    </div>
  );
}
