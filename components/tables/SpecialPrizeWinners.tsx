'use client';

import { useState, useEffect } from 'react';
import { Crown, Swords, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

import { formatSeconds, shortenHex } from '@/utils';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useCurrentSpecialWinners } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

function EnduranceCountdown({ duration }: { duration: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentDuration = duration + elapsed;
  return (
    <span className="font-mono text-sm tabular-nums text-emerald-400">
      {formatSeconds(currentDuration)}
    </span>
  );
}

export const SpecialPrizeWinners = () => {
  const { data: specialWinners } = useCurrentSpecialWinners();

  const hasEndurance = !!specialWinners?.EnduranceChampionAddress;
  const hasLastCst = !!specialWinners?.LastCstBidderAddress;

  const cards = [
    {
      key: 'endurance',
      icon: <Crown className="h-5 w-5" />,
      title: 'Endurance Champion',
      tooltip:
        'The bidder who remained the last bidder for the longest consecutive period of time. Wins CST tokens and a COSMIC NFT.',
      address: specialWinners?.EnduranceChampionAddress,
      extra: hasEndurance && (specialWinners?.EnduranceChampionDuration ?? 0) > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Held for</span>
          <EnduranceCountdown duration={specialWinners?.EnduranceChampionDuration ?? 0} />
        </div>
      ),
      accent: true,
      urgency: hasEndurance && (
        <div className="mt-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 px-3 py-2">
          <p className="text-xs text-emerald-400/90 animate-urgency-pulse">
            Champion title grows stronger every second no one bids!
          </p>
        </div>
      ),
    },
    {
      key: 'chrono',
      icon: <Swords className="h-5 w-5" />,
      title: 'Chrono Warrior',
      tooltip:
        'The bidder who held the Endurance Champion title for the longest consecutive period. Wins a percentage of the total contract balance.',
      address: specialWinners?.EnduranceChampionAddress,
      extra: hasEndurance && (specialWinners?.EnduranceChampionDuration ?? 0) > 0 && (
        <div className="mt-3">
          <span className="text-xs text-muted-foreground">Duration: </span>
          <span className="font-mono text-sm tabular-nums text-primary">
            {formatSeconds(specialWinners?.EnduranceChampionDuration ?? 0)}
          </span>
        </div>
      ),
      accent: false,
      urgency: null,
    },
    {
      key: 'lastcst',
      icon: <Coins className="h-5 w-5" />,
      title: 'Last CST Bidder',
      tooltip:
        'The last person to place a bid using CST tokens wins CST tokens and a COSMIC NFT.',
      address: specialWinners?.LastCstBidderAddress,
      extra: null,
      accent: false,
      urgency: !hasLastCst && (
        <div className="mt-3 rounded-lg bg-accent/[0.06] border border-accent/20 px-3 py-2">
          <p className="text-xs text-accent/80">No CST bids yet -- be the first!</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-display text-lg font-semibold tracking-tight">Special Prize Leaders</h3>
        <InfoTooltip content="These players are currently in line to win special prizes when the round ends. Positions can change with every new bid!" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              'gradient-border-card rounded-xl bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04]',
              card.accent && 'gradient-border-card-accent animate-pulse-glow',
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  card.accent
                    ? 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary'
                    : 'bg-white/[0.06] text-muted-foreground',
                )}
              >
                {card.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-xs font-medium uppercase tracking-wider',
                      card.accent ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {card.title}
                  </span>
                  <InfoTooltip content={card.tooltip} />
                </div>
                {card.address ? (
                  <a
                    href={`/user/${card.address}`}
                    className="mt-1 block truncate font-mono text-sm text-white hover:text-primary transition-colors"
                  >
                    {shortenHex(card.address, 6)}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground/50 italic">No holder yet</p>
                )}
                {card.extra}
              </div>
            </div>
            {card.urgency}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
