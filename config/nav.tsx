import { ReactNode } from 'react';

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
    { title: 'Play', route: '/' },
    { title: 'Gallery', route: '/gallery' },
    {
      title: 'Explore',
      route: '#',
      children: [
        { title: 'Current Round', route: '/current-round' },
        { title: 'Prize Winners', route: '/prize' },
        { title: 'Staking Rewards', route: '/staking' },
        { title: 'Marketing Rewards', route: '/marketing' },
        { title: 'Statistics', route: '/statistics' },
        { title: 'Contracts', route: '/contracts' },
      ],
    },
    {
      title: 'Help',
      route: '#',
      children: [
        { title: 'How to Play', route: '/how-to-play' },
        { title: 'FAQ', route: '/faq' },
        { title: 'About', route: 'https://cosmicsignature.com' },
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
          My Rewards
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </span>
      ),
      route: '/my-winnings',
    });
  }
  return NAVS;
};

export default getNAVs;
