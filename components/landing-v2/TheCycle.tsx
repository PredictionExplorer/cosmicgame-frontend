'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { landingContent } from '@/content/landing';

import { SectionHeading } from './SectionHeading';

const { cycle } = landingContent;

export function TheCycle() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const lineProgress = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%']);

  return (
    <section
      id="cycle"
      ref={sectionRef}
      className="relative border-t border-white/10 bg-[#0D0521] py-28 sm:py-40"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={cycle.eyebrow}
          heading={cycle.heading}
          description={cycle.description}
        />

        <div className="relative mt-20 grid gap-10 lg:grid-cols-[72px_1fr] lg:gap-16">
          <div className="relative hidden lg:block">
            <div
              className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10"
              aria-hidden
            />
            <motion.div
              className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-[oklch(84.7%_0.149_213)] via-[oklch(50.4%_0.247_296)] to-[oklch(67.2%_0.228_4)]"
              style={{ height: lineProgress }}
              aria-hidden
            />
          </div>

          <ol className="space-y-10">
            {cycle.stages.map((stage, idx) => (
              <motion.li
                key={stage.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative grid grid-cols-[auto_1fr] gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20 hover:bg-white/[0.04] sm:p-8 md:grid-cols-[64px_1fr] md:gap-8"
              >
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 font-mono text-sm text-white/70 md:h-16 md:w-16 md:text-base">
                    {stage.number}
                  </div>
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold text-white sm:text-2xl md:text-3xl"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {stage.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-white/70 md:text-lg">
                    {stage.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
