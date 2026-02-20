'use client';

import { useCurrency } from '@/contexts/currency-context';
import { DollarSign, BadgeDollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export function CurrencyToggle() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <motion.button
      onClick={toggleCurrency}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 hover:shadow-md"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {currency === 'USD' ? (
        <>
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">USD</span>
        </>
      ) : (
        <>
          <BadgeDollarSign className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-gray-700">KES</span>
        </>
      )}
      <span className="text-xs text-gray-400">⇄</span>
    </motion.button>
  );
}

export function CurrencyToggleCompact() {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-primary-400 transition-colors"
      title={`Switch to ${currency === 'USD' ? 'KES' : 'USD'}`}
    >
      <span className="text-xs font-semibold text-gray-700">{currency}</span>
      <svg
        className="h-3 w-3 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    </button>
  );
}
