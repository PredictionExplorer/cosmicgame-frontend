'use client';

import { useEffect, useState } from 'react';

export interface ReadingPosition {
  /** The id of the last heading the reader has scrolled past, or null above the first. */
  activeId: string | null;
  /** How far through the article the reader is, from 0 to 1. */
  progress: number;
  /** Whether the anchor element (the in-flow contents) has scrolled away above. */
  pastAnchor: boolean;
}

const INITIAL: ReadingPosition = { activeId: null, progress: 0, pastAnchor: false };

/** Where the sticky header ends, read from the `--sticky-offset` token. */
function stickyOffset(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--sticky-offset');
  const probe = Number.parseFloat(value);
  if (!Number.isFinite(probe)) return 84;
  // The token is a calc() expression; resolve it through an element when it is not plain px.
  if (value.trim().endsWith('px')) return probe;
  const element = document.createElement('div');
  element.style.cssText = 'position:absolute;visibility:hidden;height:var(--sticky-offset)';
  document.body.append(element);
  const height = element.getBoundingClientRect().height;
  element.remove();
  return height || 84;
}

/**
 * Scroll-spy for a long read: which section heading the reader is on (the
 * last one above the upper quarter of the screen, clear of the sticky
 * header), the share of the article already read, and whether an anchor
 * element has scrolled away above. One passive scroll listener, batched to
 * the next frame; nothing runs while the page is still. (A jump past an
 * element never fires an IntersectionObserver, so the anchor is measured
 * here too.)
 */
export function useReadingPosition(
  ids: readonly string[],
  articleId: string,
  anchorId?: string,
): ReadingPosition {
  const [position, setPosition] = useState<ReadingPosition>(INITIAL);
  const key = ids.join('|');

  useEffect(() => {
    const targets = key.split('|');
    let frame = 0;
    let offset = stickyOffset();

    const measure = () => {
      frame = 0;
      const line = Math.max(offset + 16, window.innerHeight * 0.25);
      let activeId: string | null = null;
      for (const id of targets) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= line) activeId = id;
        else break;
      }
      const article = document.getElementById(articleId);
      let progress = 0;
      if (article) {
        const rect = article.getBoundingClientRect();
        const readable = rect.height - (window.innerHeight - offset);
        progress = readable <= 0 ? 1 : Math.min(1, Math.max(0, (offset - rect.top) / readable));
      }
      const anchor = anchorId ? document.getElementById(anchorId) : null;
      const pastAnchor = anchor ? anchor.getBoundingClientRect().bottom < offset : false;
      setPosition((previous) =>
        previous.activeId === activeId &&
        previous.pastAnchor === pastAnchor &&
        Math.abs(previous.progress - progress) < 0.002
          ? previous
          : { activeId, progress, pastAnchor },
      );
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    const onResize = () => {
      offset = stickyOffset();
      schedule();
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
    };
  }, [anchorId, articleId, key]);

  return position;
}
