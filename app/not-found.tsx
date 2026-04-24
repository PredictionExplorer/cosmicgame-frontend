'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { MainWrapper } from '@/components/styled';

const suggestedLinks = [
  { href: '/', label: 'Home \u2014 Active Cycle' },
  { href: '/gallery', label: 'NFT Gallery' },
  { href: '/how-to-play', label: 'How It Works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/statistics', label: 'Statistics' },
  { href: '/staking', label: 'Anchor Distributions' },
];

export default function NotFound() {
  return (
    <MainWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h1 className="text-2xl font-bold text-primary text-center">404 — Page Not Found</h1>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Cosmic
          Signature is a procedural on-chain art protocol on Arbitrum \u2014 explore the links below
          to find what you need.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>

        <nav aria-label="Suggested pages" className="mt-6 w-full max-w-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-3 text-center">
            Popular pages
          </p>
          <ul className="space-y-2">
            {suggestedLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </MainWrapper>
  );
}
