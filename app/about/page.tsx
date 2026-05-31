import type { Metadata } from 'next';

import { APP_ORIGIN, LANDING_ORIGIN } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

export const metadata: Metadata = createMetadata(
  'About Cosmic Signature | On-Chain Art on Arbitrum',
  'Cosmic Signature is a procedural on-chain art protocol on Arbitrum that turns Performance Cycle gestures into deterministic three-body NFT art.',
  undefined,
  '/about',
  { canonicalHost: 'landing' },
);

export default function AboutPage() {
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Cosmic Signature',
    url: `${LANDING_ORIGIN}/about`,
    description:
      'Cosmic Signature is a procedural on-chain art protocol on Arbitrum that generates deterministic three-body NFT art from Performance Cycle gestures.',
    publisher: {
      '@id': `${LANDING_ORIGIN}/#organization`,
    },
  };

  return (
    <main id="main" tabIndex={-1} className="relative mx-auto max-w-4xl px-6 py-24 lg:py-32">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: 'Cosmic Signature', path: '/' },
              { name: 'About', path: '/about' },
            ],
            LANDING_ORIGIN,
          ),
          aboutJsonLd,
        ]}
      />
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/50">Entity home</p>
      <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        About Cosmic Signature
      </h1>
      <div className="mt-8 space-y-6 text-base leading-7 text-white/76">
        <p>
          Cosmic Signature is a procedural on-chain art protocol on Arbitrum. During each
          Performance Cycle, participants make gestures with ETH or CST, and every gesture helps
          shape the final Signature: deterministic NFT artwork generated from on-chain data and
          rendered through a three-body physics simulation.
        </p>
        <p>
          The protocol is designed around public, verifiable mechanics. Arbitrum smart contracts
          record gestures, cycles, allocation tracks, CST, anchoring, and NFT imprints. The artwork
          is reproducible from its seed, and the project emphasizes open source code, CC0 art, and
          public-goods support.
        </p>
        <p>
          Cosmic Signature is not related to the COSMIC cancer mutation database or COSMIC
          mutational signatures in biology. It is an on-chain art protocol and app.
        </p>
        {/* lexicon-allow-start: mandatory denial language for crawler and compliance clarity */}
        <p>
          Cosmic Signature is not offered as an investment product. The protocol describes
          participation, gestures, allocations, anchoring, and public-goods forwarding; it does not
          promise token price behavior or financial outcomes.
        </p>
        {/* lexicon-allow-end */}
      </div>

      <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold text-white">Official Resources</h2>
        <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <li>
            <a href={APP_ORIGIN} className="text-primary underline-offset-4 hover:underline">
              Cosmic Signature app
            </a>
          </li>
          <li>
            <a
              href={`${APP_ORIGIN}/contracts`}
              className="text-primary underline-offset-4 hover:underline"
            >
              Verified Arbitrum contracts
            </a>
          </li>
          <li>
            <a
              href={`${APP_ORIGIN}/code`}
              className="text-primary underline-offset-4 hover:underline"
            >
              Source code resources
            </a>
          </li>
          <li>
            <a
              href="https://x.com/CosmicSignature"
              className="text-primary underline-offset-4 hover:underline"
            >
              X / Twitter
            </a>
          </li>
          <li>
            <a
              href="https://discord.gg/bGnPn96Qwt"
              className="text-primary underline-offset-4 hover:underline"
            >
              Discord
            </a>
          </li>
          <li>
            <a
              href="https://github.com/PredictionExplorer"
              className="text-primary underline-offset-4 hover:underline"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href={`${APP_ORIGIN}/faq`}
              className="text-primary underline-offset-4 hover:underline"
            >
              FAQ
            </a>
          </li>
          <li>
            <a
              href={`${APP_ORIGIN}/terms`}
              className="text-primary underline-offset-4 hover:underline"
            >
              Terms of Service
            </a>
          </li>
          <li>
            <a
              href={`${APP_ORIGIN}/privacy`}
              className="text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="mailto:support@cosmicsignature.com"
              className="text-primary underline-offset-4 hover:underline"
            >
              support@cosmicsignature.com
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
