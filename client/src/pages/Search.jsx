import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, BookOpen, Tag, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export function Search() {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus search input when page opens
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SearchIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          Search Notes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search across titles, chapters, tags, and note content
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search by topic, keyword, or chapter... (e.g. 'React', 'MongoDB')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-14 pl-12 pr-12 rounded-2xl border border-border bg-surface text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 shadow-soft"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 p-1 text-muted-foreground hover:text-foreground rounded-lg"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Placeholder / State */}
      <Card className="p-8 text-center border-dashed">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-3">
          <SearchIcon className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {query ? `Searching for "${query}"...` : 'Type to start searching'}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Full-text index ranked search with highlighted text snippets will be activated in Phase 5.
        </p>
      </Card>
    </div>
  );
}

export default Search;
