'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, Coins, MessageSquare, Timer, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';
import { formatSeconds } from '@/utils';

import { formatCstAmount } from '@/utils/cstGesture';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { SectionDivider } from '@/components/ui/section-divider';
import { UnknownValue } from '@/components/ui/unknown-value';

/**
 * Live protocol parameters. Each value is `null` until its read succeeds; a `null` renders
 * as unknown, never as a zero the protocol does not have.
 */
interface GameConfigurationProps {
  /** ETH Gesture-Cost step-up, percent. */
  priceIncrease: number | null;
  /** Per-cycle growth of the time increment, percent. */
  timeIncrease: number | null;
  /** Seconds added per gesture. */
  timeIncrement: number | null;
  cstRewardPerBid: number | null;
  maxMessageLength: number | null;
  /** Seconds. */
  claimTimeout: number | null;
  /** Seconds. */
  initialIncrement: number | null;
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
  const locale = useLocale();
  const t = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
  if (loading) {
    return (
      <div>
        <SectionDivider title={t('configuration.title')} className="mb-4" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const duration = (seconds: number | null) =>
    seconds === null ? unknown : formatSeconds(seconds, locale);

  const cards = [
    {
      label: t('configuration.cards.ethStep.label'),
      value: priceIncrease === null ? unknown : `${priceIncrease}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      tooltip: t('configuration.cards.ethStep.tooltip'),
    },
    {
      label: t('configuration.cards.timeIncrement.label'),
      value: duration(timeIncrement),
      icon: <Clock className="h-4 w-4" />,
      // The tooltip explains the rule; until the live divisor is read it quotes the
      // verified protocol default rather than a blank.
      tooltip: t('configuration.cards.timeIncrement.tooltip', {
        percent: timeIncrease ?? protocolFacts.cycleTimeIncrementIncreasePercentPerCycle,
      }),
    },
    {
      label: t('configuration.cards.cstPreview.label'),
      value: cstRewardPerBid === null ? unknown : `${formatCstAmount(cstRewardPerBid)} CST`,
      icon: <Coins className="h-4 w-4" />,
      tooltip: t('configuration.cards.cstPreview.tooltip', {
        formula: protocolFacts.dynamicCstRewardFormula,
      }),
    },
    {
      label: t('configuration.cards.finalization.label'),
      value: duration(claimTimeout),
      icon: <Timer className="h-4 w-4" />,
      tooltip: t('configuration.cards.finalization.tooltip'),
    },
    {
      label: t('configuration.cards.initial.label'),
      value: duration(initialIncrement),
      icon: <Zap className="h-4 w-4" />,
      tooltip: t('configuration.cards.initial.tooltip'),
    },
    {
      label: t('configuration.cards.message.label'),
      value: maxMessageLength === null ? unknown : maxMessageLength,
      icon: <MessageSquare className="h-4 w-4" />,
      tooltip: t('configuration.cards.message.tooltip'),
    },
  ];

  return (
    <div>
      <SectionDivider title={t('configuration.title')} className="mb-4" />
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
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
