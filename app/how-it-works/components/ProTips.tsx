'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingDown, ImageIcon, Ticket, Clock, Zap } from 'lucide-react';

import { InfoTooltip } from '@/components/ui/info-tooltip';

const tips = [
  {
    Icon: TrendingDown,
    title: 'Watch Both Calibration Windows',
    description:
      'ETH and CST Gesture Costs follow separate live windows, and each gesture changes the CST window.',
    tooltip:
      'ETH gestures slightly shorten the CST Calibration Window; CST gestures slightly lengthen it. The live app panels show the current cost path.',
  },
  {
    Icon: ImageIcon,
    title: 'Attach a Random Walk NFT',
    description: 'Holding a Random Walk NFT grants a one-time 50% ETH Gesture Cost reduction.',
    tooltip:
      'Each Random Walk NFT can be used once for the cost reduction. Save it for a higher-cost gesture to maximize the effect.',
  },
  {
    Icon: Ticket,
    title: 'Stack Stellar Selection Entries',
    description:
      'Each gesture records one Stellar Selection entry. More gestures means higher Selection frequency.',
    tooltip:
      'Three ETH Stellar Selection recipients share 4% of the Cycle Reserve. Ten participant NFT recipients and ten Random Walk NFT anchor-holders each receive 1,000 CST and a Cosmic Signature NFT.',
  },
  {
    Icon: Shield,
    title: 'Use a Burner Wallet',
    description:
      'The smart contract is formally verified, but using a dedicated wallet for participation adds an extra layer of safety.',
    tooltip:
      'A burner wallet isolates your protocol activity from your main holdings for additional security.',
  },
  {
    Icon: Clock,
    title: 'Watch the Finalization Time',
    description:
      'Each gesture adds the current time increment to the stored Cycle Finalization Time.',
    tooltip:
      'Gesturing when the timer is low is riskier (higher cost) but positions you closest to the Final Gesture.',
  },
  {
    Icon: Zap,
    title: 'Gesture with CST',
    description: 'Use CST as an alternative gesture currency through the CST Calibration Window.',
    tooltip:
      'A CST gesture records a Stellar Selection entry, extends the timer, may imprint dynamic Participation CST, and lengthens the CST Calibration Window by about 0.4%.',
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
          Practical guidance for maximizing participation across allocation tracks.
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
