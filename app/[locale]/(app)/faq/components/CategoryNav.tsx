'use client';

import { useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useStickyClearance } from '@/hooks/useStickyClearance';
import { cn } from '@/lib/utils';
import { ScrollRail } from '@/components/ui/scroll-rail';

/** A destination in the contents: a category, or the glossary at the end. */
export interface CategoryNavEntry {
  id: string;
  label: string;
  /** Questions in the category; omitted for the glossary. */
  count?: number;
  /** Shown beside the label in the desktop rail. */
  icon: LucideIcon;
}

interface CategoryNavProps {
  entries: readonly CategoryNavEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

/** The fragment id of a contents entry. */
export const categoryAnchor = (id: string) => `faq-category-${id}`;

/**
 * The FAQ's contents: in-page links to each category and the glossary, the
 * one being read marked with `aria-current="location"`. One list in two
 * shapes. Below `lg` it is a row of chips stuck under the site header, which
 * starts at the left edge, scrolls sideways with an edge fade while more
 * chips are hidden that way, and keeps the current chip in view. From `lg`
 * it is the left column of a documentation layout: one entry per line with
 * its count, stuck below the header. Render it as a direct child of the
 * page's tall layout container so both shapes can stick.
 */
export function CategoryNav({ entries, activeId, onSelect, className }: CategoryNavProps) {
  const t = useTranslations('faq');
  const navRef = useRef<HTMLElement>(null);
  // Below `lg` the chips bar covers the top of the page: focus stops below it.
  // From `lg` it is a side column, which covers nothing above the content.
  useStickyClearance(navRef, { media: '(max-width: 1023.98px)' });

  return (
    <nav
      ref={navRef}
      aria-label={t('navigation.ariaLabel')}
      className={cn(
        // Phones and tablets: a glass bar under the header, bleeding across the
        // page gutter (--gutter, which widens with the viewport) to the screen's
        // edges, so nothing scrolls visibly beside it. z-30 is the layer scale's
        // sticky-nav step (styles/global.css): the theme's `--z-*` tokens generate
        // no `z-*` utility, and without a z-index a positioned control scrolling
        // under the bar (a Button) paints over it.
        'glass sticky top-[var(--header-height)] z-30 -mx-[var(--gutter)] border-b border-rule px-[var(--gutter)] py-2',
        // Desktop: the contents column.
        'lg:top-[var(--sticky-offset)] lg:mx-0 lg:max-h-[calc(100dvh-var(--sticky-offset)-1.5rem)] lg:self-start lg:overflow-y-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none',
        className,
      )}
    >
      <p className="mb-3 hidden type-eyebrow text-subtle lg:block">{t('navigation.heading')}</p>
      <ScrollRail
        activeSelector='[aria-current="location"]'
        trackClassName="gap-2 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-l lg:border-rule"
      >
        {entries.map((entry) => {
          const current = entry.id === activeId;
          const Icon = entry.icon;
          return (
            <a
              key={entry.id}
              href={`#${categoryAnchor(entry.id)}`}
              aria-current={current ? 'location' : undefined}
              onClick={(event) => {
                event.preventDefault();
                onSelect(entry.id);
              }}
              className={cn(
                // Chips take the control radius: the pill is the live status's shape.
                'group flex min-h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-control border px-3.5 type-body-sm transition-colors duration-fast',
                'lg:-ml-px lg:min-h-10 lg:whitespace-normal lg:rounded-none lg:border-0 lg:border-l-2 lg:py-2 lg:pl-3.5 lg:pr-2',
                current
                  ? 'border-primary/50 bg-primary/12 text-foreground lg:border-primary lg:bg-transparent'
                  : 'border-rule text-muted-foreground hover:border-input hover:text-foreground lg:border-transparent lg:hover:border-rule',
              )}
            >
              <Icon
                aria-hidden
                className={cn(
                  'hidden size-4 shrink-0 lg:block',
                  current ? 'text-primary' : 'text-subtle',
                )}
              />
              <span className="min-w-0 lg:flex-1">{entry.label}</span>
              {entry.count !== undefined ? (
                <span className="type-caption tabular-nums text-subtle">{entry.count}</span>
              ) : null}
            </a>
          );
        })}
      </ScrollRail>
    </nav>
  );
}
