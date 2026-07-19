'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingDown, ImageIcon, Ticket, Clock, Zap } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { InfoTooltip } from '@/components/ui/info-tooltip';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function ProTips({ proTips }: { proTips: HowItWorksContent['proTips'] }) {
  const tips = [
    { Icon: TrendingDown, ...proTips.tips[0] },
    { Icon: ImageIcon, ...proTips.tips[1] },
    { Icon: Ticket, ...proTips.tips[2] },
    { Icon: Shield, ...proTips.tips[3] },
    { Icon: Clock, ...proTips.tips[4] },
    { Icon: Zap, ...proTips.tips[5] },
  ];

  return (
    <section aria-labelledby="tips-heading" className="py-16">
      <div className="mb-10 text-center">
        <h2
          id="tips-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {proTips.heading}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{proTips.subhead}</p>
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
