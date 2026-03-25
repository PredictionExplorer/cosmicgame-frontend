'use client';

import { motion } from 'framer-motion';
import { Play, Users, TimerOff, Trophy, Ticket, RotateCcw } from 'lucide-react';

import { GradientText } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const phases = [
  {
    Icon: Play,
    label: 'Round Starts',
    description: 'A new round begins with a 24-hour countdown timer.',
    tooltip:
      'The initial timer is set to 24 hours. The prize pool starts at zero and grows with each bid.',
  },
  {
    Icon: Users,
    label: 'Players Bid',
    description: 'Each bid adds 1 hour to the timer and increases the next bid price by 1%.',
    tooltip:
      'Bidding extends the countdown and raises the price, creating a strategic tension between early cheap bids and late decisive ones.',
  },
  {
    Icon: TimerOff,
    label: 'Timer Expires',
    description: 'When the countdown reaches zero, the round ends.',
    tooltip:
      'No more bids can be placed once the timer hits zero. The last bidder is declared the winner.',
  },
  {
    Icon: Trophy,
    label: 'Winner Collects',
    description: 'The last bidder wins 25% of the prize pool and a Cosmic Signature NFT.',
    tooltip:
      'The winner must withdraw their prize from the smart contract. The NFT is minted automatically.',
  },
  {
    Icon: Ticket,
    label: 'Raffles Drawn',
    description:
      '4 raffle winners share 6% of the pool. 5 NFT raffle winners + 4 staker winners are drawn.',
    tooltip:
      'Raffle tickets are earned per bid. More bids means higher chances. NFT stakers also have a separate draw.',
  },
  {
    Icon: RotateCcw,
    label: 'New Round',
    description:
      'The bid price resets to ~100x lower than the winning bid, and it all starts again.',
    tooltip:
      'Each new round is a fresh opportunity. The reset price makes early bids in a new round very affordable.',
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function GameCycle() {
  return (
    <section aria-labelledby="game-cycle-heading" className="py-16">
      <div className="mb-10 text-center">
        <h2
          id="game-cycle-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Lifecycle of a Round
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every round follows this cycle from start to finish
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="relative mx-auto max-w-2xl"
      >
        {/* Vertical connecting line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-accent/30 to-primary/40 sm:left-7" />

        <div className="space-y-8">
          {phases.map((phase, i) => (
            <motion.div
              key={phase.label}
              variants={itemVariants}
              className="relative flex gap-5 pl-1"
            >
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-card sm:h-14 sm:w-14">
                <phase.Icon className="h-5 w-5 text-primary" />
              </div>

              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <GradientText className="text-[10px] font-bold tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </GradientText>
                  <h3 className="font-display text-base font-bold sm:text-lg">{phase.label}</h3>
                  <InfoTooltip content={phase.tooltip} />
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {phase.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
