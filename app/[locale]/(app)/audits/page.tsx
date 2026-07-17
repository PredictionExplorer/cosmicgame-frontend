import type { Metadata } from 'next';

import { Link } from '@/i18n/navigation';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

export const metadata: Metadata = createMetadata(
  'Cosmic Signature Audits | Verification and Contract Review',
  'Review Cosmic Signature audit status, formal verification context, smart contract review notes, and source-code verification resources.',
  undefined,
  '/audits',
);

export default function AuditsPage() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Audits', path: '/audits' },
        ])}
      />
      <p className="type-eyebrow text-muted-foreground">Audits and verification</p>
      <h1 className="mt-4 type-display-md text-foreground">Cosmic Signature Audits</h1>
      <p className="mt-6 type-body-lg text-muted-foreground">
        Cosmic Signature makes contract review context crawlable so participants, researchers,
        search engines, and AI systems can understand how the protocol is verified and where to
        inspect its public implementation.
      </p>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">Review Status</h2>
        <p className="text-muted-foreground">
          The contracts page identifies the public Arbitrum deployment and verification context.
          Audit reports, formal verification notes, and source-code references should be linked from
          this page as they are published or updated.
        </p>
        <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted-foreground">
          Last reviewed: 2026-05-31. This page is the canonical public location for Cosmic Signature
          audit and verification status.
        </p>
      </section>

      <section className="mt-12 space-y-5">
        <h2 className="text-2xl font-semibold">Verification Checklist</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Confirm the contract address on the official contracts page.</li>
          <li>Compare verified source code and ABI data on the Arbitrum block explorer.</li>
          <li>Review formal verification notes and audit summaries when published.</li>
          <li>Confirm that visible app mechanics match the public contract behavior.</li>
        </ul>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold">Related Trust Resources</h2>
        <ul className="space-y-3">
          <li>
            <Link href="/contracts" className="text-primary underline-offset-4 hover:underline">
              Verified Arbitrum contract addresses
            </Link>
          </li>
          <li>
            <Link href="/code" className="text-primary underline-offset-4 hover:underline">
              Source code and deterministic rendering resources
            </Link>
          </li>
          <li>
            <Link href="/security" className="text-primary underline-offset-4 hover:underline">
              Security overview
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
