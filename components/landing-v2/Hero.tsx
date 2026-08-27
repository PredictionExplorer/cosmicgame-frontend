'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ReducedMotionFallback } from '@/components/three/ReducedMotionFallback';
import { useCanRenderHeroCanvas } from '@/components/three/hero-canvas-gate';
import { localizeCrossHostHref } from '@/lib/hostRouting';

import { EventHorizonCountdown } from './EventHorizonCountdown';
import { GradientText } from './GradientText';
import { HeroArtShowcase } from './HeroArtShowcase';

const HeroCanvas = dynamic(
  () => import('@/components/three/HeroCanvas').then((m) => m.HeroCanvas),
  {
    ssr: false,
    loading: () => <ReducedMotionFallback />,
  },
);

/**
 * Renders the WebGL canvas only when the gate passes. Rendering (not just
 * hiding) is what matters: mounting the dynamic component is what triggers
 * the three.js chunk download, so phones and reduced-motion visitors must
 * never mount it.
 */
function HeroBackdrop() {
  const canRenderCanvas = useCanRenderHeroCanvas();
  if (!canRenderCanvas) return <ReducedMotionFallback />;
  return <HeroCanvas />;
}

export function Hero({ hero }: { hero: LandingContent['hero'] }) {
  const locale = useLocale();

  return (
    <section className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden bg-deep-space">
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroBackdrop />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-[#0D0521] via-[#0D0521]/60 to-transparent"
        aria-hidden
      />

      <div className="absolute right-6 top-6 z-30">
        <LanguageSwitcher />
      </div>

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pb-28 pt-24 sm:pb-32 md:pt-32 lg:px-12">
        {/* items-start: the framed artwork tops out level with the eyebrow so
            the whole exhibit sits above the fold beside the headline.
            grid-cols-1 at base keeps the single implicit track at container
            width — an `auto` track would size to max-content and overflow
            narrow phones. */}
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12 xl:gap-16">
          {/* Transform-only entrance (no opacity ramp): the headline and subhead
            are the page's LCP candidates and must be visible in the server
            HTML — an opacity-0 initial state would delay LCP until the whole
            bundle hydrates. */}
          <motion.div
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/75 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(84.7%_0.149_213)] animate-signature-pulse" />
              {hero.eyebrow}
            </div>

            {/* Sizing steps down at lg where the artwork column appears, then
              back up as the viewport gives both columns room. */}
            <h1
              className="mt-8 text-balance text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl 2xl:text-[84px]"
              style={{ fontFamily: 'var(--font-family-display)' }}
            >
              {hero.headlineLead}{' '}
              <GradientText variant="signature">{hero.headlineAccent}</GradientText>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
              {hero.subhead}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
              {hero.biologyDisclaimer}
            </p>

            <motion.div
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <EventHorizonCountdown />
            </motion.div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={localizeCrossHostHref(hero.primaryCta.href, locale)}
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
                href={localizeCrossHostHref(hero.secondaryCta.href, locale)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-md transition hover:bg-white/10"
              >
                {hero.secondaryCta.label}
              </Link>
              <Link
                href={localizeCrossHostHref(hero.statisticsCta.href, locale)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
              >
                {hero.statisticsCta.label}
              </Link>
              <Link
                href={localizeCrossHostHref(hero.galleryCta.href, locale)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
              >
                {hero.galleryCta.label}
              </Link>
            </div>
          </motion.div>

          <HeroArtShowcase art={hero.art} />
        </div>

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
        aria-label={hero.scrollAriaLabel}
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
