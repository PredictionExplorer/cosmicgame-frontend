import { ArrowRight, Atom, Blocks, CircleHelp, Images, ShieldCheck, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { LearnSlug } from '@/content/learn';

import { Link } from '@/i18n/navigation';
import {
  AnchoringIcon,
  CosmicCouncilIcon,
  CycleIcon,
  GestureIcon,
  PublicGoodsIcon,
} from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';

/**
 * One glyph per guide. Guides about a coined concept use that concept's
 * icon (lib/conceptIcons), so the Cycle, gestures, the Council, anchoring and
 * Public Goods look the same here as everywhere else on the site.
 */
export const GUIDE_ICONS: Readonly<Record<LearnSlug, LucideIcon>> = {
  'what-is-cosmic-signature': Sparkles,
  'how-the-performance-cycle-works': CycleIcon,
  'how-gestures-work': GestureIcon,
  'three-body-nft-art': Atom,
  'cosmic-signature-on-arbitrum': Blocks,
  'contracts-security-verification': ShieldCheck,
  'cst-token-and-cosmic-council': CosmicCouncilIcon,
  'anchoring-nfts': AnchoringIcon,
  'protocol-guild-public-goods': PublicGoodsIcon,
  'collecting-and-trading-cosmic-signature': Images,
  'not-a-lottery-not-an-investment': CircleHelp,
};

export interface GuideCardProps {
  slug: LearnSlug;
  /** The guide's place on the reading path, from 1. */
  number: number;
  title: string;
  description: string;
  /** "4 min read", or `null` for a guide too short for the figure to help. */
  readingTime: string | null;
  /** The card title's heading level in the page outline. */
  titleAs?: 'h3' | 'p';
  className?: string;
}

/**
 * A guide on the Learn hub's reading path: its number, glyph, short title,
 * one-line description and reading time, the whole card one link.
 */
export function GuideCard({
  slug,
  number,
  title,
  description,
  readingTime,
  titleAs: Title = 'h3',
  className,
}: GuideCardProps) {
  const Icon = GUIDE_ICONS[slug];
  return (
    <Link
      href={`/learn/${slug}`}
      className={cn(
        'group flex h-full flex-col rounded-surface border border-rule bg-surface p-5 transition-colors duration-fast hover:border-input hover:bg-surface-raised sm:p-6',
        className,
      )}
    >
      <span className="flex items-center justify-between gap-4">
        <span aria-hidden className="type-label tabular-nums text-subtle">
          {String(number).padStart(2, '0')}
        </span>
        <Icon
          aria-hidden
          className="size-4 text-subtle transition-colors duration-fast group-hover:text-primary"
        />
      </span>
      <Title className="mt-5 type-heading-3 text-foreground">{title}</Title>
      <span className="mt-2 flex-1 type-body-sm text-muted-foreground">{description}</span>
      <span className="mt-5 flex items-center justify-between gap-4 border-t border-rule-faint pt-4 type-caption tabular-nums text-subtle">
        <span>{readingTime}</span>
        <ArrowRight
          aria-hidden
          className="size-4 text-subtle transition-[color,transform] duration-fast group-hover:text-primary motion-safe:group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
