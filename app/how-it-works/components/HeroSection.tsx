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
      className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.10),rgb(var(--nebula-violet-rgb)/0.08)_42%,rgb(var(--chrono-rose-rgb)/0.06))] px-5 py-16 text-center shadow-[0_24px_100px_-70px_rgb(var(--aurora-cyan-rgb)/0.9)] backdrop-blur sm:px-8 lg:px-14"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--aurora-cyan-rgb) / 0.22), rgb(var(--nebula-violet-rgb) / 0.18) 48%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-25"
        style={{
          background:
            'conic-gradient(from 120deg, transparent, rgb(var(--aurora-cyan-rgb) / 0.85), transparent 34%, rgb(var(--nebula-violet-rgb) / 0.65), transparent 68%, rgb(var(--chrono-rose-rgb) / 0.55), transparent)',
          maskImage:
            'radial-gradient(circle, transparent 57%, black 59%, black 62%, transparent 64%)',
        }}
      />

      <motion.div
        variants={fadeUp}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Procedural On-Chain Art Protocol
      </motion.div>

      <motion.h1
        id="hero-heading"
        variants={fadeUp}
        className="relative mx-auto max-w-5xl font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
      >
        Gesture. Endure.{' '}
        <GradientText as="span" className="font-display">
          Shape the Signature.
        </GradientText>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="relative mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground"
      >
        Participants make gestures during a Performance Cycle. When the Cycle Finalization Time
        expires, the cycle closes and allocations distribute across more than ten tracks &mdash;
        including the Signature Allocation, Anchor Distributions, and Protocol Guild.
      </motion.p>

      <motion.div
        variants={fadeUp}
        className="relative mt-9 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
      >
        <Button asChild size="lg">
          <Link href="/">Open the Protocol</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="#protocol-overview">Learn More</a>
        </Button>
      </motion.div>
    </motion.section>
  );
}
