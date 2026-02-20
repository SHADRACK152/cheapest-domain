'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total } = useCart();

  // Redirect to TrueHost for checkout
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
    
    // Redirect to TrueHost after a short delay to show the message
    const timer = setTimeout(() => {
      window.location.href = 'https://truehost.co.ke/cloud//cart.php?a=checkout';
    }, 3000);

    return () => clearTimeout(timer);
  }, [items, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="bg-blue-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
            <ExternalLink className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-4">
            Redirecting to TrueHost
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            You&apos;re being redirected to TrueHost Kenya to complete your purchase securely.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Final pricing will be confirmed on TrueHost. TrueHost will update any price differences automatically.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-[#111111] mb-3">Your Order Summary</h3>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.domain.fullDomain} className="flex justify-between">
                  <span className="text-gray-600">{item.domain.fullDomain}</span>
                  <span className="font-medium">${item.domain.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-blue-200 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>Secure checkout with SSL encryption</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="h-4 w-4 text-green-600" />
              <span>Your payment information is protected</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => window.location.href = 'https://truehost.co.ke/cloud//cart.php?a=checkout'}
              className="gap-2"
            >
              Continue to TrueHost
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Link href="/cart">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Back to Cart
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
