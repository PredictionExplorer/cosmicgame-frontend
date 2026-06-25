'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { cn } from '@/lib/utils';

const appToolLinks = [
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

const systemLinks = [
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

function SitemapLinkList({
  links,
  navLabel,
}: {
  links: readonly { href: string; label: string; description?: string }[];
  navLabel: string;
}) {
  return (
    <nav aria-label={navLabel} className="mt-5">
      <ul className="flex flex-col gap-0.5">
        {links.map(({ href, label, description }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                'group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm',
                'text-foreground/90 transition-colors',
                'hover:bg-white/[0.05] hover:text-primary',
              )}
            >
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
            </Link>
          </li>
        ))}
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
      </div>
    </PageShell>
  );
};

export default SiteMapPage;
