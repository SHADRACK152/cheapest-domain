import Link from 'next/link';
import { Globe, Mail, Phone, MapPin } from 'lucide-react';
import { POPULAR_EXTENSIONS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      {/* Video / GIF banner */}
      <div className="relative overflow-hidden h-56 md:h-72">
        {/* Mobile — GIF */}
        <img
          src="/cheapestdomains.gif"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover md:hidden"
        />
        {/* Desktop — video */}
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
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Ready to grab your domain?
          </h2>
          <p className="text-sm md:text-base text-white/80 max-w-lg">
            Search across the top registrars and secure the best price today.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Search Domains
          </Link>
        </div>
      </div>

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
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                  Domain Prices
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                  Contact
                </Link>
              </li>
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
                <a href="mailto:support@cheapestdomains.com" className="hover:text-primary-600 transition-colors">
                  support@cheapestdomains.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href="tel:+254740637273" className="hover:text-primary-600 transition-colors">
                  +254 740 637273
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 text-gray-400" />
                JUJA, Nairobi, Kenya
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
