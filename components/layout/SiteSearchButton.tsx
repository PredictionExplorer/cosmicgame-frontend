'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { requestSiteSearch } from './siteSearchEvents';

/** Opens the header's command palette from anywhere on the app host. */
export function SiteSearchButton({ className }: { className?: string }) {
  const t = useTranslations('nav');
  return (
    <button
      type="button"
      onClick={requestSiteSearch}
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-control border border-input bg-surface-sunken px-4 text-sm text-muted-foreground transition-colors duration-150 hover:border-foreground/40 hover:text-foreground sm:h-10',
        className,
      )}
    >
      <Search aria-hidden className="size-4" />
      {t('search.triggerLabel')}
    </button>
  );
}
