import * as React from 'react';

import { cn } from '@/lib/utils';

type GradientVariant = 'signature' | 'nebula' | 'aurora';

const VARIANT_CLASS: Record<GradientVariant, string> = {
  signature: 'text-gradient-signature',
  nebula: 'text-gradient-nebula',
  aurora: 'text-gradient-aurora',
};

export interface GradientTextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  variant?: GradientVariant;
  /** Rendered element — defaults to `span`. Use `h1`/`h2` when heading. */
  as?: React.ElementType;
}

export function GradientText({
  variant = 'signature',
  className,
  as: Component = 'span',
  ...props
}: GradientTextProps) {
  return React.createElement(Component, {
    className: cn(VARIANT_CLASS[variant], className),
    ...props,
  });
}
