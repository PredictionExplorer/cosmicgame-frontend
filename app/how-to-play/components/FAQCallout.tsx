'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function FAQCallout() {
  return (
    <motion.section
      aria-labelledby="faq-callout-heading"
      className="py-16"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="gradient-border-card relative overflow-hidden rounded-2xl bg-white/[0.02] px-6 py-10 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>

        <h2
          id="faq-callout-heading"
          className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Have Questions?
        </h2>

        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Check our comprehensive FAQ for detailed answers about protocol mechanics, allocations,
          tokens, and everything Cosmic Signature.
        </p>

        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/faq" className="inline-flex items-center gap-2">
              Browse FAQ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
