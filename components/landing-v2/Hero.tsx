'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

import { landingContent } from '@/content/landing';

import { ReducedMotionFallback } from '@/components/three/ReducedMotionFallback';
import { APP_ORIGIN } from '@/lib/hostRouting';

import { EventHorizonCountdown } from './EventHorizonCountdown';
import { GradientText } from './GradientText';

const HeroCanvas = dynamic(
  () => import('@/components/three/HeroCanvas').then((m) => m.HeroCanvas),
  {
    ssr: false,
    loading: () => <ReducedMotionFallback />,
  },
);

const { hero } = landingContent;

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden bg-deep-space">
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroCanvas />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-[#0D0521] via-[#0D0521]/60 to-transparent"
        aria-hidden
      />

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-28 pt-24 sm:pb-32 md:pt-32 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/75 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(84.7%_0.149_213)] animate-signature-pulse" />
            {hero.eyebrow}
          </div>

          <h1
            className="mt-8 text-balance text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[92px]"
            style={{ fontFamily: 'var(--font-family-display)' }}
          >
            Cosmic Signature: Procedural On-Chain Art on{' '}
            <GradientText variant="signature">Arbitrum</GradientText>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            {hero.subhead}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
            Cosmic Signature is not related to the COSMIC cancer mutation database or COSMIC
            mutational signatures in biology. It is an on-chain art protocol and app.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <EventHorizonCountdown />
          </motion.div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={hero.primaryCta.href}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#0D0521] transition hover:bg-[oklch(84.7%_0.149_213)] hover:text-[#0D0521] glow-aurora"
              rel="noopener"
            >
              {hero.primaryCta.label}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>

            <Link
              href={hero.secondaryCta.href}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-md transition hover:bg-white/10"
            >
              {hero.secondaryCta.label}
            </Link>
            <Link
              href={`${APP_ORIGIN}/statistics`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              Protocol statistics
            </Link>
            <Link
              href={`${APP_ORIGIN}/gallery`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              NFT gallery
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="mt-20 flex flex-wrap gap-x-8 gap-y-3"
        >
          {hero.marqueeChips.map((chip) => (
            <div
              key={chip}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/50"
            >
              <span
                className="h-px w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                aria-hidden
              />
              {chip}
            </div>
          ))}
        </motion.div>
      </div>

      <motion.a
        href="#cycle"
        aria-label="Scroll to The Cycle section"
        className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-white/50 transition hover:text-white"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <ChevronDown className="h-6 w-6 animate-cosmic-drift" aria-hidden />
      </motion.a>
    </section>
  );
}
