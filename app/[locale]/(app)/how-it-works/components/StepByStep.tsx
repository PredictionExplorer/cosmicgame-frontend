'use client';

import { motion } from 'framer-motion';
import { Wallet, Search, MousePointerClick } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { GradientText } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function StepByStep({ stepByStep }: { stepByStep: HowItWorksContent['stepByStep'] }) {
  const steps = [
    { Icon: Wallet, ...stepByStep.steps[0] },
    { Icon: Search, ...stepByStep.steps[1] },
    { Icon: MousePointerClick, ...stepByStep.steps[2] },
  ];

  return (
    <section aria-labelledby="steps-heading" className="py-16">
      <div className="mb-10 text-center">
        <h2
          id="steps-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {stepByStep.heading}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{stepByStep.subhead}</p>
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
                    {stepByStep.stepLabel} {String(i + 1).padStart(2, '0')}
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
