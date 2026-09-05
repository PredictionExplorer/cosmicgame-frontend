import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { get_dashboard_info } from '@/services/api/rounds';
import { toIntlLocale } from '@/utils/format';

export async function GallerySeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const numberFormatter = new Intl.NumberFormat(toIntlLocale(locale));
  // Resolve to null on transport failure so ISR builds never crash on a
  // temporarily unreachable API; the card then renders "Unavailable".
  const data = await get_dashboard_info().catch(() => null);
  const count = data?.MainStats?.NumCSTokenMints;

  return (
    <section aria-labelledby="gallery-seo-heading" className="mb-12 border-b border-border pb-10">
      <p className="type-eyebrow text-primary/80">{t('gallerySummary.eyebrow')}</p>
      <h1 id="gallery-seo-heading" className="mt-4 type-display-lg text-foreground">
        {t('gallerySummary.heading')}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        {t('gallerySummary.description')}
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('gallerySummary.cards.imprinted')}
          </dt>
          <dd className="mt-2 font-display text-2xl font-medium">
            {typeof count === 'number' && Number.isFinite(count)
              ? numberFormatter.format(count)
              : t('gallerySummary.unavailable')}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('gallerySummary.cards.process')}
          </dt>
          <dd className="mt-2 text-lg font-medium">{t('gallerySummary.cards.processValue')}</dd>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('gallerySummary.cards.license')}
          </dt>
          <dd className="mt-2 text-lg font-medium">{t('gallerySummary.cards.licenseValue')}</dd>
        </div>
      </dl>
      <nav aria-label={t('gallerySummary.relatedAria')} className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/how-it-works" className="text-primary underline-offset-4 hover:underline">
              {t('gallerySummary.links.learn')}
            </Link>
          </li>
          <li>
            <Link href="/code" className="text-primary underline-offset-4 hover:underline">
              {t('gallerySummary.links.code')}
            </Link>
          </li>
          <li>
            <Link href="/statistics" className="text-primary underline-offset-4 hover:underline">
              {t('gallerySummary.links.statistics')}
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
