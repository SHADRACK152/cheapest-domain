'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Domain } from '@/types';

interface CartItem {
  domain: Domain;
  idProtection: boolean;
  years: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (domain: Domain) => void;
  removeItem: (domainName: string) => void;
  updateItem: (domainName: string, updates: Partial<Omit<CartItem, 'domain'>>) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((domain: Domain) => {
    setItems((prev) => {
      // Check if domain already in cart
      if (prev.some((item) => item.domain.fullDomain === domain.fullDomain)) {
        return prev;
      }
      return [...prev, { domain, idProtection: false, years: 1 }];
    });
  }, []);

  const removeItem = useCallback((domainName: string) => {
    setItems((prev) => prev.filter((item) => item.domain.fullDomain !== domainName));
  }, []);

  const updateItem = useCallback((domainName: string, updates: Partial<Omit<CartItem, 'domain'>>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.domain.fullDomain === domainName
          ? { ...item, ...updates }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(() => items.length, [items]);
  
  const total = useMemo(() => items.reduce((sum, item) => {
    const domainCost = item.domain.price * item.years;
    const protectionCost = item.idProtection ? 9.99 * item.years : 0; // $9.99/year for ID protection
    return sum + domainCost + protectionCost;
  }, 0), [items]);

  const value: CartContextType = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    itemCount,
    total,
  }), [items, addItem, removeItem, updateItem, clearCart, itemCount, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
