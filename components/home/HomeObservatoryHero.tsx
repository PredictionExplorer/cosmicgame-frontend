'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Fingerprint, HeartHandshake, Orbit, Radio, Sparkles } from 'lucide-react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import { formatId, getAssetsUrl, toIntlLocale } from '@/utils';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import { GradientText } from '@/components/ui/gradient-text';
import { Surface } from '@/components/ui/surface';
import NFTImage from '@/components/nft/NFTImage';
// riseIn (not fadeRise): this section's copy must stay visible in the server
// HTML instead of fading in after hydration — it is the page's crawlable
// story text (and held the LCP before the Deck redesign moved the H1 up).
import { fadeRiseStagger, riseIn, useMotionVariants } from '@/lib/motion';
import type { CyclePhase } from '@/lib/cycleState';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

interface BannerToken {
  seed: string;
  id: number;
}

interface HomeObservatoryHeroProps {
  data: DashboardInfo | null;
  bannerToken: BannerToken | null;
  canOpenGesturePanel: boolean;
  phase: CyclePhase;
  /** When set, primary CTA submits a gesture (or finalize) instead of only scrolling. */
  onPrimaryCtaClick?: () => void;
  /**
   * 'h1' when this section leads the page; 'h2' when it renders as the
   * story section below the Deck (the page H1 then lives in the Deck header).
   */
  headingLevel?: 'h1' | 'h2';
}

const storyCards = [
  { icon: Orbit, messageKey: 'gestures', tone: 'aurora' },
  { icon: Fingerprint, messageKey: 'cst', tone: 'nebula' },
  { icon: HeartHandshake, messageKey: 'publicGoods', tone: 'impact' },
] as const;

const toneClasses: Record<(typeof storyCards)[number]['tone'], string> = {
  aurora:
    'border-[rgb(var(--aurora-cyan-rgb)/0.22)] bg-[rgb(var(--aurora-cyan-rgb)/0.08)] text-primary',
  nebula:
    'border-[rgb(var(--nebula-violet-rgb)/0.24)] bg-[rgb(var(--nebula-violet-rgb)/0.10)] text-[rgb(var(--nebula-violet-rgb))]',
  impact:
    'border-[rgb(var(--impact-green-rgb)/0.24)] bg-[rgb(var(--impact-green-rgb)/0.10)] text-[rgb(var(--impact-green-rgb))]',
};

function getHeroPhaseView(phase: CyclePhase) {
  switch (phase) {
    case 'opening-soon':
      return {
        messageKey: 'openingSoon',
        headlineUsesCycleLabel: false,
        bodyUsesCycleLabel: true,
        badgeDotClass: 'bg-[rgb(var(--impact-green-rgb))] animate-live-dot',
        bodyClass: 'text-foreground/90 font-medium sm:text-xl',
      };
    case 'waiting-first-gesture':
      return {
        messageKey: 'waitingFirstGesture',
        headlineUsesCycleLabel: true,
        bodyUsesCycleLabel: false,
        badgeDotClass: 'bg-[rgb(var(--impact-green-rgb))] animate-live-dot',
        bodyClass: 'text-foreground/90 font-medium sm:text-xl',
      };
    case 'confirming':
      return {
        messageKey: 'confirming',
        headlineUsesCycleLabel: false,
        bodyUsesCycleLabel: false,
        badgeDotClass: 'bg-primary animate-pulse-glow',
        bodyClass: 'text-foreground/90 font-medium sm:text-xl',
      };
    case 'ready-to-finalize':
      return {
        messageKey: 'readyToFinalize',
        headlineUsesCycleLabel: false,
        bodyUsesCycleLabel: false,
        badgeDotClass: 'bg-[rgb(var(--impact-green-rgb))] animate-signature-pulse',
        bodyClass: 'text-foreground/90 font-medium sm:text-xl',
      };
    case 'final-hour':
    case 'final-ten':
    case 'final-minute':
      return {
        messageKey: 'finalWindow',
        headlineUsesCycleLabel: false,
        bodyUsesCycleLabel: false,
        badgeDotClass: 'bg-[rgb(var(--chrono-rose-rgb))] animate-pulse-glow',
        bodyClass: 'text-foreground/90',
      };
    case 'loading':
      return {
        messageKey: 'loading',
        headlineUsesCycleLabel: false,
        bodyUsesCycleLabel: false,
        badgeDotClass: 'bg-primary animate-cosmic-drift',
        bodyClass: 'text-muted-foreground',
      };
    case 'unavailable':
      return {
        messageKey: 'unavailable',
        headlineUsesCycleLabel: false,
        bodyUsesCycleLabel: false,
        badgeDotClass: 'bg-white/50',
        bodyClass: 'text-muted-foreground',
      };
    case 'approach':
    case 'live':
    default:
      return {
        messageKey: 'live',
        headlineUsesCycleLabel: false,
        bodyUsesCycleLabel: false,
        badgeDotClass: 'bg-emerald-300 animate-live-dot',
        bodyClass: 'text-muted-foreground',
      };
  }
}

function getHeroArtSrc(bannerToken: BannerToken): string {
  return getAssetsUrl(`cosmicsignature/${bannerToken.seed}.png`);
}

function ObservatoryArtworkUnavailable() {
  const t = useTranslations('home');

  return (
    <div className="relative flex aspect-video min-h-[220px] overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgb(var(--aurora-cyan-rgb)/0.18),transparent_34%),radial-gradient(circle_at_78%_15%,rgb(var(--nebula-violet-rgb)/0.20),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 bg-primary/10 blur-sm" />
      <div className="relative z-[1] m-auto max-w-xs px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {t('hero.artUnavailable.eyebrow')}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t('hero.artUnavailable.body')}
        </p>
      </div>
    </div>
  );
}

function formatEth(value: number | undefined): string {
  return `${(value ?? 0).toFixed(4)} ETH`;
}

function useAnimatedNumber(value: number, durationMs = 650): number {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    if (!Number.isFinite(value) || !Number.isFinite(startValue)) {
      previousValueRef.current = value;
      const frameId = requestAnimationFrame(() => setDisplayValue(value));
      return () => cancelAnimationFrame(frameId);
    }

    const delta = value - startValue;
    if (delta === 0) return undefined;

    let frameId = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + delta * eased);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = value;
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [durationMs, value]);

  return displayValue;
}

export function HomeObservatoryHero({
  data,
  bannerToken,
  canOpenGesturePanel,
  phase,
  onPrimaryCtaClick,
  headingLevel = 'h1',
}: HomeObservatoryHeroProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const sectionVariants = useMotionVariants(riseIn);
  const staggerVariants = useMotionVariants(fadeRiseStagger);
  const itemVariants = useMotionVariants(riseIn);

  const cycleNumber = data?.CurRoundNum;
  const gestureCount = data?.CurNumBids ?? 0;
  const previousCycle = (cycleNumber ?? 0) - 1;
  const hasPreviousCycle = previousCycle > 0;
  const signatureAllocation = data?.PrizeAmountEth ?? data?.CurPrizeAmountEth;
  const publicGoodsPercentage = data?.CharityPercentage ?? 0;
  const animatedGestureCount = useAnimatedNumber(gestureCount);
  const animatedSignatureAllocation = useAnimatedNumber(signatureAllocation ?? 0);
  const hasRealBannerToken = bannerToken != null && bannerToken.seed !== '' && bannerToken.id >= 0;
  const artHref = hasRealBannerToken ? `/detail/${bannerToken.id}` : null;
  const artSrc = hasRealBannerToken ? getHeroArtSrc(bannerToken) : null;
  const primaryCtaHref = canOpenGesturePanel ? '#make-gesture' : '/current-cycle';
  const phaseView = getHeroPhaseView(phase);
  const cycleLabel =
    cycleNumber == null
      ? t('hero.cycleFallback')
      : t('hero.cycleNumber', { number: String(cycleNumber) });
  const headline = phaseView.headlineUsesCycleLabel
    ? t(`hero.phase.${phaseView.messageKey}.headline`, { cycleLabel })
    : t(`hero.phase.${phaseView.messageKey}.headline`);
  const body = phaseView.bodyUsesCycleLabel
    ? t(`hero.phase.${phaseView.messageKey}.body`, { cycleLabel })
    : t(`hero.phase.${phaseView.messageKey}.body`);
  const badge = t(`hero.phase.${phaseView.messageKey}.badge`);
  const primaryCtaLabel = canOpenGesturePanel
    ? t(`hero.phase.${phaseView.messageKey}.cta`)
    : t('hero.viewCycleDetails');

  return (
    <LazyMotion features={domAnimation}>
      <m.section
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
            <m.div variants={staggerVariants} className="flex min-w-0 flex-col justify-center">
              <m.div
                variants={itemVariants}
                className="mb-5 inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.22em]"
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      'relative inline-flex h-2 w-2 rounded-full',
                      phaseView.badgeDotClass,
                    )}
                  />
                </span>
                {badge}
              </m.div>

              <m.div variants={itemVariants}>
                <GradientText
                  as={headingLevel}
                  id="home-observatory-title"
                  className="font-display text-4xl font-bold leading-[0.96] tracking-tight sm:text-5xl lg:text-6xl"
                >
                  {headline}
                </GradientText>
                <p
                  className={cn(
                    'mt-5 max-w-2xl text-base leading-relaxed sm:text-lg',
                    phaseView.bodyClass,
                  )}
                >
                  {body}
                </p>
              </m.div>

              <m.div
                variants={staggerVariants}
                className="mt-7 grid gap-3 sm:grid-cols-3 lg:max-w-3xl"
              >
                {storyCards.map(({ icon: Icon, messageKey, tone }) => (
                  <m.div key={messageKey} variants={itemVariants}>
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
                      <h3 className="text-sm font-semibold text-foreground">
                        {t(`hero.story.${messageKey}.title`)}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {t(`hero.story.${messageKey}.body`)}
                      </p>
                    </Surface>
                  </m.div>
                ))}
              </m.div>

              <m.div variants={itemVariants} className="mt-7 flex flex-wrap items-center gap-3">
                {onPrimaryCtaClick && primaryCtaHref === '#make-gesture' ? (
                  <Button type="button" size="lg" className="h-11 px-5" onClick={onPrimaryCtaClick}>
                    {primaryCtaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button asChild size="lg" className="h-11 px-5">
                    <Link href={primaryCtaHref}>
                      {primaryCtaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button asChild variant="secondary" size="lg" className="h-11 px-5">
                  <Link href="/current-cycle">{t('hero.viewCycleDetails')}</Link>
                </Button>
                <UniswapTradeButton variant="secondary" className="h-11 px-5" />
              </m.div>
            </m.div>

            <m.div variants={itemVariants} className="min-w-0">
              <Surface
                variant="glass-bordered"
                radius="xl"
                padding="none"
                className="h-full p-4 sm:p-5"
                role="region"
                aria-label={t('hero.console.ariaLabel')}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
                      <Radio className="h-5 w-5 text-primary" />
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-live-dot" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t('hero.console.eyebrow')}
                      </p>
                      <h2 className="font-display text-2xl font-bold tracking-tight">
                        {cycleNumber == null
                          ? t('hero.console.cycleLoading')
                          : t('hero.cycleNumber', { number: String(cycleNumber) })}
                      </h2>
                    </div>
                  </div>
                  <Link
                    href="/coordination-changes"
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
                  >
                    {t('hero.console.parameters')}
                  </Link>
                </div>

                {artHref && artSrc && bannerToken ? (
                  <Link
                    key={bannerToken.id}
                    href={artHref}
                    className="group block animate-in fade-in duration-700"
                    aria-label={t('hero.console.viewSignatureAria', {
                      id: formatId(bannerToken.id),
                    })}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgb(var(--aurora-cyan-rgb)/0.16),transparent_34%),radial-gradient(circle_at_78%_15%,rgb(var(--nebula-violet-rgb)/0.18),transparent_38%)]" />
                      {/* No `priority`: since the Deck redesign this section renders
                          below the first viewport, so preloading the artwork would
                          compete with the Deck's LCP text for bandwidth. */}
                      <NFTImage
                        src={artSrc}
                        alt={t('hero.console.artworkAlt', { id: formatId(bannerToken.id) })}
                        terminalFallbackSrc={null}
                        sizes="(max-width: 1024px) 100vw, 520px"
                        className="relative transition-transform duration-700 group-hover:scale-[1.025]"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-4 pt-12">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          {t('hero.console.signatureBadge', { id: formatId(bannerToken.id) })}
                        </span>
                        <ArrowRight className="h-4 w-4 text-white/80 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <ObservatoryArtworkUnavailable />
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 min-[400px]:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <p className="break-words text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.18em]">
                      {t('hero.console.stats.gestures')}
                    </p>
                    <p className="mt-1 break-words text-lg font-bold tabular-nums">
                      {Math.round(animatedGestureCount).toLocaleString(toIntlLocale(locale))}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <p className="break-words text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.18em]">
                      {t('hero.console.stats.signature')}
                    </p>
                    <p className="mt-1 break-words text-sm font-bold tabular-nums">
                      {formatEth(animatedSignatureAllocation)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <p className="break-words text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.18em]">
                      {t('hero.console.stats.publicGoods')}
                    </p>
                    <p className="mt-1 break-words text-sm font-bold tabular-nums">
                      {publicGoodsPercentage > 0
                        ? `${publicGoodsPercentage}%`
                        : t('hero.console.stats.publicGoodsFallback')}
                    </p>
                  </div>
                </div>

                {hasPreviousCycle ? (
                  <Link
                    href={`/allocation/${previousCycle}`}
                    className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-sm text-muted-foreground transition-all duration-300 hover:border-primary/25 hover:bg-white/[0.045] hover:text-primary"
                  >
                    {t('hero.console.previousAllocations', { number: String(previousCycle) })}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </Surface>
            </m.div>
          </div>
        </Surface>
      </m.section>
    </LazyMotion>
  );
}
