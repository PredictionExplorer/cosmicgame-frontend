'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import {
  getEcosystemDestinations,
  type EcosystemAccent,
  type EcosystemDestination,
} from '@/config/ecosystem';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const ACCENT_ICON: Record<EcosystemAccent, string> = {
  cyan: 'text-primary/80 group-hover/seg:text-primary',
  violet: 'text-accent/80 group-hover/seg:text-accent',
  gold: 'text-[rgb(var(--solar-gold-rgb)/0.8)] group-hover/seg:text-[rgb(var(--solar-gold-rgb))]',
};

const ACCENT_HOVER_BG: Record<EcosystemAccent, string> = {
  cyan: 'hover:bg-primary/[0.09]',
  violet: 'hover:bg-accent/[0.09]',
  gold: 'hover:bg-[rgb(var(--solar-gold-rgb)/0.09)]',
};

function DockSegment({ destination }: { destination: EcosystemDestination }) {
  const Icon = destination.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={destination.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={destination.ariaLabel}
          data-destination={destination.id}
          className={cn(
            'group/seg flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium leading-none text-white/70 no-underline transition-colors duration-[var(--duration-fast)] hover:text-white',
            ACCENT_HOVER_BG[destination.accent],
          )}
        >
          <Icon
            className={cn(
              'h-3.5 w-3.5 shrink-0 transition-colors duration-[var(--duration-fast)]',
              ACCENT_ICON[destination.accent],
            )}
            aria-hidden
          />
          {destination.name}
        </a>
      </TooltipTrigger>
      <TooltipContent sideOffset={10} className="max-w-[220px] text-center text-xs">
        {destination.tagline}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * The ecosystem dock groups the three external Cosmic Signature surfaces
 * (Uniswap CST trading, the Axiom Zero NFT marketplace, and the Chaos Zero
 * prediction market) into one cohesive segmented control in the header.
 */
export function EcosystemDock({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const destinations = getEcosystemDestinations(t);

  return (
    <div
      role="group"
      aria-label={t('ecosystem.groupLabel')}
      className={cn(
        'flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] backdrop-blur-md',
        className,
      )}
    >
      {destinations.map((destination, i) => (
        <Fragment key={destination.id}>
          {i > 0 ? (
            <span className="mx-0.5 h-3.5 w-px shrink-0 bg-white/[0.08]" aria-hidden />
          ) : null}
          <DockSegment destination={destination} />
        </Fragment>
      ))}
    </div>
  );
}
