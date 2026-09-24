'use client';

import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getSiteRoute, resolveRouteHref } from '@/config/siteNav';
import { SiteLink } from '@/components/layout/SiteLink';
import { cn } from '@/lib/utils';

/**
 * "Open the app": the landing's one way into the Observatory, with one label
 * everywhere (`nav.cta.openApp`). It crosses hosts in the same tab, so it
 * carries a forward arrow, not the new-tab arrow.
 */
export function OpenAppLink({
  size = 'md',
  className,
}: {
  size?: 'md' | 'lg';
  className?: string;
}) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const app = resolveRouteHref(getSiteRoute('observatory'), 'landing', locale);
  return (
    <SiteLink
      href={app.href}
      kind={app.kind}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-control bg-signature-gradient text-sm font-semibold text-primary-foreground no-underline shadow-[inset_0_1px_0_hsl(var(--foreground)/0.16)] transition-[filter] duration-150 hover:brightness-110',
        size === 'md' ? 'h-10 px-4' : 'h-11 px-5',
        className,
      )}
    >
      {t('cta.openApp')}
      <ArrowRight aria-hidden className="size-4" />
    </SiteLink>
  );
}
