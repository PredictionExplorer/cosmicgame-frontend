'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { LanguageSwitcher } from './LanguageSwitcher';
import { PalettePicker } from './PalettePicker';
import { Wordmark } from './Wordmark';

interface NavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The menu button; the sheet wires it up as its trigger. */
  trigger: ReactNode;
  /** The host's navigation: its links, and anything that belongs with them. */
  children: ReactNode;
  /**
   * Where focus goes once the sheet has closed; see `SheetContent`. The
   * landing uses it to land on a home section chosen in the sheet.
   */
  onCloseAutoFocus?: ComponentProps<typeof SheetContent>['onCloseAutoFocus'];
}

/**
 * The navigation sheet below 1024px, one anatomy on both hosts: it opens
 * from the right, under the thumb, from a menu button at the header's end;
 * a header-height row holds the wordmark (home, which closes the sheet) and
 * the close button; the host's navigation scrolls in between; and the
 * palette and language preferences are pinned to the foot, so the phone
 * header keeps its room. The app drawer (`SiteDrawer`) and the landing
 * header pass their own navigation. It holds nothing of the wallet stack,
 * so the landing bundle stays free of it.
 */
export function NavSheet({
  open,
  onOpenChange,
  trigger,
  children,
  onCloseAutoFocus,
}: NavSheetProps) {
  const t = useTranslations('nav');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        closePlacement="header"
        aria-describedby={undefined}
        onCloseAutoFocus={onCloseAutoFocus}
        className="flex w-[min(22rem,100vw)] max-w-full flex-col gap-0 border-l border-rule bg-background p-0 sm:max-w-[22rem]"
      >
        <SheetTitle className="sr-only">{t('drawerTitle')}</SheetTitle>
        <div className="flex h-[var(--header-height)] shrink-0 items-center border-b border-rule-faint pl-4 pr-16">
          <Link
            href="/"
            onClick={() => onOpenChange(false)}
            aria-label={t('brand.homeLabel')}
            className="inline-flex min-h-11 items-center no-underline"
          >
            <Wordmark size="md" />
          </Link>
        </div>

        <nav
          aria-label={t('primaryLabel')}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
        >
          {children}
        </nav>

        <div className="shrink-0 border-t border-rule-faint px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3">
          <p className="type-eyebrow text-subtle">{t('drawer.preferences')}</p>
          <PalettePicker className="mt-1 -ml-2.5" />
          <LanguageSwitcher variant="drawer" className="mt-2" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
