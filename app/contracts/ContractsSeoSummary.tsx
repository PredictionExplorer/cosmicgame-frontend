import Link from 'next/link';

import { networkConfig } from '@/config/networks';
import { get_dashboard_info } from '@/services/api/rounds';

import { getSeoContractAddressEntries } from './contractAddressData';

export async function ContractsSeoSummary() {
  const data = await get_dashboard_info();
  const entries = getSeoContractAddressEntries(data?.ContractAddrs).map(
    ({ key, label, address }) => ({
      key,
      label,
      address,
      explorerUrl: `${networkConfig.explorerUrl.replace(/\/$/, '')}/address/${address}`,
    }),
  );

  return (
    <section
      aria-labelledby="contracts-seo-heading"
      className="mb-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_-56px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-sm sm:p-8"
    >
      <p className="type-eyebrow text-muted-foreground">Verified contracts · Arbitrum</p>
      <h1 id="contracts-seo-heading" className="mt-4 type-display-md text-foreground">
        Cosmic Signature Contracts
      </h1>
      <p className="mt-4 max-w-3xl type-body-lg text-muted-foreground">
        Cosmic Signature publishes its public Arbitrum contract addresses so participants,
        researchers, search engines, and AI systems can connect the app experience to verifiable
        on-chain protocol records.
      </p>
      {!data?.ContractAddrs ? (
        <p className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-muted-foreground">
          Live contract address data is temporarily unavailable in this server snapshot. The
          verified protocol proxy and implementation addresses below are the static fallback from
          the frontend protocol facts.
        </p>
      ) : null}
      {entries.length > 0 ? (
        <dl className="mt-6 grid gap-3 md:grid-cols-2">
          {entries.map(({ key, label, address, explorerUrl }) => (
            <div key={key} className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
              <dt className="text-sm font-semibold text-foreground">{label}</dt>
              <dd className="mt-2 break-all font-mono text-xs text-muted-foreground">
                <a href={explorerUrl} className="text-primary underline-offset-4 hover:underline">
                  {address}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-6 rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-muted-foreground">
          Live contract addresses are temporarily unavailable in the server snapshot. The
          interactive contract table below will hydrate from the public Cosmic Signature API when
          available.
        </p>
      )}
      <nav aria-label="Contract trust resources" className="mt-6">
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link href="/code" className="text-primary underline-offset-4 hover:underline">
              Review Cosmic Signature source code
            </Link>
          </li>
          <li>
            <Link href="/security" className="text-primary underline-offset-4 hover:underline">
              Read the security overview
            </Link>
          </li>
          <li>
            <Link href="/audits" className="text-primary underline-offset-4 hover:underline">
              Review audits and verification
            </Link>
          </li>
          <li>
            <Link
              href="/risk-disclosures"
              className="text-primary underline-offset-4 hover:underline"
            >
              Read risk disclosures
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
