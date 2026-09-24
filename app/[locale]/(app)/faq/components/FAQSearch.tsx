'use client';

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
 * The FAQ's own search, on the shared SearchField, right under the H1;
 * ⌘K / Ctrl+K stays with the site-wide command palette in the header.
 * While a query is active, a polite status line says how many questions
 * match.
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
  // No "/" shortcut: a single-character key that cannot be turned off fires from speech
  // input and stray keys (WCAG 2.1.4); the field sits under the H1, and ⌘K opens site search.
  const isFiltering = value.trim().length > 0 && activeQuery.trim().length > 0;

  return (
    <div className={cn('w-full max-w-xl', className)}>
      <SearchField
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
