'use client';

import { motion } from 'framer-motion';
import { Gavel, Timer, Trophy } from 'lucide-react';

import { GradientText } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const cards = [
  {
    number: '01',
    title: 'Bid',
    description:
      'Place a bid using ETH or CST tokens. Each bid resets the countdown timer and raises the stakes.',
    tooltip:
      'Bids can be placed with ETH or Cosmic Signature Tokens. Holding a Random Walk NFT grants a one-time 50% ETH discount.',
    Icon: Gavel,
  },
  {
    number: '02',
    title: 'Compete',
    description:
      'Race against time and other players. The countdown timer adds 1 hour with every new bid.',
    tooltip:
      'The round timer starts at 24 hours and gains 1 hour per bid. Bid price increases by 1% after each bid.',
    Icon: Timer,
  },
  {
    number: '03',
    title: 'Win',
    description:
      'Be the last bidder when the timer reaches zero to claim the main ETH prize and a COSMIC NFT.',
    tooltip:
      'The winner receives 25% of the prize pool. Raffle winners, NFT stakers, and other participants also earn rewards.',
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
          Three simple steps to compete for the prize pool
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
