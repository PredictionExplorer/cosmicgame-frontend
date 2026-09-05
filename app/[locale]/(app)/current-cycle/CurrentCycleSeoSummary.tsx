import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { get_dashboard_info } from '@/services/api/rounds';
import { toIntlLocale } from '@/utils/format';

function formatNumber(value: unknown, locale: string, unavailable: string): string {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat(toIntlLocale(locale)).format(numeric)
    : unavailable;
}

function formatEth(value: unknown, locale: string, unavailable: string): string {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? `${new Intl.NumberFormat(toIntlLocale(locale), {
        maximumFractionDigits: 4,
      }).format(numeric)} ETH`
    : unavailable;
}

export async function CurrentCycleSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const unavailable = t('currentCycleSummary.unavailable');
  // Resolve to null on transport failure so ISR builds never crash on a
  // temporarily unreachable API; cards then render "Unavailable".
  const data = await get_dashboard_info().catch(() => null);

  return (
    <section
      aria-labelledby="current-cycle-seo-heading"
      className="mb-12 border-b border-border pb-10"
    >
      <p className="type-eyebrow text-primary/80">{t('currentCycleSummary.eyebrow')}</p>
      <h1 id="current-cycle-seo-heading" className="mt-4 type-display-lg text-foreground">
        {t('currentCycleSummary.heading')}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        {t('currentCycleSummary.description')}
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('currentCycleSummary.cards.cycle')}
          </dt>
          <dd className="mt-2 font-display text-2xl font-medium">
            {formatNumber(data?.CurRoundNum, locale, unavailable)}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('currentCycleSummary.cards.gestures')}
          </dt>
          <dd className="mt-2 font-display text-2xl font-medium">
            {formatNumber(data?.CurNumBids, locale, unavailable)}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('currentCycleSummary.cards.reserve')}
          </dt>
          <dd className="mt-2 font-display text-2xl font-medium">
            {formatEth(data?.PrizeAmountEth ?? data?.CurPrizeAmountEth, locale, unavailable)}
          </dd>
        </div>
      </dl>
      <nav aria-label={t('currentCycleSummary.relatedAria')} className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/how-it-works" className="text-primary underline-offset-4 hover:underline">
              {t('currentCycleSummary.links.learn')}
            </Link>
          </li>
          <li>
            <Link href="/statistics" className="text-primary underline-offset-4 hover:underline">
              {t('currentCycleSummary.links.statistics')}
            </Link>
          </li>
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              {t('currentCycleSummary.links.contracts')}
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
