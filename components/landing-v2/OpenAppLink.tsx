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
 * landing hero and footer) and inside client components (the landing header).
 * The hero uses the commit gradient for its primary action; other placements
 * use the solid primary or an outline.
 */
export function OpenAppLink({
  size = 'md',
  variant = 'default',
  className,
}: {
  size?: 'md' | 'lg' | 'xl';
  /** `commit` for the hero; `outline` where the page's own primary action should lead. */
  variant?: 'default' | 'outline' | 'commit';
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
        buttonVariants({ variant, size: size === 'md' ? 'default' : size }),
        'shrink-0 no-underline',
        size === 'md' ? 'max-sm:px-3' : size === 'lg' ? 'px-5' : undefined,
        className,
      )}
    >
      {t('cta.openApp')}
      <ArrowRight aria-hidden />
    </SiteLink>
  );
}
