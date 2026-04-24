import type { ReactNode } from 'react';

export interface NavDescriptor {
  title: string | ReactNode;
  route?: string;
  children?: NavDescriptor[];
}

interface ClaimStatus {
  ETHRaffleToClaim?: number;
  NumDonatedNFTToClaim?: number;
  UnclaimedStakingReward?: number;
}

const getNAVs = (status: ClaimStatus | null, account: string | null) => {
  const NAVS: NavDescriptor[] = [
    { title: 'Home', route: '/' },
    { title: 'Gallery', route: '/gallery' },
    {
      title: 'Explore',
      route: '#',
      children: [
        { title: 'Current Cycle', route: '/current-round' },
        { title: 'Allocation Recipients', route: '/prize' },
        { title: 'Anchor Distributions', route: '/staking' },
        { title: 'Outreach Reserve', route: '/marketing' },
        { title: 'Statistics', route: '/statistics' },
        { title: 'Contracts', route: '/contracts' },
      ],
    },
    {
      title: 'Help',
      route: '#',
      children: [
        { title: 'How It Works', route: '/how-to-play' },
        { title: 'FAQ', route: '/faq' },
      ],
    },
  ];
  if (
    account &&
    ((status?.ETHRaffleToClaim ?? 0) > 0 ||
      (status?.NumDonatedNFTToClaim ?? 0) > 0 ||
      (status?.UnclaimedStakingReward ?? 0) > 0)
  ) {
    NAVS.push({
      title: (
        <span className="relative inline-flex items-center gap-1.5">
          My Allocations
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </span>
      ),
      route: '/my-winnings',
    });
  }
  return NAVS;
};

export default getNAVs;
