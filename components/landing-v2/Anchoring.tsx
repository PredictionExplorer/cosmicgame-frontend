'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { Link } from '@/i18n/navigation';
import { localizeCrossHostHref } from '@/lib/hostRouting';

import { SectionHeading } from './SectionHeading';

export function Anchoring({ anchoring }: { anchoring: LandingContent['anchoring'] }) {
  const locale = useLocale();

  return (
    <section className="relative border-t border-border bg-card py-16 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square w-full max-w-md overflow-hidden rounded-full border border-border bg-foreground/[0.02] mx-auto"
        >
          <div
            aria-hidden
            className="absolute inset-[12%] rounded-full border border-border animate-orbit-slow"
          />
          <div
            aria-hidden
            className="absolute inset-[28%] rounded-full border border-border"
            style={{ animation: 'orbit-slow 90s linear infinite reverse' }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-primary to-secondary opacity-40 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/20 bg-foreground/5 text-foreground backdrop-blur"
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
            className="absolute left-[8%] top-[44%] h-3 w-3 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
          />
          <div
            aria-hidden
            className="absolute right-[14%] top-[20%] h-2.5 w-2.5 rounded-full bg-secondary shadow-[0_0_18px_hsl(var(--secondary)/0.6)]"
          />
          <div
            aria-hidden
            className="absolute bottom-[18%] right-[30%] h-2 w-2 rounded-full bg-primary/70 shadow-[0_0_14px_hsl(var(--primary)/0.4)]"
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
              <li key={bullet} className="flex items-start gap-3 text-base text-foreground/80">
                <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
          <Link
            href={localizeCrossHostHref(anchoring.cta.href, locale)}
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-foreground/5 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-foreground/10"
          >
            {anchoring.cta.label}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
