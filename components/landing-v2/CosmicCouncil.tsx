'use client';

import { motion } from 'framer-motion';

import { landingContent } from '@/content/landing';

import { SectionHeading } from './SectionHeading';

const { council } = landingContent;

export function CosmicCouncil() {
  return (
    <section className="relative border-t border-white/10 bg-[#0D0521] py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={council.eyebrow}
          heading={council.heading}
          description={council.body}
          align="center"
        />

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {council.columns.map((col, idx) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur transition hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 font-mono text-xs text-white/70">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3
                  className="text-xl font-semibold text-white sm:text-2xl"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {col.title}
                </h3>
              </div>
              <p className="mt-5 text-base leading-relaxed text-white/70">{col.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
