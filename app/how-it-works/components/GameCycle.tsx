'use client';

import { motion } from 'framer-motion';
import { Play, Users, TimerOff, Trophy, Ticket, RotateCcw } from 'lucide-react';

import { GradientText } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const phases = [
  {
    Icon: Play,
    label: 'Cycle Opens',
    description:
      'A new Performance Cycle begins. The Calibration Window opens: Gesture Cost descends from the Calibration Ceiling to the Calibration Floor over ~2 days.',
    tooltip:
      'The Calibration Window lets any participant gesture at a falling cost. The Cycle Reserve starts at zero plus the Compounding Reserve from the previous cycle.',
  },
  {
    Icon: Users,
    label: 'Participants Gesture',
    description:
      'Each gesture adds ~1 hour to the Cycle Finalization Time and raises the Gesture Cost by ~1%.',
    tooltip:
      'Gestures extend the cycle and introduce a Gesture-Cost Drift \u2014 a strategic tension between cost-efficient early gestures and decisive late ones.',
  },
  {
    Icon: TimerOff,
    label: 'Cycle Finalization Time Expires',
    description: 'When the countdown reaches zero, the cycle closes.',
    tooltip:
      'No more gestures can be made once the timer hits zero. The participant who made the Final Gesture becomes eligible to finalize the cycle.',
  },
  {
    Icon: Trophy,
    label: 'Cycle Finalizes',
    description:
      'The participant who made the Final Gesture retrieves the Signature Allocation: 25% of the Cycle Reserve plus a Cosmic Signature NFT.',
    tooltip:
      'The Signature Allocation retrieval happens via the protocol contract. The Cosmic Signature NFT is imprinted automatically.',
  },
  {
    Icon: Ticket,
    label: 'Stellar Selections',
    description:
      'Three ETH Stellar Selection recipients share 4% of the Cycle Reserve. Ten NFT Stellar Selection recipients plus ten Anchored-NFT Stellar Selection recipients receive Cosmic Signature NFTs.',
    tooltip:
      'Entries are recorded per gesture. More gestures means higher Selection frequency. Random Walk NFT anchor-holders have a separate Stellar Selection.',
  },
  {
    Icon: RotateCcw,
    label: 'Next Cycle',
    description:
      'About half of the Cycle Reserve rolls forward as the Compounding Reserve, and the Gesture Cost resets ~100x lower than the Final Gesture cost.',
    tooltip:
      'Each new cycle begins with a reset Calibration Window. The Compounding Cycle Reserve means the protocol accumulates value rather than extracts it.',
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
    <section aria-labelledby="protocol-cycle-heading" className="py-16">
      <div className="mb-10 text-center">
        <h2
          id="protocol-cycle-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Lifecycle of a Performance Cycle
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every cycle follows this sequence from open to finalization.
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
