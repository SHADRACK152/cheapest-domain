'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Tag, RefreshCw } from 'lucide-react';
import { DOMAIN_EXTENSIONS } from '@/lib/constants';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function PricingSection() {
  const popularExtensions = DOMAIN_EXTENSIONS.filter((ext) => ext.popular);

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold tracking-wide uppercase">
            Transparent Pricing
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111111]">
            Domain Pricing
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            No hidden fees. No surprises at renewal. Just honest prices.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {popularExtensions.map((ext) => (
            <motion.div
              key={ext.extension}
              variants={item}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:border-amber-300 hover:shadow-md transition-all duration-300"
            >
              {/* Top accent */}
              <div className="h-1 w-full bg-amber-500" />

              <div className="p-6 flex flex-col flex-1 gap-4">
                {/* TLD + badge */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-[#111111] tracking-tight">
                    {ext.extension}
                  </span>
                  {ext.popular && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Popular
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed">{ext.description}</p>

                {/* Price block */}
                <div className="mt-auto rounded-xl bg-gray-50 px-4 py-3 space-y-2">
                  <div className="flex items-end gap-1">
                    <Tag className="h-4 w-4 text-amber-600 mb-1 shrink-0" />
                    <span className="text-3xl font-bold text-[#111111]">
                      ${ext.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400 mb-0.5">/yr</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <RefreshCw className="h-3 w-3 shrink-0" />
                    Renews at ${ext.renewPrice.toFixed(2)}/yr
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={`https://truehost.com/cart.php?a=add&domain=register&query=example${ext.extension}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-[#111111] text-white hover:bg-gray-800 transition-colors"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
          >
            View all domain extensions & prices
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}


export function PricingSection() {
  const popularExtensions = DOMAIN_EXTENSIONS.filter((ext) => ext.popular);

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold tracking-wide uppercase">
            Transparent Pricing
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111111]">
            Domain Pricing
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            No hidden fees. No surprises at renewal. Just honest prices.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {popularExtensions.map((ext) => {
            const accent = accentColors[ext.extension] ?? 'from-gray-400 to-gray-600';
            return (
              <motion.div
                key={ext.extension}
                variants={item}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300"
              >
                {/* Colored accent bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />

                <div className="p-6 flex flex-col flex-1 gap-4">
                  {/* TLD + badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-[#111111] tracking-tight">
                      {ext.extension}
                    </span>
                    {ext.popular && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${accent}`}>
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 leading-relaxed">{ext.description}</p>

                  {/* Price block */}
                  <div className="mt-auto rounded-xl bg-gray-50 px-4 py-3 space-y-2">
                    <div className="flex items-end gap-1">
                      <Tag className="h-4 w-4 text-amber-600 mb-1" />
                      <span className="text-3xl font-bold text-[#111111]">
                        ${ext.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400 mb-0.5">/yr</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <RefreshCw className="h-3 w-3" />
                      Renews at ${ext.renewPrice.toFixed(2)}/yr
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={`https://truehost.com/cart.php?a=add&domain=register&query=example${ext.extension}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${accent} hover:opacity-90 transition-opacity`}
                  >
                    Register Now
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
          >
            View all domain extensions & prices
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
