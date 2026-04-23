'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, Coins, MessageSquare, Timer, Zap } from 'lucide-react';

import { formatSeconds } from '@/utils';

import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { SectionDivider } from '@/components/ui/section-divider';

interface GameConfigurationProps {
  priceIncrease: number;
  timeIncrease: number;
  timeIncrement: number;
  cstRewardPerBid: number;
  maxMessageLength: number;
  claimTimeout: number;
  initialIncrement: number;
  loading?: boolean;
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function GameConfiguration({
  priceIncrease,
  timeIncrease,
  timeIncrement,
  cstRewardPerBid,
  maxMessageLength,
  claimTimeout,
  initialIncrement,
  loading = false,
}: GameConfigurationProps) {
  if (loading) {
    return (
      <div>
        <SectionDivider title="Protocol parameters" className="mb-4" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Gesture-cost drift',
      value: `${priceIncrease}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      tooltip: 'Each gesture increases the next gesture cost by this percentage',
      featured: true,
    },
    {
      label: 'Time added per gesture',
      value: timeIncrement > 0 ? formatSeconds(timeIncrement) : '--',
      icon: <Clock className="h-4 w-4" />,
      tooltip: `Each gesture extends the Performance clock by this duration. The added time grows by ${timeIncrease}% with each gesture.`,
      featured: true,
    },
    {
      label: 'CST imprint per gesture',
      value: `${cstRewardPerBid} CST`,
      icon: <Coins className="h-4 w-4" />,
      tooltip: 'CST imprinted to your wallet with each gesture (Participation Imprint)',
    },
    {
      label: 'Finalize exclusivity window',
      value: claimTimeout > 0 ? formatSeconds(claimTimeout) : '--',
      icon: <Timer className="h-4 w-4" />,
      tooltip: 'Time the final-gesture participant has to finalize before open finalization',
    },
    {
      label: 'Initial Performance clock',
      value: initialIncrement > 0 ? formatSeconds(initialIncrement) : '--',
      icon: <Zap className="h-4 w-4" />,
      tooltip: 'Initial countdown after the opening gesture is made',
    },
    {
      label: 'Max Message Length',
      value: maxMessageLength > 0 ? maxMessageLength : '--',
      icon: <MessageSquare className="h-4 w-4" />,
      tooltip: 'Maximum character length allowed in gesture messages',
    },
  ];

  return (
    <div>
      <SectionDivider title="Protocol parameters" className="mb-4" />
      <motion.div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card) => (
          <motion.div key={card.label} variants={fadeUp}>
            <StatCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              tooltip={card.tooltip}
              featured={card.featured}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
