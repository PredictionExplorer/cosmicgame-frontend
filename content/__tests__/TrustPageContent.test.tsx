import { getAuditsCopy, getSecurityCopy } from '@/content/legal';
import { TrustPageContent } from '@/content/legal/TrustPageContent';
import { TRUST_DOCUMENT_DATES } from '@/content/legal/trustCenter';

import { routing } from '@/i18n/routing';

import { render, screen } from '@/test-utils';

describe('TrustPageContent', () => {
  it('renders the Trust Center hub header: one H1, the section eyebrow unlinked', () => {
    render(<TrustPageContent copy={getSecurityCopy('en')} locale="en" page="security" />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('common.pageHeader.sections.trust')).not.toHaveAttribute('href');
    // No review date is recorded for Security, so none is claimed.
    expect(document.querySelector('time')).not.toBeInTheDocument();
  });

  it('dates a reviewed document and links its eyebrow to the hub', () => {
    render(<TrustPageContent copy={getAuditsCopy('en')} locale="en" page="audits" />);
    expect(screen.getByRole('link', { name: 'common.pageHeader.sections.trust' })).toHaveAttribute(
      'href',
      '/security',
    );
    expect(document.querySelector('time')).toHaveAttribute(
      'datetime',
      TRUST_DOCUMENT_DATES.audits?.date,
    );
  });

  it.each(routing.locales)('sets backticked copy as code, never as backticks (%s)', (locale) => {
    render(<TrustPageContent copy={getSecurityCopy(locale)} locale={locale} page="security" />);
    expect(document.body.textContent).not.toContain('`');
    expect(Array.from(document.querySelectorAll('code')).map((code) => code.textContent)).toContain(
      'https://app.cosmicsignature.com/',
    );
  });
});
