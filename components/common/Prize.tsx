'use client';

import { type FC } from 'react';
import { Trophy, Shuffle, Image, Layers, Swords, Crown, Coins, Users } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface PrizeData {
  PrizeAmountEth?: number;
  RaffleAmountEth?: number;
  NumRaffleEthWinnersBidding?: number;
  NumRaffleNFTWinnersBidding?: number;
  NumRaffleNFTWinnersStakingRWalk?: number;
  StakingAmountEth?: number;
  CosmicGameBalanceEth?: number;
  ChronoWarriorPercentage?: number;
  CurNumBids?: number;
  [key: string]: unknown;
}

interface PrizeProps {
  data: PrizeData | null;
}

interface PrizeCardData {
  icon: React.ReactNode;
  name: string;
  tooltip: string;
  amounts: string[];
  winners: string;
  faqLink?: string;
  featured?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
};

const Prize: FC<PrizeProps> = ({ data }) => {
  const prizes: PrizeCardData[] = [
    {
      icon: <Trophy className="h-5 w-5" />,
      name: 'Main Prize',
      tooltip: 'The last bidder when the countdown hits zero wins this prize.',
      amounts: [
        `${(data?.PrizeAmountEth ?? 0).toFixed(4)} ETH`,
        '1 Cosmic Signature NFT',
        'Donated tokens (if any)',
      ],
      winners: '1',
      faqLink: '/faq#main-prize',
      featured: true,
    },
    {
      icon: <Shuffle className="h-5 w-5" />,
      name: 'Raffle ETH',
      tooltip: 'Random bidders are selected to win ETH from the raffle pool.',
      amounts: [
        `${((data?.RaffleAmountEth ?? 0) / (data?.NumRaffleEthWinnersBidding ?? 1)).toFixed(4)} ETH each`,
      ],
      winners: `${data?.NumRaffleEthWinnersBidding}`,
    },
    {
      icon: <Image className="h-5 w-5" />,
      name: 'Raffle NFT',
      tooltip: 'Random bidders win Cosmic Signature NFTs from the raffle.',
      amounts: ['1 Cosmic Signature NFT each'],
      winners: `${data?.NumRaffleNFTWinnersBidding}`,
    },
    {
      icon: <Layers className="h-5 w-5" />,
      name: 'RandomWalk Staker',
      tooltip: 'Stakers of RandomWalk NFTs can win Cosmic Signature NFTs.',
      amounts: ['1 Cosmic Signature NFT each'],
      winners: `${data?.NumRaffleNFTWinnersStakingRWalk} or 0`,
    },
    {
      icon: <Users className="h-5 w-5" />,
      name: 'CS NFT Staker',
      tooltip: 'Stakers of Cosmic Signature NFTs share the staking ETH pool.',
      amounts: [`${(data?.StakingAmountEth ?? 0).toFixed(4)} ETH`],
      winners: '1',
    },
    {
      icon: <Swords className="h-5 w-5" />,
      name: 'Chrono Warrior',
      tooltip:
        'The bidder who held the Endurance Champion title for the longest consecutive period. Wins a percentage of the total contract balance.',
      amounts: [
        `${(((data?.CosmicGameBalanceEth ?? 0) * (data?.ChronoWarriorPercentage ?? 0)) / 100).toFixed(4)} ETH`,
      ],
      winners: '1',
      faqLink: '/faq#chrono-warrior',
    },
    {
      icon: <Crown className="h-5 w-5" />,
      name: 'Endurance Champion',
      tooltip:
        'The bidder who remained the last bidder for the longest consecutive period of time. Wins CST tokens and an NFT.',
      amounts: [`${(data?.CurNumBids ?? 0) * 10} CST`, '1 Cosmic Signature NFT'],
      winners: '1',
      faqLink: '/faq#endurance-champion',
    },
    {
      icon: <Coins className="h-5 w-5" />,
      name: 'Last CST Bidder',
      tooltip: 'The last person to bid with CST tokens wins CST tokens and an NFT.',
      amounts: [`${(data?.CurNumBids ?? 0) * 10} CST`, '1 Cosmic Signature NFT'],
      winners: '1 or 0',
    },
  ];

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-display text-lg font-semibold tracking-tight">Prize Breakdown</h3>
        <InfoTooltip content="All prizes awarded when the round ends. Multiple ways to win!" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {prizes.map((prize, i) => (
          <motion.div
            key={prize.name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              'group relative rounded-xl border p-4 transition-all duration-300 hover:bg-white/[0.04]',
              prize.featured
                ? 'gradient-border-card gradient-border-card-accent bg-white/[0.03] sm:col-span-2 lg:col-span-2'
                : 'border-white/[0.06] bg-white/[0.02]',
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                  prize.featured
                    ? 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary'
                    : 'bg-white/[0.06] text-muted-foreground group-hover:text-primary',
                )}
              >
                {prize.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      prize.featured ? 'text-white' : 'text-white/90',
                    )}
                  >
                    {prize.faqLink ? (
                      <a
                        href={prize.faqLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {prize.name}
                      </a>
                    ) : (
                      prize.name
                    )}
                  </span>
                  <InfoTooltip content={prize.tooltip} />
                </div>
                <div className="mt-2 space-y-0.5">
                  {prize.amounts.map((amount) => (
                    <p
                      key={amount}
                      className={cn(
                        'text-sm',
                        prize.featured
                          ? 'font-medium bg-gradient-to-r from-[#35C9FF] to-[#AC56FF] bg-clip-text text-transparent'
                          : 'text-muted-foreground',
                      )}
                    >
                      {amount}
                    </p>
                  ))}
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {prize.winners} winner{prize.winners === '1' ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Prize;
