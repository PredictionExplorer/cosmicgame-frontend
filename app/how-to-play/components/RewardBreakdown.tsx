'use client';

import { motion } from 'framer-motion';
import { Coins, Ticket, ImageIcon, Trophy } from 'lucide-react';

import { InfoTooltip } from '@/components/ui/info-tooltip';

const rewards = [
  {
    Icon: Coins,
    title: '100 CST imprint',
    description: 'Each gesture imprints 100 Cosmic Signature Tokens in your wallet.',
    tooltip:
      'CST is the coordination token. Use it for CST gestures or hold it for on-chain coordination weight.',
    accent: 'from-cyan-400/20 to-blue-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    Icon: Ticket,
    title: 'Stellar Selection weight',
    description: 'Each gesture increases how often you are considered in future Stellar Selections.',
    tooltip:
      'At cycle end, the protocol runs on-chain random selection for ETH and NFT allocation tracks.',
    accent: 'from-purple-400/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    Icon: ImageIcon,
    title: 'COSMIC NFT allocations',
    description: 'COSMIC NFTs are minted across Signature, Stellar Selection, and champion tracks.',
    tooltip:
      'Tracks include final CST gesture, NFT Stellar Selection for participants and anchored Random Walk holders, and more.',
    accent: 'from-amber-400/20 to-orange-500/20',
    iconColor: 'text-amber-400',
  },
  {
    Icon: Trophy,
    title: 'Signature Allocation',
    description: 'The final gesture when the Performance closes directs the main ETH track.',
    tooltip:
      'The cycle reserve grows with gestures; about a quarter of the balance is on the Signature track at settlement.',
    accent: 'from-emerald-400/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export function RewardBreakdown() {
  return (
    <section aria-labelledby="rewards-heading" className="py-16">
      <div className="mb-10 text-center">
        <h2
          id="rewards-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Every gesture imprints value
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          CST imprint, selection frequency, and allocation tracks — all deterministic on-chain
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {rewards.map((reward) => (
          <motion.div
            key={reward.title}
            variants={itemVariants}
            className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.04]"
          >
            <div
              className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${reward.accent}`}
            >
              <reward.Icon className={`h-5 w-5 ${reward.iconColor}`} />
            </div>

            <div className="flex items-start gap-1.5">
              <h3 className="font-display text-lg font-bold">{reward.title}</h3>
              <InfoTooltip content={reward.tooltip} />
            </div>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {reward.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
