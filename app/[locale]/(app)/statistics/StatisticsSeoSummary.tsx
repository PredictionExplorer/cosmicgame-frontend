import { getLocale, getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { get_dashboard_info } from '@/services/api/rounds';
import { formatUtcDateTimeStamp, toIntlLocale } from '@/utils/format';

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

interface SummaryMetricProps {
  label: string;
  value: string;
  tooltip: string;
  description: string;
}

function SummaryMetric({ label, value, tooltip, description }: SummaryMetricProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <span>{label}</span>
        <InfoTooltip content={tooltip} label={label} />
      </dt>
      <dd className="mt-2 text-2xl font-semibold text-foreground">{value}</dd>
      <dd className="sr-only">{description}</dd>
    </div>
  );
}

export async function StatisticsSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'statistics' });
  const updatedAt = new Date();
  // Resolve to null on transport failure so ISR builds never crash on a
  // temporarily unreachable API; the summary falls back to static copy.
  const data = await get_dashboard_info().catch(() => null);
  const hasLiveData = data !== null;
  const mainStats = data?.MainStats;

  return (
    <section
      aria-labelledby="statistics-heading"
      className="mb-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">{t('hub.seo.eyebrow')}</p>
      <h1 id="statistics-heading" className="mt-4 type-display-md text-foreground">
        {t('hub.seo.heading')}
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        {t('hub.seo.description')}
      </p>
      <p className="mt-3 type-body-sm text-muted-foreground">
        {t('hub.seo.lastUpdated', { date: formatUtcDateTimeStamp(updatedAt, locale) })}
        {!hasLiveData ? t('hub.seo.unavailableSuffix') : ''}
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetric
          label={t('metrics.activePerformanceCycle.label')}
          value={formatNumber(data?.CurRoundNum, locale, t('hub.seo.unavailable'))}
          tooltip={t('metrics.activePerformanceCycle.tooltip')}
          description={t('metrics.activePerformanceCycle.seoDescription')}
        />
        <SummaryMetric
          label={t('metrics.activeCycleGestures.label')}
          value={formatNumber(data?.CurNumBids, locale, t('hub.seo.unavailable'))}
          tooltip={t('metrics.activeCycleGestures.tooltip')}
          description={t('metrics.activeCycleGestures.seoDescription')}
        />
        <SummaryMetric
          label={t('metrics.contractBalance.seoLabel')}
          value={formatEth(data?.CosmicGameBalanceEth, locale, t('hub.seo.unavailable'))}
          tooltip={t('metrics.contractBalance.tooltip')}
          description={t('metrics.contractBalance.seoDescription')}
        />
        <SummaryMetric
          label={t('metrics.cosmicSignatureNftsImprinted.label')}
          value={formatNumber(mainStats?.NumCSTokenMints, locale, t('hub.seo.unavailable'))}
          tooltip={t('metrics.cosmicSignatureNftsImprinted.tooltip')}
          description={t('metrics.cosmicSignatureNftsImprinted.seoDescription')}
        />
      </dl>

      <p className="mt-6 type-body-sm text-muted-foreground">{t('hub.seo.dataSource')}</p>
      <nav aria-label={t('hub.seo.relatedPagesAria')} className="mt-5">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/current-cycle" className="text-primary underline-offset-4 hover:underline">
              {t('hub.seo.links.currentCycle')}
            </Link>
          </li>
          <li>
            <Link href="/how-it-works" className="text-primary underline-offset-4 hover:underline">
              {t('hub.seo.links.howItWorks')}
            </Link>
          </li>
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              {t('hub.seo.links.contracts')}
            </Link>
          </li>
          <li>
            <Link href="/faq" className="text-primary underline-offset-4 hover:underline">
              {t('hub.seo.links.faq')}
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
