'use client';

import { Gem } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { RarityInfo } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { toIntlLocale } from '@/utils/format';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  return 'border-white/[0.08] bg-black/40 text-white/75';
}

/**
 * RarityRankChip — the token's rarity rank across the collection (1 = rarest),
 * with the rarest trait spelled out in the tooltip.
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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          className={cn(
            'inline-flex items-center gap-1 rounded-md border font-mono tabular-nums backdrop-blur-sm cursor-help',
            size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
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
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[260px]">
        <p>
          {rarestText
            ? t('rarity.tooltip', { rank, total: totalText, trait: rarestText })
            : t('rarity.tooltipNoTrait', { rank, total: totalText })}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
