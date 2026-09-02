'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { hueStripGradient } from './palette';

/** Props for {@link HueStrip}. */
export interface HueStripProps {
  /** Base hue of each body in degrees; renders nothing when absent. */
  hues?: readonly number[];
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const heights: Record<NonNullable<HueStripProps['size']>, string> = {
  xs: 'h-[3px]',
  sm: 'h-1',
  md: 'h-1.5',
};

/**
 * HueStrip — a thin banded gradient showing the base hue of each of the three
 * bodies, the token's own colour signature. Renders nothing without hues.
 */
export function HueStrip({ hues, size = 'sm', className }: HueStripProps) {
  const t = useTranslations('traits');
  const gradient = hueStripGradient(hues);
  if (!gradient) return null;
  return (
    <span
      role="img"
      aria-label={t('card.hueStripAria')}
      data-testid="hue-strip"
      className={cn('block w-full rounded-full', heights[size], className)}
      style={{ backgroundImage: gradient }}
    />
  );
}
