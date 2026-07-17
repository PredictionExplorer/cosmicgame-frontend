import { Link } from '@/i18n/navigation';
import { get_dashboard_info } from '@/services/api/rounds';

const numberFormatter = new Intl.NumberFormat('en-US');

export async function GallerySeoSummary() {
  // Resolve to null on transport failure so ISR builds never crash on a
  // temporarily unreachable API; the card then renders "Unavailable".
  const data = await get_dashboard_info().catch(() => null);
  const count = data?.MainStats?.NumCSTokenMints;

  return (
    <section
      aria-labelledby="gallery-seo-heading"
      className="mb-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">Deterministic NFT art · Arbitrum</p>
      <h1 id="gallery-seo-heading" className="mt-4 type-display-md text-foreground">
        Cosmic Signature Gallery
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        Explore Cosmic Signature NFT artwork generated from deterministic three-body physics,
        on-chain seeds, spectral rendering, and Performance Cycle data. Each Signature is
        reproducible from protocol records and represents a specific cycle context.
      </p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Imprinted NFTs
          </dt>
          <dd className="mt-2 text-2xl font-semibold">
            {typeof count === 'number' && Number.isFinite(count)
              ? numberFormatter.format(count)
              : 'Unavailable'}
          </dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Art Process</dt>
          <dd className="mt-2 text-lg font-semibold">Three-body simulation</dd>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">License</dt>
          <dd className="mt-2 text-lg font-semibold">CC0-aligned</dd>
        </div>
      </dl>
      <nav aria-label="Gallery related pages" className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/how-it-works" className="text-primary underline-offset-4 hover:underline">
              Learn how Cosmic Signature works
            </Link>
          </li>
          <li>
            <Link href="/code" className="text-primary underline-offset-4 hover:underline">
              Review the rendering source code
            </Link>
          </li>
          <li>
            <Link href="/statistics" className="text-primary underline-offset-4 hover:underline">
              View protocol statistics
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
