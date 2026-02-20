import Link from 'next/link';
import { Globe, Mail, Phone, MapPin } from 'lucide-react';
import { NAV_ITEMS, POPULAR_EXTENSIONS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-[#111111]">
                Cheapest<span className="text-primary-600">Domains</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Find and register domain names at the lowest prices globally.
              Trusted by thousands of businesses worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#111111] mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Extensions */}
          <div>
            <h3 className="text-sm font-semibold text-[#111111] mb-4">
              Popular Extensions
            </h3>
            <ul className="space-y-3">
              {POPULAR_EXTENSIONS.map((ext) => (
                <li key={ext}>
                  <Link
                    href={`/pricing`}
                    className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {ext} Domain
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[#111111] mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4 text-gray-400" />
                support@truehost.co.ke
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4 text-gray-400" />
                +254 20 528 0000
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 text-gray-400" />
                Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} CheapestDomains. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
