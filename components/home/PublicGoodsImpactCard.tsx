'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Amount } from '@/components/ui/amount';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { UnknownValue } from '@/components/ui/unknown-value';
import { PublicGoodsIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatPercent } from '@/utils/format';

export interface PublicGoodsImpactCardProps {
  data: DashboardInfo | null;
  className?: string;
}

function Figure({ value }: { value: number | null }) {
  const t = useTranslations('common');
  return value == null ? (
    <UnknownValue label={t('status.unavailable')} />
  ) : (
    <Amount value={value} unit="ETH" context="card" />
  );
}

/**
 * Public Goods at a glance, above the protocol's Public Goods ledger: what the
 * vault holds and what has been retrieved, as settled figures, and apart from
 * them the share this cycle is projected to add (the current Cycle Reserve
 * times the public-goods share, paid when the cycle finalizes), labelled as
 * a projection so it never reads as money already contributed (F264).
 */
export function PublicGoodsImpactCard({ data, className }: PublicGoodsImpactCardProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const percentage = toFiniteNumber(data?.CharityPercentage);

  if (!data || percentage == null || percentage <= 0) return null;

  const reserveEth = toFiniteNumber(data.CosmicGameBalanceEth);
  const projectedEth = reserveEth != null ? (reserveEth * percentage) / 100 : null;
  const vaultEth = toFiniteNumber(data.CharityBalanceEth);
  const retrievedEth = toFiniteNumber(data.MainStats?.SumWithdrawals);
  const projectedLabel = t('publicGoods.projected');

  return (
    <section
      data-testid="public-goods-impact-card"
      aria-labelledby="public-goods-impact-heading"
      className={cn('rounded-surface border border-rule-faint bg-surface/60 p-5 sm:p-6', className)}
    >
      <p className="type-eyebrow flex items-center gap-2 text-subtle">
        <PublicGoodsIcon className="size-4" aria-hidden />
        {t('publicGoods.eyebrow')}
      </p>
      <h2 id="public-goods-impact-heading" className="type-heading-3 mt-2 text-foreground">
        {t('publicGoods.heading')}
      </h2>

      <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-[repeat(2,minmax(0,auto))_1fr]">
        <div data-testid="public-goods-settled-vault" className="min-w-0">
          <dt className="type-label text-subtle">{t('publicGoods.stats.vault')}</dt>
          <dd className="type-figure-md mt-1 text-foreground">
            <Figure value={vaultEth} />
          </dd>
        </div>
        <div data-testid="public-goods-settled-retrieved" className="min-w-0">
          <dt className="type-label text-subtle">{t('publicGoods.stats.retrieved')}</dt>
          <dd className="type-figure-md mt-1 text-foreground">
            <Figure value={retrievedEth} />
          </dd>
        </div>
        {/* The projection stands apart from the settled figures: a dashed
            rule and its own explanation, never a third settled total. */}
        <div
          data-testid="public-goods-projected"
          className="min-w-0 border-t border-dashed border-rule pt-4 sm:justify-self-end sm:border-s sm:border-t-0 sm:ps-8 sm:pt-0"
        >
          <dt className="type-label flex items-center gap-1.5 text-subtle">
            {projectedLabel}
            <InfoTooltip
              label={projectedLabel}
              content={t('publicGoods.projectedTooltip', {
                percent: formatPercent(percentage, locale),
              })}
            />
          </dt>
          <dd className="type-figure-md mt-1 text-muted-foreground">
            <Figure value={projectedEth} />
          </dd>
        </div>
      </dl>
    </section>
  );
}
