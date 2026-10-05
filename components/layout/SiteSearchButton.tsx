'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { requestSiteSearch } from './siteSearchEvents';

/**
 * Opens the header's command palette from anywhere on the app host. An
 * outline button from the shared primitive, so it matches the secondary
 * action it usually sits beside.
 */
export function SiteSearchButton({ className }: { className?: string }) {
  const t = useTranslations('nav');
  return (
    <button
      type="button"
      onClick={requestSiteSearch}
      className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'px-5', className)}
    >
      <Search aria-hidden />
      {t('search.triggerLabel')}
    </button>
  );
}
