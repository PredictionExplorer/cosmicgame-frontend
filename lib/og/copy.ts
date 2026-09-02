import enSeo from '@/messages/en/seo.json';
import zhSeo from '@/messages/zh/seo.json';

import { normalizeLocale, type AppLocale, type LocaleRecord } from '@/i18n/locale';

import { COSMIC_OG_SIZE } from './CosmicOgCard';

export const OG_ROUTES = [
  'default',
  'gallery',
  'currentCycle',
  'anchoring',
  'faq',
  'howItWorks',
  'gesture',
  'allocation',
  'participant',
] as const;

export type OgRoute = (typeof OG_ROUTES)[number];
export type OgLocale = AppLocale;

export interface OgCopy {
  alt: string;
  eyebrow: string;
  eyebrowWithValue?: string;
  title: string;
  subhead: string;
  chips: string[];
}

const catalogs = {
  en: enSeo.og,
  zh: zhSeo.og,
} as unknown as LocaleRecord<Record<OgRoute, OgCopy>>;

export function resolveOgLocale(locale: string | undefined): OgLocale {
  return normalizeLocale(locale);
}

export function getOgCopy(locale: string | undefined, route: OgRoute): OgCopy {
  return catalogs[resolveOgLocale(locale)][route];
}

export function formatOgEyebrow(copy: OgCopy, value: string | number | null): string {
  if (value === null || value === '' || !copy.eyebrowWithValue) return copy.eyebrow;
  return copy.eyebrowWithValue.replace('{value}', String(value));
}

export function getOgImageMetadata(locale: string | undefined, route: OgRoute) {
  const copy = getOgCopy(locale, route);
  return [
    {
      id: 'default',
      alt: copy.alt,
      size: COSMIC_OG_SIZE,
      contentType: 'image/png',
    },
  ];
}
