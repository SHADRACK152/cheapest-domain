import { DomainExtension, Feature, NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const DOMAIN_EXTENSIONS: DomainExtension[] = [
  // Kenya TLDs (Priority for TrueHost) - Actual TrueHost Kenya prices
  { extension: '.co.ke', price: 6.66, renewPrice: 7.99, popular: true, description: 'Kenya commercial domain' }, // 999 KES
  { extension: '.ke', price: 16.67, renewPrice: 20.00, popular: true, description: 'Kenya national domain' }, // 2500 KES
  { extension: '.ac.ke', price: 6.66, renewPrice: 7.99, popular: false, description: 'Kenya academic domain' }, // 999 KES
  { extension: '.or.ke', price: 6.66, renewPrice: 7.99, popular: false, description: 'Kenya organization domain' }, // 999 KES
  
  // Global TLDs - TrueHost Kenya prices
  { extension: '.com', price: 10.00, renewPrice: 12.00, popular: true, description: 'Most popular worldwide' }, // 1500 KES
  { extension: '.net', price: 10.67, renewPrice: 12.80, popular: true, description: 'Great for tech companies' }, // 1600 KES
  { extension: '.org', price: 10.67, renewPrice: 12.80, popular: true, description: 'Perfect for organizations' }, // 1600 KES
  { extension: '.io', price: 30.00, renewPrice: 36.00, popular: true, description: 'Popular with startups' }, // 4500 KES
  
  // African TLDs
  { extension: '.ng', price: 12.00, renewPrice: 14.40, popular: true, description: 'Nigeria domain extension' }, // 1800 KES
  { extension: '.africa', price: 12.00, renewPrice: 14.40, popular: false, description: 'Pan-African domain' }, // 1800 KES
  
  // Tech/Modern TLDs
  { extension: '.tech', price: 18.67, renewPrice: 22.40, popular: false, description: 'For tech brands' }, // 2800 KES
  { extension: '.me', price: 16.67, renewPrice: 20.00, popular: false, description: 'Personal branding' }, // 2500 KES
  { extension: '.site', price: 10.00, renewPrice: 12.00, popular: false, description: 'For websites' }, // 1500 KES
  { extension: '.website', price: 10.00, renewPrice: 12.00, popular: false, description: 'For web presence' }, // 1500 KES
  
  // Budget TLDs
  { extension: '.xyz', price: 8.00, renewPrice: 9.60, popular: false, description: 'Affordable & modern' }, // 1200 KES
  { extension: '.online', price: 23.33, renewPrice: 28.00, popular: false, description: 'For online businesses' }, // 3500 KES
  { extension: '.store', price: 36.67, renewPrice: 44.00, popular: false, description: 'For e-commerce' }, // 5500 KES
  { extension: '.info', price: 12.00, renewPrice: 14.40, popular: false, description: 'Information sites' }, // 1800 KES
  { extension: '.biz', price: 12.00, renewPrice: 14.40, popular: false, description: 'For businesses' }, // 1800 KES
  { extension: '.space', price: 8.00, renewPrice: 9.60, popular: false, description: 'Creative projects' }, // 1200 KES
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
