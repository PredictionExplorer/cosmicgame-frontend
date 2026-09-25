'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface LegalContentsItem {
  id: string;
  label: string;
  /** The section's number in a numbered document ("3."), shown before its label. */
  number?: string;
}

/**
 * The section the reader is in: the last one whose heading has passed a line
 * a third of the way down the viewport (below the sticky header). Before the
 * first heading nothing is current; at the very bottom the last section is,
 * even when it is too short to reach the line.
 */
export function currentSectionId(
  sections: readonly { id: string; top: number }[],
  viewportHeight: number,
  atBottom: boolean,
): string | null {
  if (sections.length === 0) return null;
  if (atBottom) return sections.at(-1)?.id ?? null;
  const line = viewportHeight / 3;
  let current: string | null = null;
  for (const section of sections) {
    if (section.top <= line) current = section.id;
    else break;
  }
  return current;
}

/**
 * The document's contents as a sticky rail beside the text (from `lg`), with
 * the section in view marked `aria-current="location"` and a link back to
 * the top (the document's title, `topId`: `#main` belongs to the skip link).
 * Phones get the server-rendered "On this page" disclosure instead.
 */
export function LegalContentsRail({
  items,
  title,
  backToTop,
  topId,
}: {
  items: readonly LegalContentsItem[];
  title: string;
  backToTop: string;
  /** The id "Back to top" returns to: the H1. */
  topId: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const sections = items.flatMap(({ id }) => {
        const element = document.getElementById(id);
        return element ? [{ id, top: element.getBoundingClientRect().top }] : [];
      });
      const root = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 2;
      setActive(currentSectionId(sections, window.innerHeight, atBottom));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [items]);

  return (
    <nav aria-labelledby="legal-contents-rail-title" className="hidden lg:block">
      <div className="sticky top-[calc(var(--sticky-offset)+1.5rem)]">
        <p id="legal-contents-rail-title" className="type-label text-muted-foreground">
          {title}
        </p>
        <ol className="mt-4 border-s border-rule">
          {items.map(({ id, label, number }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={active === id ? 'location' : undefined}
                className={cn(
                  'focus-ring-inset -ms-px flex items-baseline gap-2 border-s-2 py-1.5 ps-4 type-body-sm transition-colors duration-[var(--duration-fast)]',
                  active === id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-input hover:text-foreground',
                )}
              >
                {/* The space keeps "3. Allocations" one phrase for assistive tech; the gap draws it. */}
                {number ? (
                  <span className="shrink-0 tabular-nums text-subtle">{`${number} `}</span>
                ) : null}
                {label}
              </a>
            </li>
          ))}
        </ol>
        <a
          href={`#${topId}`}
          className="mt-6 inline-flex min-h-6 items-center gap-1.5 type-label text-subtle transition-colors duration-[var(--duration-fast)] hover:text-foreground"
        >
          <ArrowUp aria-hidden className="size-3.5" />
          {backToTop}
        </a>
      </div>
    </nav>
  );
}
