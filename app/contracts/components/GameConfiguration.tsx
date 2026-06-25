'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, Coins, MessageSquare, Timer, Zap } from 'lucide-react';

import { protocolFacts } from '@/content/protocol-facts';
import { formatSeconds } from '@/utils';

import { formatCstAmount } from '@/utils/cstGesture';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { SectionDivider } from '@/components/ui/section-divider';

interface GameConfigurationProps {
  priceIncrease: number;
  timeIncrease: number;
  timeIncrement: number;
  cstRewardPerBid: number | null;
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
        <SectionDivider title="Protocol Configuration" className="mb-4" />
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
      label: 'ETH Gesture-Cost Step-Up',
      value: `${priceIncrease}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      tooltip:
        'ETH gesture cost uses this step-up parameter. CST gesture cost follows the live CST Calibration Window.',
      featured: true,
    },
    {
      label: 'Time Increment',
      value: timeIncrement > 0 ? formatSeconds(timeIncrement) : '--',
      icon: <Clock className="h-4 w-4" />,
      tooltip: `Each gesture adds this much time to the Cycle Finalization Time. The increment grows by ${timeIncrease}% with each cycle.`,
      featured: true,
    },
    {
      label: 'Current Participation CST Preview',
      value: `${formatCstAmount(cstRewardPerBid)} CST`,
      icon: <Coins className="h-4 w-4" />,
      tooltip: `Estimated Participation CST if a gesture lands now. The amount is dynamic and uses ${protocolFacts.dynamicCstRewardFormula}.`,
    },
    {
      label: 'Finalization Timeout',
      value: claimTimeout > 0 ? formatSeconds(claimTimeout) : '--',
      icon: <Timer className="h-4 w-4" />,
      tooltip:
        'Time the Final Gesture participant has to finalize the cycle before the Open-Finalization Window opens to anyone',
    },
    {
      label: 'Initial Time Increment',
      value: initialIncrement > 0 ? formatSeconds(initialIncrement) : '--',
      icon: <Zap className="h-4 w-4" />,
      tooltip: 'The initial Cycle Finalization Time added when the first gesture is made',
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
      <SectionDivider title="Protocol Configuration" className="mb-4" />
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
