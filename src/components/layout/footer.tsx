import Link from 'next/link';
import { Globe, Mail, Phone, MapPin } from 'lucide-react';
import { POPULAR_EXTENSIONS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background — Mobile: GIF, Desktop: video */}
      <img
        src="/cheapestdomains.gif"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover md:hidden"
      />
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
      >
        <source src="/cheapestdomains.webm" type="video/webm" />
        <source src="/cheapestdomains.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Globe className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white">
                Cheapest<span className="text-primary-400">Domains</span>
              </span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              Find and register domain names at the lowest prices globally.
              Trusted by thousands of businesses worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-white/70 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition-colors">
                  Domain Prices
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/70 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Extensions */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Popular Extensions
            </h3>
            <ul className="space-y-3">
              {POPULAR_EXTENSIONS.map((ext) => (
                <li key={ext}>
                  <Link
                    href={`/pricing`}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {ext} Domain
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="h-4 w-4 text-white/50" />
                <a href="mailto:support@cheapestdomains.com" className="hover:text-white transition-colors">
                  support@cheapestdomains.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Phone className="h-4 w-4 text-white/50" />
                <a href="tel:+254740637273" className="hover:text-white transition-colors">
                  +254 740 637273
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-white/50" />
                JUJA, Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} CheapestDomains. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-white/50 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
