'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'KES';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');

  // Load currency preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('preferred-currency');
    if (saved === 'KES' || saved === 'USD') {
      setCurrency(saved);
    }
  }, []);

  // Save to localStorage when changed
  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferred-currency', newCurrency);
  };

  // Toggle between USD and KES
  const toggleCurrency = () => {
    const newCurrency = currency === 'USD' ? 'KES' : 'USD';
    handleSetCurrency(newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

/**
 * Format price in the current currency
 */
export function formatPrice(priceUSD: number, priceKES: number | undefined, currency: Currency): string {
  if (currency === 'KES' && priceKES) {
    return `KES ${priceKES.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `$${priceUSD.toFixed(2)}`;
}
