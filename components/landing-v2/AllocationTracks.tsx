'use client';

import { motion } from 'framer-motion';

import { landingContent } from '@/content/landing';

import { SectionHeading } from './SectionHeading';

const { tracks } = landingContent;

type Tone = 'primary' | 'aurora' | 'rose' | 'impact' | 'nebula' | 'solar' | 'default';

const TONE_STYLES: Record<Tone, string> = {
  primary: 'border-[oklch(84.7%_0.149_213)]/30 bg-[oklch(21.3%_0.135_286)]/40 glow-aurora',
  aurora: 'border-[oklch(84.7%_0.149_213)]/25 bg-[oklch(21.3%_0.135_286)]/30',
  rose: 'border-[oklch(67.2%_0.228_4)]/25 bg-[oklch(67.2%_0.228_4)]/5',
  impact: 'border-[oklch(77.1%_0.163_161)]/25 bg-[oklch(77.1%_0.163_161)]/5 glow-impact',
  nebula: 'border-[oklch(50.4%_0.247_296)]/25 bg-[oklch(50.4%_0.247_296)]/5 glow-nebula',
  solar: 'border-[oklch(82.4%_0.162_81)]/25 bg-[oklch(82.4%_0.162_81)]/5 glow-solar',
  default: 'border-white/10 bg-white/[0.02]',
};

const TONE_TEXT: Record<Tone, string> = {
  primary: 'text-gradient-signature',
  aurora: 'text-[oklch(84.7%_0.149_213)]',
  rose: 'text-[oklch(67.2%_0.228_4)]',
  impact: 'text-[oklch(77.1%_0.163_161)]',
  nebula: 'text-[oklch(67.2%_0.228_4)]',
  solar: 'text-[oklch(82.4%_0.162_81)]',
  default: 'text-white',
};

export function AllocationTracks() {
  return (
    <section id="tracks" className="relative border-t border-white/10 bg-[#0A0418] py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
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
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition hover:border-white/25 ${TONE_STYLES[tone]} ${span}`}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60"
                  style={{
                    background:
                      tone === 'default'
                        ? 'radial-gradient(circle, rgb(255 255 255 / 0.15), transparent)'
                        : undefined,
                  }}
                  aria-hidden
                />

                <div className="relative">
                  <p className={`font-mono text-[10px] uppercase tracking-[0.24em] text-white/50`}>
                    Allocation
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
                    className="text-xl font-semibold text-white sm:text-2xl"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{item.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
