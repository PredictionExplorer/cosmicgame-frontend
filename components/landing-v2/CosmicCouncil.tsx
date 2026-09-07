'use client';

import { motion } from 'framer-motion';

import type { LandingContent } from '@/content/landing';

import { SectionHeading } from './SectionHeading';

export function CosmicCouncil({ council }: { council: LandingContent['council'] }) {
  return (
    <section className="relative border-t border-border bg-card py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
        <SectionHeading
          eyebrow={council.eyebrow}
          heading={council.heading}
          description={council.body}
          align="center"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {council.columns.map((col, idx) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="relative rounded-2xl border border-border bg-foreground/[0.02] p-6 backdrop-blur transition hover:border-primary/20"
            >
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-foreground/5 font-mono text-xs text-muted-foreground">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3
                  className="text-xl font-semibold text-foreground sm:text-2xl"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {col.title}
                </h3>
              </div>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">{col.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
