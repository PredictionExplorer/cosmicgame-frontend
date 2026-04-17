'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import { cn } from '@/lib/utils';

const perUserLinks = [
  { href: '/my-tokens', label: 'My Tokens' },
  { href: '/my-winnings', label: 'My Unclaimed Winnings' },
  { href: '/winning-history', label: 'History of My Winnings' },
  { href: '/my-staking', label: 'My Staking' },
];

const systemLinks = [
  { href: '/gallery', label: 'CosmicSignature Gallery' },
  { href: '/prize', label: 'Rounds Played' },
  { href: '/staking', label: 'Staking Rewards' },
  { href: '/marketing', label: 'Marketing Rewards' },
  { href: '/statistics', label: 'System Statistics' },
  { href: '/contracts', label: 'Contract Addresses' },
  { href: '/faq', label: 'FAQ' },
];

function SitemapLinkList({
  links,
  navLabel,
}: {
  links: readonly { href: string; label: string }[];
  navLabel: string;
}) {
  return (
    <nav aria-label={navLabel} className="mt-5">
      <ul className="flex flex-col gap-0.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                'group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm',
                'text-foreground/90 transition-colors',
                'hover:bg-white/[0.05] hover:text-primary',
              )}
            >
              <span>{label}</span>
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
    <MainWrapper>
      <PageHeader
        title="Site Map"
        subtitle="Quick links to account pages and public game data."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Site Map' },
        ]}
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
            Per-user information
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Wallet-specific pages: balances, claims, staking, and your history.
          </p>
          <SitemapLinkList links={perUserLinks} navLabel="Per-user pages" />
        </section>

        <section
          aria-labelledby="sitemap-system-heading"
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
        >
          <h2
            id="sitemap-system-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Overall system information
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Public leaderboards, rewards, stats, contracts, and help.
          </p>
          <SitemapLinkList links={systemLinks} navLabel="System and help pages" />
        </section>
      </div>
    </MainWrapper>
  );
};

export default SiteMapPage;
