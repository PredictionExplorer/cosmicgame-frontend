'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FAQSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
}

export function FAQSearch({ value, onChange, resultCount, totalCount, className }: FAQSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isFiltering = value.length > 0;

  return (
    <div className={cn('relative mx-auto w-full max-w-xl', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground/60" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search questions..."
          aria-label="Search frequently asked questions"
          className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-24 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 focus:border-primary/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-sm"
        />

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {isFiltering ? (
            <button
              onClick={() => onChange('')}
              aria-label="Clear search"
              className="flex h-7 items-center rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </button>
          ) : (
            <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 font-mono text-[10px] text-muted-foreground/50 sm:inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {isFiltering && resultCount !== undefined && totalCount !== undefined && (
        <p className="mt-2 text-center text-xs text-muted-foreground/70" aria-live="polite">
          {resultCount === 0
            ? 'No questions found. Try a different search term.'
            : `Showing ${resultCount} of ${totalCount} questions`}
        </p>
      )}
    </div>
  );
}
