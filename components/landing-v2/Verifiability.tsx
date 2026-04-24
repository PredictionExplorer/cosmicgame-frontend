'use client';

import { motion } from 'framer-motion';
import { FileCheck, ShieldCheck, Sparkles } from 'lucide-react';

import { landingContent } from '@/content/landing';

import { SectionHeading } from './SectionHeading';

const { verifiability } = landingContent;

const ICONS = [FileCheck, ShieldCheck, Sparkles];

export function Verifiability() {
  return (
    <section className="relative border-t border-white/10 bg-[#0A0418] py-28 sm:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          eyebrow={verifiability.eyebrow}
          heading={verifiability.heading}
          description={verifiability.body}
        />

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {verifiability.pillars.map((pillar, idx) => {
            const Icon = ICONS[idx] ?? FileCheck;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-white/20"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl"
                  style={{
                    background:
                      idx === 0
                        ? 'radial-gradient(circle, rgb(var(--solar-gold-rgb) / 0.6), transparent)'
                        : idx === 1
                          ? 'radial-gradient(circle, rgb(var(--aurora-cyan-rgb) / 0.6), transparent)'
                          : 'radial-gradient(circle, rgb(var(--nebula-violet-rgb) / 0.6), transparent)',
                  }}
                />
                <Icon className="h-8 w-8 text-white/80" aria-hidden />
                <h3
                  className="mt-6 text-xl font-semibold text-white sm:text-2xl"
                  style={{ fontFamily: 'var(--font-family-display)' }}
                >
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                  {pillar.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
