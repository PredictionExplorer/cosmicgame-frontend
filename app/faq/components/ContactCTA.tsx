'use client';

import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20.317 4.369A19.791 19.791 0 0 0 16.558 3.2a.074.074 0 0 0-.079.037c-.34.6-.716 1.38-.979 1.994a18.27 18.27 0 0 0-5 0 12.64 12.64 0 0 0-.987-1.994.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-3.76 1.17.07.07 0 0 0-.032.027C2.533 8.045 1.862 11.607 2.202 15.125a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.2 14.2 0 0 0 1.226-1.994.076.076 0 0 0-.041-.105 13.104 13.104 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .079.009c.12.099.245.198.372.292a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.04.106c.36.698.773 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-4.108-.838-7.638-3.548-10.79a.061.061 0 0 0-.031-.028ZM8.02 13.041c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.42 2.157-2.42 1.21 0 2.175 1.096 2.156 2.42 0 1.333-.946 2.419-2.156 2.419Z" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function ContactCTA() {
  return (
    <motion.section
      aria-labelledby="contact-heading"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="pt-8 pb-4"
    >
      <div className="gradient-border-card relative overflow-hidden rounded-2xl bg-white/[0.02] p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />

        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 id="contact-heading" className="font-display text-xl font-bold tracking-tight">
              Still have a question?
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Our community is always happy to help.
              Reach out on any of these channels and we&apos;ll get back to you as soon as possible.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <a
                href="https://x.com/RandomWalkNFT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary/[0.06]"
              >
                <XIcon className="h-4 w-4" />
                Twitter / X
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </a>
              <a
                href="https://discord.gg/bGnPn96Qwt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-accent/30 hover:bg-accent/[0.06]"
              >
                <DiscordIcon className="h-4 w-4" />
                Discord
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
