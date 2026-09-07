'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { Link } from '@/i18n/navigation';
import { localizeCrossHostHref } from '@/lib/hostRouting';

import { SectionHeading } from './SectionHeading';

export function PublicGoods({ publicGoods }: { publicGoods: LandingContent['publicGoods'] }) {
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden border-t border-border bg-background py-16 sm:py-24 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 0%, hsl(var(--primary) / 0.1) 0%, transparent 65%), radial-gradient(60% 60% at 100% 60%, hsl(var(--secondary) / 0.08) 0%, transparent 70%)',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, transparent 30%, hsl(var(--primary) / 0.04) 50%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
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
            className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl border border-primary/20 p-8 shadow-[0_24px_80px_-24px_hsl(var(--primary)/0.12)] sm:p-10"
            style={{
              background:
                'linear-gradient(155deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--secondary) / 0.04) 45%, hsl(var(--card)) 100%)',
            }}
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                {publicGoods.card.label}
              </p>
              <p
                className="mt-4 text-7xl font-semibold text-gradient-signature sm:text-8xl"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {publicGoods.card.percentage}
              </p>
              <p className="mt-4 text-lg text-foreground/80">{publicGoods.card.description}</p>
            </div>

            <div className="relative mt-8 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
              {publicGoods.card.tableRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span>{row.label}</span>
                  <span className="font-mono text-foreground/90">{row.value}</span>
                </div>
              ))}
            </div>

            <Link
              href={localizeCrossHostHref(publicGoods.cta.href, locale)}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-medium text-primary transition hover:bg-primary/20"
              rel="noopener"
              target="_blank"
            >
              {publicGoods.cta.label}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>

        <div className="relative mt-16 rounded-2xl border border-border bg-foreground/[0.02] p-6 text-sm text-muted-foreground backdrop-blur sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {publicGoods.disclaimerHeading}
          </p>
          <p className="mt-2 leading-relaxed">{publicGoods.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
