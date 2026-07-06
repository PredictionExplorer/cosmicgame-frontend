import Link from 'next/link';

import { get_dashboard_info } from '@/services/api/rounds';

const numberFormatter = new Intl.NumberFormat('en-US');
const ethFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });

function formatNumber(value: unknown): string {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numberFormatter.format(numeric) : 'Unavailable';
}

function formatEth(value: unknown): string {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${ethFormatter.format(numeric)} ETH` : 'Unavailable';
}

export async function CurrentCycleSeoSummary() {
  // Resolve to null on transport failure so ISR builds never crash on a
  // temporarily unreachable API; cards then render "Unavailable".
  const data = await get_dashboard_info().catch(() => null);

  return (
    <section
      aria-labelledby="current-cycle-seo-heading"
      className="mb-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">Live Performance Cycle · Arbitrum</p>
      <h1 id="current-cycle-seo-heading" className="mt-4 type-display-md text-foreground">
        Current Cosmic Signature Performance Cycle
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        This page tracks the active Cosmic Signature Performance Cycle, including public gesture
        counts, cycle reserve context, attached assets, allocation tracks, and finalization status.
        The interactive console below hydrates with live app data.
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cycle</dt>
          <dd className="mt-2 text-2xl font-semibold">{formatNumber(data?.CurRoundNum)}</dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Gestures</dt>
          <dd className="mt-2 text-2xl font-semibold">{formatNumber(data?.CurNumBids)}</dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Reserve Snapshot
          </dt>
          <dd className="mt-2 text-2xl font-semibold">
            {formatEth(data?.PrizeAmountEth ?? data?.CurPrizeAmountEth)}
          </dd>
        </div>
      </dl>
      <nav aria-label="Current cycle related pages" className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/how-it-works" className="text-primary underline-offset-4 hover:underline">
              Learn how Performance Cycles work
            </Link>
          </li>
          <li>
            <Link href="/statistics" className="text-primary underline-offset-4 hover:underline">
              View protocol statistics
            </Link>
          </li>
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              Review verified contracts
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
