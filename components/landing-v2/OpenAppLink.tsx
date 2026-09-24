import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getSiteRoute, resolveRouteHref } from '@/config/siteNav';
import { buttonVariants } from '@/components/ui/button';
import { SiteLink } from '@/components/layout/SiteLink';
import { cn } from '@/lib/utils';

const SIZE = { md: 'default', lg: 'lg', xl: 'xl' } as const;

/**
 * "Open the app": the landing's one way into the Observatory, with one label
 * everywhere (`nav.cta.openApp`). It crosses hosts in the same tab, so it
 * carries a forward arrow, not the new-tab arrow. Renders on the server (the
 * landing footer, the closing band) and inside client components (the
 * landing header).
 *
 * `variant`: `default` (solid primary) in the header and footer; `commit`
 * (the signature gradient) only where it is the one action of its view, the
 * page's closing band.
 */
export function OpenAppLink({
  size = 'md',
  variant = 'default',
  className,
}: {
  size?: 'md' | 'lg' | 'xl';
  variant?: 'default' | 'commit';
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
        buttonVariants({ variant, size: SIZE[size] }),
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
