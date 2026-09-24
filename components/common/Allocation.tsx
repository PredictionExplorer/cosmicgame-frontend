'use client';

import { type FC } from 'react';
import { ImageIcon, Layers, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import {
  ChronoWarriorIcon,
  EnduranceChampionIcon,
  FinalCstGestureIcon,
  PublicGoodsIcon,
  SignatureAllocationIcon,
  StellarSelectionIcon,
} from '@/lib/conceptIcons';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface AllocationData {
  PrizeAmountEth?: number;
  RaffleAmountEth?: number;
  NumRaffleEthWinnersBidding?: number;
  NumRaffleNFTWinnersBidding?: number;
  NumRaffleNFTWinnersStakingRWalk?: number;
  StakingAmountEth?: number;
  CosmicGameBalanceEth?: number;
  ChronoWarriorPercentage?: number;
  CharityPercentage?: number;
  [key: string]: unknown;
}

interface AllocationProps {
  data: AllocationData | null;
}

interface AllocationCardData {
  icon: React.ReactNode;
  name: string;
  tooltip: string;
  amounts: string[];
  recipientCount?: number;
  recipientLabel?: string;
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

const Allocation: FC<AllocationProps> = ({ data }) => {
  const t = useTranslations('home');

  const allocations: AllocationCardData[] = [
    {
      icon: <SignatureAllocationIcon className="h-5 w-5" />,
      name: t('allocation.cards.signature.name'),
      tooltip: t('allocation.cards.signature.tooltip'),
      amounts: [
        t('allocation.amounts.eth', { amount: (data?.PrizeAmountEth ?? 0).toFixed(4) }),
        t('allocation.amounts.fixedCst'),
        t('allocation.amounts.nft'),
        t('allocation.amounts.attachedTokens'),
      ],
      recipientCount: 1,
      // lexicon-allow-start — FAQ hash anchor preserves legacy URL fragment
      faqLink: '/faq#main-allocation',
      // lexicon-allow-end
      featured: true,
    },
    {
      icon: <PublicGoodsIcon className="h-5 w-5" />,
      name: t('allocation.cards.publicGoods.name'),
      tooltip: t('allocation.cards.publicGoods.tooltip', {
        percent: String(data?.CharityPercentage ?? 0),
      }),
      amounts: [
        t('allocation.amounts.eth', {
          amount: (
            ((data?.CosmicGameBalanceEth ?? 0) * (data?.CharityPercentage ?? 0)) /
            100
          ).toFixed(4),
        }),
      ],
      recipientLabel: t('allocation.cards.publicGoods.recipientLabel'),
      faqLink: '/faq',
    },
    {
      icon: <StellarSelectionIcon className="h-5 w-5" />,
      name: t('allocation.cards.ethStellar.name'),
      tooltip: t('allocation.cards.ethStellar.tooltip'),
      amounts: [
        t('allocation.amounts.ethEach', {
          amount: ((data?.RaffleAmountEth ?? 0) / (data?.NumRaffleEthWinnersBidding ?? 1)).toFixed(
            4,
          ),
        }),
      ],
      recipientCount: data?.NumRaffleEthWinnersBidding ?? 0,
    },
    {
      icon: <ImageIcon className="h-5 w-5" />,
      name: t('allocation.cards.nftStellar.name'),
      tooltip: t('allocation.cards.nftStellar.tooltip'),
      amounts: [t('allocation.amounts.fixedCstEach'), t('allocation.amounts.nftEach')],
      recipientCount: data?.NumRaffleNFTWinnersBidding ?? 0,
    },
    {
      icon: <Layers className="h-5 w-5" />,
      name: t('allocation.cards.randomWalkAnchor.name'),
      tooltip: t('allocation.cards.randomWalkAnchor.tooltip'),
      amounts: [t('allocation.amounts.fixedCstEach'), t('allocation.amounts.nftEach')],
      recipientCount: data?.NumRaffleNFTWinnersStakingRWalk ?? 0,
    },
    {
      icon: <Users className="h-5 w-5" />,
      name: t('allocation.cards.cosmicAnchor.name'),
      tooltip: t('allocation.cards.cosmicAnchor.tooltip'),
      amounts: [t('allocation.amounts.eth', { amount: (data?.StakingAmountEth ?? 0).toFixed(4) })],
      recipientLabel: t('allocation.cards.cosmicAnchor.recipientLabel'),
    },
    {
      icon: <ChronoWarriorIcon className="h-5 w-5" />,
      name: t('allocation.cards.chronoWarrior.name'),
      tooltip: t('allocation.cards.chronoWarrior.tooltip'),
      amounts: [
        t('allocation.amounts.eth', {
          amount: (
            ((data?.CosmicGameBalanceEth ?? 0) * (data?.ChronoWarriorPercentage ?? 0)) /
            100
          ).toFixed(4),
        }),
        t('allocation.amounts.fixedCst'),
        t('allocation.amounts.nft'),
      ],
      recipientCount: 1,
      faqLink: '/faq#chrono-warrior',
    },
    {
      icon: <EnduranceChampionIcon className="h-5 w-5" />,
      name: t('allocation.cards.endurance.name'),
      tooltip: t('allocation.cards.endurance.tooltip'),
      amounts: [t('allocation.amounts.fixedCst'), t('allocation.amounts.nft')],
      recipientCount: 1,
      faqLink: '/faq#endurance-champion',
    },
    {
      icon: <FinalCstGestureIcon className="h-5 w-5" />,
      name: t('allocation.cards.finalCst.name'),
      tooltip: t('allocation.cards.finalCst.tooltip'),
      amounts: [t('allocation.amounts.fixedCst'), t('allocation.amounts.nft')],
      recipientCount: 1,
    },
  ];

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="type-heading-3 text-foreground">{t('allocation.title')}</h3>
        <InfoTooltip content={t('allocation.titleTooltip')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {allocations.map((allocation, i) => (
          <motion.div
            key={allocation.name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              'group relative rounded-surface p-4 transition-colors duration-[var(--duration-fast)]',
              allocation.featured
                ? 'gradient-border-card gradient-border-card-accent bg-primary/[0.04] sm:col-span-2 lg:col-span-2'
                : 'border border-rule-faint bg-surface/60 hover:bg-surface',
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-rule-faint bg-surface-sunken transition-colors duration-[var(--duration-fast)]',
                  allocation.featured ? 'text-primary' : 'text-subtle group-hover:text-foreground',
                )}
              >
                {allocation.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="type-title text-foreground">
                    {allocation.faqLink ? (
                      <Link
                        href={allocation.faqLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-quiet"
                      >
                        {allocation.name}
                      </Link>
                    ) : (
                      allocation.name
                    )}
                  </span>
                  <InfoTooltip content={allocation.tooltip} />
                </div>
                <div className="mt-2 space-y-0.5">
                  {allocation.amounts.map((amount) => (
                    <p
                      key={amount}
                      className={cn(
                        'type-body-sm tabular-nums',
                        allocation.featured
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {amount}
                    </p>
                  ))}
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <Badge size="sm">
                    {allocation.recipientLabel ??
                      t('allocation.recipientCount', { count: allocation.recipientCount ?? 0 })}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Allocation;
