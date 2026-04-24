import type { ReactNode } from 'react';

type Variant = 'signature' | 'nebula' | 'aurora';

const CLASS_MAP: Record<Variant, string> = {
  signature: 'text-gradient-signature',
  nebula: 'text-gradient-nebula',
  aurora: 'text-gradient-aurora',
};

export function GradientText({
  children,
  variant = 'signature',
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return <span className={`${CLASS_MAP[variant]} ${className ?? ''}`.trim()}>{children}</span>;
}
