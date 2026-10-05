'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { SearchField } from '@/components/ui/search-field';

/** How long typing pauses before the search reaches the URL. */
export const SEARCH_DEBOUNCE_MS = 300;

interface GallerySearchInputProps {
  /** The search in the URL. */
  value: string;
  /** Writes a search to the URL: after a pause in typing, on Enter, and on clear. */
  onCommit: (query: string) => void;
  className?: string;
}

/**
 * The gallery search: a token number (`47`, `#000047`) or a name. It filters
 * as the reader types (after a short pause) and keeps the query in the URL,
 * so Back returns to it. The field shows what the reader typed even while
 * their last commit is still on its way to the URL.
 */
export function GallerySearchInput({ value, onCommit, className }: GallerySearchInputProps) {
  const t = useTranslations('search');
  const [text, setText] = useState(value);
  // The URL value last seen, and the value this field last sent. A URL change
  // that is not our own commit (Back, "Clear all") replaces the text.
  const [seen, setSeen] = useState(value);
  const [sent, setSent] = useState<string | null>(null);
  if (value !== seen) {
    setSeen(value);
    if (value !== sent) setText(value);
  }

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  // The debounced commit fires after later renders: it calls the latest
  // onCommit, never the one from the keystroke that scheduled it.
  const onCommitRef = useRef(onCommit);
  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  const commit = (next: string) => {
    clearTimeout(timer.current);
    const trimmed = next.trim();
    setSent(trimmed);
    onCommitRef.current(trimmed);
  };

  const onValueChange = (next: string) => {
    setText(next);
    clearTimeout(timer.current);
    if (next.trim() === '') {
      commit('');
      return;
    }
    timer.current = setTimeout(() => commit(next), SEARCH_DEBOUNCE_MS);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit(text);
    }
  };

  return (
    <SearchField
      value={text}
      onValueChange={onValueChange}
      onKeyDown={onKeyDown}
      placeholder={t('gallery.placeholder')}
      aria-label={t('gallery.ariaLabel')}
      clearLabel={t('gallery.clear')}
      containerClassName={className}
      data-testid="gallery-search"
    />
  );
}
