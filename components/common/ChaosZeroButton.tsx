import type { AnchorHTMLAttributes } from 'react';
import { TrendingUpDown } from 'lucide-react';

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

const LABELS: Record<ChaosZeroButtonVariant, string> = {
  default: 'Make Predictions on Chaos Zero',
  secondary: 'Make Predictions on Chaos Zero',
  compact: 'Chaos Zero',
  menu: 'Chaos Zero Predictions',
  card: 'Chaos Zero',
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
  'aria-label': ariaLabel = 'Make predictions on Chaos Zero',
  ...props
}: ChaosZeroButtonProps) {
  const text = label ?? LABELS[variant];

  if (variant === 'menu') {
    return (
      <a
        href={CHAOS_ZERO_PREDICTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
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
        aria-label={ariaLabel}
        {...props}
      >
        {text}
        <TrendingUpDown className="h-4 w-4" aria-hidden />
      </a>
    </Button>
  );
}
