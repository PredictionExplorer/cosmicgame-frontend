'use client';

import { motion } from 'framer-motion';
import { Wallet, Search, MousePointerClick } from 'lucide-react';

import { GradientText } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const steps = [
  {
    Icon: Wallet,
    title: 'Connect Your Wallet',
    highlights: [
      'Click the "Connect Wallet" button at the top of the page.',
      'Use a wallet that supports the Arbitrum blockchain, such as MetaMask.',
      'Switch your network to Arbitrum when prompted, then approve permissions.',
      'Your wallet address will appear in the header once connected.',
    ],
    tooltip:
      'Arbitrum is a Layer 2 blockchain on Ethereum with lower gas fees and faster transactions.',
  },
  {
    Icon: Search,
    title: 'Review gesture cost',
    highlights: [
      'Review the Performance countdown — it extends with each gesture.',
      'Check the current ETH or CST gesture cost before confirming.',
      'Note the Signature Allocation amount shown for the active cycle.',
      'Ensure your wallet holds the gesture amount plus a small buffer for gas fees.',
    ],
    tooltip: 'Gas fees on Arbitrum are typically a few cents — much cheaper than Ethereum mainnet.',
  },
  {
    Icon: MousePointerClick,
    title: 'Make your gesture',
    highlights: [
      'Choose ETH or CST, or attach a Random Walk NFT for a one-time 50% ETH gesture-cost discount.',
      'Confirm the transaction in your wallet when you are ready.',
      'Your gesture extends the Performance clock and steps the next gesture cost (about +1% for ETH).',
      'Each gesture imprints CST and increases your weight for future Stellar Selections.',
    ],
    tooltip:
      'The Random Walk NFT 50% discount can only be used once per wallet, so choose your moment wisely.',
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function StepByStep() {
  return (
    <section aria-labelledby="steps-heading" className="py-16">
      <div className="mb-10 text-center">
        <h2
          id="steps-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Getting Started
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          From wallet connection to your first gesture in three steps
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="space-y-8"
      >
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            variants={itemVariants}
            className="gradient-border-card rounded-xl bg-white/[0.02] p-6 sm:p-8"
          >
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 sm:h-14 sm:w-14">
                <step.Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <GradientText className="text-xs font-bold tracking-widest">
                    STEP {String(i + 1).padStart(2, '0')}
                  </GradientText>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold sm:text-xl">{step.title}</h3>
                  <InfoTooltip content={step.tooltip} />
                </div>

                <ul className="mt-4 space-y-2.5">
                  {step.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
