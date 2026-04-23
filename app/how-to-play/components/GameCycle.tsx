'use client';

import { motion } from 'framer-motion';
import { Play, Users, TimerOff, Trophy, Ticket, RotateCcw } from 'lucide-react';

import { GradientText } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const phases = [
  {
    Icon: Play,
    label: 'Cycle opens',
    description: 'A new Performance Cycle begins with an initial countdown.',
    tooltip:
      'The clock starts around 24 hours. The cycle reserve builds as participants make gestures.',
  },
  {
    Icon: Users,
    label: 'Participants gesture',
    description: 'Each gesture extends the clock and steps the next gesture cost (about +1% for ETH).',
    tooltip:
      'Early gestures cost less; late gestures cost more — a deliberate protocol tension with no operator “house.”',
  },
  {
    Icon: TimerOff,
    label: 'Performance closes',
    description: 'When the countdown reaches zero, no further gestures are accepted for that cycle.',
    tooltip:
      'The participant who made the final gesture may finalize first; later, open finalization is available.',
  },
  {
    Icon: Trophy,
    label: 'Finalize & mint',
    description: 'Finalization runs settlement: ETH tracks, CST imprints, and COSMIC NFT mints.',
    tooltip:
      'Recipients retrieve ETH and tokens from the allocations wallet; NFTs mint per the allocation table.',
  },
  {
    Icon: Ticket,
    label: 'Stellar Selection',
    description:
      'Random allocation tracks execute on-chain alongside fixed champion and Signature tracks.',
    tooltip:
      'Selection frequency increases with participation; anchored Random Walk NFTs have their own NFT track.',
  },
  {
    Icon: RotateCcw,
    label: 'Next cycle',
    description:
      'Gesture costs reset toward the calibration floor, and the protocol opens the next Performance.',
    tooltip:
      'Each cycle is a fresh calibration window; opening gestures are comparatively inexpensive.',
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
          Lifecycle of a cycle
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          From open to finalization, the protocol follows this structure
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
