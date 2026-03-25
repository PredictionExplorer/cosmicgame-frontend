'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function MarketingCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      aria-labelledby="cta-heading"
      className="gradient-border-card rounded-2xl bg-white/[0.02] px-8 py-16 text-center sm:px-16"
    >
      <h2 id="cta-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Ready to Start Earning?
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
        Join our marketing program and earn CST rewards for promoting Cosmic Signature to the world.
      </p>
      <div className="mt-8 inline-flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="lg">
              <a href="mailto:marketing@cosmicsignature.com">
                Contact Marketing Team
                <ExternalLink className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Reach out to discuss promotional opportunities and reward structures
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Info about contacting the marketing team"
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            Our team will help you get started with promotional materials and discuss reward tiers
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.section>
  );
}
