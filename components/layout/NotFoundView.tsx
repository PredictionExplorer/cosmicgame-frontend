import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  NOT_FOUND_ROUTE_IDS,
  getSiteRoute,
  resolveRouteHref,
  type SiteHost,
} from '@/config/siteNav';
import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { buttonVariants } from '@/components/ui/button';
import { OrbitMark } from '@/components/ui/orbit-mark';
import { cn } from '@/lib/utils';

import { NavRowContent } from './NavRow';
import { SiteLink } from './SiteLink';
import { SiteSearchButton } from './SiteSearchButton';

/**
 * The 404 page of both hosts. The missing page hangs as an empty plate: the
 * black art plate at the Signatures' own 3456:2234 ratio, with the hairline
 * orbit mark that stands in for artwork everywhere on the site, captioned
 * with the error code. Then a plain heading and one sentence, the two places
 * most visitors want (the Observatory and the Gallery), search on the app,
 * and useful destinations as a quiet list of rows: no card, no icon tile,
 * titles on one line across each row.
 *
 * Rendered on the server, so the recovery links are in the HTML; every
 * link, the two actions included, prefetches only on intent, so a page most
 * visitors leave does not download the home and gallery bundles.
 */
export function NotFoundView({ host }: { host: SiteHost }) {
  const t = useTranslations('errors');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const observatory = resolveRouteHref(getSiteRoute('observatory'), host, locale);
  const gallery = resolveRouteHref(getSiteRoute('gallery'), host, locale);

  return (
    <section
      aria-labelledby="not-found-heading"
      className="relative mx-auto flex w-full max-w-5xl flex-col items-center py-6 text-center sm:py-12"
    >
      <div
        data-testid="not-found-plate"
        className="art-plate flex w-full max-w-60 flex-col items-center justify-center gap-2.5 sm:max-w-80"
      >
        <OrbitMark className="h-[38%] w-auto" />
        <p className="type-label text-muted-foreground">{t('notFound.code')}</p>
      </div>
      <h1
        id="not-found-heading"
        className="type-display-sm mt-8 text-balance text-foreground sm:mt-10"
      >
        {t('notFound.title')}
      </h1>
      <p className="type-lede mt-4 text-muted-foreground">{t('notFound.description')}</p>

      <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <SiteLink
          href={observatory.href}
          kind={observatory.kind}
          prefetch="intent"
          className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'px-5 no-underline')}
        >
          {/* The landing calls the app "the app" everywhere, as its header does. */}
          {host === 'landing' ? navT('cta.openApp') : t('notFound.primaryCta')}
          <ArrowRight aria-hidden className="rtl:-scale-x-100" />
        </SiteLink>
        <SiteLink
          href={gallery.href}
          kind={gallery.kind}
          prefetch="intent"
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'px-5 no-underline')}
        >
          {t('notFound.secondaryCta')}
        </SiteLink>
        {host === 'app' ? <SiteSearchButton /> : null}
      </div>

      <nav aria-labelledby="not-found-suggestions" className="mt-14 w-full sm:mt-16">
        <h2 id="not-found-suggestions" className="type-eyebrow text-subtle">
          {t('notFound.suggestedPages')}
        </h2>
        <ul className="mt-4 grid border-t border-rule-faint pt-2 text-left sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-3">
          {NOT_FOUND_ROUTE_IDS.map((id) => {
            const target = resolveRouteHref(getSiteRoute(id), host, locale);
            return (
              <li key={id} className="min-w-0">
                <SiteLink
                  href={target.href}
                  kind={target.kind}
                  prefetch="intent"
                  className="group/row flex h-full min-h-11 items-start gap-3 rounded-control px-3 py-3 no-underline transition-colors duration-150 hover:bg-muted"
                >
                  <NavRowContent
                    iconStyle="inline"
                    iconClassName="mt-0.5"
                    icon={SITE_ROUTE_ICONS[id]}
                    label={navT(`routes.${id}.label`)}
                    description={navT(`routes.${id}.description`)}
                  />
                </SiteLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
