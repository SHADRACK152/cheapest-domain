'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Crown,
  ShoppingCart,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DomainSearchBar } from '@/components/domain-search-bar';
import { Domain, SearchResult } from '@/types';
import { POPULAR_EXTENSIONS } from '@/lib/constants';
import { useCart } from '@/contexts/cart-context';
import { useCurrency, formatPrice } from '@/contexts/currency-context';
import { convertUSDtoKES } from '@/lib/truehost-fetcher';
import { cn } from '@/lib/utils';
import { redirectToTrueHost } from '@/lib/truehost-config';
import { CurrencyToggleCompact } from '@/components/ui/currency-toggle';

function DomainCard({
  domain,
  index,
}: {
  domain: Domain;
  index: number;
}) {
  const { addItem, items } = useCart();
  const { currency } = useCurrency();
  const [showToast, setShowToast] = useState(false);
  const isInCart = items.some(item => item.domain.fullDomain === domain.fullDomain);
  
  const handleAddToCart = () => {
    // Redirect directly to TrueHost Kenya to register this domain
    redirectToTrueHost(domain.fullDomain);
  };
  
  // Calculate KES price if not provided
  const priceKES = domain.priceKES || convertUSDtoKES(domain.price);
  const displayPrice = formatPrice(domain.price, priceKES, currency);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-200',
        domain.available
          ? 'border-gray-100 bg-white hover:border-primary-200 hover:shadow-lg hover:shadow-primary-600/5'
          : 'border-gray-100 bg-gray-50 opacity-60'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0',
            domain.available
              ? domain.premium
                ? 'bg-amber-50 text-amber-600'
                : 'bg-green-50 text-green-600'
              : 'bg-gray-100 text-gray-400'
          )}
        >
          {domain.available ? (
            domain.premium ? (
              <Crown className="h-5 w-5" />
            ) : (
              <Check className="h-5 w-5" />
            )
          ) : (
            <X className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#111111] truncate">
            {domain.fullDomain}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {domain.premium && (
              <Badge variant="default" className="text-[10px]">
                Premium
              </Badge>
            )}
            <span className="text-xs text-gray-400">
              {domain.available ? 'Available' : 'Taken'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="text-right">
          <p className="text-lg font-bold text-[#111111]">
            {displayPrice}
          </p>
          <p className="text-xs text-gray-400">per year</p>
        </div>
        {domain.available ? (
          <Button 
            size="sm" 
            className="flex-shrink-0"
            onClick={handleAddToCart}
            disabled={false}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Register on TrueHost
          </Button>
        ) : (
          <Button size="sm" variant="secondary" disabled className="flex-shrink-0">
            Unavailable
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterExt, setFilterExt] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'name'>('price');

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      setError(null);
      
      // Call the API route for real domain checking
      fetch(`/api/search-domain?q=${encodeURIComponent(query)}`)
        .then(async (response) => {
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to search domain');
          }
          
          setResults(data.data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Search error:', err);
          setError(err.message || 'Failed to search domain. Please try again.');
          setIsLoading(false);
        });
    }
  }, [query]);

  const allDomains = results
    ? [
        ...(results.exact ? [results.exact] : []),
        ...results.suggestions,
        ...results.premium,
        ...results.taken,
      ]
    : [];

  const filteredDomains = allDomains
    .filter((d) => filterExt === 'all' || d.extension === filterExt)
    .sort((a, b) =>
      sortBy === 'price' ? a.price - b.price : a.fullDomain.localeCompare(b.fullDomain)
    );

  return (
    <div className="container-wide py-12">
      {/* Search Bar */}
      <div className="mb-12">
        <DomainSearchBar />
      </div>

      {query && (
        <div className="space-y-8">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
            >
              <div className="flex items-center gap-2">
                <X className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
          
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">
                Results for &ldquo;{query}&rdquo;
              </h1>
              {!isLoading && !error && (
                <p className="text-sm text-gray-400 mt-1">
                  {filteredDomains.length} domains found
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Currency Toggle */}
              <CurrencyToggleCompact />
              
              {/* Filter */}
              <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 p-1">
                <Filter className="h-4 w-4 text-gray-400 ml-2" />
                <select
                  value={filterExt}
                  onChange={(e) => setFilterExt(e.target.value)}
                  className="text-sm bg-transparent outline-none pr-2 text-gray-600"
                >
                  <option value="all">All Extensions</option>
                  {POPULAR_EXTENSIONS.map((ext) => (
                    <option key={ext} value={ext}>
                      {ext}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortBy((prev) => (prev === 'price' ? 'name' : 'price'))
                }
              >
                <ArrowUpDown className="h-4 w-4 mr-1.5" />
                {sortBy === 'price' ? 'Price' : 'Name'}
              </Button>
            </div>
          </div>

          {/* Exact Match */}
          {isLoading ? (
            <SearchSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={query + filterExt + sortBy}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Exact Domain Search Result - Always Show First */}
                {results?.exact && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                      <span className="text-primary-600">Your Search:</span> {results.exact.fullDomain}
                    </h2>
                    <div className={cn(
                      "p-6 rounded-2xl border-2 shadow-lg",
                      results.exact.available
                        ? "border-green-200 bg-green-50/50"
                        : "border-red-200 bg-red-50/50"
                    )}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0",
                            results.exact.available ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          )}>
                            {results.exact.available ? (
                              <Check className="h-8 w-8" strokeWidth={2.5} />
                            ) : (
                              <X className="h-8 w-8" strokeWidth={2.5} />
                            )}
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-[#111111] mb-1">
                              {results.exact.fullDomain}
                            </p>
                            <p className={cn(
                              "text-base font-semibold",
                              results.exact.available ? "text-green-600" : "text-red-600"
                            )}>
                              {results.exact.available ? "✓ Available for Registration" : "✗ Already Taken"}
                            </p>
                            {results.exact.premium && (
                              <Badge className="mt-2 bg-amber-500">Premium Domain</Badge>
                            )}
                          </div>
                        </div>
                        
                        {results.exact.available && (
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary-600">
                                ${results.exact.price.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">per year</p>
                            </div>
                            <Button size="lg" className="flex-shrink-0 h-12 px-6">
                              <ShoppingCart className="h-5 w-5 mr-2" />
                              Register Now
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {results && (results.suggestions.length > 0 || results.premium.length > 0) && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-[#111111]">
                      {results.exact?.available ? "Similar Domains You Might Like" : "Available Alternatives"}
                    </h2>
                    <p className="text-sm text-gray-500 -mt-1">
                      Great alternative options for your domain
                    </p>
                  </div>
                )}

                {/* Premium Domains */}
                {results?.premium && results.premium.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-600" />
                      <h3 className="text-base font-semibold text-gray-700 uppercase tracking-wider">
                        Premium Domains
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {results.premium.map((d, i) => (
                        <DomainCard key={d.fullDomain} domain={d} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Suggestions */}
                {filteredDomains.filter((d) => d.available && !d.premium && d.fullDomain !== results?.exact?.fullDomain).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-700 uppercase tracking-wider">
                      More Available Options
                    </h3>
                    <div className="space-y-2">
                      {filteredDomains
                        .filter((d) => d.available && !d.premium && d.fullDomain !== results?.exact?.fullDomain)
                        .map((d, i) => (
                          <DomainCard
                            key={d.fullDomain}
                            domain={d}
                            index={i}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Taken Domains */}
                {filteredDomains.filter((d) => !d.available && d.fullDomain !== results?.exact?.fullDomain).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-400 uppercase tracking-wider">
                      Unavailable Domains
                    </h3>
                    <div className="space-y-2">
                      {filteredDomains
                        .filter((d) => !d.available && d.fullDomain !== results?.exact?.fullDomain)
                        .map((d, i) => (
                          <DomainCard
                            key={d.fullDomain}
                            domain={d}
                            index={i}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-[#111111] mb-2">
            Search for a Domain
          </h2>
          <p className="text-gray-500">
            Enter a domain name above to check availability and pricing.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-wide py-12">
          <SearchSkeleton />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
