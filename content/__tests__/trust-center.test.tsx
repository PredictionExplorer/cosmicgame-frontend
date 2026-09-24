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
import {
  OFFICIAL_CONTRACTS,
  sourcifyContractUrl,
  type OfficialContractId,
} from '@/content/legal/officialAddresses';
import { PrivacyContent } from '@/content/legal/PrivacyContent';
import { activePrivacyServices, activePrivacyStorage } from '@/content/legal/privacyInventory';
import { RiskContent } from '@/content/legal/RiskContent';
import { SecurityContent } from '@/content/legal/SecurityContent';
import { TermsContent } from '@/content/legal/TermsContent';
import { TRUST_CENTER_PAGES, TRUST_DOCUMENT_DATES } from '@/content/legal/trustCenter';
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
    sectionLink: legal.document.sectionLink ?? '',
    revisionHistory: legal.document.revisionHistory ?? '',
    tabs: Object.fromEntries(
      TRUST_CENTER_PAGES.map(({ id }) => [id, legal.breadcrumbs[id] ?? id]),
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

/** Every Trust Center page, rendered from a locale's copy. */
const PAGES = {
  security: (locale: string) => (
    <SecurityContent
      copy={getSecurityCopy(locale)}
      locale={locale}
      labels={labelsFor(locale)}
      contractNames={contractNamesFor(locale)}
    />
  ),
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
      const tabs = screen.getByRole('navigation', { name: 'common.pageHeader.sections.trust' });
      expect(within(tabs).getAllByRole('link')).toHaveLength(5);
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

  it('says where to report a vulnerability', () => {
    render(PAGES.security('en'));
    expect(screen.getByRole('link', { name: 'support@cosmicsignature.com' })).toHaveAttribute(
      'href',
      'mailto:support@cosmicsignature.com',
    );
    expect(screen.getByRole('link', { name: 'security.txt' })).toHaveAttribute(
      'href',
      '/.well-known/security.txt',
    );
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

describe('Terms of Service', () => {
  it('gives every clause the anchor the risk disclosures link to', () => {
    render(PAGES.terms('en'));
    for (const id of [
      'mechanics',
      'mechanics-random-walk',
      'mechanics-cst-window',
      'allocations-retrieval',
      'allocations-no-guarantee',
      'eligibility',
      'risks',
    ]) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it('lists the prohibited activities as a real list', () => {
    render(PAGES.terms('en'));
    const items = document.querySelectorAll('#prohibited ul > li');
    expect(items).toHaveLength(7);
    for (const item of items) expect(item.textContent).not.toMatch(/^•/);
  });

  it('shows the allocation tracks at a glance from the protocol facts', () => {
    render(PAGES.terms('en'));
    const table = screen.getByRole('table', { name: 'The allocation tracks at a glance' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(12);
    expect(within(table).getByText(`${protocolFacts.mainEthPercentage}%`)).toBeInTheDocument();
    expect(within(table).getByText('4%, shared by 3')).toBeInTheDocument();
    expect(within(table).getAllByText('10 × 1,000')).toHaveLength(2);
  });

  // On phones the table became eleven four-row records, about 2,100px of mostly
  // empty cells; phones get one line per track instead, and the table from sm.
  it('gives phones one summary line per track instead of the table', () => {
    render(PAGES.terms('en'));
    const table = screen.getByRole('table', { name: 'The allocation tracks at a glance' });
    expect(table.closest('[class*="max-sm:hidden"]')).not.toBeNull();
    const summary = document.querySelector('[data-allocations-summary]');
    expect(summary).toHaveClass('sm:hidden');
    const lines = Array.from(summary?.querySelectorAll(':scope > div') ?? []);
    expect(lines).toHaveLength(11);
    const signature = lines[0]?.querySelector('dd');
    expect(signature).toHaveTextContent(
      `ETH ${protocolFacts.mainEthPercentage}% · CST ${protocolFacts.specialAllocationCst.toLocaleString('en')} · NFT 1`,
    );
    // A track without a figure in a column says nothing for it, rather than a dash.
    const publicGoods = lines.find((line) => line.textContent?.includes('Public Goods'));
    expect(publicGoods?.querySelector('dd')?.textContent).not.toMatch(/CST|NFT|—/);
    // Each line links the clause that states the track's rule.
    expect(lines[0]?.querySelector('a')).toHaveAttribute('href', '#allocations-signature');
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
