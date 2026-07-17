'use client';

import type { AnchorHTMLAttributes } from 'react';
import { TrendingUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ChaosZeroButtonVariant = 'default' | 'secondary' | 'compact' | 'menu' | 'card';

interface ChaosZeroButtonProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children' | 'href' | 'rel' | 'target'
> {
  variant?: ChaosZeroButtonVariant;
  label?: string;
}

const LABEL_KEYS: Record<ChaosZeroButtonVariant, string> = {
  default: 'ecosystem.chaosZero.defaultLabel',
  secondary: 'ecosystem.chaosZero.defaultLabel',
  compact: 'ecosystem.chaosZero.shortLabel',
  menu: 'ecosystem.chaosZero.menuLabel',
  card: 'ecosystem.chaosZero.shortLabel',
};

const buttonClasses: Record<Exclude<ChaosZeroButtonVariant, 'menu'>, string> = {
  default: 'h-11 px-5',
  secondary: 'h-11 px-5 border-primary/35 bg-primary/[0.06]',
  compact: 'h-9 rounded-full px-3.5 text-xs',
  card: 'h-8 rounded-md px-2.5 text-xs',
};

export function ChaosZeroButton({
  variant = 'default',
  label,
  className,
  'aria-label': ariaLabel,
  ...props
}: ChaosZeroButtonProps) {
  const t = useTranslations('nav');
  const text = label ?? t(LABEL_KEYS[variant]);
  const resolvedAriaLabel = ariaLabel ?? t('ecosystem.chaosZero.ariaLabel');

  if (variant === 'menu') {
    return (
      <a
        href={CHAOS_ZERO_PREDICTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={resolvedAriaLabel}
        className={cn(
          'flex w-full items-center gap-2.5 px-2 py-1.5 text-sm text-white no-underline transition-colors hover:text-primary',
          className,
        )}
        {...props}
      >
        <TrendingUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        {text}
      </a>
    );
  }

  const buttonVariant = variant === 'default' ? 'default' : 'secondary';

  return (
    <Button
      asChild
      size={variant === 'card' || variant === 'compact' ? 'sm' : 'lg'}
      variant={buttonVariant}
      className={cn(buttonClasses[variant], className)}
    >
      <a
        href={CHAOS_ZERO_PREDICTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={resolvedAriaLabel}
        {...props}
      >
        {text}
        <TrendingUpDown className="h-4 w-4" aria-hidden />
      </a>
    </Button>
  );
}
