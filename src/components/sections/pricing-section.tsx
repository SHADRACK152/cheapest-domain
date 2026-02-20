'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DOMAIN_EXTENSIONS } from '@/lib/constants';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function PricingSection() {
  const popularExtensions = DOMAIN_EXTENSIONS.filter((ext) => ext.popular);

  return (
    <section className="py-20 md:py-28">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111111]">
            Domain Pricing
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. Register your domain today.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {popularExtensions.map((ext) => (
            <motion.div
              key={ext.extension}
              variants={item}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass-card group cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#111111]">
                    {ext.extension}
                  </span>
                  {ext.popular && (
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold">
                      Popular
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-400">{ext.description}</p>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#111111]">
                      ${ext.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400">/yr</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Renews at ${ext.renewPrice.toFixed(2)}/yr
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.open(`https://truehost.com/cart.php?a=add&domain=register&query=example${ext.extension}`, '_blank')}
                >
                  Register at TrueHost
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
