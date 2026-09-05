'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function CallToAction({
  callToAction,
}: {
  callToAction: HowItWorksContent['callToAction'];
}) {
  return (
    <motion.section
      aria-labelledby="cta-heading"
      className="pt-8 sm:pt-10"
      variants={fadeUp}
      initial={false}
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="gradient-border-card relative overflow-hidden rounded-2xl bg-white/[0.02] px-6 py-12 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />

        <h2 id="cta-heading" className="type-display-sm">
          {callToAction.heading}
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">{callToAction.body}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href={callToAction.primaryCta.href}>{callToAction.primaryCta.label}</Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <a
            href={callToAction.discordCta.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 transition-colors hover:text-primary',
              TOUCH_TARGET_TEXT_LINK_CLASS,
            )}
          >
            <MessageCircle className="h-4 w-4" />
            {callToAction.discordCta.label}
          </a>
          <a
            href={callToAction.twitterCta.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 transition-colors hover:text-primary',
              TOUCH_TARGET_TEXT_LINK_CLASS,
            )}
          >
            <XIcon className="h-4 w-4" />
            {callToAction.twitterCta.label}
          </a>
        </div>
      </div>
    </motion.section>
  );
}
