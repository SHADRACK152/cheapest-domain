'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function TransferPage() {
  return (
    <div className="py-12 md:py-20 bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <div className="container-wide">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="bg-primary-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] mb-4">
            Transfer Your Domain
          </h1>
          <p className="text-lg text-gray-500">
            Move your domain to CheapestDomains and save on renewal costs. Fast, secure, and hassle-free transfer process.
          </p>
        </motion.div>

        {/* Transfer Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-[#111111] mb-6">Start Your Transfer</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Name
                </label>
                <Input 
                  type="text" 
                  placeholder="example.com"
                  className="text-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authorization Code (EPP Code)
                </label>
                <Input 
                  type="text" 
                  placeholder="Enter your EPP/Auth code"
                  className="text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can get this code from your current registrar
                </p>
              </div>
            </div>

            <Button size="lg" className="w-full mb-4 gap-2">
              Check Transfer Eligibility
              <ArrowRight className="h-5 w-5" />
            </Button>

            <p className="text-xs text-center text-gray-500">
              By transferring, you agree to our{' '}
              <Link href="#" className="text-primary-600 hover:underline">
                terms of service
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-[#111111] text-center mb-8">
            Why Transfer to CheapestDomains?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Lower Prices',
                description: 'Save up to 50% on domain renewals compared to other registrars',
              },
              {
                title: 'Free Privacy Protection',
                description: 'WHOIS privacy included at no extra cost with every transfer',
              },
              {
                title: '24/7 Support',
                description: 'Our expert team is here to help you every step of the way',
              },
              {
                title: 'Fast Transfer',
                description: 'Most transfers complete within 5-7 days, often faster',
              },
              {
                title: 'No Downtime',
                description: 'Your website and email continue working during transfer',
              },
              {
                title: '1 Year Extension',
                description: 'Get 1 additional year added to your domain registration',
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="bg-primary-50 rounded-full h-10 w-10 flex items-center justify-center mb-4">
                  <Check className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="font-bold text-[#111111] mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-500">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-[#111111] text-center mb-8">
            Transfer FAQs
          </h2>
          
          <div className="space-y-4">
            {[
              {
                q: 'How long does a domain transfer take?',
                a: 'Most transfers complete within 5-7 days, though some can finish in as little as 24 hours.',
              },
              {
                q: 'Will my website go down during transfer?',
                a: 'No, your website and email services will continue to work normally throughout the transfer process.',
              },
              {
                q: 'How do I get my authorization code?',
                a: 'Log in to your current registrar and look for "Domain Transfer" or "Authorization Code" in your domain settings.',
              },
              {
                q: 'Can I transfer a newly registered domain?',
                a: 'Domains must be at least 60 days old to be eligible for transfer, as per ICANN regulations.',
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="font-semibold text-[#111111] mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
