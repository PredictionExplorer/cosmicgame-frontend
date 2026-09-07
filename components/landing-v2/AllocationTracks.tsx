'use client';

import { motion } from 'framer-motion';

import type { LandingContent } from '@/content/landing';

import { SectionHeading } from './SectionHeading';

type Tone = 'primary' | 'aurora' | 'rose' | 'impact' | 'nebula' | 'solar' | 'default';

const TONE_STYLES: Record<Tone, string> = {
  primary: 'border-primary/30 bg-primary/[0.06] shadow-[0_20px_70px_-30px_hsl(var(--primary)/0.2)]',
  aurora: 'border-primary/25 bg-primary/[0.04]',
  rose: 'border-secondary/25 bg-secondary/[0.04]',
  impact: 'border-primary/20 bg-primary/[0.03]',
  nebula: 'border-secondary/20 bg-secondary/[0.03]',
  solar: 'border-primary/25 bg-primary/[0.04]',
  default: 'border-border bg-foreground/[0.02]',
};

const TONE_TEXT: Record<Tone, string> = {
  primary: 'text-gradient-signature',
  aurora: 'text-primary',
  rose: 'text-secondary',
  impact: 'text-primary',
  nebula: 'text-secondary',
  solar: 'text-primary',
  default: 'text-foreground',
};

export function AllocationTracks({ tracks }: { tracks: LandingContent['tracks'] }) {
  return (
    <section
      id="tracks"
      className="relative border-t border-border bg-background py-16 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
        <SectionHeading
          eyebrow={tracks.eyebrow}
          heading={tracks.heading}
          description={tracks.description}
        />

        <div className="mt-16 grid auto-rows-[minmax(220px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {tracks.items.map((item, idx) => {
            const tone = (item.tone ?? 'default') as Tone;

            let span = 'sm:col-span-1 lg:col-span-2';
            if (idx === 0) span = 'sm:col-span-2 lg:col-span-4';
            if (idx === 1) span = 'sm:col-span-2 lg:col-span-2';
            if (idx === 2) span = 'sm:col-span-1 lg:col-span-3';
            if (idx === 3) span = 'sm:col-span-1 lg:col-span-3';
            if (idx === 4) span = 'sm:col-span-1 lg:col-span-2';
            if (idx === 5) span = 'sm:col-span-1 lg:col-span-2';
            if (idx === 6) span = 'sm:col-span-2 lg:col-span-2';

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: Math.min(idx * 0.04, 0.3) }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition hover:border-primary/30 ${TONE_STYLES[tone]} ${span}`}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60"
                  style={{
                    background:
                      tone === 'default'
                        ? 'radial-gradient(circle, hsl(var(--primary) / 0.15), transparent)'
                        : undefined,
                  }}
                  aria-hidden
                />

                <div className="relative">
                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground`}
                  >
                    {tracks.cardLabel}
                  </p>
                  <p
                    className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${TONE_TEXT[tone]}`}
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {item.percent}
                  </p>
                </div>

                <div className="relative mt-6">
                  <h3
                    className="text-xl font-semibold text-foreground sm:text-2xl"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
