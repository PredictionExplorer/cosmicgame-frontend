'use client';

import { useEffect, useState, type RefObject } from 'react';

import { cn } from '@/lib/utils';

import { GalleryFiltersButton } from './GalleryFiltersButton';

interface GalleryFloatingFiltersProps {
  /** The in-page toolbar: the pill appears once it has scrolled away. */
  toolbarRef: RefObject<HTMLElement | null>;
  /** The results: the pill shows only while they are on screen. */
  resultsRef: RefObject<HTMLElement | null>;
  activeCount: number;
  onOpen: () => void;
}

/**
 * The phone's one floating control: a 44px "Filters" pill at the bottom of
 * the screen, within the thumb's reach, shown only while the grid is on
 * screen and the toolbar has scrolled away. Nothing is pinned to the top on
 * a phone, so the art keeps the screen (hidden from `lg`, where the toolbar
 * itself stays under the header).
 */
export function GalleryFloatingFilters({
  toolbarRef,
  resultsRef,
  activeCount,
  onOpen,
}: GalleryFloatingFiltersProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    const results = resultsRef.current;
    if (!toolbar || !results || typeof IntersectionObserver === 'undefined') return;
    let toolbarInView = true;
    let resultsInView = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === toolbar) toolbarInView = entry.isIntersecting;
          else resultsInView = entry.isIntersecting;
        }
        setVisible(!toolbarInView && resultsInView);
      },
      // The fixed header covers the top of the viewport.
      { rootMargin: '-72px 0px 0px 0px' },
    );
    observer.observe(toolbar);
    observer.observe(results);
    return () => observer.disconnect();
  }, [toolbarRef, resultsRef]);

  if (!visible) return null;
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center lg:hidden',
        'pointer-events-none motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-[var(--duration-base)]',
      )}
      data-testid="floating-filters"
    >
      <GalleryFiltersButton
        activeCount={activeCount}
        onClick={onOpen}
        className="pointer-events-auto rounded-pill border-input glass px-5 shadow-float"
        data-testid="floating-filters-button"
      />
    </div>
  );
}
