'use client';

import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_HEIGHT_CLASS, TOUCH_TARGET_ICON_CLASS } from '@/lib/touch-target';

interface GallerySearchInputProps {
  value: string;
  onChange: (query: string) => void;
  onSearch: (query: string) => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
}

export function GallerySearchInput({
  value,
  onChange,
  onSearch,
  resultCount,
  totalCount,
  className,
}: GallerySearchInputProps) {
  const t = useTranslations('search');
  const [local, setLocal] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync local back to prop when the parent resets externally (e.g. clear
  // button on the toolbar). The lint rule discourages syncing prop → state
  // via effects, but the alternative (`key={value}`) would remount the
  // input on every keystroke since the parent updates value via the same
  // debounce pipeline.
  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setLocal(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!next) {
      onChange('');
      return;
    }
    debounceRef.current = setTimeout(() => onChange(next), 300);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onSearch(local);
    }
  };

  const handleClear = () => {
    setLocal('');
    onChange('');
  };

  const handleSearchClick = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch(local);
  };

  const isFiltered =
    resultCount !== undefined && totalCount !== undefined && resultCount !== totalCount;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <input
          type="text"
          placeholder={t('gallery.placeholder')}
          aria-label={t('gallery.ariaLabel')}
          value={local}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full h-10 rounded-lg border border-white/[0.06] bg-white/[0.03] pl-9 pr-9 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors',
            TOUCH_TARGET_HEIGHT_CLASS,
          )}
        />
        {local && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t('gallery.clear')}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors',
              TOUCH_TARGET_ICON_CLASS,
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleSearchClick}
        className={cn(
          'h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity',
          TOUCH_TARGET_HEIGHT_CLASS,
        )}
      >
        {t('gallery.submit')}
      </button>
      {isFiltered && (
        <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {t('gallery.results', { count: resultCount })}
        </span>
      )}
    </div>
  );
}
