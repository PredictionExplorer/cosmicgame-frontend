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
  size?: 'sm' | 'md' | 'lg';
  /** Render the localized class label next to the letter. */
  withLabel?: boolean;
  className?: string;
}

const sizes: Record<NonNullable<SpectralClassBadgeProps['size']>, string> = {
  sm: 'h-5 min-w-5 px-1 text-[10px]',
  md: 'h-6 min-w-6 px-1.5 text-xs',
  lg: 'h-8 min-w-8 px-2 text-sm',
};

/**
 * SpectralClassBadge — the dominant body's stellar class letter, tinted on
 * the O (blue) → M (red) sequence, with the colour description in a tooltip.
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
  const color = spectralClassColor(spectralClass);
  const label = valueLabel('spectralClass', spectralClass);
  const tone = spectralTone(spectralClass);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          className={cn(
            'inline-flex items-center justify-center gap-1 rounded-full border font-mono font-semibold tracking-wide backdrop-blur-sm cursor-help',
            sizes[size],
            className,
          )}
          style={{
            color,
            borderColor: `${color}55`,
            backgroundColor: `${color}1f`,
            boxShadow: `0 0 12px ${color}33`,
          }}
          aria-label={t('card.spectralAria', { value: spectralClass })}
          data-testid="spectral-class-badge"
        >
          <span aria-hidden>{spectralClass}</span>
          {withLabel ? (
            <span aria-hidden className="font-sans font-medium normal-case tracking-normal">
              {label}
            </span>
          ) : null}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="font-medium">{label}</p>
        {tone ? <p className="text-muted-foreground">{tone}</p> : null}
      </TooltipContent>
    </Tooltip>
  );
}
