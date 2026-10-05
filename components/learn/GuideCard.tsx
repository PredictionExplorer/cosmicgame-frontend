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
  /**
   * "4 min read", or `null` below the shared threshold
   * (components/learn/guides `MIN_READING_MINUTES_SHOWN`): the card then has
   * no foot at all rather than an empty one.
   */
  readingTime: string | null;
  /** The card title's heading level in the page outline. */
  titleAs?: 'h3' | 'p';
  className?: string;
}

const ARROW_CLASS =
  'size-4 shrink-0 text-subtle transition-[color,transform] duration-fast group-hover:text-primary motion-safe:group-hover:translate-x-0.5';

/**
 * A guide on the Learn hub's reading path, the whole entry one link. On
 * phones it is a row between hairlines — number, title, one line, arrow —
 * so eleven guides read as a list, not five screens of boxes; from `sm` it
 * is a card with the guide's glyph, and its reading time when that says
 * something.
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
        'group grid h-full grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-x-3 border-b border-rule-faint py-4 transition-colors duration-fast',
        'sm:flex sm:flex-col sm:rounded-surface sm:border sm:border-rule sm:bg-surface sm:p-6 sm:hover:border-input sm:hover:bg-surface-raised',
        className,
      )}
    >
      <span className="flex items-center justify-between gap-4 pt-1 sm:w-full sm:pt-0">
        <span aria-hidden className="flex items-center gap-3 type-label tabular-nums text-subtle">
          {String(number).padStart(2, '0')}
          <Icon
            aria-hidden
            className="size-4 transition-colors duration-fast group-hover:text-primary max-sm:hidden"
          />
        </span>
        <ArrowRight aria-hidden className={cn(ARROW_CLASS, 'max-sm:hidden')} />
      </span>
      <span className="min-w-0 sm:mt-5 sm:flex sm:flex-1 sm:flex-col">
        <Title className="type-title text-foreground group-hover:text-primary sm:type-heading-3 sm:group-hover:text-foreground">
          {title}
        </Title>
        <span className="mt-1 block type-body-sm text-muted-foreground sm:mt-2 sm:flex-1">
          {description}
        </span>
        {readingTime ? (
          <span className="mt-4 block type-caption tabular-nums text-subtle max-sm:hidden">
            {readingTime}
          </span>
        ) : null}
      </span>
      <ArrowRight aria-hidden className={cn(ARROW_CLASS, 'mt-1 sm:hidden')} />
    </Link>
  );
}
