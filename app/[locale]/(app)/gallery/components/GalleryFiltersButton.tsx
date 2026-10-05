'use client';

import { forwardRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatCount } from '@/utils/format';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';

export interface GalleryFiltersButtonProps extends Omit<ButtonProps, 'children'> {
  /** Active filters (status, traits, chaos): shown on the button. */
  activeCount: number;
  /** The rail is open (desktop): the button reads as pressed. */
  pressed?: boolean;
}

/** "Filters" with the number of active filters; opens the rail or the filter sheet. */
export const GalleryFiltersButton = forwardRef<HTMLButtonElement, GalleryFiltersButtonProps>(
  ({ activeCount, pressed, className, variant = 'outline', ...props }, ref) => {
    const t = useTranslations('gallery');
    const locale = useLocale();
    return (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        aria-pressed={pressed}
        className={cn('shrink-0 gap-2', className)}
        data-testid="facets-toggle"
        {...props}
      >
        <SlidersHorizontal aria-hidden className="size-4" />
        {activeCount > 0
          ? t('toolbar.filtersWithCount', { count: formatCount(activeCount, locale) })
          : t('toolbar.filters')}
      </Button>
    );
  },
);
GalleryFiltersButton.displayName = 'GalleryFiltersButton';
