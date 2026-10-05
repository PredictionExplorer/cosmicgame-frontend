import type { ReactNode } from 'react';

import { AmbientBackdrop } from '@/components/ui/ambient-backdrop';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';

export interface ReadingMainProps {
  children: ReactNode;
  /** Classes for the content column inside the site container. */
  className?: string;
}

/**
 * The `<main>` of a landing reading page (About, Learn, the white paper, the
 * quiz): the calm 40% atmosphere behind the site container, the skip link's
 * target, and the rhythm below the sticky landing header. The landing header
 * and footer sit outside it as top-level landmarks.
 */
export function ReadingMain({ children, className }: ReadingMainProps) {
  return (
    <main id="main" tabIndex={-1} className="relative">
      <AmbientBackdrop variant="subtle" />
      <Container className={cn('pb-20 pt-8 sm:pb-24 sm:pt-12 lg:pb-28 lg:pt-14', className)}>
        {children}
      </Container>
    </main>
  );
}
