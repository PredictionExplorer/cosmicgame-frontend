import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import styles from './Landing.module.css';

interface SectionHeadingProps {
  eyebrow: string;
  heading: ReactNode;
  /** The H2's id, for the section's `aria-labelledby`. */
  headingId: string;
  description?: ReactNode;
  /** `display` for a section that leads with its heading, `compact` beside another section. */
  size?: 'display' | 'compact';
  className?: string;
}

/**
 * A landing section's heading: the eyebrow (once per section), the H2 in the
 * display face, and an optional one-paragraph lede held to the lede measure.
 */
export function SectionHeading({
  eyebrow,
  heading,
  headingId,
  description,
  size = 'display',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-[48rem]', className)}>
      <p className="type-eyebrow text-subtle">{eyebrow}</p>
      <h2
        id={headingId}
        className={cn('mt-4', size === 'display' ? 'type-display-md' : 'type-display-sm')}
      >
        {heading}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-5 text-muted-foreground',
            size === 'display' ? 'type-lede' : 'type-body-md max-w-[var(--measure-lede)]',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

interface LandingSectionProps {
  /** The in-page anchor (`#art`, `#cycle`, `#tracks`, `#faq`). */
  id?: string;
  /** The heading that names the section. */
  labelledBy: string;
  children: ReactNode;
  className?: string;
}

/**
 * One chapter of the landing: a hairline above, the section gap around, and
 * the site's content edge. Sections sit on the page's own ground; only the
 * art plates and one group per section ever draw a box.
 */
export function LandingSection({ id, labelledBy, children, className }: LandingSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('scroll-mt-16 border-t border-rule-faint py-[var(--section-gap)]', className)}
    >
      <div className="site-container">{children}</div>
    </section>
  );
}

/**
 * Two short sections side by side under one hairline (the Council beside
 * Verifiability): each keeps its own heading and landmark.
 */
export function LandingPair({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-rule-faint py-[var(--section-gap)]">
      <div className={cn('site-container', styles.pair)}>{children}</div>
    </div>
  );
}
