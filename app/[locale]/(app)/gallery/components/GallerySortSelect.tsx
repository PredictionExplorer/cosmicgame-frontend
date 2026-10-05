'use client';

import { ArrowDownUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { SORT_KEYS, TRAIT_SORT_KEYS, isSortKey, type SortKey } from '../galleryQuery';

/** Catalog key of each sort order's label (gallery.sort.*). */
const SORT_LABEL_KEYS: Record<SortKey, string> = {
  newest: 'newest',
  oldest: 'oldest',
  'cycle-desc': 'cycleDesc',
  'cycle-asc': 'cycleAsc',
  rarity: 'rarity',
  'chaos-desc': 'chaosDesc',
  'chaos-asc': 'chaosAsc',
  'syzygies-desc': 'syzygiesDesc',
};

interface GallerySortSelectProps {
  value: SortKey;
  onChange: (sort: SortKey) => void;
  /** Hide trait-based orders while the trait index is unavailable. */
  traitSortsAvailable?: boolean;
  /** Full width (the filter sheet) instead of the toolbar's fixed width. */
  block?: boolean;
  className?: string;
}

/** The sort order of the gallery, as a select with its arrows glyph. */
export function GallerySortSelect({
  value,
  onChange,
  traitSortsAvailable = true,
  block = false,
  className,
}: GallerySortSelectProps) {
  const t = useTranslations('gallery');
  const options = SORT_KEYS.filter(
    (key) => traitSortsAvailable || key === value || !TRAIT_SORT_KEYS.includes(key),
  );

  return (
    <Select value={value} onValueChange={(next) => isSortKey(next) && onChange(next)}>
      <SelectTrigger
        aria-label={t('sort.ariaLabel')}
        className={cn(
          'justify-start [&>span]:flex-1 [&>span]:text-start',
          block ? 'w-full' : 'w-auto min-w-48',
          className,
        )}
        data-testid="gallery-sort"
      >
        <ArrowDownUp aria-hidden className="size-4 shrink-0 text-subtle" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((key) => (
          <SelectItem key={key} value={key}>
            {t(`sort.${SORT_LABEL_KEYS[key]}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
