'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Users, Image as ImageIcon, Tag, Ticket, FileCode, Home, BookOpen, Mail, ShieldCheck, Lock, Percent, Store, Globe, ArrowUpAZ, Layers, ArrowRight, User } from 'lucide-react';

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

const ICON_COLORS: Record<string, string> = {
  Article:'bg-blue-50 text-blue-600', Author:'bg-violet-50 text-violet-600',
  Banners:'bg-pink-50 text-pink-600', Category:'bg-orange-50 text-orange-600',
  Coupons:'bg-green-50 text-green-600', 'Dynamic Pages':'bg-indigo-50 text-indigo-600',
  User:'bg-gray-50 text-gray-600', 'About Page':'bg-violet-50 text-violet-600',
  'Blog page':'bg-blue-50 text-blue-600', 'Contact page':'bg-teal-50 text-teal-600',
  'Home Page':'bg-amber-50 text-amber-600', 'Privacy Page':'bg-red-50 text-red-600',
  'Promo codes Page':'bg-green-50 text-green-600', 'Registrars Page':'bg-cyan-50 text-cyan-600',
  'Terms Page':'bg-gray-50 text-gray-600', 'Tlds Category Page':'bg-indigo-50 text-indigo-600',
  'Tlds From a-z Page':'bg-purple-50 text-purple-600', 'Tlds Page':'bg-sky-50 text-sky-600',
};

export default function ContentManagerPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const endpoints: [string, string][] = [
      ['articles', '/api/blog'],
      ['authors', '/api/admin/collections/authors'],
      ['banners', '/api/admin/collections/banners'],
      ['categories', '/api/admin/collections/categories'],
      ['coupons', '/api/admin/collections/coupons'],
      ['dynamicPages', '/api/admin/collections/dynamicPages'],
    ];
    Promise.allSettled(
      endpoints.map(([key, url]) =>
        fetch(url).then(r => r.json())
          .then(d => ({ key, count: Array.isArray(d) ? d.length : (d.posts?.length ?? 0) }))
          .catch(() => ({ key, count: 0 }))
      )
    ).then(results => {
      const next: Record<string, number> = {};
      results.forEach(r => { if (r.status === 'fulfilled') next[r.value.key] = r.value.count; });
      setCounts(next);
    });
  }, []);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Content Manager</h1>
        <p className="text-sm text-gray-500 mb-8">Manage all your site content from a single place.</p>

        {/* Collection Types */}
        <section className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Collection Types <span className="text-gray-300 ml-1">{COLLECTION_TYPES.length}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {COLLECTION_TYPES.map((type, i) => (
              <motion.div
                key={type.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={type.href}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ICON_COLORS[type.label] ?? 'bg-gray-50 text-gray-600'}`}>
                    <type.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{type.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{counts[type.key] ?? '—'} entries</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Single Types */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Single Types <span className="text-gray-300 ml-1">{SINGLE_TYPES.length}</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {SINGLE_TYPES.map((type, i) => (
              <motion.div
                key={type.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 + i * 0.04 }}
              >
                <Link
                  href={type.href}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ICON_COLORS[type.label] ?? 'bg-gray-50 text-gray-600'}`}>
                    <type.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{type.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Single entry</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
