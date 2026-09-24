import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getSiteRoute, resolveRouteHref } from '@/config/siteNav';
import { buttonVariants } from '@/components/ui/button';
import { SiteLink } from '@/components/layout/SiteLink';
import { cn } from '@/lib/utils';

/**
 * "Open the app": the landing's one way into the Observatory, with one label
 * everywhere (`nav.cta.openApp`). It crosses hosts in the same tab, so it
 * carries a forward arrow, not the new-tab arrow. Drawn by the shared button
 * primitive's gradient variant, so it follows the primitive; `normal-case`
 * keeps the sentence-case label as written. Renders on the server (the
 * landing footer) and inside client components (the landing header).
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
        buttonVariants({ variant: 'default', size: size === 'md' ? 'default' : 'lg' }),
        'shrink-0 normal-case no-underline',
        size === 'md' ? 'max-sm:px-3' : 'px-5',
        className,
      )}
    >
      {t('cta.openApp')}
      <ArrowRight aria-hidden />
    </SiteLink>
  );
}
