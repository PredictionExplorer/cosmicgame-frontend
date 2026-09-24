/**
 * Lets any surface open the header's command palette (the 404 page, an
 * empty state) without importing it: the header listens for this event.
 */
export const OPEN_SITE_SEARCH_EVENT = 'cosmic-signature:open-search';

export function requestSiteSearch(): void {
  window.dispatchEvent(new Event(OPEN_SITE_SEARCH_EVENT));
}
