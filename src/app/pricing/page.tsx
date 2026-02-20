'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, HelpCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DomainExtension } from '@/types';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PricingPage() {
  const [showAll, setShowAll] = useState(false);
  const [extensions, setExtensions] = useState<DomainExtension[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    async function fetchPricing() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/pricing');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error('Failed to fetch pricing');
        }
        
        setExtensions(result.data);
        setDataSource(result.source);
      } catch (err) {
        console.error('Pricing fetch error:', err);
        setError('Failed to load pricing. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPricing();
  }, []);

  const displayExtensions = showAll 
    ? extensions 
    : extensions.filter(ext => ['.com', '.co.ke', '.net', '.org', '.io', '.app'].includes(ext.extension));

  return (
    <div className="py-12 md:py-20">
      <div className="container-wide">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12 max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111]">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            No hidden fees, no surprises. Just the lowest domain prices you&apos;ll
            find anywhere.
          </p>

          {/* Data Source Indicator */}
          {dataSource && dataSource !== 'truehost' && (
            <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg py-2 px-4 max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <span>
                {dataSource === 'local' ? 'Using cached pricing' : 'Real-time pricing from TrueHost'}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant={!showAll ? 'default' : 'secondary'}
              onClick={() => setShowAll(false)}
              disabled={isLoading}
            >
              Popular
            </Button>
            <Button
              variant={showAll ? 'default' : 'secondary'}
              onClick={() => setShowAll(true)}
              disabled={isLoading}
            >
              All Extensions
            </Button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card">
                <Skeleton className="h-8 w-20 mb-4" />
                <Skeleton className="h-4 w-full mb-6" />
                <Skeleton className="h-12 w-32 mb-4" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            key={showAll ? 'all' : 'popular'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            {displayExtensions.map((ext) => (
              <motion.div
                key={ext.extension}
                variants={item}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={cn(
                  'glass-card group relative overflow-hidden',
                  ext.extension === '.com' && 'ring-2 ring-primary-600 ring-offset-2'
                )}
              >
                {ext.extension === '.com' && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-xl px-3 py-1 bg-primary-600 text-white text-xs">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-3xl font-bold text-[#111111]">
                      {ext.extension}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{ext.description}</p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-[#111111]">
                        ${ext.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400">/yr</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Renews at ${ext.renewPrice.toFixed(2)}/yr
                    </p>
                  </div>

                  <ul className="space-y-2.5">
                    {[
                      'Free DNS Management',
                      'Free Email Forwarding',
                      'WHOIS Privacy',
                      'Auto-Renewal',
                      '24/7 Support',
                    ].map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" size="lg">
                    Register Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-[#111111] text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Are there any hidden fees?',
                a: 'No. The price you see is the price you pay. We believe in transparent pricing with no surprises.',
              },
              {
                q: 'Can I transfer my domain later?',
                a: 'Yes! You can transfer your domain at any time after 60 days of registration. We also accept incoming transfers.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept M-PESA, credit/debit cards, and Paystack for your convenience.',
              },
              {
                q: 'Is WHOIS privacy included?',
                a: 'Yes, WHOIS privacy protection is included free with every domain registration.',
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="glass-card"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[#111111]">{faq.q}</h3>
                    <p className="text-sm text-gray-500 mt-1">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
