import type { Metadata } from 'next';
import Link from 'next/link';

import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Security | Protocol Verification and Safety',
  'Review Cosmic Signature security practices, Arbitrum contract verification, operational controls, and participant safety notes.',
  undefined,
  '/security',
);

export default function SecurityPage() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Security', path: '/security' },
        ])}
      />
      <p className="type-eyebrow text-muted-foreground">Trust and security</p>
      <h1 className="mt-4 type-display-md text-foreground">Cosmic Signature Security</h1>
      <p className="mt-6 type-body-lg text-muted-foreground">
        Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Its security posture
        depends on public smart contracts, transparent protocol data, careful wallet interactions,
        and clear participant education.
      </p>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">Security Model</h2>
        <p className="text-muted-foreground">
          Protocol actions are recorded by Arbitrum smart contracts. Public pages should let users
          and crawlers inspect the contract addresses, source-code resources, verification context,
          and operational assumptions before connecting a wallet or making a gesture.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Use the official app at `https://app.cosmicsignature.com/`.</li>
          <li>Verify contract addresses from the contracts page before interacting on-chain.</li>
          <li>Review wallet prompts carefully; blockchain transactions cannot be reversed.</li>
          <li>
            Do not treat CST, NFTs, gestures, or allocations as guaranteed financial outcomes.
          </li>
        </ul>
      </section>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">Verification Resources</h2>
        <p className="text-muted-foreground">
          The strongest security signal is consistency between visible app content, verified
          contracts, source code, and live Arbitrum data.
        </p>
        <ul className="space-y-3">
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              Cosmic Signature contracts and Arbitrum addresses
            </Link>
          </li>
          <li>
            <Link href="/code" className="text-primary underline-offset-4 hover:underline">
              Cosmic Signature source code and rendering pipeline
            </Link>
          </li>
          <li>
            <Link href="/audits" className="text-primary underline-offset-4 hover:underline">
              Audits and formal verification notes
            </Link>
          </li>
          <li>
            <Link
              href="/risk-disclosures"
              className="text-primary underline-offset-4 hover:underline"
            >
              Risk disclosures and participant clarity
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
