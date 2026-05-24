'use client';

import Link from 'next/link';
import { ArrowRight, Fingerprint, HeartHandshake, Orbit, Radio, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { getAssetsUrl } from '@/utils';

import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import { Surface } from '@/components/ui/surface';
import NFTImage from '@/components/nft/NFTImage';
import { fadeRise, fadeRiseStagger, useMotionVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

interface BannerToken {
  seed: string;
  id: number;
}

interface HomeObservatoryHeroProps {
  data: DashboardInfo | null;
  bannerToken: BannerToken;
  canOpenGesturePanel: boolean;
}

const storyCards = [
  {
    icon: Orbit,
    title: 'Gestures shape the art',
    body: 'Every move bends the Performance Cycle toward its final on-chain Signature.',
    tone: 'aurora',
  },
  {
    icon: Fingerprint,
    title: 'CST records participation',
    body: 'Participation CST carries a trace of the cycle you helped create.',
    tone: 'nebula',
  },
  {
    icon: HeartHandshake,
    title: 'Allocations fund public goods',
    body: 'Protocol reserves flow across allocation tracks, including Protocol Guild.',
    tone: 'impact',
  },
] as const;

const toneClasses: Record<(typeof storyCards)[number]['tone'], string> = {
  aurora:
    'border-[rgb(var(--aurora-cyan-rgb)/0.22)] bg-[rgb(var(--aurora-cyan-rgb)/0.08)] text-primary',
  nebula:
    'border-[rgb(var(--nebula-violet-rgb)/0.24)] bg-[rgb(var(--nebula-violet-rgb)/0.10)] text-[rgb(var(--nebula-violet-rgb))]',
  impact:
    'border-[rgb(var(--impact-green-rgb)/0.24)] bg-[rgb(var(--impact-green-rgb)/0.10)] text-[rgb(var(--impact-green-rgb))]',
};

function getHeroArtSrc(bannerToken: BannerToken): string {
  if (bannerToken.seed === '') return '/images/qmark.png';
  if (bannerToken.seed === 'sample') return '/images/CosmicSignatureNFT.png';
  return getAssetsUrl(`cosmicsignature/${bannerToken.seed}.png`);
}

function formatEth(value: number | undefined): string {
  return `${(value ?? 0).toFixed(4)} ETH`;
}

export function HomeObservatoryHero({
  data,
  bannerToken,
  canOpenGesturePanel,
}: HomeObservatoryHeroProps) {
  const sectionVariants = useMotionVariants(fadeRise);
  const staggerVariants = useMotionVariants(fadeRiseStagger);
  const itemVariants = useMotionVariants(fadeRise);

  const cycleNumber = data?.CurRoundNum;
  const gestureCount = data?.CurNumBids ?? 0;
  const previousCycle = (cycleNumber ?? 0) - 1;
  const hasPreviousCycle = previousCycle > 0;
  const signatureAllocation = data?.PrizeAmountEth ?? data?.CurPrizeAmountEth;
  const publicGoodsPercentage = data?.CharityPercentage ?? 0;
  const artHref = bannerToken.id >= 0 ? `/detail/${bannerToken.id}` : '/detail/sample';
  const artSrc = getHeroArtSrc(bannerToken);
  const primaryCtaHref = canOpenGesturePanel ? '#make-gesture' : '/current-cycle';
  const primaryCtaLabel = canOpenGesturePanel ? 'Make a Gesture' : 'Explore Current Cycle';

  return (
    <motion.section
      aria-labelledby="home-observatory-title"
      className="print-motion-visible mb-8"
      variants={sectionVariants}
      initial="initial"
      animate="animate"
    >
      <Surface variant="gradient-border-accent" radius="xl" padding="none" className="isolate">
        <div className="pointer-events-none absolute -left-20 top-6 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 rounded-full bg-[rgb(var(--nebula-violet-rgb)/0.24)] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:p-8">
          <motion.div variants={staggerVariants} className="flex min-w-0 flex-col justify-center">
            <motion.div
              variants={itemVariants}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-live-dot rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              Live on Arbitrum
            </motion.div>

            <motion.div variants={itemVariants}>
              <GradientText
                as="h1"
                id="home-observatory-title"
                className="font-display text-4xl font-bold leading-[0.96] tracking-tight sm:text-5xl lg:text-6xl"
              >
                Shape the next Cosmic Signature
              </GradientText>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Cosmic Signature is a live Performance Cycle where each Gesture leaves a visible
                trace, imprints Participation CST, and helps direct protocol reserves toward the
                Ethereum public goods that keep the network alive.
              </p>
            </motion.div>

            <motion.div
              variants={staggerVariants}
              className="mt-7 grid gap-3 sm:grid-cols-3 lg:max-w-3xl"
            >
              {storyCards.map(({ icon: Icon, title, body, tone }) => (
                <motion.div key={title} variants={itemVariants}>
                  <Surface
                    variant="glass"
                    radius="lg"
                    padding="md"
                    className="h-full border-white/[0.08] bg-white/[0.035]"
                  >
                    <div
                      className={cn(
                        'mb-3 flex h-9 w-9 items-center justify-center rounded-xl border',
                        toneClasses[tone],
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{body}</p>
                  </Surface>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-11 px-5">
                <Link href={primaryCtaHref}>
                  {primaryCtaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="h-11 px-5">
                <Link href="/current-cycle">View Cycle Details</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="min-w-0">
            <Surface
              variant="glass-bordered"
              radius="xl"
              padding="none"
              className="h-full p-4 sm:p-5"
              role="region"
              aria-label="Current cycle observatory"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
                    <Radio className="h-5 w-5 text-primary" />
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-live-dot" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Observatory Console
                    </p>
                    <h2 className="font-display text-2xl font-bold tracking-tight">
                      {cycleNumber == null ? 'Cycle loading' : `Cycle #${cycleNumber}`}
                    </h2>
                  </div>
                </div>
                <Link
                  href="/coordination-changes"
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
                >
                  Parameters
                </Link>
              </div>

              <Link href={artHref} className="group block" aria-label="View Cosmic Signature art">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgb(var(--aurora-cyan-rgb)/0.16),transparent_34%),radial-gradient(circle_at_78%_15%,rgb(var(--nebula-violet-rgb)/0.18),transparent_38%)]" />
                  <NFTImage
                    src={artSrc}
                    alt="Cosmic Signature artwork preview"
                    priority
                    sizes="(max-width: 1024px) 100vw, 520px"
                    className="relative transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-4 pt-12">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Signature Artifact
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/80 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Gestures
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums">{gestureCount}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Signature
                  </p>
                  <p className="mt-1 text-sm font-bold tabular-nums">
                    {formatEth(signatureAllocation)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Public Goods
                  </p>
                  <p className="mt-1 text-sm font-bold tabular-nums">
                    {publicGoodsPercentage > 0 ? `${publicGoodsPercentage}%` : '10+ tracks'}
                  </p>
                </div>
              </div>

              {hasPreviousCycle ? (
                <Link
                  href={`/allocation/${previousCycle}`}
                  className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-sm text-muted-foreground transition-all duration-300 hover:border-primary/25 hover:bg-white/[0.045] hover:text-primary"
                >
                  Cycle {previousCycle} allocations
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </Surface>
          </motion.div>
        </div>
      </Surface>
    </motion.section>
  );
}
