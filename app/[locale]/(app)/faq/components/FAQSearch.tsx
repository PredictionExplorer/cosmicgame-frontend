'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { SearchField } from '@/components/ui/search-field';

interface FAQSearchProps {
  value: string;
  /**
   * The query `resultCount` was computed for, when results lag the field
   * (a debounced search). Defaults to `value`.
   */
  activeQuery?: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
}

/**
 * The FAQ's own search, on the shared SearchField. "/" focuses it from
 * anywhere on the page outside a text field; ⌘K / Ctrl+K stays with the
 * site-wide command palette in the header. While a query is active, a
 * polite status line says how many questions match.
 */
export function FAQSearch({
  value,
  activeQuery = value,
  onChange,
  resultCount,
  totalCount,
  className,
}: FAQSearchProps) {
  const t = useTranslations('faq');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
    const target = e.target as HTMLElement | null;
    const typing =
      !!target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));
    if (typing) return;
    e.preventDefault();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isFiltering = value.trim().length > 0 && activeQuery.trim().length > 0;

  return (
    <div className={cn('w-full max-w-xl', className)}>
      <SearchField
        ref={inputRef}
        size="lg"
        value={value}
        onValueChange={onChange}
        placeholder={t('search.placeholder')}
        aria-label={t('search.ariaLabel')}
        clearLabel={t('search.clearAria')}
        enterKeyHint="search"
      />
      <p className="mt-2 min-h-[1.1rem] type-caption text-subtle" role="status" aria-live="polite">
        {isFiltering && resultCount !== undefined && totalCount !== undefined
          ? resultCount === 0
            ? t('search.noResults')
            : t('search.resultCount', { resultCount, totalCount })
          : null}
      </p>
    </div>
  );
}
