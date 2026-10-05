'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { spectralClassColor, toSpectralClass } from './palette';
import { useTraitLabels } from './useTraitLabels';

/** Props for {@link SpectralClassBadge}. */
export interface SpectralClassBadgeProps {
  /** Wire spectral class (`"B"`); renders nothing when absent or unknown. */
  value?: string | null;
  /** `sm` sets caption type; `md` takes the surrounding text size; `lg` body type. */
  size?: 'sm' | 'md' | 'lg';
  /** Name the class ("Class B") instead of showing the letter alone. */
  withLabel?: boolean;
  className?: string;
}

const sizes: Record<NonNullable<SpectralClassBadgeProps['size']>, string> = {
  sm: 'type-caption',
  md: '',
  lg: 'type-body-md',
};

/**
 * SpectralClassBadge — the dominant body's stellar class as a value: a dot
 * in its colour on the O (blue) → M (red) sequence, then the letter or the
 * localized class name, with the colour description in a tooltip. It reads
 * as text beside the other trait values: no pill, no glow.
 */
export function SpectralClassBadge({
  value,
  size = 'md',
  withLabel = false,
  className,
}: SpectralClassBadgeProps) {
  const t = useTranslations('traits');
  const { valueLabel, spectralTone } = useTraitLabels();
  const spectralClass = toSpectralClass(value);
  if (!spectralClass) return null;
  const label = valueLabel('spectralClass', spectralClass);
  const tone = spectralTone(spectralClass);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          className={cn('inline-flex cursor-help items-center gap-1.5', sizes[size], className)}
          aria-label={t('card.spectralAria', { value: spectralClass })}
          data-testid="spectral-class-badge"
        >
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: spectralClassColor(spectralClass) }}
          />
          <span aria-hidden>{withLabel ? label : spectralClass}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="font-medium">{label}</p>
        {tone ? <p className="text-muted-foreground">{tone}</p> : null}
      </TooltipContent>
    </Tooltip>
  );
}
