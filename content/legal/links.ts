import { ABOUT_RESOURCE_HREFS } from '@/content/about/types';
import { CODE_REPOSITORIES } from '@/content/code/structure';

/**
 * The verifiable artifacts the Trust Center documents point at, once, for
 * every locale. Legal copy names one inline with a tag around the words that
 * link (`Confirm the address on the <contracts>contracts page</contracts>.`),
 * and `RichText` (components/legal/RichText) renders the tag as the link, so
 * a translation moves the words and never the URL.
 *
 * `app`: a locale-aware route on this host. `landing`: a path on the
 * marketing host, localized there. `external`: a new tab, with an arrow and
 * a screen-reader note. `email`: a mail link. `file`: a plain file this host
 * serves (security.txt).
 */
export type LegalLinkKind = 'app' | 'landing' | 'external' | 'email' | 'file';

export interface LegalLinkTarget {
  readonly kind: LegalLinkKind;
  readonly href: string;
}

const repository = (id: (typeof CODE_REPOSITORIES)[number]['id']): string =>
  CODE_REPOSITORIES.find((repo) => repo.id === id)?.href ?? ABOUT_RESOURCE_HREFS.github;

const FRONTEND_REPOSITORY = repository('frontend');
const CONTRACTS_REPOSITORY = repository('contracts');

/** The published Hacken report on the Cosmic Signature contracts. */
export const HACKEN_REPORT_URL =
  'https://hacken.io/audits/cosmic-signature/sca-cosmic-signature-cosmicsignature-contracts-oct2025/';

/** The public contact the project publishes (About → Official resources). */
export const SUPPORT_EMAIL = 'support@cosmicsignature.com';

/** A file's change history on the public frontend repository's default branch. */
export function frontendFileHistory(path: string): string {
  return `${FRONTEND_REPOSITORY}/commits/main/${path}`;
}

/** A directory of the contracts repository's default branch. */
export function contractsRepositoryPath(path: string): string {
  return `${CONTRACTS_REPOSITORY}/tree/main/${path}`;
}

export const LEGAL_LINKS = {
  // Trust Center and verification pages on this host.
  contracts: { kind: 'app', href: '/contracts' },
  code: { kind: 'app', href: '/code' },
  security: { kind: 'app', href: '/security' },
  securityOfficial: { kind: 'app', href: '/security#official' },
  audits: { kind: 'app', href: '/audits' },
  risk: { kind: 'app', href: '/risk-disclosures' },
  terms: { kind: 'app', href: '/terms' },
  privacy: { kind: 'app', href: '/privacy' },
  privacyServices: { kind: 'app', href: '/privacy#services' },
  privacyStorage: { kind: 'app', href: '/privacy#storage' },
  // Terms clauses the risk disclosures point at.
  termsMechanics: { kind: 'app', href: '/terms#mechanics' },
  termsCalibration: { kind: 'app', href: '/terms#mechanics-cst-window' },
  termsRandomWalk: { kind: 'app', href: '/terms#mechanics-random-walk' },
  termsRetrieval: { kind: 'app', href: '/terms#allocations-retrieval' },
  termsNoGuarantee: { kind: 'app', href: '/terms#allocations-no-guarantee' },
  termsEligibility: { kind: 'app', href: '/terms#eligibility' },
  termsRisks: { kind: 'app', href: '/terms#risks' },
  // Explanations on the marketing host.
  // lexicon-allow-start: the denial article's slug names the categories it denies.
  notALottery: { kind: 'landing', href: '/learn/not-a-lottery-not-an-investment' },
  // lexicon-allow-end
  // Evidence published elsewhere.
  explorer: { kind: 'external', href: 'https://arbiscan.io' },
  sourcify: { kind: 'external', href: 'https://sourcify.dev' },
  hacken: { kind: 'external', href: HACKEN_REPORT_URL },
  contractsRepository: { kind: 'external', href: CONTRACTS_REPOSITORY },
  frontendRepository: { kind: 'external', href: FRONTEND_REPOSITORY },
  github: { kind: 'external', href: ABOUT_RESOURCE_HREFS.github },
  license: { kind: 'external', href: `${FRONTEND_REPOSITORY}/blob/main/LICENSE` },
  notices: { kind: 'external', href: `${FRONTEND_REPOSITORY}/blob/main/THIRD_PARTY_NOTICES.md` },
  certora: { kind: 'external', href: contractsRepositoryPath('certora') },
  smtchecker: { kind: 'external', href: contractsRepositoryPath('smtchecker') },
  slither: { kind: 'external', href: contractsRepositoryPath('slither') },
  tests: { kind: 'external', href: contractsRepositoryPath('test') },
  discord: { kind: 'external', href: ABOUT_RESOURCE_HREFS.discord },
  x: { kind: 'external', href: ABOUT_RESOURCE_HREFS.x },
  privacyHistory: {
    kind: 'external',
    href: frontendFileHistory('content/legal/PrivacyContent.en.ts'),
  },
  support: { kind: 'email', href: `mailto:${SUPPORT_EMAIL}` },
  securityTxt: { kind: 'file', href: '/.well-known/security.txt' },
} as const satisfies Record<string, LegalLinkTarget>;

export type LegalLinkId = keyof typeof LEGAL_LINKS;

export function isLegalLinkId(value: string): value is LegalLinkId {
  return Object.prototype.hasOwnProperty.call(LEGAL_LINKS, value);
}
