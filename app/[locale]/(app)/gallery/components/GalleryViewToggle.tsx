'use client';

import { LayoutGrid, List } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_ICON_CLASS } from '@/lib/touch-target';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type ViewMode = 'grid' | 'list';

interface GalleryViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: { value: ViewMode; icon: typeof LayoutGrid; labelKey: string }[] = [
  { value: 'grid', icon: LayoutGrid, labelKey: 'view.grid' },
  { value: 'list', icon: List, labelKey: 'view.list' },
];

export function GalleryViewToggle({ value, onChange }: GalleryViewToggleProps) {
  const t = useTranslations('gallery');

  return (
    <div
      className="flex items-center rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5"
      role="radiogroup"
      aria-label={t('view.ariaLabel')}
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = value === mode.value;
        return (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={t(mode.labelKey)}
                onClick={() => onChange(mode.value)}
                className={cn(
                  'rounded-md p-1.5 transition-all duration-200',
                  TOUCH_TARGET_ICON_CLASS,
                  isActive
                    ? 'bg-primary/20 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]',
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t(mode.labelKey)}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
