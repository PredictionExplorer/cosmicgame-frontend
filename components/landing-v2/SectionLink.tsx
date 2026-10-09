'use client';

import type { MouseEvent, ReactNode } from 'react';

import { jumpToSection } from '@/lib/jumpToSection';

/** A click the browser should handle itself: a new tab, a new window, a download. */
export function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/**
 * Follows an in-page `#section` link the way the browser's own fragment jump
 * would for every reader: scrolls to the section, writes the fragment, and
 * moves keyboard focus to its heading (lib/jumpToSection), so the next Tab
 * and a screen reader continue from there instead of from the link. Returns
 * whether it handled the click; a modified click or a missing section is
 * left to the browser.
 */
export function followSectionLink(event: MouseEvent<HTMLAnchorElement>, id: string): boolean {
  if (isModifiedClick(event)) return false;
  if (!document.getElementById(id)) return false;
  event.preventDefault();
  return jumpToSection(id);
}

export interface SectionLinkProps {
  /** The id of a section on this page. */
  section: string;
  className?: string;
  children: ReactNode;
}

/** A link to a section on this page that takes keyboard focus there with the view. */
export function SectionLink({ section, className, children }: SectionLinkProps) {
  return (
    <a
      href={`#${section}`}
      className={className}
      onClick={(event) => followSectionLink(event, section)}
    >
      {children}
    </a>
  );
}
