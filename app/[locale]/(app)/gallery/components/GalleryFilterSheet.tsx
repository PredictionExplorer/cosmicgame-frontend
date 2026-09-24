'use client';

import type { ReactNode } from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetOverlay, SheetPortal } from '@/components/ui/sheet';

interface GalleryFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Signatures the current filters show, for the footer's primary button. */
  resultCount: number | null;
  /** A filter narrows the view: "Clear all" appears in the footer. */
  filtered: boolean;
  onClearAll: () => void;
  children: ReactNode;
}

/**
 * The filter sheet below `lg`: it rises from the bottom (within a thumb's
 * reach), scrolls on its own, and keeps its two actions pinned at the foot,
 * "Clear all" and "Show N NFTs", which closes it on the updated grid.
 */
export function GalleryFilterSheet({
  open,
  onOpenChange,
  resultCount,
  filtered,
  onClearAll,
  children,
}: GalleryFilterSheetProps) {
  const t = useTranslations('gallery');
  const tTraits = useTranslations('traits');
  const tCommon = useTranslations('common');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-surface border-t border-rule bg-surface-raised shadow-float',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'data-[state=closed]:duration-[var(--duration-base)] data-[state=open]:duration-[var(--duration-slow)] motion-reduce:animate-none',
            'sm:inset-x-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[26rem] sm:rounded-none sm:border-l sm:border-t-0',
            'sm:data-[state=closed]:slide-out-to-right sm:data-[state=open]:slide-in-from-right',
          )}
          data-testid="gallery-filter-sheet"
        >
          <div className="flex items-center justify-between gap-3 border-b border-rule-faint px-4 py-3 sm:px-5">
            <SheetPrimitive.Title className="type-heading-3 text-foreground">
              {t('toolbar.filters')}
            </SheetPrimitive.Title>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label={tCommon('actions.close')}>
                <X aria-hidden />
              </Button>
            </SheetClose>
          </div>
          <SheetPrimitive.Description className="sr-only">
            {tTraits('facets.sheetDescription')}
          </SheetPrimitive.Description>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
            {children}
          </div>
          <div className="flex items-center gap-3 border-t border-rule-faint px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
            {filtered ? (
              <Button variant="ghost" onClick={onClearAll}>
                {tTraits('facets.clearAll')}
              </Button>
            ) : null}
            <SheetClose asChild>
              <Button className="ms-auto min-w-40 flex-1 sm:flex-none">
                {resultCount === null
                  ? tCommon('actions.close')
                  : t('toolbar.showResults', { count: resultCount })}
              </Button>
            </SheetClose>
          </div>
        </SheetPrimitive.Content>
      </SheetPortal>
    </Sheet>
  );
}
