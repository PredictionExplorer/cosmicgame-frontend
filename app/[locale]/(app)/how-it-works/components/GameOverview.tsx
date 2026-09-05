'use client';

import { motion } from 'framer-motion';
import { Gavel, Timer, Trophy } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { GradientText } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function GameOverview({ overview }: { overview: HowItWorksContent['overview'] }) {
  const cards = [
    { Icon: Gavel, ...overview.cards[0] },
    { Icon: Timer, ...overview.cards[1] },
    { Icon: Trophy, ...overview.cards[2] },
  ];

  return (
    <section
      id="protocol-overview"
      aria-labelledby="protocol-overview-heading"
      className="py-8 sm:py-10"
    >
      <div className="mb-10 max-w-3xl">
        <h2 id="protocol-overview-heading" className="type-display-sm">
          {overview.heading}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{overview.subhead}</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial={false}
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid gap-8 sm:grid-cols-3"
      >
        {cards.map((card) => (
          <motion.div
            key={card.number}
            variants={itemVariants}
            className="group relative rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-primary/15 bg-primary/[0.06]">
              <card.Icon className="h-6 w-6 text-primary" />
            </div>

            <GradientText className="mb-1 text-sm font-bold tracking-widest">
              {card.number}
            </GradientText>

            <h3 className="mt-2 font-display text-xl font-bold">{card.title}</h3>

            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>

            <div className="mt-3 flex">
              <InfoTooltip content={card.tooltip} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
