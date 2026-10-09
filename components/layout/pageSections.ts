import { SITE_SECTION_HUBS, SITE_SECTION_IDS, type SiteSectionId } from '@/config/siteNav';

/**
 * The site's sections, for page wayfinding: the navigation taxonomy
 * (`config/siteNav.ts`) plus `admin`, the operator tools, which the public
 * navigation does not list.
 *
 * Every app page belongs to one section. `PageHeader` names it above the H1 —
 * as the eyebrow on a top-level page, as the first crumb after Home on a
 * record page — and links it to the section's hub, so every page is one click
 * from the place it belongs to. The ids, hubs and labels (`nav.sections`) are
 * the navigation's own, so the header, the menus, the site map and every page
 * header name a page's section the same way.
 */
export type PageSectionId = SiteSectionId | 'admin';

export const PAGE_SECTIONS: Readonly<Record<PageSectionId, { readonly hub: string }>> = {
  ...(Object.fromEntries(
    SITE_SECTION_IDS.map((id) => [id, { hub: SITE_SECTION_HUBS[id] }]),
  ) as Record<SiteSectionId, { readonly hub: string }>),
  admin: { hub: '/admin' },
};
