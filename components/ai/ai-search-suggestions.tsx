"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';

interface AISearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

export default function AISearchSuggestions({
  query,
  onSuggestionClick,
  className = ''
}: AISearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled] = useState(() => isAIFeatureEnabled('searchEnhancement'));
  
  const debouncedQuery = useDebounce(query, 500);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    console.log('🔍 [AI Search] Fetching suggestions for:', searchQuery, { enabled: isEnabled });
    
    if (!searchQuery || searchQuery.length < 2 || !isEnabled) {
      console.log('🔍 [AI Search] Skipping - query too short or disabled');
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    console.log('🔍 [AI Search] Making API request to /api/ai/search-suggestions');
    
    try {
      const response = await fetch('/api/ai/search-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      console.log('🔍 [AI Search] API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [AI Search] Suggestions received:', data.suggestions?.length || 0);
        setSuggestions(data.suggestions || []);
      } else {
        const errorText = await response.text();
        console.error('🔍 [AI Search] API error:', errorText);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('🔍 [AI Search] Fetch error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled]);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  // Don't render if AI search enhancement is disabled or no suggestions
  if (!isEnabled || (!suggestions.length && !isLoading)) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          AI Suggestions
        </span>
        <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
          Smart
        </Badge>
      </div>

      {/* Suggestions */}
      <div className="py-2">
        {isLoading ? (
          <div className="px-3 py-2 flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin h-3 w-3 border border-gray-300 border-t-violet-600 rounded-full" />
            Generating suggestions...
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:bg-gray-50 dark:focus:bg-gray-800 focus:outline-none flex items-center gap-2"
            >
              <Search className="h-3 w-3 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      {suggestions.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI-powered search suggestions for better results
          </p>
        </div>
      )}
    </div>
  );
}