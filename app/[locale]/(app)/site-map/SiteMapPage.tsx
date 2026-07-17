'use client';

import { ChevronRight } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { cn } from '@/lib/utils';

export const appToolLinks = [
  { href: '/my-tokens', label: 'My NFTs', description: 'Wallet-specific NFT view; noindexed.' },
  {
    href: '/my-allocations',
    label: 'My Unretrieved Allocations',
    description: 'Wallet-specific allocation retrieval view; noindexed.',
  },
  {
    href: '/my-anchors',
    label: 'My Anchors',
    description: 'Wallet-specific anchoring view; noindexed.',
  },
];

export const systemLinks = [
  {
    href: 'https://cosmicsignature.com/about',
    label: 'About Cosmic Signature',
    description: 'Entity home and brand disambiguation.',
  },
  {
    href: 'https://cosmicsignature.com/learn',
    label: 'Cosmic Signature Learn Hub',
    description: 'Crawlable explainers for AI and search systems.',
  },
  {
    href: 'https://cosmicsignature.com/learn/what-is-cosmic-signature',
    label: 'What Is Cosmic Signature?',
    description: 'Plain-English definition of the protocol.',
  },
  {
    href: 'https://cosmicsignature.com/learn/three-body-nft-art',
    label: 'Three-Body NFT Art Guide',
    description: 'How deterministic physics generates Signature NFTs.',
  },
  {
    href: '/gallery',
    label: 'Cosmic Signature Gallery',
    description: 'Deterministic NFT artwork archive.',
  },
  {
    href: '/current-cycle',
    label: 'Current Performance Cycle',
    description: 'Live cycle state and gesture context.',
  },
  {
    href: '/how-it-works',
    label: 'How It Works',
    description: 'The cycle mechanics, step by step.',
  },
  {
    href: '/statistics',
    label: 'Protocol Statistics',
    description: 'Public protocol metrics and data sources.',
  },
  {
    href: '/contracts',
    label: 'Cosmic Signature Contracts',
    description: 'Verified Arbitrum contract addresses.',
  },
  {
    href: '/code',
    label: 'Source Code',
    description: 'Rendering pipeline and source-code resources.',
  },
  {
    href: '/security',
    label: 'Security',
    description: 'Security model and verification resources.',
  },
  { href: '/audits', label: 'Audits', description: 'Audit and formal verification status.' },
  {
    href: '/risk-disclosures',
    label: 'Risk Disclosures',
    description: 'Blockchain risk and participant-clarity disclosures.',
  },
  {
    href: '/faq',
    label: 'Cosmic Signature FAQ',
    description: 'Questions and answers about protocol mechanics.',
  },
  {
    href: '/terms',
    label: 'Terms of Service',
    description: 'Legal terms for app use and participation.',
  },
  {
    href: '/privacy',
    label: 'Privacy Policy',
    description: 'Wallet data, analytics, and blockchain transparency.',
  },
];

/**
 * Public data routes. Together with `systemLinks`, this list keeps the HTML
 * site map in parity with the XML sitemap (`lib/seoRoutes.ts`) — enforced by
 * app/__tests__/crawl-paths.test.tsx.
 */
export const dataLinks = [
  {
    href: '/allocation',
    label: 'Allocation Recipients',
    description: 'Where each cycle\u2019s reserves went.',
  },
  {
    href: '/anchoring',
    label: 'Anchor Distributions',
    description: 'Anchored NFTs and their distributions.',
  },
  {
    href: '/marketing',
    label: 'Outreach Reserve',
    description: 'Community outreach CST activity.',
  },
  { href: '/imprint', label: 'Imprint', description: 'Imprint interface for new tokens.' },
  {
    href: '/eth-contribution',
    label: 'ETH Contributions',
    description: 'History of ETH contributions.',
  },
  {
    href: '/attached-nfts',
    label: 'Attached NFTs',
    description: 'NFTs attached to gestures across cycles.',
  },
  {
    href: '/allocation-finalized',
    label: 'Finalized Allocations',
    description: 'Record of finalized cycle allocations.',
  },
  { href: '/named-nfts', label: 'Named NFTs', description: 'NFTs given custom names.' },
  {
    href: '/used-rwlk-nfts',
    label: 'Used RandomWalk NFTs',
    description: 'RandomWalk NFTs already used for gesture discounts.',
  },
  {
    href: '/coordination-changes',
    label: 'Coordination Changes',
    description: 'History of protocol parameter changes.',
  },
  {
    href: '/public-goods-contributions-cg',
    label: 'Public Goods Contributions',
    description: 'Per-cycle Public Goods Allocation records.',
  },
  {
    href: '/public-goods-contributions-voluntary',
    label: 'Voluntary Public Goods Contributions',
    description: 'Direct voluntary contributions to the vault.',
  },
  {
    href: '/public-goods-retrievals',
    label: 'Public Goods Retrievals',
    description: 'Funds forwarded from the Public Goods Vault.',
  },
  {
    href: '/statistics/participation',
    label: 'Statistics: Participation',
    description: 'Participant and gesture analytics.',
  },
  {
    href: '/statistics/tokens',
    label: 'Statistics: Tokens',
    description: 'CST and NFT supply analytics.',
  },
  {
    href: '/statistics/anchoring',
    label: 'Statistics: Anchoring',
    description: 'Anchoring totals and history.',
  },
  {
    href: '/statistics/activity',
    label: 'Statistics: Activity',
    description: 'Cycle activity and timing analytics.',
  },
  {
    href: '/statistics/performance',
    label: 'Statistics: Performance',
    description: 'Cycle records and performance analytics.',
  },
];

/** External product surfaces that orbit the protocol. */
export const ecosystemLinks = [
  {
    href: COSMIC_SIGNATURE_MARKETPLACE_URL,
    label: 'Axiom Zero Marketplace',
    description: 'Zero-fee NFT marketplace for Cosmic Signature and Random Walk.',
  },
  {
    href: CHAOS_ZERO_PREDICTIONS_URL,
    label: 'Chaos Zero Predictions',
    description: 'Prediction market on each Performance Cycle.',
  },
  {
    href: CST_UNISWAP_SWAP_URL,
    label: 'Trade CST on Uniswap',
    description: 'Swap ETH for CST on Arbitrum.',
  },
];

function SitemapLinkList({
  links,
  navLabel,
}: {
  links: readonly { href: string; label: string; description?: string }[];
  navLabel: string;
}) {
  const rowClassName = cn(
    'group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm',
    'text-foreground/90 transition-colors',
    'hover:bg-white/[0.05] hover:text-primary',
  );

  return (
    <nav aria-label={navLabel} className="mt-5">
      <ul className="flex flex-col gap-0.5">
        {links.map(({ href, label, description }) => {
          const isExternal = /^https?:\/\//.test(href);
          const rowContent = (
            <>
              <span>
                <span className="block">{label}</span>
                {description ? (
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </span>
                ) : null}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-100 group-hover:text-primary"
                aria-hidden
              />
            </>
          );
          return (
            <li key={href}>
              {isExternal ? (
                <a href={href} rel="noopener" className={rowClassName}>
                  {rowContent}
                </a>
              ) : (
                <Link href={href} className={rowClassName}>
                  {rowContent}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const SiteMapPage = () => {
  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        title="Site Map"
        subtitle="Quick links to account pages and public protocol data."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Site Map' }]}
        className="mb-10 max-w-3xl md:mx-auto md:text-center"
      />

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:items-start">
        <section
          aria-labelledby="sitemap-personal-heading"
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2
            id="sitemap-personal-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Personal App Tools
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Wallet-specific pages are useful to connected participants but are noindexed and absent
            from XML sitemaps.
          </p>
          <SitemapLinkList links={appToolLinks} navLabel="Personal app tools" />
        </section>

        <section
          aria-labelledby="sitemap-system-heading"
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2
            id="sitemap-system-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Public Protocol Pages
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Public leaderboards, distributions, stats, contracts, and help.
          </p>
          <SitemapLinkList links={systemLinks} navLabel="System and help pages" />
        </section>

        <section
          aria-labelledby="sitemap-data-heading"
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2
            id="sitemap-data-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Protocol Data Pages
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Every public data route from the XML sitemap, in one crawlable list.
          </p>
          <SitemapLinkList links={dataLinks} navLabel="Protocol data pages" />
        </section>

        <section
          aria-labelledby="sitemap-ecosystem-heading"
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2
            id="sitemap-ecosystem-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Ecosystem
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            External product surfaces: the Axiom Zero NFT marketplace, the Chaos Zero prediction
            market, and Uniswap CST trading.
          </p>
          <SitemapLinkList links={ecosystemLinks} navLabel="Ecosystem destinations" />
        </section>
      </div>
    </PageShell>
  );
};

export default SiteMapPage;
