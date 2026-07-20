import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { get_dashboard_info } from '@/services/api/rounds';

function formatNumber(value: unknown, locale: string, unavailable: string): string {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US').format(numeric)
    : unavailable;
}

function formatEth(value: unknown, locale: string, unavailable: string): string {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? `${new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
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
      className="mb-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">{t('currentCycleSummary.eyebrow')}</p>
      <h1 id="current-cycle-seo-heading" className="mt-4 type-display-md text-foreground">
        {t('currentCycleSummary.heading')}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        {t('currentCycleSummary.description')}
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('currentCycleSummary.cards.cycle')}
          </dt>
          <dd className="mt-2 text-2xl font-semibold">
            {formatNumber(data?.CurRoundNum, locale, unavailable)}
          </dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('currentCycleSummary.cards.gestures')}
          </dt>
          <dd className="mt-2 text-2xl font-semibold">
            {formatNumber(data?.CurNumBids, locale, unavailable)}
          </dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t('currentCycleSummary.cards.reserve')}
          </dt>
          <dd className="mt-2 text-2xl font-semibold">
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
