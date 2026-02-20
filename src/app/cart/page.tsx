'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, ShieldCheck, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateItem, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-[#111111] mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-gray-500 mb-8">
            Start searching for your perfect domain name and add it to your cart.
          </p>
          <Link href="/search">
            <Button size="lg" className="gap-2">
              Search Domains
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-2">
                Shopping Cart
              </h1>
              <p className="text-gray-500">
                {items.length} {items.length === 1 ? 'domain' : 'domains'} in your cart
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.domain.fullDomain}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  {/* Domain Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#111111] mb-1">
                        {item.domain.fullDomain}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ${item.domain.price.toFixed(2)}/year
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.domain.fullDomain)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Years Selector */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Registration Period</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItem(item.domain.fullDomain, { years: Math.max(1, item.years - 1) })}
                        disabled={item.years <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-semibold min-w-[60px] text-center">
                        {item.years} {item.years === 1 ? 'year' : 'years'}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItem(item.domain.fullDomain, { years: Math.min(10, item.years + 1) })}
                        disabled={item.years >= 10}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* ID Protection */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">WHOIS Privacy Protection</p>
                        <p className="text-xs text-gray-500">$9.99/year - Keep your personal info private</p>
                      </div>
                    </div>
                    <Button
                      variant={item.idProtection ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateItem(item.domain.fullDomain, { idProtection: !item.idProtection })}
                    >
                      {item.idProtection ? 'Added' : 'Add'}
                    </Button>
                  </div>

                  {/* Item Total */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Item Total</span>
                      <span className="text-lg font-bold text-[#111111]">
                        ${((item.domain.price * item.years) + (item.idProtection ? 9.99 * item.years : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24"
              >
                <h2 className="text-xl font-bold text-[#111111] mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.domain.fullDomain} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">
                        {item.domain.fullDomain} ({item.years}yr)
                      </span>
                      <span className="font-medium text-gray-900">
                        ${(item.domain.price * item.years).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  {items.some(item => item.idProtection) && (
                    <>
                      <div className="pt-3 border-t border-gray-100"></div>
                      {items.filter(item => item.idProtection).map((item) => (
                        <div key={`protection-${item.domain.fullDomain}`} className="flex justify-between text-sm">
                          <span className="text-gray-600 truncate mr-2">
                            ID Protection ({item.years}yr)
                          </span>
                          <span className="font-medium text-gray-900">
                            ${(9.99 * item.years).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-[#111111]">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> Final pricing will be confirmed on TrueHost checkout.
                    </p>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mb-3 gap-2"
                  onClick={() => {
                    // Redirect to TrueHost for checkout
                    window.location.href = 'https://truehost.co.ke/cloud//cart.php?a=checkout';
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <Link href="/search">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <ShieldCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
