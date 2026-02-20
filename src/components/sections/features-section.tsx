'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Headphones,
  Shield,
  Globe,
  Lock,
  ArrowRightLeft,
} from 'lucide-react';
import { FEATURES } from '@/lib/constants';

const iconMap: Record<string, React.ElementType> = {
  Zap,
  Headphones,
  Shield,
  Globe,
  Lock,
  ArrowRightLeft,
};

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

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50/50">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#111111]">
            Why Choose CheapestDomains
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to manage your online presence, at prices that
            make sense.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon] || Globe;
            return (
              <motion.div
                key={feature.title}
                variants={item}
                className="glass-card text-center group"
              >
                <div className="space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#111111]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
