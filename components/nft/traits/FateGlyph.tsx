'use client';

import { ArrowUpRight, Infinity as InfinityIcon, Orbit } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { camelTraitKey, useTraitLabels } from './useTraitLabels';

/** Props for {@link FateGlyph}. */
export interface FateGlyphProps {
  /** Wire fate value (`"Eternal Dance"`, `"Ejection"`); renders nothing when absent. */
  value?: string;
  size?: 'sm' | 'md';
  /** Render the localized fate next to the glyph. */
  withLabel?: boolean;
  className?: string;
}

/** Each fate's glyph, in its Collection DNA series colour (the data tokens). */
const fateStyles: Record<string, { Icon: typeof Orbit; className: string }> = {
  eternalDance: { Icon: InfinityIcon, className: 'text-data-5' },
  ejection: { Icon: ArrowUpRight, className: 'text-data-4' },
};

/**
 * FateGlyph — how the simulation ends: a bound eternal dance (∞) or an
 * ejection (↗), with the localized name in a tooltip or inline label.
 */
export function FateGlyph({ value, size = 'sm', withLabel = false, className }: FateGlyphProps) {
  const t = useTranslations('traits');
  const { valueLabel } = useTraitLabels();
  if (!value) return null;
  const fate = fateStyles[camelTraitKey(value)] ?? {
    Icon: Orbit,
    className: 'text-muted-foreground',
  };
  const label = valueLabel('fate', value);
  const iconClass = size === 'sm' ? 'size-3' : 'size-4';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          className={cn(
            'inline-flex cursor-help items-center gap-1.5',
            // md takes the surrounding text size, like the other trait values.
            size === 'sm' && 'type-caption',
            className,
          )}
          aria-label={t('card.fateAria', { value: label })}
          data-testid="fate-glyph"
        >
          <fate.Icon aria-hidden className={cn(iconClass, fate.className)} />
          {withLabel ? <span aria-hidden>{label}</span> : null}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{t('hints.fate')}</p>
      </TooltipContent>
    </Tooltip>
  );
}
