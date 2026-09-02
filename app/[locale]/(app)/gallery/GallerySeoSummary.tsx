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
    <section
      aria-labelledby="gallery-seo-heading"
      className="mb-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">{t('gallerySummary.eyebrow')}</p>
      <h1 id="gallery-seo-heading" className="mt-4 type-display-md text-foreground">
        {t('gallerySummary.heading')}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        {t('gallerySummary.description')}
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('gallerySummary.cards.imprinted')}
          </dt>
          <dd className="mt-2 text-2xl font-semibold">
            {typeof count === 'number' && Number.isFinite(count)
              ? numberFormatter.format(count)
              : t('gallerySummary.unavailable')}
          </dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('gallerySummary.cards.process')}
          </dt>
          <dd className="mt-2 text-lg font-semibold">{t('gallerySummary.cards.processValue')}</dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('gallerySummary.cards.license')}
          </dt>
          <dd className="mt-2 text-lg font-semibold">{t('gallerySummary.cards.licenseValue')}</dd>
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
