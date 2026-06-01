import Link from 'next/link';

import { statisticsCopy } from '@/content/statistics-copy';

import { get_dashboard_info } from '@/services/api/rounds';

const numberFormatter = new Intl.NumberFormat('en-US');
const ethFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
});

function formatNumber(value: unknown): string {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numberFormatter.format(numeric) : 'Unavailable';
}

function formatEth(value: unknown): string {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${ethFormatter.format(numeric)} ETH` : 'Unavailable';
}

function formatUpdatedAt(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

export async function StatisticsSeoSummary() {
  const updatedAt = new Date();
  const data = await get_dashboard_info();
  const hasLiveData = data !== null;
  const mainStats = data?.MainStats;

  return (
    <section
      aria-labelledby="statistics-heading"
      className="mb-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">Protocol statistics · Arbitrum</p>
      <h1 id="statistics-heading" className="mt-4 type-display-md text-foreground">
        Cosmic Signature Protocol Statistics
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        This page tracks public Cosmic Signature protocol activity on Arbitrum, including
        Performance Cycle status, gestures, Cosmic Signature NFTs, CST, anchoring, reserves, and
        allocation data. The interactive tables below hydrate with live app data, while this summary
        is available in the initial HTML for search engines and AI crawlers.
      </p>
      <p className="mt-3 type-body-sm text-muted-foreground">
        Last updated: {formatUpdatedAt(updatedAt)}
        {!hasLiveData
          ? '. Live data is temporarily unavailable; this page is showing explanatory protocol context.'
          : ''}
      </p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Active Performance Cycle
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">
            {formatNumber(data?.CurRoundNum)}
          </dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Active Cycle Gestures
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">
            {formatNumber(data?.CurNumBids)}
          </dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Protocol Contract Balance
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">
            {formatEth(data?.CosmicGameBalanceEth)}
          </dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {statisticsCopy.metrics.cosmicSignatureNftsImprinted.label}
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-foreground">
            {formatNumber(mainStats?.NumCSTokenMints)}
          </dd>
          <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {statisticsCopy.metrics.cosmicSignatureNftsImprinted.seoDescription}
          </dd>
        </div>
      </dl>

      <p className="mt-6 type-body-sm text-muted-foreground">
        Data comes from the public Cosmic Signature API, which indexes Arbitrum smart contract
        activity for the protocol. For protocol mechanics and verification details, use the
        crawlable links below.
      </p>
      <nav aria-label="Statistics related pages" className="mt-5">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/current-cycle" className="text-primary underline-offset-4 hover:underline">
              View the current Performance Cycle
            </Link>
          </li>
          <li>
            <Link href="/how-it-works" className="text-primary underline-offset-4 hover:underline">
              Learn how Cosmic Signature works
            </Link>
          </li>
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              Review verified Arbitrum contracts
            </Link>
          </li>
          <li>
            <Link href="/faq" className="text-primary underline-offset-4 hover:underline">
              Read the Cosmic Signature FAQ
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
