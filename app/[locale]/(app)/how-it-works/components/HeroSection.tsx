'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function HeroSection({ hero }: { hero: HowItWorksContent['hero'] }) {
  return (
    <motion.section
      aria-labelledby="hero-heading"
      className="relative border-b border-border pb-8 sm:pb-10"
      initial={false}
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <motion.div
        variants={fadeUp}
        className="mb-5 inline-flex items-center gap-2 type-eyebrow text-primary/80"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {hero.badge}
      </motion.div>

      <motion.h1
        id="hero-heading"
        variants={fadeUp}
        className="relative max-w-4xl type-display-lg text-foreground"
      >
        {hero.headingLead} <span className="text-primary">{hero.headingAccent}</span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="relative mt-6 max-w-3xl type-body-lg text-muted-foreground"
      >
        {hero.paragraph}
      </motion.p>

      <motion.div
        variants={fadeUp}
        className="relative mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
      >
        <Button asChild size="lg">
          <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
        </Button>
      </motion.div>
    </motion.section>
  );
}
