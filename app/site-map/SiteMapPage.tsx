'use client';

import Link from 'next/link';

import { MainWrapper } from '@/components/styled';

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

const SiteMapPage = () => {
  return (
    <MainWrapper>
      <h2 className="mb-12 text-center text-2xl font-bold text-primary">Site Map</h2>

      <div>
        <h3 className="text-xl font-semibold">Per-user information</h3>
        <div className="ml-8">
          {perUserLinks.map(({ href, label }) => (
            <p className="text-base" key={href}>
              <Link href={href} className="text-inherit">
                {label}
              </Link>
            </p>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Overall system information</h3>
        <div className="ml-8">
          {systemLinks.map(({ href, label }) => (
            <p className="text-base" key={href}>
              <Link href={href} className="text-inherit">
                {label}
              </Link>
            </p>
          ))}
        </div>
      </div>
    </MainWrapper>
  );
};

export default SiteMapPage;
