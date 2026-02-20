'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context';
import { ChatProvider } from '@/contexts/chat-context';
import { CurrencyProvider } from '@/contexts/currency-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}
