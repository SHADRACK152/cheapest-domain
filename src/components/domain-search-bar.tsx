'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POPULAR_EXTENSIONS } from '@/lib/constants';

export function DomainSearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleExtensionClick = (ext: string) => {
    setQuery((prev) => {
      if (!prev) return 'example' + ext;
      // Remove existing extension if present
      const withoutExt = prev.replace(/\.[a-z]{2,}(\.[a-z]{2,})?$/i, '');
      return withoutExt + ext;
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    
    // Navigate to search results page
    // Results will be fetched from TrueHost and displayed in our UI
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    
    setIsSearching(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div
          className={`flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white shadow-lg shadow-gray-100/50 transition-all duration-300 focus-within:border-primary-600 focus-within:shadow-xl focus-within:shadow-primary-600/10 ${
            large ? 'p-2' : 'p-1.5'
          }`}
        >
          <div className="flex items-center flex-1 gap-2 px-3">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for your perfect domain name..."
              className={`flex-1 bg-transparent outline-none text-[#111111] placeholder:text-gray-400 ${
                large ? 'text-lg py-3' : 'text-base py-2'
              }`}
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            size={large ? 'xl' : 'lg'}
            className="flex-shrink-0"
          >
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {/* Popular Extensions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-2 mt-6"
      >
        <span className="text-sm text-gray-400">Popular:</span>
        {POPULAR_EXTENSIONS.map((ext) => (
          <button
            key={ext}
            onClick={() => handleExtensionClick(ext)}
            className="px-3 py-1.5 rounded-full bg-gray-50 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200"
          >
            {ext}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
