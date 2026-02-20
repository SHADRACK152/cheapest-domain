'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS } from '@/lib/constants';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="container-wide flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white transition-transform duration-200 group-hover:scale-105">
            <Globe className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-[#111111]">
            Cheapest<span className="text-primary-600">Domains</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                pathname === item.href
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cart - visible for all users except admin */}
          {user?.email !== 'admin@truehost.co.ke' && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          )}
          
          {/* Admin Menu - Only show for authenticated admin */}
          {isAuthenticated && user?.email === 'admin@truehost.co.ke' && (
            <div className="relative user-menu-container">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">Admin</span>
              </Button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-primary-600 font-semibold hover:bg-primary-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    🔐 Admin Panel
                  </Link>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="container-wide py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Cart - visible for all users except admin */}
              {user?.email !== 'admin@truehost.co.ke' && (
                <Link
                  href="/cart"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Shopping Cart
                  </span>
                  {itemCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}
              
              {/* Admin Menu - Mobile */}
              {isAuthenticated && user?.email === 'admin@truehost.co.ke' && (
                <>
                  <div className="pt-3 pb-2 px-4">
                    <p className="text-xs text-gray-500 mb-1">Logged in as</p>
                    <p className="font-medium text-gray-900 truncate">Admin</p>
                  </div>
                  <Link
                    href="/admin"
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 transition-colors"
                  >
                    🔐 Admin Panel
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
