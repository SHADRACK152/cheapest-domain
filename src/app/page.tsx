import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/sections/hero-section';
import { SITE_CONFIG } from '@/lib/constants';

// Lazy load sections below the fold for better initial load performance
const PricingSection = dynamic(() => import('@/components/sections/pricing-section').then(mod => ({ default: mod.PricingSection })), {
  ssr: true,
});

const FeaturesSection = dynamic(() => import('@/components/sections/features-section').then(mod => ({ default: mod.FeaturesSection })), {
  ssr: true,
});

const TransferSection = dynamic(() => import('@/components/sections/transfer-section').then(mod => ({ default: mod.TransferSection })), {
  ssr: true,
});

const CTASection = dynamic(() => import('@/components/sections/cta-section').then(mod => ({ default: mod.CTASection })), {
  ssr: true,
});

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_CONFIG.name,
            url: SITE_CONFIG.url,
            description: SITE_CONFIG.description,
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      <HeroSection />
      <PricingSection />
      <FeaturesSection />
      <TransferSection />
      <CTASection />
    </>
  );
}
