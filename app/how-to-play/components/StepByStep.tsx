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
    title: 'Check the Bid Price',
    highlights: [
      'Review the round countdown timer — it resets and adds time with each bid.',
      'Check the current bid price in ETH or CST before committing.',
      'Note the main prize reward amount to see what you could win.',
      'Ensure your wallet holds the bid price plus a small amount for gas fees.',
    ],
    tooltip: 'Gas fees on Arbitrum are typically a few cents — much cheaper than Ethereum mainnet.',
  },
  {
    Icon: MousePointerClick,
    title: 'Place Your Bid',
    highlights: [
      'Choose your bid currency: ETH, CST, or use a Random Walk NFT for a 50% ETH discount.',
      'Click "Bid Now" and confirm the transaction in your wallet.',
      'Your bid extends the timer by 1 hour and increases the next bid price by 1%.',
      'Every bid earns you 100 CST tokens and a raffle ticket automatically.',
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
          From wallet connection to your first bid in three steps
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
