'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import { GradientText } from '@/components/styled';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function HeroSection() {
  return (
    <motion.section
      aria-labelledby="hero-heading"
      className="relative py-16 text-center"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />

      <motion.div
        variants={fadeUp}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Strategy Bidding Game
      </motion.div>

      <motion.h1
        id="hero-heading"
        variants={fadeUp}
        className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
      >
        Bid. Compete.{' '}
        <GradientText as="span" className="font-display">
          Win Big.
        </GradientText>
      </motion.h1>

      <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
        Outsmart other players in a thrilling countdown. The last bidder standing wins the ETH prize
        pool and exclusive COSMIC NFTs.
      </motion.p>

      <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/">Start Playing</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="#game-overview">Learn More</a>
        </Button>
      </motion.div>
    </motion.section>
  );
}
