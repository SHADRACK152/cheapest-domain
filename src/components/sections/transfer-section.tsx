'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, CheckCircle2, ShieldCheck, Globe, Headphones, Gift } from 'lucide-react';
import { Input } from '@/components/ui/input';

const steps = [
  'Unlock your domain at your current registrar',
  'Get your authorization (EPP) code',
  'Enter your domain and code below',
  'We handle the rest — transfer completes in 5-7 days',
];

const perks = [
  { icon: ShieldCheck, label: 'Free WHOIS Privacy' },
  { icon: Globe,       label: 'Free DNS Management' },
  { icon: Headphones,  label: 'World-class Support' },
  { icon: Gift,        label: 'Free 1-year Extension' },
];

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
    <section className="py-20 md:py-28 bg-white">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold tracking-wide uppercase">
                Domain Transfer
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111111] leading-tight">
                Transfer Your Domain
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Moving your domain to CheapestDomains is simple and seamless.
                Enjoy better prices, free DNS management, and world-class support.
              </p>
            </div>

            {/* Steps */}
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-gray-600 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            {/* Perks row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {perks.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <Icon className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-sm text-gray-600 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="h-1.5 w-full bg-amber-500" />
              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#111111]">Start Your Transfer</h3>
                  <p className="text-sm text-gray-400">Enter your details and we take care of the rest.</p>
                </div>

                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Domain Name
                    </label>
                    <Input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.com"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Authorization Code (EPP)
                    </label>
                    <Input
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="Enter your auth code"
                      type="password"
                      className="rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
                  >
                    {isTransferring ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {isTransferring ? 'Initiating Transfer...' : 'Transfer Domain'}
                  </button>
                </form>

                <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-100 py-2.5 px-4">
                  <Gift className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-xs font-medium text-amber-700">
                    Free 1-year extension included with every transfer
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
