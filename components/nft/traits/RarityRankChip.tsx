'use client';

import { Gem } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { RarityInfo } from '@/lib/nftMetadata';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import { toIntlLocale } from '@/utils/format';
import { ExplainPopover } from '@/components/ui/explain-popover';

import { useTraitLabels } from './useTraitLabels';

/** Props for {@link RarityRankChip}. */
export interface RarityRankChipProps {
  /** Rarity of this token; renders nothing when the token is unranked. */
  rarity?: RarityInfo | null;
  /** Number of ranked tokens in the collection. */
  total: number;
  size?: 'sm' | 'md';
  /** Render "Rank n of N" instead of the bare `#n`. */
  verbose?: boolean;
  className?: string;
}

/** Tier styling: the top decile glows gold, the top quartile violet, the rest stays quiet. */
function tierClass(rank: number, total: number): string {
  if (total <= 0) return '';
  const percentile = rank / total;
  if (percentile <= 0.1) {
    return 'border-[rgb(var(--solar-gold-rgb)/0.35)] bg-[rgb(var(--solar-gold-rgb)/0.12)] text-[rgb(var(--solar-gold-rgb))]';
  }
  if (percentile <= 0.25) {
    return 'border-[rgb(var(--nebula-violet-rgb)/0.35)] bg-[rgb(var(--nebula-violet-rgb)/0.14)] text-[#C77DFF]';
  }
  return 'border-rule bg-art-ground/40 text-muted-foreground';
}

/**
 * RarityRankChip — the token's rarity rank across the collection (1 = rarest),
 * with the rarest trait spelled out in a toggletip.
 */
export function RarityRankChip({
  rarity,
  total,
  size = 'sm',
  verbose = false,
  className,
}: RarityRankChipProps) {
  const t = useTranslations('traits');
  const locale = useLocale();
  const { valueLabel, typeLabel } = useTraitLabels();
  if (!rarity || total <= 0) return null;

  const intl = toIntlLocale(locale);
  const rank = rarity.rank.toLocaleString(intl);
  const totalText = total.toLocaleString(intl);
  const rarestText = rarity.rarest
    ? `${typeLabel(rarity.rarest.key)} · ${valueLabel(rarity.rarest.key, rarity.rarest.value)}`
    : null;

  // The chip is its own toggletip: hovering shows the rarest trait, and a
  // click, tap, Enter or Space pins it, so keyboard and touch readers get
  // the same sentence as a mouse.
  return (
    <ExplainPopover
      title={t('rarity.rankLabel')}
      definition={
        rarestText
          ? t('rarity.tooltip', { rank, total: totalText, trait: rarestText })
          : t('rarity.tooltipNoTrait', { rank, total: totalText })
      }
      side="bottom"
      maxWidth={260}
    >
      <button
        type="button"
        data-touch-target="extended"
        className={cn(
          TOUCH_TARGET_EXTENDED_CLASS,
          'inline-flex cursor-help items-center gap-1 rounded-md border font-mono tabular-nums backdrop-blur-sm',
          size === 'sm' ? 'px-1.5 py-0.5 type-caption' : 'min-h-6 px-2 py-1 text-xs',
          tierClass(rarity.rank, total),
          className,
        )}
        aria-label={t('rarity.rankOf', { rank, total: totalText })}
        data-testid="rarity-rank-chip"
      >
        <Gem aria-hidden className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
        <span aria-hidden>
          {verbose ? t('rarity.rankOf', { rank, total: totalText }) : t('rarity.rank', { rank })}
        </span>
      </button>
    </ExplainPopover>
  );
}
