'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="container-wide relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-8 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Ready to Register Your Domain?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Get started at TrueHost with the lowest prices globally. Trusted by thousands of businesses worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              className="bg-white text-primary-700 hover:bg-gray-100 shadow-xl shadow-black/10"
              onClick={() => window.open('https://truehost.com/domain-registration', '_blank')}
            >
              Register at TrueHost
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Link href="/blog">
              <Button
                size="xl"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              >
                Read Our Blog
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
