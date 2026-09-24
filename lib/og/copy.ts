import enSeo from '@/messages/en/seo.json';
import jaSeo from '@/messages/ja/seo.json';
import koSeo from '@/messages/ko/seo.json';
import ukSeo from '@/messages/uk/seo.json';
import viSeo from '@/messages/vi/seo.json';
import zhSeo from '@/messages/zh/seo.json';
import zhHkSeo from '@/messages/zh-HK/seo.json';
import zhTwSeo from '@/messages/zh-TW/seo.json';

import { normalizeLocale, type AppLocale, type LocaleRecord } from '@/i18n/locale';

/** Share-card routes with their own copy in `messages/<locale>/seo.json` → `og`. */
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
  'token',
] as const;

export type OgRoute = (typeof OG_ROUTES)[number];
export type OgLocale = AppLocale;

/**
 * One route's card copy. `*WithValue` / `altWithTraits` are templates with
 * `{name}` placeholders (`fillOgTemplate`); the plain forms are the fallback
 * when the value cannot be read.
 */
export interface OgRouteCopy {
  /** Image alt text (`og:image:alt`, `twitter:image:alt`); never rendered. */
  alt: string;
  altWithValue?: string;
  altWithTraits?: string;
  /** Small uppercase label above the title; brand cards have none. */
  eyebrow?: string;
  title: string;
  titleWithValue?: string;
  subhead: string;
  /** One line of protocol facts at the foot of a text card. */
  fact?: string;
}

export interface OgGestureMethods {
  eth: string;
  ethRandomWalk: string;
  cst: string;
}

/**
 * A token card's alt text is composed from parts, each used only when it can
 * be read: the subject (`altSubject` or, with the owner's name,
 * `altSubjectNamed`), placed in its cycle (`altInCycle`), then described by
 * its traits (`altWithTraits`) or generically (`alt`), both of which take
 * `{subject}`.
 */
export interface OgTokenAltCopy {
  /** `{subject}: {structure} structure, {palette} palette` */
  altWithTraits: string;
  /** `Cosmic Signature #{id}` */
  altSubject: string;
  /** `{name}, Cosmic Signature #{id}` */
  altSubjectNamed: string;
  /** `{subject} from Cycle {cycle}` */
  altInCycle: string;
}

export interface OgCatalog extends Record<OgRoute, OgRouteCopy> {
  shared: {
    /** `Cycle {cycle}` */
    cycle: string;
    /** A plate's wall label: `{name} · {cycle}` (the locale's own separator). */
    plateCaption: string;
  };
  gesture: OgRouteCopy & { methods: OgGestureMethods };
  token: OgRouteCopy & OgTokenAltCopy;
}

// `satisfies` compiles every locale's JSON against the catalog shape, so a
// missing key or an extra route fails the type check before it ships.
const catalogs = {
  en: enSeo.og,
  zh: zhSeo.og,
  'zh-TW': zhTwSeo.og,
  'zh-HK': zhHkSeo.og,
  uk: ukSeo.og,
  ko: koSeo.og,
  ja: jaSeo.og,
  vi: viSeo.og,
} satisfies LocaleRecord<OgCatalog>;

export function resolveOgLocale(locale: string | undefined): OgLocale {
  return normalizeLocale(locale);
}

/** The whole share-card catalog of a locale. */
export function getOgCatalog(locale: string | undefined): OgCatalog {
  return catalogs[resolveOgLocale(locale)];
}

export function getOgCopy(locale: string | undefined, route: OgRoute): OgRouteCopy {
  return getOgCatalog(locale)[route];
}

/** `Gesture #{position} · Cycle {cycle}` + values → `Gesture #1139 · Cycle 2`. */
export function fillOgTemplate(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in values ? String(values[name]) : placeholder,
  );
}

/** The localized cycle label: `Cycle 2`, `第 2 个周期`, `サイクル2`. */
export function formatOgCycle(locale: string | undefined, cycle: number): string {
  return fillOgTemplate(getOgCatalog(locale).shared.cycle, { cycle });
}
