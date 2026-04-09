'use client';

import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { faXTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
                <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4" />
                Twitter / X
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </a>
              <a
                href="https://discord.gg/bGnPn96Qwt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-accent/30 hover:bg-accent/[0.06]"
              >
                <FontAwesomeIcon icon={faDiscord} className="h-4 w-4" />
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
