'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TransferSection() {
  const [domain, setDomain] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !authCode.trim()) return;
    setIsTransferring(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsTransferring(false);
    alert('Transfer initiated! (Demo)');
  };

  return (
    <section className="py-20 md:py-28">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111111]">
              Transfer Your Domain
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              Moving your domain to CheapestDomains is simple and seamless.
              Enjoy better prices, free DNS management, and world-class support.
            </p>
            <ul className="space-y-3">
              {[
                'Unlock your domain at your current registrar',
                'Get your authorization (EPP) code',
                'Enter your domain and code below',
                'We handle the rest — transfer completes in 5-7 days',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{step}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form
              onSubmit={handleTransfer}
              className="glass-card space-y-5 p-8"
            >
              <h3 className="text-xl font-semibold text-[#111111]">
                Start Your Transfer
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Domain Name
                  </label>
                  <Input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Authorization Code (EPP)
                  </label>
                  <Input
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="Enter your auth code"
                    type="password"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isTransferring}
              >
                {isTransferring ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-5 w-5 mr-2" />
                )}
                {isTransferring ? 'Initiating Transfer...' : 'Transfer Domain'}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                Free 1-year extension with every transfer
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
