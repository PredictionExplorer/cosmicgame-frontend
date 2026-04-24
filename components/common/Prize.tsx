'use client';

import { type FC } from 'react';
import { Trophy, Shuffle, ImageIcon, Layers, Swords, Crown, Coins, Users } from 'lucide-react';
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
      name: 'Signature Allocation',
      tooltip:
        'The participant who made the Final Gesture when the countdown reaches zero may retrieve this allocation.',
      amounts: [
        `${(data?.PrizeAmountEth ?? 0).toFixed(4)} ETH`,
        '1 Cosmic Signature NFT',
        'Attached tokens (if any)',
      ],
      winners: '1',
      faqLink: '/faq#main-prize',
      featured: true,
    },
    {
      icon: <Shuffle className="h-5 w-5" />,
      name: 'ETH Stellar Selection',
      tooltip:
        'Participants are selected at random from the cycle entries to share an allocation of ETH.',
      amounts: [
        `${((data?.RaffleAmountEth ?? 0) / (data?.NumRaffleEthWinnersBidding ?? 1)).toFixed(4)} ETH each`,
      ],
      winners: `${data?.NumRaffleEthWinnersBidding}`,
    },
    {
      icon: <ImageIcon className="h-5 w-5" />,
      name: 'NFT Stellar Selection',
      tooltip:
        'Participants are selected at random from the cycle entries to receive Cosmic Signature NFTs.',
      amounts: ['1 Cosmic Signature NFT each'],
      winners: `${data?.NumRaffleNFTWinnersBidding}`,
    },
    {
      icon: <Layers className="h-5 w-5" />,
      name: 'RandomWalk Anchor-holder',
      tooltip: 'Anchor-holders of RandomWalk NFTs may receive Cosmic Signature NFTs.',
      amounts: ['1 Cosmic Signature NFT each'],
      winners: `${data?.NumRaffleNFTWinnersStakingRWalk} or 0`,
    },
    {
      icon: <Users className="h-5 w-5" />,
      name: 'Cosmic Signature Anchor',
      tooltip: 'Anchor-holders of Cosmic Signature NFTs share the per-cycle Anchor Distribution.',
      amounts: [`${(data?.StakingAmountEth ?? 0).toFixed(4)} ETH`],
      winners: '1',
    },
    {
      icon: <Swords className="h-5 w-5" />,
      name: 'Chrono-Warrior Allocation',
      tooltip:
        'The participant who held the Endurance Champion position for the longest consecutive interval receives a percentage of the Cycle Reserve.',
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
        'The participant who remained the most recent gesture maker for the longest consecutive interval. Receives Recognition CST and a Cosmic Signature NFT.',
      amounts: [`${(data?.CurNumBids ?? 0) * 10} CST`, '1 Cosmic Signature NFT'],
      winners: '1',
      faqLink: '/faq#endurance-champion',
    },
    {
      icon: <Coins className="h-5 w-5" />,
      name: 'Final CST Gesture',
      tooltip:
        'The participant who made the last CST gesture of the cycle receives Recognition CST and a Cosmic Signature NFT.',
      amounts: [`${(data?.CurNumBids ?? 0) * 10} CST`, '1 Cosmic Signature NFT'],
      winners: '1 or 0',
    },
  ];

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-display text-lg font-semibold tracking-tight">Allocation Breakdown</h3>
        <InfoTooltip content="Allocations distributed when the cycle finalizes across more than ten tracks." />
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
                    {prize.winners} recipient{prize.winners === '1' ? '' : 's'}
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
