'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { POPULAR_EXTENSIONS } from '@/lib/constants';
import { useChat } from '@/contexts/chat-context';

export function DomainSearchBar({ large = false }: { large?: boolean }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const router = useRouter();
  const { sendMessage } = useChat();

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

  // Debounced suggestions using the search-domain API
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSuggesting(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-domain?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          // normalize results: exact + suggestions
          const items: any[] = [];
          if (data?.data?.exact) items.push({ type: 'exact', ...data.data.exact });
          if (Array.isArray(data?.data?.suggestions)) {
            data.data.suggestions.slice(0, 6).forEach((s: any) => items.push({ type: 'suggestion', ...s }));
          }
          setSuggestions(items);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch (e) {
        console.error('Suggestion fetch error', e);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsSuggesting(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSuggestionClick = (fullDomain: string) => {
    setQuery(fullDomain);
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(fullDomain)}`);
  };

  const handleGenerateWithKaya = async () => {
    const prompt = query.trim()
      ? `Generate 6 creative domain name ideas for the keyword: ${query.trim()}`
      : 'Generate 6 creative domain name ideas for a small business';
    // sendMessage will call Kaya and insert results into chat
    await sendMessage(prompt);
    // open chat handled by chat context elsewhere
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
              onFocus={() => { if (suggestions.length) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
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

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <div className="relative max-w-2xl mx-auto mt-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-2">
              {isSuggesting && (
                <div className="flex items-center gap-2 text-sm text-gray-500 px-2 py-1">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching suggestions...
                </div>
              )}

              {!isSuggesting && suggestions.length === 0 && (
                <div className="text-sm text-gray-500 px-2 py-2">No suggestions found</div>
              )}

              {suggestions.map((s, idx) => (
                <button
                  key={s.fullDomain + idx}
                  onClick={() => handleSuggestionClick(s.fullDomain)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-800">{s.fullDomain}</div>
                    <div className="text-xs text-gray-400">{s.available ? 'Available' : 'Taken'} • ${s.price ?? '--'}/yr</div>
                  </div>
                  <div className="text-xs text-gray-400">{s.type === 'exact' ? 'Exact' : 'Suggestion'}</div>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 p-2 flex items-center justify-between">
              <button
                onClick={() => router.push(`/search?q=${encodeURIComponent(query.trim())}`)}
                className="text-sm text-primary-600 hover:underline"
              >
                View all results
              </button>
              <button
                onClick={handleGenerateWithKaya}
                className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-100"
              >
                Ask Kaya for ideas
              </button>
            </div>
          </div>
        </div>
      )}

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
