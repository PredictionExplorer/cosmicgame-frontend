'use client';

import { motion } from 'framer-motion';
import { Play, Users, TimerOff, Trophy, Ticket, RotateCcw } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { GradientText } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function GameCycle({ gameCycle }: { gameCycle: HowItWorksContent['gameCycle'] }) {
  const phases = [
    { Icon: Play, ...gameCycle.phases[0] },
    { Icon: Users, ...gameCycle.phases[1] },
    { Icon: TimerOff, ...gameCycle.phases[2] },
    { Icon: Trophy, ...gameCycle.phases[3] },
    { Icon: Ticket, ...gameCycle.phases[4] },
    { Icon: RotateCcw, ...gameCycle.phases[5] },
  ];

  return (
    <section aria-labelledby="protocol-cycle-heading" className="py-8 sm:py-10">
      <div className="mb-10 max-w-3xl">
        <h2 id="protocol-cycle-heading" className="type-display-sm">
          {gameCycle.heading}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{gameCycle.subhead}</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial={false}
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
