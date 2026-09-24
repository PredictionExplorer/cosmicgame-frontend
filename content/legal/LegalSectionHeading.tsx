import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * The one section heading of the Trust Center documents (security, audits,
 * risk disclosures, terms, privacy): the long-form H2 tier in Clash, with an
 * optional icon. Renders no hooks, so both the server trust pages and the
 * client legal pages use it.
 */
export function LegalSectionHeading({
  icon: Icon,
  className,
  children,
}: {
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <h2 className={cn('flex items-center gap-3 type-section text-foreground', className)}>
      {Icon ? <Icon aria-hidden className="size-6 shrink-0 text-primary" /> : null}
      <span className="min-w-0">{children}</span>
    </h2>
  );
}
