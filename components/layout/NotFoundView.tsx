import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  NOT_FOUND_ROUTE_IDS,
  getSiteRoute,
  resolveRouteHref,
  type SiteHost,
} from '@/config/siteNav';
import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';

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

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <SiteLink
          href={observatory.href}
          kind={observatory.kind}
          className="inline-flex h-11 items-center gap-2 rounded-control bg-signature-gradient px-5 text-sm font-semibold text-primary-foreground no-underline shadow-[inset_0_1px_0_hsl(var(--foreground)/0.16)] transition-[filter] duration-150 hover:brightness-110"
        >
          {t('notFound.primaryCta')}
          <ArrowRight aria-hidden className="size-4" />
        </SiteLink>
        <SiteLink
          href={gallery.href}
          kind={gallery.kind}
          className="inline-flex h-11 items-center rounded-control border border-input px-5 text-sm font-semibold text-foreground no-underline transition-colors duration-150 hover:border-foreground/40 hover:bg-muted"
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
