'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import { landingContent } from '@/content/landing';

import { SectionHeading } from './SectionHeading';

const { publicGoods } = landingContent;

export function PublicGoods() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#031810] py-28 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 0%, rgb(var(--impact-green-rgb) / 0.18) 0%, transparent 65%), radial-gradient(60% 60% at 100% 60%, rgb(var(--aurora-cyan-rgb) / 0.12) 0%, transparent 70%)',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, transparent 30%, rgb(var(--impact-green-rgb) / 0.04) 50%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
          <SectionHeading
            eyebrow={publicGoods.eyebrow}
            heading={publicGoods.heading}
            description={publicGoods.body}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl border border-[oklch(77.1%_0.163_161)]/20 p-8 glow-impact sm:p-10"
            style={{
              background:
                'linear-gradient(155deg, rgba(0, 214, 143, 0.08) 0%, rgba(0, 229, 255, 0.06) 45%, rgba(13, 5, 33, 0.9) 100%)',
            }}
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[oklch(77.1%_0.163_161)]">
                Cycle Allocation
              </p>
              <p
                className="mt-4 text-7xl font-semibold text-gradient-aurora sm:text-8xl"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                7%
              </p>
              <p className="mt-4 text-lg text-white/80">
                of every Performance Cycle is forwarded to Protocol Guild.
              </p>
            </div>

            <div className="relative mt-8 space-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
              <div className="flex items-center justify-between">
                <span>Protocol Guild contributors</span>
                <span className="font-mono text-white/90">170+</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Enforcement</span>
                <span className="font-mono text-white/90">on-chain</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recipient</span>
                <span className="font-mono text-white/90">pg.eth</span>
              </div>
            </div>

            <Link
              href={publicGoods.cta.href}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-[oklch(77.1%_0.163_161)]/40 bg-[oklch(77.1%_0.163_161)]/10 px-6 py-3 text-sm font-medium text-[oklch(77.1%_0.163_161)] transition hover:bg-[oklch(77.1%_0.163_161)]/20"
              rel="noopener"
              target="_blank"
            >
              {publicGoods.cta.label}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>

        <div className="relative mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60 backdrop-blur sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            Disclaimer
          </p>
          <p className="mt-2 leading-relaxed">{publicGoods.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
