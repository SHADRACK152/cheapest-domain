'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3d0f 0%, #92400e 40%, #b45309 100%)' }}>
      {/* Subtle dot pattern */}
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
            Ready to Find the Best Domain Deal?
          </h2>
          <p className="text-lg text-orange-100/80 max-w-xl mx-auto">
            Compare domain prices and avoid expensive renewals. Our mission is to help you find affordable domain names without misleading pricing structures.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pricing">
              <Button
                size="xl"
                className="bg-orange-50 text-amber-900 hover:bg-white shadow-xl shadow-black/20"
              >
                Compare Domain Deals
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button
                size="xl"
                variant="outline"
                className="border-orange-200/40 text-white hover:bg-white/10 hover:border-orange-200/60"
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
