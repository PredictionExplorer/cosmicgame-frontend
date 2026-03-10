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
  let NAVS: NavDescriptor[] = [
    { title: 'Gallery', route: '/gallery' },
    {
      title: 'Rewards',
      route: '#',
      children: [
        { title: 'Prizes', route: '/prize' },
        { title: 'Staking Rewards', route: '/staking' },
        { title: 'Marketing Rewards', route: '/marketing' },
      ],
    },
    { title: 'Contracts', route: '/contracts' },
    { title: 'Statistics', route: '/statistics' },
    {
      title: 'Help',
      route: '#',
      children: [
        { title: 'How-to-Play', route: '/how-to-play' },
        { title: 'FAQ', route: '/faq' },
        { title: 'Site-Map', route: '/site-map' },
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
        <span className="relative inline-flex">
          Claim
          <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            $
          </span>
        </span>
      ),
      route: '/my-winnings',
    });
  }
  return NAVS;
};

export default getNAVs;
