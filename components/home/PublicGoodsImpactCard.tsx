'use client';

import { ArrowUpRight, HeartHandshake, Vault } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getLandingContent } from '@/content/landing';
import { formatEthValue } from '@/utils';

import { Link } from '@/i18n/navigation';
import type { DashboardInfo } from '@/services/api';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import { formatFixed } from '@/utils/format';

interface PublicGoodsImpactCardProps {
  data: DashboardInfo | null;
  variant?: 'default' | 'rail' | 'compact';
  className?: string;
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function PublicGoodsImpactCard({
  data,
  variant = 'default',
  className,
}: PublicGoodsImpactCardProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const percentage = toNumber(data?.CharityPercentage);

  if (!data || percentage <= 0) {
    return null;
  }

  const cycleReserveEth = toNumber(data.CosmicGameBalanceEth);
  const currentCycleEth = (cycleReserveEth * percentage) / 100;
  const protocolContributionsEth = toNumber(data.MainStats.SumCosmicGameDonationsEth);
  const voluntaryContributionsEth = toNumber(data.SumVoluntaryDonationsEth);
  const lifetimeContributedEth = protocolContributionsEth + voluntaryContributionsEth;
  const vaultBalanceEth = toNumber(data.CharityBalanceEth);
  const retrievedEth = toNumber(data.MainStats.SumWithdrawals);

  if (variant === 'compact') {
    const stats = [
      { label: t('publicGoods.thisCycle'), value: formatEthValue(currentCycleEth) },
      { label: t('publicGoods.stats.lifetime'), value: formatEthValue(lifetimeContributedEth) },
      { label: t('publicGoods.stats.vault'), value: formatEthValue(vaultBalanceEth) },
      { label: t('publicGoods.stats.retrieved'), value: formatEthValue(retrievedEth) },
    ];

    return (
      <section
        data-testid="public-goods-impact-card"
        data-variant="compact"
        aria-labelledby="public-goods-impact-heading"
        className={cn(
          'rounded-xl border border-[oklch(77.1%_0.163_161)]/20 bg-[rgb(var(--impact-green-rgb)/0.035)] p-4',
          className,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--impact-green-rgb))]">
              {t('publicGoods.eyebrow')}
            </p>
            <h2
              id="public-goods-impact-heading"
              className="mt-1 font-display text-base font-bold tracking-tight text-white"
            >
              {t('publicGoods.heading')}
            </h2>
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-2 divide-x divide-y divide-white/[0.07] overflow-hidden rounded-lg border border-white/[0.07] sm:grid-cols-4 sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0 bg-black/10 p-2.5">
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-1 font-mono text-xs font-semibold tabular-nums text-foreground">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return (
    <section
      data-testid="public-goods-impact-card"
      data-variant={variant}
      aria-labelledby="public-goods-impact-heading"
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[oklch(77.1%_0.163_161)]/20 glow-impact',
        variant === 'rail' ? 'p-5 sm:p-6' : 'mt-10 p-6 sm:p-8',
        className,
      )}
      style={{
        background:
          'linear-gradient(155deg, rgba(0, 214, 143, 0.08) 0%, rgba(0, 229, 255, 0.06) 45%, rgba(13, 5, 33, 0.9) 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_65%_at_100%_0%,rgb(var(--impact-green-rgb)/0.16),transparent_70%)]"
      />

      <div
        className={cn(
          'relative grid gap-8',
          variant === 'rail' ? 'gap-6' : 'lg:grid-cols-[1.1fr_0.9fr] lg:items-center',
        )}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--impact-green-rgb))]">
            {t('publicGoods.eyebrow')}
          </p>
          <h2
            id="public-goods-impact-heading"
            className={cn(
              'mt-3 font-display font-bold tracking-tight text-white',
              variant === 'rail' ? 'text-2xl' : 'text-2xl sm:text-3xl',
            )}
          >
            {t('publicGoods.heading')}
          </h2>
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('publicGoods.thisCycle')}
            </p>
            <p
              className={cn(
                'mt-2 font-display font-bold leading-none text-gradient-aurora',
                variant === 'rail' ? 'text-5xl' : 'text-5xl sm:text-6xl',
              )}
            >
              {formatFixed(currentCycleEth, 4)} ETH
            </p>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/75">
            {t('publicGoods.body', {
              percent: formatFixed(percentage, percentage % 1 === 0 ? 0 : 2),
            })}
          </p>
          <Link
            href="/public-goods-contributions-cg"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[oklch(77.1%_0.163_161)]/40 bg-[rgb(var(--impact-green-rgb)/0.10)] px-5 py-2.5 text-sm font-medium text-[rgb(var(--impact-green-rgb))] transition hover:bg-[rgb(var(--impact-green-rgb)/0.18)]"
          >
            {t('publicGoods.cta')}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div
          className={cn(
            'grid gap-3',
            variant === 'rail' ? 'sm:grid-cols-3 xl:grid-cols-1' : 'sm:grid-cols-3 lg:grid-cols-1',
          )}
        >
          <StatCard
            label={t('publicGoods.stats.lifetime')}
            value={formatEthValue(lifetimeContributedEth)}
            icon={<HeartHandshake className="h-4 w-4" />}
            accent="impact"
            tooltip={t('publicGoods.stats.lifetimeTooltip')}
          />
          <StatCard
            label={t('publicGoods.stats.vault')}
            value={formatEthValue(vaultBalanceEth)}
            icon={<Vault className="h-4 w-4" />}
            accent="impact"
            tooltip={t('publicGoods.stats.vaultTooltip')}
          />
          <StatCard
            label={t('publicGoods.stats.retrieved')}
            value={formatEthValue(retrievedEth)}
            icon={<ArrowUpRight className="h-4 w-4" />}
            accent="impact"
            tooltip={t('publicGoods.stats.retrievedTooltip')}
          />
        </div>
      </div>

      {/* Legal denial copy stays in the per-locale landing text modules
          (content/landing/text.{en,zh}.ts): the message catalogs cannot carry
          lexicon-allow pragmas, and the zh disclaimer there is already
          reviewed legal copy. */}
      <p className="relative mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">
        {getLandingContent(locale).publicGoods.disclaimer}
      </p>
    </section>
  );
}
