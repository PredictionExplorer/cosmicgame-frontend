'use client';

import dynamic from 'next/dynamic';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent, LandingLink } from '@/content/landing';

import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ReducedMotionFallback } from '@/components/three/ReducedMotionFallback';
import { useCanRenderHeroCanvas } from '@/components/three/hero-canvas-gate';
import { localizeCrossHostHref } from '@/lib/hostRouting';

import { EventHorizonCountdown } from './EventHorizonCountdown';
import { HeroArtShowcase } from './HeroArtShowcase';
import styles from './Landing.module.css';

const HeroCanvas = dynamic(
  () => import('@/components/three/HeroCanvas').then((m) => m.HeroCanvas),
  { ssr: false, loading: () => <ReducedMotionFallback /> },
);

function HeroBackdrop() {
  // Keep the WebGL download out of phone and reduced-motion visits entirely.
  const canRenderCanvas = useCanRenderHeroCanvas();
  return canRenderCanvas ? <HeroCanvas /> : <ReducedMotionFallback />;
}

export function Hero({
  hero,
  navigation = [],
}: {
  hero: LandingContent['hero'];
  navigation?: readonly LandingLink[];
}) {
  const locale = useLocale();

  return (
    <section className={styles.hero} aria-labelledby="landing-headline">
      <div className={styles.backdrop} aria-hidden="true">
        <HeroBackdrop />
      </div>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={styles.brandIcon}>
            <circle cx="20" cy="20" r="3" fill="currentColor" />
            <ellipse
              cx="20"
              cy="20"
              rx="18"
              ry="7"
              stroke="currentColor"
              transform="rotate(-35 20 20)"
            />
            <ellipse
              cx="20"
              cy="20"
              rx="18"
              ry="7"
              stroke="currentColor"
              transform="rotate(65 20 20)"
            />
          </svg>
          <span>
            Cosmic <span className={styles.brandSecond}>Signature</span>
          </span>
        </Link>
        <nav className={styles.navigation}>
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.language}>
          <LanguageSwitcher />
        </div>
      </header>

      <div className={styles.heroInner}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.signal} aria-hidden="true" />
              {hero.eyebrow}
            </p>
            <h1 id="landing-headline" className={styles.headline}>
              {hero.headlineLead}{' '}
              <span className={styles.headlineAccent}>{hero.headlineAccent}</span>
            </h1>
            <p className={styles.subhead}>{hero.subhead}</p>
            <div className={styles.actions}>
              <Link
                href={localizeCrossHostHref(hero.primaryCta.href, locale)}
                className={styles.primaryAction}
                rel="noopener"
              >
                {hero.primaryCta.label}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link href={hero.secondaryCta.href} className={styles.secondaryAction}>
                {hero.secondaryCta.label}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.exploreLinks}>
              {[hero.statisticsCta, hero.galleryCta].map((item) => (
                <Link key={item.href} href={localizeCrossHostHref(item.href, locale)}>
                  {item.label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <HeroArtShowcase art={hero.art} />
        </div>

        <div className={styles.clockBand}>
          <EventHorizonCountdown />
        </div>
        <div className={styles.credentials}>
          <ul>
            {hero.marqueeChips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
          <a href="#cycle" aria-label={hero.scrollAriaLabel} className={styles.scrollLink}>
            <ChevronDown size={20} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
