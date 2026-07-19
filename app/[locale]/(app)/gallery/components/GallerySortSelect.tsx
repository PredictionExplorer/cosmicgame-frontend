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

export type SortKey = 'newest' | 'oldest' | 'cycle-desc' | 'cycle-asc';

interface GallerySortSelectProps {
  value: SortKey;
  onChange: (sort: SortKey) => void;
}

const sortOptions: { value: SortKey; labelKey: string }[] = [
  { value: 'newest', labelKey: 'sort.newest' },
  { value: 'oldest', labelKey: 'sort.oldest' },
  { value: 'cycle-desc', labelKey: 'sort.cycleDesc' },
  { value: 'cycle-asc', labelKey: 'sort.cycleAsc' },
];

export function GallerySortSelect({ value, onChange }: GallerySortSelectProps) {
  const t = useTranslations('gallery');

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
              {sortOptions.map((opt) => (
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
