'use client';

import { ArrowDownUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type SortKey =
  | 'newest'
  | 'oldest'
  | 'cycle-desc'
  | 'cycle-asc'
  | 'rarity'
  | 'chaos-desc'
  | 'chaos-asc'
  | 'syzygies-desc';

/** Sort orders that need the collection trait index to be meaningful. */
export const TRAIT_SORT_KEYS: readonly SortKey[] = [
  'rarity',
  'chaos-desc',
  'chaos-asc',
  'syzygies-desc',
];

/** Every sort key, for URL parsing. */
export const SORT_KEYS: readonly SortKey[] = [
  'newest',
  'oldest',
  'cycle-desc',
  'cycle-asc',
  ...TRAIT_SORT_KEYS,
];

/** Narrows an arbitrary string (e.g. a URL param) to a {@link SortKey}. */
export function isSortKey(value: string | null | undefined): value is SortKey {
  return typeof value === 'string' && (SORT_KEYS as readonly string[]).includes(value);
}

interface GallerySortSelectProps {
  value: SortKey;
  onChange: (sort: SortKey) => void;
  /** Hide trait-based orders while the trait index is unavailable. */
  traitSortsAvailable?: boolean;
}

const sortOptions: { value: SortKey; labelKey: string }[] = [
  { value: 'newest', labelKey: 'sort.newest' },
  { value: 'oldest', labelKey: 'sort.oldest' },
  { value: 'cycle-desc', labelKey: 'sort.cycleDesc' },
  { value: 'cycle-asc', labelKey: 'sort.cycleAsc' },
  { value: 'rarity', labelKey: 'sort.rarity' },
  { value: 'chaos-desc', labelKey: 'sort.chaosDesc' },
  { value: 'chaos-asc', labelKey: 'sort.chaosAsc' },
  { value: 'syzygies-desc', labelKey: 'sort.syzygiesDesc' },
];

export function GallerySortSelect({
  value,
  onChange,
  traitSortsAvailable = true,
}: GallerySortSelectProps) {
  const t = useTranslations('gallery');
  const options = traitSortsAvailable
    ? sortOptions
    : sortOptions.filter((opt) => !TRAIT_SORT_KEYS.includes(opt.value));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
          <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
            <SelectTrigger
              className="w-[170px] h-9 text-xs border-white/[0.06] bg-white/[0.03]"
              aria-label={t('sort.ariaLabel')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{t('sort.tooltip')}</p>
      </TooltipContent>
    </Tooltip>
  );
}
