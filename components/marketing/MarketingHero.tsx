'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function MarketingHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl px-6 py-20 text-center sm:px-12 sm:py-28"
    >
      <div
        aria-hidden
        className="animate-gradient-shift pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 bg-[length:200%_200%]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl border border-white/[0.06]"
      />

      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Earn Rewards by{' '}
        <span className="bg-gradient-to-r from-[#35C9FF] via-[#1D9BEF] to-[#AC56FF] bg-clip-text text-transparent">
          Spreading the Word
        </span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
        Promote Cosmic Signature and receive CST distributions for every verified outreach activity.
      </p>

      <div className="mt-10">
        <Button asChild size="lg" className="group">
          <a href="#how-it-works">
            Learn How
            <ArrowDown className="ml-1 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>
        </Button>
      </div>
    </motion.section>
  );
}
