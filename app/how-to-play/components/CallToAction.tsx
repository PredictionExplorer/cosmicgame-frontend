'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Button } from '@/components/ui/button';

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
          Ready to make a gesture?
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Join the active Performance Cycle on Cosmic Signature. Connect your wallet and confirm your
          first gesture to receive your CST imprint.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/">Go to home</Link>
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
            <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4" />
            Twitter / X
          </a>
        </div>
      </div>
    </motion.section>
  );
}
