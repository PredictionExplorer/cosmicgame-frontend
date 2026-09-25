import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { Link } from '@/i18n/navigation';
import { SiteLink } from '@/components/layout/SiteLink';
import { SectionHeader } from '@/components/ui/section-header';

/** The row look every related link shares. */
const ROW_CLASS =
  'group flex min-h-12 items-center justify-between gap-4 py-2 type-body-sm text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground';
const ICON_CLASS =
  'size-4 shrink-0 text-subtle transition-[color,translate] duration-[var(--duration-fast)] group-hover:text-foreground motion-reduce:transition-none';

/** The pages a reader goes on to from the collection: how it works, the renderer, the figures. */
const RELATED = [
  { href: '/how-it-works', key: 'learn' },
  { href: '/code', key: 'code' },
  { href: '/statistics', key: 'statistics' },
] as const;

/**
 * "About the collection", after the wall: how a Signature comes to be and
 * what a cycle imprints, beside the pages to read next. It sits below the art
 * so the header stays one sentence and the first plates reach the first
 * screen; it renders on the server, so crawlers read it with the header.
 */
export async function GalleryAbout({ locale }: { locale: string }) {
  const [t, seo, common, nav] = await Promise.all([
    getTranslations({ locale, namespace: 'gallery' }),
    getTranslations({ locale, namespace: 'seo' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  return (
    <section
      aria-labelledby="gallery-about"
      className="mt-16 grid gap-x-16 gap-y-8 border-t border-rule-faint pt-10 sm:mt-20 lg:grid-cols-[minmax(0,1fr)_20rem]"
      data-testid="gallery-about"
    >
      <div className="min-w-0">
        <SectionHeader headingId="gallery-about" title={t('about.title')} />
        <p className="type-prose text-muted-foreground">{t('about.description')}</p>
      </div>
      <nav aria-label={seo('gallerySummary.relatedAria')} className="min-w-0 lg:pt-1">
        <p className="type-label text-subtle">{common('pageHeader.relatedPages')}</p>
        <ul className="mt-3 divide-y divide-rule-faint border-y border-rule-faint">
          {RELATED.map(({ href, key }) => (
            <li key={href}>
              <Link href={href} className={ROW_CLASS}>
                {seo(`gallerySummary.links.${key}`)}
                <ArrowRight
                  aria-hidden
                  className={`${ICON_CLASS} group-hover:translate-x-0.5 rtl:-scale-x-100`}
                />
              </Link>
            </li>
          ))}
          {/* The marketplace, off the site: the phone header leaves it here. */}
          <li>
            <SiteLink
              kind="external"
              href={COSMIC_SIGNATURE_MARKETPLACE_URL}
              externalIcon={false}
              className={ROW_CLASS}
            >
              {nav('ecosystem.axiomZero.defaultLabel')}
              <ArrowUpRight aria-hidden className={ICON_CLASS} />
            </SiteLink>
          </li>
        </ul>
      </nav>
    </section>
  );
}
