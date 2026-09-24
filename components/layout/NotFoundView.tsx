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
import { cn } from '@/lib/utils';

import { BrandMark } from './BrandMark';
import { NavRowContent } from './NavRow';
import { SiteLink } from './SiteLink';
import { SiteSearchButton } from './SiteSearchButton';

/**
 * The 404 page of both hosts: a quiet orbit mark, the code as an eyebrow, a
 * plain heading and one sentence, the two places most visitors want (the
 * Observatory and the Gallery), search on the app, and a grid of useful
 * destinations. Server-rendered, so the recovery links are in the HTML;
 * they prefetch only on intent.
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
      className="relative isolate mx-auto flex w-full max-w-5xl flex-col items-center py-10 text-center sm:py-16"
    >
      <BrandMark className="pointer-events-none absolute left-1/2 top-0 -z-10 size-64 -translate-x-1/2 opacity-[0.07] sm:size-80" />
      <p className="type-eyebrow text-subtle">{t('notFound.code')}</p>
      <h1 id="not-found-heading" className="type-display-sm mt-3 text-balance text-foreground">
        {t('notFound.title')}
      </h1>
      <p className="type-lede mt-4 text-muted-foreground">{t('notFound.description')}</p>

      <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        {/* The shared button primitive draws all three actions; normal-case
            keeps the sentence-case labels as written. */}
        <SiteLink
          href={observatory.href}
          kind={observatory.kind}
          className={cn(
            buttonVariants({ variant: 'default', size: 'lg' }),
            'px-5 normal-case no-underline',
          )}
        >
          {t('notFound.primaryCta')}
          <ArrowRight aria-hidden />
        </SiteLink>
        <SiteLink
          href={gallery.href}
          kind={gallery.kind}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'px-5 normal-case no-underline',
          )}
        >
          {t('notFound.secondaryCta')}
        </SiteLink>
        {host === 'app' ? <SiteSearchButton /> : null}
      </div>

      <nav aria-labelledby="not-found-suggestions" className="mt-14 w-full">
        <h2 id="not-found-suggestions" className="type-eyebrow text-subtle">
          {t('notFound.suggestedPages')}
        </h2>
        <ul className="mt-4 grid gap-2 text-left sm:grid-cols-2 lg:grid-cols-3">
          {NOT_FOUND_ROUTE_IDS.map((id) => {
            const target = resolveRouteHref(getSiteRoute(id), host, locale);
            return (
              <li key={id}>
                <SiteLink
                  href={target.href}
                  kind={target.kind}
                  prefetch="intent"
                  className="group/row flex h-full items-center gap-3 rounded-surface border border-rule-faint bg-surface px-4 py-3 no-underline transition-colors duration-150 hover:border-input"
                >
                  <NavRowContent
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
