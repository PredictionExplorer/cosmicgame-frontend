'use client';

import { motion } from 'framer-motion';
import { Megaphone, ShieldCheck, Coins, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { GradientText } from '@/components/styled';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function HowItWorks() {
  const t = useTranslations('marketing');
  const steps = [
    {
      number: '01',
      title: t('howItWorks.steps.promote.title'),
      description: t('howItWorks.steps.promote.description'),
      tooltip: t('howItWorks.steps.promote.tooltip'),
      Icon: Megaphone,
    },
    {
      number: '02',
      title: t('howItWorks.steps.verify.title'),
      description: t('howItWorks.steps.verify.description'),
      tooltip: t('howItWorks.steps.verify.tooltip'),
      Icon: ShieldCheck,
    },
    {
      number: '03',
      title: t('howItWorks.steps.receive.title'),
      description: t('howItWorks.steps.receive.description'),
      tooltip: t('howItWorks.steps.receive.tooltip'),
      Icon: Coins,
    },
  ] as const;

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="py-16">
      <div className="mb-12 flex items-center justify-center gap-2">
        <h2
          id="how-it-works-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {t('howItWorks.title')}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={t('howItWorks.infoAria')}
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{t('howItWorks.tooltip')}</TooltipContent>
        </Tooltip>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid gap-8 sm:grid-cols-3"
      >
        {steps.map((step) => (
          <motion.div
            key={step.number}
            variants={itemVariants}
            className="gradient-border-card group relative rounded-xl bg-white/[0.02] p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <step.Icon className="h-6 w-6 text-primary" />
            </div>

            <GradientText className="mb-1 text-sm font-bold tracking-widest">
              {step.number}
            </GradientText>

            <h3 className="mt-2 font-display text-xl font-bold">{step.title}</h3>

            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>

            <div className="mt-3 flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t('howItWorks.stepInfoAria', { title: step.title })}
                    className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{step.tooltip}</TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
