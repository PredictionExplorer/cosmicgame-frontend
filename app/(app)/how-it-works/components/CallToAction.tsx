'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function CallToAction() {
  return (
    <motion.section
      aria-labelledby="cta-heading"
      className="py-16"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="gradient-border-card relative overflow-hidden rounded-2xl bg-white/[0.02] px-6 py-12 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />

        <h2 id="cta-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to Make Your First Gesture?
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Join the active Performance Cycle. Connect your wallet and make your first gesture to
          start imprinting CST and shaping the cycle\u2019s Signature.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/">Open the Protocol</Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <a
            href="https://discord.com/channels/1258032742084509779/1258691600951935056"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            Discord
          </a>
          <a
            href="https://x.com/CosmicSignature"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <XIcon className="h-4 w-4" />
            Twitter / X
          </a>
        </div>
      </div>
    </motion.section>
  );
}
