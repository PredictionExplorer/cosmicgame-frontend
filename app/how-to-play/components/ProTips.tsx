'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingDown, ImageIcon, Ticket, Clock, Zap } from 'lucide-react';

import { InfoTooltip } from '@/components/ui/info-tooltip';

const tips = [
  {
    Icon: TrendingDown,
    title: 'Gesture early, lower cost',
    description:
      'After each cycle reset, ETH gesture costs start near the calibration floor — far below the prior cycle’s peak.',
    tooltip:
      'Early-cycle gestures cost less ETH. They also increase your selection frequency for future Stellar Selections.',
  },
  {
    Icon: ImageIcon,
    title: 'Attach your Random Walk NFT',
    description:
      'A Random Walk NFT gives a one-time 50% discount on ETH gesture cost when attached.',
    tooltip:
      'Each NFT can be used once for this discount. Many participants save it for a higher-cost moment.',
  },
  {
    Icon: Ticket,
    title: 'Increase selection frequency',
    description:
      'More gestures in a cycle increase how often your address is considered in random allocation tracks.',
    tooltip:
      'Stellar Selection uses on-chain randomness; participation frequency is procedural.',
  },
  {
    Icon: Shield,
    title: 'Use a dedicated wallet',
    description:
      'The contracts are audited; a separate wallet still isolates routine participation from long-term holdings.',
    tooltip:
      'Operational security: keep cold storage separate from active participation addresses.',
  },
  {
    Icon: Clock,
    title: 'Watch the Performance clock',
    description:
      'Each gesture extends the clock. Timing near finalization affects gesture cost and who holds the final gesture.',
    tooltip:
      'Late gestures cost more but keep you closest to the Signature Allocation if the Performance closes.',
  },
  {
    Icon: Zap,
    title: 'Pay with CST',
    description:
      'Already received CST imprints from earlier gestures? Use CST to avoid spending ETH on the next gesture.',
    tooltip:
      'CST gestures follow the CST Calibration Window. Each gesture still imprints CST and extends the Performance clock.',
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function ProTips() {
  return (
    <section aria-labelledby="tips-heading" className="py-16">
      <div className="mb-10 text-center">
        <h2
          id="tips-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Pro Tips &amp; Strategy
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Practical notes for participating in cycles
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {tips.map((tip) => (
          <motion.div
            key={tip.title}
            variants={itemVariants}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04]"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <tip.Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-start gap-1.5">
              <h3 className="font-display text-base font-bold">{tip.title}</h3>
              <InfoTooltip content={tip.tooltip} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tip.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
