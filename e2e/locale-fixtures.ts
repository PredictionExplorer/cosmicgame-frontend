/**
 * Locale lists and pinned chrome strings shared by the e2e suites.
 *
 * The locale codes come straight from the routing contract so a new language
 * shows up in every locale-parametrized spec the moment it is registered;
 * `scripts/__tests__/locale-e2e-fixtures.test.ts` asserts that each
 * translated locale also has its chrome fixture here.
 */
import { routing, TRANSLATED_LOCALES } from '../i18n/routing';

import { ROUTE_FIXTURES } from './locale-route-inventory';
import { ZH_ROUTE_INVENTORY } from './zh-route-inventory';

export { routing, TRANSLATED_LOCALES };

/** URL prefixes for every locale: '' for the default, '/zh', '/uk', … */
export const LOCALE_PREFIXES: readonly string[] = routing.locales.map((locale) =>
  locale === routing.defaultLocale ? '' : `/${locale}`,
);

/** Strings the shared chrome renders in each translated locale (nav, footer, switcher). */
export interface LocaleChromeFixture {
  /** Regex matching at least one character of the language's script. */
  readonly script: RegExp;
  /** Accessible name of the language switcher trigger in this locale. */
  readonly switcherLabel: string;
  /** Own-language label shown for this locale inside the switcher menu. */
  readonly switcherOption: string;
  /** Footer legal link labels. */
  readonly footer: { readonly terms: string; readonly privacy: string };
  /** Primary navigation labels (desktop rail / mobile drawer). */
  readonly nav: {
    readonly primaryLabel: string;
    readonly openMenu: string;
    readonly gallery: string;
    readonly explore: string;
    readonly help: string;
    readonly aboutPattern: RegExp;
  };
  /** Site-map page heading and one section label. */
  readonly siteMap: { readonly heading: string; readonly title: string; readonly section: string };
  /** 404 heading pattern and the home-link label. */
  readonly notFound: { readonly headingPattern: RegExp; readonly homeLink: string };
  /** Skip link accessible name. */
  readonly skipLink: string;
  /** Landing page h1 as served under the locale prefix. */
  readonly landingH1: string;
  /** Substring of the landing hero that proves the landing body is translated. */
  readonly landingText: string;
}

type TranslatedLocale = (typeof TRANSLATED_LOCALES)[number];

const { cycle, tokenId, contributionId } = ROUTE_FIXTURES;

/**
 * Route id → text the rendered body must contain, per translated locale
 * (the full-site QA runner in ./locale-site-qa.ts). The zh column is the
 * Sprint 8 inventory itself; later locales add a table here.
 */
export const LOCALE_ROUTE_TEXT: Record<TranslatedLocale, Readonly<Record<string, string>>> = {
  zh: Object.fromEntries(ZH_ROUTE_INVENTORY.map((route) => [route.id, route.expectedText])),
  uk: {
    'app-not-found': '404 — Сторінку не знайдено',
    'site-map': 'Мапа сайту',
    'landing-home': 'процедурне ончейн-мистецтво',
    about: 'Про Cosmic Signature',
    learn: 'Дізнайтеся, як працює Cosmic Signature',
    'learn-article': 'Що таке Cosmic Signature?',
    'white-paper': 'Процедурний протокол ончейн-мистецтва на Arbitrum',
    'quiz-hub': 'Наскільки добре ви знаєте Cosmic Signature?',
    'quiz-tier': 'Двадцять п’ять запитань про основи',
    'app-home': 'Жести формують мистецтво',
    'experimental-ui': 'Обсерваторія Cosmic Signature',
    'current-cycle': 'Усього жестів',
    gallery: 'Галерея NFT',
    detail: 'Закарбовано',
    'gesture-detail': 'Деталі жесту',
    'how-it-works': 'Як це працює',
    allocation: 'Отримувачі розподілів',
    'allocation-detail': `Цикл ${cycle}`,
    'allocation-finalized': 'Забрані розподіли',
    anchoring: 'Надходження за закріплення',
    'anchor-action': 'Дія закріплення',
    'my-allocations': 'Мої розподіли',
    'my-anchors': 'Мої закріплення',
    'my-statistics': 'Моя статистика',
    'my-tokens': 'Мої NFT',
    'transfer-cst': 'Переказати CST',
    'signature-transfer-history': 'Передачі Cosmic Signature NFT',
    'cst-transfer-history': 'Перекази токена CST Cosmic Signature',
    'token-distributions': `Деталі надходжень за закріплення для токена ${tokenId}`,
    statistics: 'Статистика протоколу Cosmic Signature',
    'statistics-activity': 'Статистика активності жестів',
    'statistics-anchoring': 'Статистика закріплення',
    'statistics-participation': 'Статистика участі',
    'statistics-performance': 'Статистика показників учасників',
    'statistics-tokens': 'Статистика токенів',
    'recipient-history': 'Моя історія розподілів',
    'named-nfts': 'Іменовані Cosmic Signature NFT',
    'attached-nfts': 'Долучені NFT-внески',
    'used-rwlk-nfts': 'Використані RandomWalk NFT',
    user: 'Профіль користувача',
    'user-stellar-eth': 'ETH зоряного відбору, розподілений цьому учаснику',
    'user-stellar-nft': 'NFT зоряного відбору, розподілені цьому учаснику',
    'system-event': `Системна конфігурація, встановлена перед циклом ${cycle}`,
    faq: 'Поширені запитання',
    terms: 'Умови використання',
    privacy: 'Політика конфіденційності',
    'risk-disclosures': 'Розкриття ризиків',
    security: 'Безпека',
    audits: 'Аудити',
    imprint: 'Закарбувати RandomWalk NFT',
    contracts: 'Контракти Cosmic Signature',
    code: 'Вихідний код Cosmic Signature',
    'source-code-alias': 'Вихідний код Cosmic Signature',
    'eth-contribution': 'Внески ETH',
    'eth-contribution-detail': 'Деталі прямого внеску ETH',
    'eth-contribution-cycle': `Прямі внески ETH у циклі ${contributionId}`,
    'public-goods-cg': 'Внески протоколу в суспільні блага',
    'public-goods-voluntary': 'Добровільні внески в суспільні блага',
    'public-goods-retrievals': 'Забрані кошти суспільних благ',
    outreach: 'розповідаєте про Cosmic Signature',
    'outreach-address': 'Винагороди за просування для учасника',
    'coordination-changes': 'Зміни координації',
    admin: 'Адміністрування',
    'admin-settings': 'Адміністративні методи',
    'internal-outreach-transfer': 'Переказ CST на просування',
    'endurance-embed': 'У цьому циклі лідерства ще не було',
  },
};

/** Raw-HTML SEO expectations per translated locale (e2e/seo-raw-html.spec.ts). */
export interface LocaleSeoFixture {
  /** schema.org `inLanguage` emitted in JSON-LD (i18n/localeConfig.ts). */
  readonly inLanguage: string;
  /** `og:locale` value. */
  readonly ogLocale: string;
  /** Landing-host pages: path → h1 that must appear in the server HTML. */
  readonly landingPages: ReadonlyArray<{ readonly path: string; readonly h1: string }>;
  /** App-host public-data pages: path → SEO summary text that must appear in the server HTML. */
  readonly appSummaries: ReadonlyArray<{ readonly path: string; readonly summary: string }>;
}

export const LOCALE_SEO: Record<TranslatedLocale, LocaleSeoFixture> = {
  zh: {
    inLanguage: 'zh-Hans',
    ogLocale: 'zh_CN',
    landingPages: [
      { path: '/zh', h1: 'Cosmic Signature：程序化链上艺术' },
      { path: '/zh/about', h1: '关于 Cosmic Signature' },
      { path: '/zh/learn', h1: '了解 Cosmic Signature' },
      { path: '/zh/learn/what-is-cosmic-signature', h1: '什么是 Cosmic Signature？' },
    ],
    appSummaries: [
      { path: '/zh/statistics', summary: 'Cosmic Signature 协议统计' },
      { path: '/zh/gallery', summary: '确定性 NFT 艺术' },
      { path: '/zh/anchoring', summary: '锚定派发' },
      { path: '/zh/allocation', summary: '分配历史' },
      { path: '/zh/eth-contribution', summary: '直接 ETH 贡献' },
    ],
  },
  uk: {
    inLanguage: 'uk',
    ogLocale: 'uk_UA',
    landingPages: [
      { path: '/uk', h1: 'Cosmic Signature: процедурне ончейн-мистецтво на Arbitrum' },
      { path: '/uk/about', h1: 'Про Cosmic Signature' },
      { path: '/uk/learn', h1: 'Дізнайтеся, як працює Cosmic Signature' },
      { path: '/uk/learn/what-is-cosmic-signature', h1: 'Що таке Cosmic Signature?' },
    ],
    appSummaries: [
      { path: '/uk/statistics', summary: 'Статистика протоколу Cosmic Signature' },
      { path: '/uk/gallery', summary: 'Детерміноване NFT-мистецтво' },
      { path: '/uk/anchoring', summary: 'Надходження за закріплення' },
      { path: '/uk/allocation', summary: 'Отримувачі розподілів' },
      { path: '/uk/eth-contribution', summary: 'Прямі внески ETH' },
    ],
  },
};

export const LOCALE_CHROME: Record<TranslatedLocale, LocaleChromeFixture> = {
  zh: {
    script: /[\u3400-\u9fff]/,
    switcherLabel: '语言',
    switcherOption: '中文',
    footer: { terms: '服务条款', privacy: '隐私政策' },
    nav: {
      primaryLabel: '主导航',
      openMenu: '打开菜单',
      gallery: '画廊',
      explore: '探索',
      help: '帮助',
      aboutPattern: /关于 Cosmic Signature/,
    },
    siteMap: { heading: '网站地图', title: '网站地图 · Cosmic Signature', section: '个人工具' },
    notFound: { headingPattern: /404：找不到页面/, homeLink: '返回首页' },
    skipLink: '跳至主要内容',
    landingH1: 'Cosmic Signature：程序化链上艺术',
    landingText: '程序化链上艺术',
  },
  uk: {
    script: /[\u0400-\u04ff]/,
    switcherLabel: 'Мова',
    switcherOption: 'Українська',
    footer: { terms: 'Умови', privacy: 'Конфіденційність' },
    nav: {
      primaryLabel: 'Основна навігація',
      openMenu: 'Меню',
      gallery: 'Галерея',
      explore: 'Огляд',
      help: 'Довідка',
      aboutPattern: /Про Cosmic Signature/,
    },
    siteMap: {
      heading: 'Мапа сайту',
      title: 'Мапа сайту | Cosmic Signature',
      section: 'Персональні інструменти застосунку',
    },
    notFound: { headingPattern: /404 — Сторінку не знайдено/, homeLink: 'На головну' },
    skipLink: 'Перейти до основного вмісту',
    landingH1: 'Cosmic Signature: процедурне ончейн-мистецтво на Arbitrum',
    landingText: 'процедурне ончейн-мистецтво',
  },
};
