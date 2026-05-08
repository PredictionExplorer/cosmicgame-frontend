'use client';

import Link from 'next/link';
import { ArrowUpRight, HeartHandshake, Vault } from 'lucide-react';

import { landingContent } from '@/content/landing';
import { formatEthValue } from '@/utils';

import type { DashboardInfo } from '@/services/api';
import { StatCard } from '@/components/ui/stat-card';

interface PublicGoodsImpactCardProps {
  data: DashboardInfo | null;
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function PublicGoodsImpactCard({ data }: PublicGoodsImpactCardProps) {
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

  return (
    <section
      aria-labelledby="public-goods-impact-heading"
      className="relative mt-10 overflow-hidden rounded-2xl border border-[oklch(77.1%_0.163_161)]/20 p-6 glow-impact sm:p-8"
      style={{
        background:
          'linear-gradient(155deg, rgba(0, 214, 143, 0.08) 0%, rgba(0, 229, 255, 0.06) 45%, rgba(13, 5, 33, 0.9) 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_65%_at_100%_0%,rgb(var(--impact-green-rgb)/0.16),transparent_70%)]"
      />

      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--impact-green-rgb))]">
            Public Goods
          </p>
          <h2
            id="public-goods-impact-heading"
            className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Funding Ethereum&apos;s core contributors.
          </h2>
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              This cycle
            </p>
            <p className="mt-2 font-display text-5xl font-bold leading-none text-gradient-aurora sm:text-6xl">
              {currentCycleEth.toFixed(4)} ETH
            </p>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/75">
            {percentage.toFixed(percentage % 1 === 0 ? 0 : 2)}% of every Performance Cycle is
            forwarded to Protocol Guild, the funding mechanism for 170+ Ethereum core contributors.
          </p>
          <Link
            href="/public-goods-contributions-cg"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[oklch(77.1%_0.163_161)]/40 bg-[rgb(var(--impact-green-rgb)/0.10)] px-5 py-2.5 text-sm font-medium text-[rgb(var(--impact-green-rgb))] transition hover:bg-[rgb(var(--impact-green-rgb)/0.18)]"
          >
            View public-goods contributions
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard
            label="Lifetime Contributed"
            value={formatEthValue(lifetimeContributedEth)}
            icon={<HeartHandshake className="h-4 w-4" />}
            accent="impact"
            tooltip="Automatic protocol forwards plus voluntary public-goods contributions."
          />
          <StatCard
            label="In Vault Now"
            value={formatEthValue(vaultBalanceEth)}
            icon={<Vault className="h-4 w-4" />}
            accent="impact"
            tooltip="ETH currently held in the Public Goods Vault before retrieval."
          />
          <StatCard
            label="Already Retrieved"
            value={formatEthValue(retrievedEth)}
            icon={<ArrowUpRight className="h-4 w-4" />}
            accent="impact"
            tooltip="Total ETH retrieved from the Public Goods Vault for beneficiaries."
          />
        </div>
      </div>

      <p className="relative mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">
        {landingContent.publicGoods.disclaimer}
      </p>
    </section>
  );
}
