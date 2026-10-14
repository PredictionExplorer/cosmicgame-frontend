import { normalizeLocale } from '@/i18n/locale';
import { getPathname } from '@/i18n/navigation';

/** Stable names used in artwork links, independent of the media server's filenames. */
export type InkView = 'image' | 'short' | 'medium' | 'slow';

export const INK_VIEW_PARAM = 'ink';

/** Unknown values never select or load an asset. Links use exact, lowercase names. */
export function parseInkView(value: string | null): InkView | null {
  return value === 'image' || value === 'short' || value === 'medium' || value === 'slow'
    ? value
    : null;
}

/** A shareable artwork link excludes the current page's filters, tracking and fragment. */
export function inkViewHref(tokenId: number, locale: string, view: InkView): string {
  return `${getPathname({ locale: normalizeLocale(locale), href: `/detail/${tokenId}` })}?${INK_VIEW_PARAM}=${view}`;
}
