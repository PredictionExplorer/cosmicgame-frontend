import type { Metadata } from 'next';
import Link from 'next/link';

import { learnArticles } from '@/content/learn';

import { LANDING_ORIGIN } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

export const metadata: Metadata = createMetadata(
  'Learn Cosmic Signature | On-Chain Art, Performance Cycles, and Arbitrum',
  'Learn how Cosmic Signature works: Performance Cycles, gestures, CST, three-body NFT art, Arbitrum contracts, anchoring, public goods, and risk clarifications.',
  undefined,
  '/learn',
  { canonicalHost: 'landing' },
);

export default function LearnIndexPage() {
  return (
    <main id="main" tabIndex={-1} className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: 'Cosmic Signature', path: '/' },
            { name: 'Learn', path: '/learn' },
          ],
          LANDING_ORIGIN,
        )}
      />
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/50">
        Cosmic Signature Learn
      </p>
      <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Learn Cosmic Signature
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
        Clear, crawlable guides to Cosmic Signature: the procedural on-chain art protocol on
        Arbitrum where gestures shape deterministic three-body NFT art during Performance Cycles.
      </p>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {learnArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.slug}`}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <h2 className="text-xl font-semibold tracking-tight text-white">{article.h1}</h2>
            <p className="mt-3 text-sm leading-6 text-white/68">{article.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
