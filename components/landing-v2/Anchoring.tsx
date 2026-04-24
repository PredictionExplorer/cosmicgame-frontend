'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';

import { landingContent } from '@/content/landing';

import { SectionHeading } from './SectionHeading';

const { anchoring } = landingContent;

export function Anchoring() {
  return (
    <section className="relative border-t border-white/10 bg-[#0D0521] py-28 sm:py-40">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square w-full max-w-md overflow-hidden rounded-full border border-white/10 bg-white/[0.02] mx-auto"
        >
          <div
            aria-hidden
            className="absolute inset-[12%] rounded-full border border-white/10 animate-orbit-slow"
          />
          <div
            aria-hidden
            className="absolute inset-[28%] rounded-full border border-white/10"
            style={{ animation: 'orbit-slow 90s linear infinite reverse' }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[oklch(84.7%_0.149_213)] to-[oklch(50.4%_0.247_296)] opacity-60 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="22" x2="12" y2="8" />
              <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
            </svg>
          </div>
          <div
            aria-hidden
            className="absolute left-[8%] top-[44%] h-3 w-3 rounded-full bg-[oklch(84.7%_0.149_213)] shadow-[0_0_20px_rgb(0_229_255/0.8)]"
          />
          <div
            aria-hidden
            className="absolute right-[14%] top-[20%] h-2.5 w-2.5 rounded-full bg-[oklch(50.4%_0.247_296)] shadow-[0_0_18px_rgb(108_60_225/0.8)]"
          />
          <div
            aria-hidden
            className="absolute bottom-[18%] right-[30%] h-2 w-2 rounded-full bg-[oklch(67.2%_0.228_4)] shadow-[0_0_14px_rgb(255_61_138/0.7)]"
          />
        </motion.div>

        <div>
          <SectionHeading
            eyebrow={anchoring.eyebrow}
            heading={anchoring.heading}
            description={anchoring.body}
          />
          <ul className="mt-10 space-y-4">
            {anchoring.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-base text-white/80">
                <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full border border-[oklch(84.7%_0.149_213)]/40 bg-[oklch(84.7%_0.149_213)]/10 text-[oklch(84.7%_0.149_213)]">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
          <Link
            href={anchoring.cta.href}
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
          >
            {anchoring.cta.label}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
