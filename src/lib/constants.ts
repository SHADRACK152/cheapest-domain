import { DomainExtension, Feature, NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Registrars', href: '/registrars' },
  { label: 'Promos', href: '/promos' },
  { label: 'WHOIS', href: '/whois' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const DOMAIN_EXTENSIONS: DomainExtension[] = [
  // Kenya TLDs (Priority) — Live TrueHost WHMCS prices (KES)
  { extension: '.co.ke',  price: 6.66,  renewPrice: 8.00,  popular: true,  description: 'Kenya commercial domain' },   // 999 / 1200 KES
  { extension: '.ke',     price: 20.00, renewPrice: 20.00, popular: true,  description: 'Kenya national domain' },     // 3000 / 3000 KES
  { extension: '.ac.ke',  price: 6.67,  renewPrice: 6.67,  popular: false, description: 'Kenya academic domain' },    // 1000 / 1000 KES
  { extension: '.or.ke',  price: 6.67,  renewPrice: 6.67,  popular: false, description: 'Kenya organization domain' },// 1000 / 1000 KES

  // Global TLDs — Live TrueHost WHMCS prices
  { extension: '.com',    price: 8.00,  renewPrice: 10.67, popular: true,  description: 'Most popular worldwide' },   // 1200 / 1600 KES
  { extension: '.net',    price: 12.37, renewPrice: 13.40, popular: true,  description: 'Great for tech companies' }, // 1856 / 2010 KES
  { extension: '.org',    price: 8.00,  renewPrice: 10.00, popular: true,  description: 'Perfect for organizations' },// 1200 / 1500 KES
  { extension: '.io',     price: 34.70, renewPrice: 48.33, popular: true,  description: 'Popular with startups' },    // 5205 / 7250 KES

  // African TLDs
  { extension: '.ng',     price: 20.00, renewPrice: 20.00, popular: true,  description: 'Nigeria domain extension' }, // 3000 / 3000 KES
  { extension: '.africa', price: 12.00, renewPrice: 13.33, popular: false, description: 'Pan-African domain' },       // 1800 / 2000 KES

  // Tech/Modern TLDs
  { extension: '.tech',    price: 7.76,  renewPrice: 49.84, popular: false, description: 'For tech brands' },         // 1164 / 7476 KES
  { extension: '.me',      price: 8.47,  renewPrice: 19.57, popular: false, description: 'Personal branding' },       // 1270 / 2935 KES
  { extension: '.site',    price: 2.41,  renewPrice: 28.65, popular: false, description: 'For websites' },            // 362 / 4297 KES
  { extension: '.website', price: 2.41,  renewPrice: 22.59, popular: false, description: 'For web presence' },        // 362 / 3389 KES

  // Budget TLDs
  { extension: '.xyz',    price: 2.47,  renewPrice: 16.93, popular: false, description: 'Affordable & modern' },     // 370 / 2540 KES
  { extension: '.online', price: 3.22,  renewPrice: 29.48, popular: false, description: 'For online businesses' },   // 483 / 4422 KES
  { extension: '.store',  price: 4.43,  renewPrice: 43.79, popular: false, description: 'For e-commerce' },          // 665 / 6568 KES
  { extension: '.info',   price: 3.83,  renewPrice: 24.61, popular: false, description: 'Information sites' },       // 574 / 3692 KES
  { extension: '.biz',    price: 6.41,  renewPrice: 17.55, popular: false, description: 'For businesses' },          // 962 / 2633 KES
  { extension: '.space',  price: 3.43,  renewPrice: 22.59, popular: false, description: 'Creative projects' },       // 514 / 3389 KES
];

export const FEATURES: Feature[] = [
  {
    icon: 'Zap',
    title: 'Instant Activation',
    description: 'Your domain is activated immediately after purchase. No waiting, no delays.',
  },
  {
    icon: 'Headphones',
    title: '24/7 Support',
    description: 'Our expert support team is available around the clock to help you.',
  },
  {
    icon: 'Shield',
    title: 'Transparent Pricing',
    description: 'No hidden fees. What you see is exactly what you pay.',
  },
  {
    icon: 'Globe',
    title: 'Free DNS Management',
    description: 'Full DNS management with every domain. Point your domain anywhere.',
  },
  {
    icon: 'Lock',
    title: 'Secure Payments',
    description: 'Bank-grade encryption for all transactions. Your data is safe.',
  },
  {
    icon: 'ArrowRightLeft',
    title: 'Easy Transfers',
    description: 'Transfer domains in and out with zero hassle. We make it simple.',
  },
];

export const POPULAR_EXTENSIONS = ['.co.ke', '.ke', '.com', '.net', '.org', '.io'];

export const SITE_CONFIG = {
  name: 'CheapestDomains',
  description: 'Find and register domain names at the lowest prices. Powered by TrueHost Kenya - Search, register, and manage your perfect domain.',
  url: 'https://cheapestdomains.com',
  ogImage: '/og-image.png',
  provider: 'TrueHost Kenya',
  supportEmail: 'support@truehost.co.ke',
  supportPhone: '+254 20 528 0000',
};
