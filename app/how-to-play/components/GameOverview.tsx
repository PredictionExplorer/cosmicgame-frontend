'use client';

import { motion } from 'framer-motion';
import { Gavel, Timer, Trophy } from 'lucide-react';

import { GradientText } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const cards = [
  {
    number: '01',
    title: 'Gesture',
    description:
      'Make a gesture with ETH or CST. Each gesture resets the Performance clock and steps the gesture cost.',
    tooltip:
      'Gestures use ETH or Cosmic Signature Tokens. Attaching a Random Walk NFT grants a one-time 50% ETH gesture-cost discount.',
    Icon: Gavel,
  },
  {
    number: '02',
    title: 'Endure',
    description:
      'The countdown extends with each gesture. The timer starts around 24 hours and adds time per gesture.',
    tooltip:
      'The Performance clock gains duration with each gesture. Gesture cost drifts upward by about 1% after each ETH gesture.',
    Icon: Timer,
  },
  {
    number: '03',
    title: 'Finalize',
    description:
      'When the Performance closes, the final-gesture participant may finalize; reserves distribute across allocation tracks.',
    tooltip:
      'The Signature Allocation is the main ETH track. Stellar Selection, anchor distributions, and other tracks settle on-chain.',
    Icon: Trophy,
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function GameOverview() {
  return (
    <section id="game-overview" aria-labelledby="game-overview-heading" className="py-16">
      <div className="mb-10 text-center">
        <h2
          id="game-overview-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          How It Works
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Three steps to participate in a Performance Cycle
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid gap-8 sm:grid-cols-3"
      >
        {cards.map((card) => (
          <motion.div
            key={card.number}
            variants={itemVariants}
            className="gradient-border-card group relative rounded-xl bg-white/[0.02] p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <card.Icon className="h-6 w-6 text-primary" />
            </div>

            <GradientText className="mb-1 text-sm font-bold tracking-widest">
              {card.number}
            </GradientText>

            <h3 className="mt-2 font-display text-xl font-bold">{card.title}</h3>

            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>

            <div className="mt-3 flex justify-center">
              <InfoTooltip content={card.tooltip} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
