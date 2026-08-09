'use client';

import { Layers, Lock, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type FilterKey = 'all' | 'staked' | 'named';

interface GalleryFilterChipsProps {
  value: FilterKey;
  onChange: (filter: FilterKey) => void;
}

const filters: { key: FilterKey; labelKey: string; icon: typeof Layers; tooltipKey: string }[] = [
  { key: 'all', labelKey: 'filters.all.label', icon: Layers, tooltipKey: 'filters.all.tooltip' },
  {
    key: 'staked',
    labelKey: 'filters.anchored.label',
    icon: Lock,
    tooltipKey: 'filters.anchored.tooltip',
  },
  {
    key: 'named',
    labelKey: 'filters.named.label',
    icon: Tag,
    tooltipKey: 'filters.named.tooltip',
  },
];

export function GalleryFilterChips({ value, onChange }: GalleryFilterChipsProps) {
  const t = useTranslations('gallery');

  return (
    <div
      className="flex items-center gap-1.5"
      role="radiogroup"
      aria-label={t('filters.ariaLabel')}
    >
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = value === f.key;
        return (
          <Tooltip key={f.key}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onChange(f.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  TOUCH_TARGET_HEIGHT_CLASS,
                  isActive
                    ? 'bg-gradient-to-r from-[#06AEEC]/20 to-[#9C37FD]/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(21,191,253,0.1)]'
                    : 'bg-white/[0.03] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.06] hover:text-foreground',
                )}
              >
                <Icon className="h-3 w-3" />
                {t(f.labelKey)}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t(f.tooltipKey)}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
