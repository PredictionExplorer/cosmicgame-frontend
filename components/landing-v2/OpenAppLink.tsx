import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getSiteRoute, resolveRouteHref } from '@/config/siteNav';
import { buttonVariants } from '@/components/ui/button';
import { SiteLink } from '@/components/layout/SiteLink';
import { cn } from '@/lib/utils';

/**
 * "Open the app": the landing's one way into the Observatory, with one label
 * everywhere (`nav.cta.openApp`). It crosses hosts in the same tab, so it
 * carries a forward arrow, not the new-tab arrow. Renders on the server (the
 * landing footer) and inside client components (the landing header). It is
 * the solid primary, never the commit gradient: a section's own commit
 * action (the hero's, The Cycle's, the closing band's) is the one that asks
 * for a decision.
 */
export function OpenAppLink({
  size = 'md',
  variant = 'default',
  className,
}: {
  size?: 'md' | 'lg';
  /** `outline` where the page's own primary action should lead (the reading pages' header). */
  variant?: 'default' | 'outline';
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
        buttonVariants({ variant, size: size === 'md' ? 'default' : 'lg' }),
        'shrink-0 no-underline',
        size === 'md' ? 'max-sm:px-3' : 'px-5',
        className,
      )}
    >
      {t('cta.openApp')}
      <ArrowRight aria-hidden />
    </SiteLink>
  );
}
