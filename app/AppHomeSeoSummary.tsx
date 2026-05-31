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

export async function AppHomeSeoSummary() {
  const data = await get_dashboard_info();

  return (
    <section
      aria-labelledby="app-home-seo-heading"
      className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8">
        <p className="type-eyebrow text-muted-foreground">Live protocol app · Arbitrum</p>
        <h1 id="app-home-seo-heading" className="mt-4 type-display-md text-foreground">
          Cosmic Signature App
        </h1>
        <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
          The Cosmic Signature app is the live interaction surface for the procedural on-chain art
          protocol on Arbitrum. Participants make gestures during Performance Cycles, inspect public
          cycle data, explore deterministic three-body NFT art, and review protocol allocations.
        </p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Active Performance Cycle
            </dt>
            <dd className="mt-2 text-2xl font-semibold">{formatNumber(data?.CurRoundNum)}</dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Active Cycle Gestures
            </dt>
            <dd className="mt-2 text-2xl font-semibold">{formatNumber(data?.CurNumBids)}</dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Cycle Reserve
            </dt>
            <dd className="mt-2 text-2xl font-semibold">
              {formatEth(data?.PrizeAmountEth ?? data?.CurPrizeAmountEth)}
            </dd>
          </div>
        </dl>
        <nav aria-label="App home related pages" className="mt-6">
          <ul className="flex flex-wrap gap-3 text-sm">
            <li>
              <Link
                href="/current-cycle"
                className="text-primary underline-offset-4 hover:underline"
              >
                View current Performance Cycle
              </Link>
            </li>
            <li>
              <Link href="/statistics" className="text-primary underline-offset-4 hover:underline">
                Review protocol statistics
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="text-primary underline-offset-4 hover:underline">
                Explore Cosmic Signature NFT art
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-primary underline-offset-4 hover:underline">
                Read the Cosmic Signature FAQ
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
}
