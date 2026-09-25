import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getAuditsCopy,
  getPrivacyCopy,
  getRiskCopy,
  getSecurityCopy,
  getTermsCopy,
} from '@/content/legal';
import { AuditsContent } from '@/content/legal/AuditsContent';
import { AUDIT_FINDINGS_TOTAL, HACKEN_AUDIT } from '@/content/legal/audit';
import type { LegalDocumentLabels } from '@/content/legal/labels';
import { LEGAL_LINKS } from '@/content/legal/links';
import {
  OFFICIAL_CONTRACTS,
  sourcifyContractUrl,
  type OfficialContractId,
} from '@/content/legal/officialAddresses';
import { PrivacyContent, privacyCopyForDeployment } from '@/content/legal/PrivacyContent';
import { activePrivacyServices, activePrivacyStorage } from '@/content/legal/privacyInventory';
import { RiskContent } from '@/content/legal/RiskContent';
import { SecurityContent, type ProtocolOwner } from '@/content/legal/SecurityContent';
import { TermsContent } from '@/content/legal/TermsContent';
import { TRUST_CENTER_TABS, TRUST_DOCUMENT_DATES } from '@/content/legal/trustCenter';
import { protocolFacts } from '@/content/protocol-facts';

import { routing } from '@/i18n/routing';
import { checksumAddress } from '@/utils/format';

import { render, screen, within } from '@/test-utils';

/** The Trust Center chrome as the pages read it on the server, from a locale's catalog. */
function labelsFor(locale: string): LegalDocumentLabels {
  const legal = JSON.parse(
    readFileSync(join(process.cwd(), 'messages', locale, 'legal.json'), 'utf8'),
  ) as { breadcrumbs: Record<string, string>; document: Record<string, string> };
  return {
    contents: legal.document.contents ?? '',
    backToTop: legal.document.backToTop ?? '',
    backToContents: legal.document.backToContents ?? '',
    sectionLink: (section) => (legal.document.sectionLink ?? '').replace('{section}', section),
    revisionHistory: legal.document.revisionHistory ?? '',
    tabs: Object.fromEntries(
      TRUST_CENTER_TABS.map(({ id }) => [id, legal.breadcrumbs[id] ?? id]),
    ) as LegalDocumentLabels['tabs'],
  };
}

/** The core contracts' names as the Security page reads them (the /contracts names). */
function contractNamesFor(locale: string): Record<OfficialContractId, string> {
  const contracts = JSON.parse(
    readFileSync(join(process.cwd(), 'messages', locale, 'contracts.json'), 'utf8'),
  ) as { entries: Record<string, { name: string }> };
  return Object.fromEntries(
    OFFICIAL_CONTRACTS.map(({ id }) => [id, contracts.entries[id]?.name ?? id]),
  ) as Record<OfficialContractId, string>;
}

/** A single-key owner, as the chain reported it when this was written. */
const OWNER_ADDRESS = checksumAddress('0x14c82ce4e5713e88c9462680e9c02bf4a3089871');
const OWNER: ProtocolOwner = { status: 'account', address: OWNER_ADDRESS, kind: 'singleKey' };

function securityPage(locale: string, owner: ProtocolOwner = OWNER) {
  return (
    <SecurityContent
      copy={getSecurityCopy(locale)}
      locale={locale}
      labels={labelsFor(locale)}
      contractNames={contractNamesFor(locale)}
      implementationNote="The current implementation behind the Cosmic Signature Protocol proxy contract"
      owner={owner}
    />
  );
}

/** Every Trust Center page, rendered from a locale's copy. */
const PAGES = {
  security: (locale: string) => securityPage(locale),
  audits: (locale: string) => (
    <AuditsContent copy={getAuditsCopy(locale)} locale={locale} labels={labelsFor(locale)} />
  ),
  risk: (locale: string) => (
    <RiskContent copy={getRiskCopy(locale)} locale={locale} labels={labelsFor(locale)} />
  ),
  terms: (locale: string) => (
    <TermsContent copy={getTermsCopy(locale)} locale={locale} labels={labelsFor(locale)} />
  ),
  privacy: (locale: string) => (
    <PrivacyContent copy={getPrivacyCopy(locale)} locale={locale} labels={labelsFor(locale)} />
  ),
} as const;

/** The visible text: explanation popovers keep a hidden copy of their definition. */
function visibleText(): string {
  const clone = document.body.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('[hidden], script, style').forEach((node) => node.remove());
  return clone.textContent ?? '';
}

describe('Trust Center template', () => {
  it.each(Object.entries(PAGES))(
    '%s: one H1, the Trust Center tabs and a dated header',
    (page, renderPage) => {
      render(renderPage('en'));
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      const tabs = screen.getByRole('navigation', { name: 'nav.sections.trust' });
      // The five documents and the two evidence pages (contracts, source code),
      // each named.
      const links = within(tabs).getAllByRole('link');
      expect(links).toHaveLength(7);
      for (const link of links) expect(link.textContent?.trim()).not.toBe('');
      expect(within(tabs).getByRole('link', { current: 'page' })).toBeInTheDocument();
      const date = TRUST_DOCUMENT_DATES[page as keyof typeof TRUST_DOCUMENT_DATES];
      expect(document.querySelector('time')).toHaveAttribute('datetime', date.date);
      expect(screen.getByRole('link', { name: /Revision history/ })).toHaveAttribute(
        'href',
        expect.stringContaining('/commits/main/content/legal/'),
      );
    },
  );

  it.each(Object.entries(PAGES))(
    '%s: every section is an anchor listed in the contents',
    (_page, renderPage) => {
      render(renderPage('en'));
      const sections = Array.from(document.querySelectorAll('main section[id]')).filter((section) =>
        section.querySelector(':scope > div > h2'),
      );
      expect(sections.length).toBeGreaterThan(2);
      const rail = screen.getByRole('navigation', { name: 'On this page' });
      for (const section of sections) {
        const heading = section.querySelector('h2');
        expect(section).toHaveAttribute('aria-labelledby', heading?.id);
        expect(
          within(rail).getByRole('link', { name: heading?.textContent ?? '' }),
        ).toHaveAttribute('href', `#${section.id}`);
        // The heading's own link names the section it points at.
        expect(
          within(section as HTMLElement).getByRole('link', {
            name: `Link to ${heading?.textContent}`,
          }),
        ).toHaveAttribute('href', `#${section.id}`);
      }
      // The phone disclosure carries the same links and is the "Back to contents" target.
      const disclosure = document.getElementById('contents');
      expect(disclosure?.tagName).toBe('DETAILS');
      expect(disclosure?.querySelectorAll('a')).toHaveLength(sections.length);
    },
  );

  // axe flagged the Terms acknowledgment, an <aside> inside a section, as a
  // complementary landmark that is not top level.
  it.each(Object.entries(PAGES))(
    '%s: callouts are notes, never landmarks nested in the document',
    (_page, renderPage) => {
      render(renderPage('en'));
      expect(document.querySelector('main aside, section aside')).toBeNull();
      expect(screen.queryAllByRole('complementary')).toHaveLength(0);
    },
  );

  it('marks the Terms warning and acknowledgment as notes', () => {
    render(PAGES.terms('en'));
    expect(screen.getAllByRole('note').length).toBeGreaterThanOrEqual(2);
  });

  it.each(routing.locales)('prints no markup and no untranslated link tag (%s)', (locale) => {
    for (const renderPage of Object.values(PAGES)) {
      const { unmount } = render(renderPage(locale));
      expect(visibleText()).not.toMatch(/[<>`]|\*\*/);
      unmount();
    }
  });
});

describe('Security', () => {
  it('lists the official websites, community accounts and core contracts with their evidence', () => {
    render(PAGES.security('en'));
    expect(
      screen.getByRole('button', { name: 'Copy app.cosmicsignature.com' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy cosmicsignature.com' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /@CosmicSignature/ })).toHaveAttribute(
      'href',
      'https://x.com/CosmicSignature',
    );
    const sourcifyLinks = screen
      .getAllByRole('link', { name: /Sourcify/ })
      .map((link) => link.getAttribute('href'));
    for (const { address } of OFFICIAL_CONTRACTS) {
      expect(sourcifyLinks).toContain(sourcifyContractUrl(address));
    }
    // The Sourcify match is stated once, with the day it was checked, not badged per row.
    expect(screen.queryByText('Exact match')).toBeNull();
    expect(
      screen.getByText(/exact match on Sourcify \(checked September 24, 2026\)/),
    ).toBeInTheDocument();
    // The whole address, never shortened on phones: the page asks for a character-by-character check.
    for (const { address } of OFFICIAL_CONTRACTS) {
      expect(screen.getByTitle(checksumAddress(address))).toHaveTextContent(
        checksumAddress(address),
      );
    }
  });

  it('states the Sourcify match under the contracts heading, before the rows it covers', () => {
    render(PAGES.security('en'));
    const note = document.querySelector('[data-sourcify-note]');
    const heading = screen.getByRole('heading', { name: 'Core contracts on Arbitrum One' });
    const firstRow = heading.parentElement?.querySelector('dl > div');
    expect(heading.compareDocumentPosition(note!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(note!.compareDocumentPosition(firstRow!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('gives the community handles a touch pad', () => {
    render(PAGES.security('en'));
    const handle = screen.getByRole('link', { name: /@CosmicSignature/ });
    expect(handle).toHaveAttribute('data-touch-target', 'extended');
    expect(handle.className).toMatch(/min-h-6/);
  });

  it('says where to report a vulnerability, what a report needs and what is in scope', () => {
    render(PAGES.security('en'));
    expect(screen.getByRole('link', { name: 'support@cosmicsignature.com' })).toHaveAttribute(
      'href',
      'mailto:support@cosmicsignature.com',
    );
    expect(screen.getByRole('link', { name: 'security.txt' })).toHaveAttribute(
      'href',
      '/.well-known/security.txt',
    );
    const report = document.getElementById('report') as HTMLElement;
    expect(within(report).getAllByRole('listitem')).toHaveLength(4);
    expect(within(report).getByRole('heading', { level: 3, name: 'Scope' })).toBeInTheDocument();
    expect(within(report).getByText('In scope')).toBeInTheDocument();
    expect(within(report).getByText('Not in scope')).toBeInTheDocument();
    expect(within(report).getByRole('link', { name: 'Official addresses' })).toHaveAttribute(
      'href',
      '/security#official',
    );
  });

  it('says who controls the protocol, what it can change and how it upgrades', () => {
    render(PAGES.security('en'));
    const controls = document.getElementById('controls') as HTMLElement;
    // Second, right after the official addresses.
    expect(controls.previousElementSibling?.id).toBe('official');
    expect(
      within(controls).getByRole('heading', { level: 2, name: 'Owner controls and upgrades' }),
    ).toBeInTheDocument();
    // The owner in full, with its explorer page and the kind of account it is.
    expect(within(controls).getByTitle(OWNER_ADDRESS)).toHaveTextContent(OWNER_ADDRESS);
    expect(within(controls).getByText(/^A single-key wallet/)).toBeInTheDocument();
    expect(within(controls).getByRole('link', { name: /Arbiscan/ })).toHaveAttribute(
      'href',
      expect.stringContaining(OWNER_ADDRESS),
    );
    for (const term of ['Between cycles', 'During a cycle', 'At any time', 'Upgrades']) {
      expect(within(controls).getByText(term)).toBeInTheDocument();
    }
    expect(within(controls).getByText(/UUPS proxy/)).toBeInTheDocument();
    expect(within(controls).getByRole('link', { name: 'coordination changes' })).toHaveAttribute(
      'href',
      '/coordination-changes',
    );
    // The implementation row says what it is.
    expect(
      screen.getByText(
        'The current implementation behind the Cosmic Signature Protocol proxy contract',
      ),
    ).toBeInTheDocument();
  });

  it('points at the contract on the explorer when the owner cannot be read', () => {
    render(securityPage('en', { status: 'unavailable' }));
    const controls = document.getElementById('controls') as HTMLElement;
    expect(within(controls).getByText(/The owner could not be read/)).toBeInTheDocument();
    expect(within(controls).getByRole('link', { name: /Arbiscan/ })).toHaveAttribute(
      'href',
      expect.stringContaining(protocolFacts.contractAddresses.proxy),
    );
  });

  it('says so when ownership has been renounced', () => {
    render(securityPage('en', { status: 'renounced' }));
    expect(screen.getByText(/Ownership has been renounced/)).toBeInTheDocument();
  });

  it.each(routing.locales)('%s: describes the same owner controls as English', (locale) => {
    const copy = getSecurityCopy(locale);
    const en = getSecurityCopy('en');
    expect(copy.controls.rows).toHaveLength(en.controls.rows.length);
    expect(copy.report.include).toHaveLength(en.report.include.length);
    expect(copy.report.scope).toHaveLength(en.report.scope.length);
  });
});

describe('Audits', () => {
  it('shows the audit at a glance, from the audit facts', () => {
    render(PAGES.audits('en'));
    const summary = screen.getByRole('region', { name: 'Audit at a glance' });
    const figure = (id: string) => summary.querySelector(`[data-figure="${id}"] dd`)?.textContent;
    expect(figure('findings')).toBe(String(AUDIT_FINDINGS_TOTAL));
    expect(figure('critical-high')).toBe('0');
    expect(figure('invariants')).toBe(
      `${HACKEN_AUDIT.invariants.held} of ${HACKEN_AUDIT.invariants.tested}`,
    );
    expect(figure('runs')).toBe('10,000');
    expect(within(summary).getByRole('link', { name: /Read the Hacken report/ })).toHaveAttribute(
      'href',
      HACKEN_AUDIT.reportUrl,
    );
    // Only severities with findings take a share of the bar.
    expect(summary.querySelectorAll('[data-severity]')).toHaveLength(3);
  });

  it('links the formal verification artifacts in the contracts repository', () => {
    render(PAGES.audits('en'));
    for (const name of ['Certora specifications', 'SMTChecker configuration', 'Slither analysis']) {
      expect(screen.getByRole('link', { name: new RegExp(name) }).getAttribute('href')).toMatch(
        /github\.com\/PredictionExplorer\/Cosmic-Signature\/tree\/main\//,
      );
    }
  });

  it('turns the checklist into numbered steps that link their evidence', () => {
    render(PAGES.audits('en'));
    const checklist = document.getElementById('checklist');
    const steps = checklist?.querySelectorAll('ol > li') ?? [];
    expect(steps).toHaveLength(5);
    expect(checklist?.querySelectorAll('ol a').length).toBeGreaterThanOrEqual(5);
  });
});

describe('Risk disclosures', () => {
  it('names the participant-specific risks with figures from the protocol facts', () => {
    render(PAGES.risk('en'));
    const text = visibleText();
    expect(text).toContain('not refunded');
    expect(text).toContain(`by ${protocolFacts.ethGestureCostStepUpPercent}%`);
    expect(text).toContain(`${protocolFacts.finalGestureExclusivityHours} hours`);
    expect(text).toContain(`${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks`);
    expect(text).toContain('afford to forgo');
  });

  it('sets the short groups compactly, two to a row, and closes on what participants do', () => {
    render(PAGES.risk('en'));
    const groups = Array.from(document.querySelectorAll('main section[id]'));
    expect(groups.map((group) => group.id)).not.toContain('participation');
    expect(groups[0]?.parentElement?.className).toMatch(/xl:grid-cols-2/);
    // No per-section way back to the contents on a page of short sections.
    expect(screen.queryByRole('link', { name: 'Back to contents' })).toBeNull();
    expect(screen.getByText('What participants do')).toBeInTheDocument();
  });

  it('points each group at the Terms clause that states the rule', () => {
    render(PAGES.risk('en'));
    const hrefs = screen
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))
      .filter((href): href is string => Boolean(href?.startsWith('/terms#')));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/terms#mechanics',
        '/terms#allocations-retrieval',
        '/terms#mechanics-random-walk',
        '/terms#allocations-no-guarantee',
      ]),
    );
  });
});

/** The Trust Center page each app path renders. */
const PAGE_BY_PATH: Record<string, keyof typeof PAGES> = {
  '/security': 'security',
  '/audits': 'audits',
  '/risk-disclosures': 'risk',
  '/terms': 'terms',
  '/privacy': 'privacy',
};

/** Every deep link the copy may name (`LEGAL_LINKS`) into a Trust Center page, by page. */
const DEEP_LINKS = Object.values(LEGAL_LINKS).flatMap((target) => {
  const [path = '', fragment] = target.href.split('#');
  const page = target.kind === 'app' ? PAGE_BY_PATH[path] : undefined;
  return page && fragment ? [{ page, fragment }] : [];
});

describe('Trust Center deep links', () => {
  it('covers the clauses the risk disclosures cite', () => {
    expect(DEEP_LINKS.map(({ fragment }) => fragment)).toEqual(
      expect.arrayContaining(['mechanics-cst-window', 'allocations-retrieval', 'services']),
    );
  });

  // The anchors are locale-agnostic (/uk/terms#allocations-retrieval), so a
  // translator's typo in one locale's clause id would break the links there.
  it.each(routing.locales)('%s: every deep link lands on an anchor', (locale) => {
    for (const page of new Set(DEEP_LINKS.map((link) => link.page))) {
      const { unmount } = render(PAGES[page](locale));
      for (const { fragment } of DEEP_LINKS.filter((link) => link.page === page)) {
        expect({
          locale,
          page,
          fragment,
          found: document.getElementById(fragment) !== null,
        }).toEqual({ locale, page, fragment, found: true });
      }
      unmount();
    }
  });
});

describe('Terms of Service', () => {
  it('lists the prohibited activities as a real list', () => {
    render(PAGES.terms('en'));
    const items = document.querySelectorAll('#prohibited ul > li');
    expect(items).toHaveLength(7);
    for (const item of items) expect(item.textContent).not.toMatch(/^•/);
  });

  // The tracks were listed twice back to back, a table (or a phone summary)
  // and then the same tracks as clauses, so every figure appeared twice.
  it('lists each allocation track once, with its figures from the protocol facts and its rule (regression)', () => {
    render(PAGES.terms('en'));
    expect(screen.queryByRole('table')).toBeNull();
    const list = document.querySelector('[data-allocation-tracks]');
    expect(list).toHaveAttribute('aria-labelledby', 'allocations-tracks-title');
    const tracks = Array.from(list?.querySelectorAll(':scope > div') ?? []);
    expect(tracks).toHaveLength(11);
    // Each track is the anchor of its clause, and states its rule once.
    expect(tracks[0]).toHaveAttribute('id', 'allocations-signature');
    const figures = (track: Element | undefined) => track?.querySelector('[data-track-figures]');
    expect(figures(tracks[0])).toHaveTextContent(
      `ETH ${protocolFacts.mainEthPercentage}% · CST ${protocolFacts.specialAllocationCst.toLocaleString('en')} · NFT 1`,
    );
    expect(list).toHaveTextContent('4%, shared by 3');
    expect(
      tracks.filter((track) => figures(track)?.textContent?.includes('10 × 1,000')),
    ).toHaveLength(2);
    // A track without a figure in a unit says nothing for it, rather than a dash.
    const publicGoods = tracks.find((track) => track.textContent?.includes('Public Goods'));
    expect(figures(publicGoods)?.textContent).not.toMatch(/CST|NFT|—/);
    for (const track of tracks) {
      expect(track.querySelectorAll('dd')).toHaveLength(1);
    }
  });

  it('marks a cited clause as the target, a little below the sticky header', () => {
    render(PAGES.terms('en'));
    for (const id of ['allocations-retrieval', 'allocations-signature', 'mechanics-random-walk']) {
      const clause = document.getElementById(id);
      expect(clause?.className).toMatch(/scroll-mt-6/);
      expect(clause?.className).toMatch(/target:before:opacity-100/);
    }
  });

  it('gives an email for questions about the Terms, as Privacy and Security do', () => {
    render(PAGES.terms('en'));
    expect(screen.getByRole('link', { name: 'support@cosmicsignature.com' })).toHaveAttribute(
      'href',
      'mailto:support@cosmicsignature.com',
    );
  });

  it('links the licence, the notices and the contact channels', () => {
    render(PAGES.terms('en'));
    expect(screen.getByRole('link', { name: /^LICENSE/ }).getAttribute('href')).toMatch(
      /cosmicgame-frontend\/blob\/main\/LICENSE$/,
    );
    expect(
      screen.getByRole('link', { name: /THIRD_PARTY_NOTICES\.md/ }).getAttribute('href'),
    ).toMatch(/THIRD_PARTY_NOTICES\.md$/);
  });
});

describe('Privacy Policy', () => {
  // The policy said the site "reports errors through the named services
  // below" while the services table, built from this deployment's
  // configuration, listed no error-reporting service.
  it.each(routing.locales)(
    'names error reports only when an error-reporting service is listed (%s)',
    (locale) => {
      const copy = getPrivacyCopy(locale);
      const withoutReports = privacyCopyForDeployment(copy, false);
      const withReports = privacyCopyForDeployment(copy, true);
      const improvement = (c: typeof copy) =>
        c.sections
          .find((section) => section.id === 'use')
          ?.content.find((item) => item.id === 'improvement')?.text;
      expect(withReports).toBe(copy);
      expect(withoutReports.inShort.points).toHaveLength(copy.inShort.points.length);
      expect(withoutReports.inShort.points.at(-1)).toBe(copy.withoutErrorReports.inShortMeasure);
      expect(improvement(withoutReports)).toBe(copy.withoutErrorReports.improvement);
      expect(withoutReports.withoutErrorReports.inShortMeasure).not.toBe(
        copy.inShort.points.at(-1),
      );
    },
  );

  it('renders the policy this deployment may state', () => {
    render(PAGES.privacy('en'));
    const sentry = activePrivacyServices().some((service) => service.id === 'sentry');
    const text = visibleText();
    if (sentry) expect(text).toContain('reports errors');
    else expect(text).not.toMatch(/error reports|reports errors/);
  });

  it('opens each phone record on its name, and leaves out what the title line carries', () => {
    render(PAGES.privacy('en'));
    const services = screen.getByRole('table', { name: 'Services we use' });
    for (const row of within(services).getAllByRole('row').slice(1)) {
      const cells = row.querySelectorAll('td');
      expect(cells[0]).toHaveAttribute('data-phone', 'title');
      expect(cells[cells.length - 1]).toHaveAttribute('data-phone', 'omit');
    }
    const storage = screen.getByRole('table', { name: 'Cookies and browser storage' });
    const theme = within(storage).getByText('cs_theme').closest('td');
    expect(theme).toHaveAttribute('data-phone', 'title');
    expect(theme).toHaveTextContent(/Cookie.*·.*1 year/);
  });

  it('lists the services and storage this deployment actually uses', () => {
    render(PAGES.privacy('en'));
    const services = screen.getByRole('table', { name: 'Services we use' });
    expect(within(services).getAllByRole('row')).toHaveLength(activePrivacyServices().length + 1);
    const storage = screen.getByRole('table', { name: 'Cookies and browser storage' });
    expect(within(storage).getAllByRole('row')).toHaveLength(activePrivacyStorage().length + 1);
    expect(within(storage).getByText('cs_theme')).toBeInTheDocument();
  });

  it('opens with the three points to read first', () => {
    render(PAGES.privacy('en'));
    const inShort = screen.getByRole('region', { name: 'In short' });
    expect(within(inShort).getAllByRole('listitem')).toHaveLength(3);
  });
});
