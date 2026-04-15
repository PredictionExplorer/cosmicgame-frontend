'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingDown, ImageIcon, Ticket, Clock, Zap } from 'lucide-react';

import { InfoTooltip } from '@/components/ui/info-tooltip';

const tips = [
  {
    Icon: TrendingDown,
    title: 'Bid Early, Bid Cheap',
    description:
      'Bid prices start low after each round reset — roughly 100x lower than the previous winning bid.',
    tooltip:
      'Early-round bids cost a fraction of late-round bids. Great for accumulating raffle tickets at low cost.',
  },
  {
    Icon: ImageIcon,
    title: 'Use Your Random Walk NFT',
    description:
      'Holding a Random Walk NFT gives you a one-time 50% discount on your ETH bid price.',
    tooltip:
      'This discount can only be used once per wallet. Save it for a higher-priced bid to maximize savings.',
  },
  {
    Icon: Ticket,
    title: 'Stack Raffle Tickets',
    description:
      'Every bid earns a raffle ticket. More bids means better odds in the end-of-round prize drawing.',
    tooltip:
      '4 raffle tickets are drawn for 6% of the prize pool. Additional winners receive COSMIC NFTs.',
  },
  {
    Icon: Shield,
    title: 'Use a Burner Wallet',
    description:
      'The smart contract is audited, but using a dedicated wallet for bidding adds an extra layer of safety.',
    tooltip:
      'A burner wallet isolates your bidding activity from your main holdings for additional security.',
  },
  {
    Icon: Clock,
    title: 'Watch the Timer',
    description:
      'The timer gains 1 hour per bid. Strategic timing near the end of a round can be the difference between winning and losing.',
    tooltip:
      'Bidding when the timer is low is riskier (higher price) but positions you closest to winning.',
  },
  {
    Icon: Zap,
    title: 'Pay with CST',
    description:
      'Already earned CST from previous bids? Use it as an alternative currency to save your ETH.',
    tooltip:
      'CST bidding follows the same rules as ETH bidding. Your bid still earns raffle tickets and extends the timer.',
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
          Expert advice to maximize your chances and rewards
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
