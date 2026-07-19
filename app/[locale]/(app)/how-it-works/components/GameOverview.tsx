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
    <section id="protocol-overview" aria-labelledby="protocol-overview-heading" className="py-16">
      <div className="mb-10 text-center">
        <h2
          id="protocol-overview-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {overview.heading}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{overview.subhead}</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid gap-8 sm:grid-cols-3"
      >
        {cards.map((card) => (
          <motion.div
            key={card.number}
            variants={itemVariants}
            className="gradient-border-card group relative rounded-xl bg-white/[0.02] p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <card.Icon className="h-6 w-6 text-primary" />
            </div>

            <GradientText className="mb-1 text-sm font-bold tracking-widest">
              {card.number}
            </GradientText>

            <h3 className="mt-2 font-display text-xl font-bold">{card.title}</h3>

            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>

            <div className="mt-3 flex justify-center">
              <InfoTooltip content={card.tooltip} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
