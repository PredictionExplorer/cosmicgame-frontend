import { LEGAL_LINKS } from '@/content/legal/links';

import { LegalLink, RichText, parseRichText, richTextLinks } from '@/components/legal/RichText';

import { render, screen } from '@/test-utils';

describe('parseRichText', () => {
  it('splits text, linked phrases and literals', () => {
    expect(
      parseRichText('Check the <contracts>contracts page</contracts> for `0xabc`, then act.'),
    ).toEqual([
      { type: 'text', value: 'Check the ' },
      { type: 'link', id: 'contracts', value: 'contracts page' },
      { type: 'text', value: ' for ' },
      { type: 'code', value: '0xabc' },
      { type: 'text', value: ', then act.' },
    ]);
  });

  it('keeps the words of an unknown tag and drops its markup', () => {
    expect(parseRichText('See <nowhere>this page</nowhere>.')).toEqual([
      { type: 'text', value: 'See this page.' },
    ]);
  });

  it('leaves plain copy as one run', () => {
    expect(parseRichText('No links here.')).toEqual([{ type: 'text', value: 'No links here.' }]);
  });

  it('lists the tags a piece of copy uses, in order', () => {
    expect(richTextLinks('<x>X</x> and <discord>Discord</discord>, or `code`')).toEqual([
      'x',
      'discord',
    ]);
  });
});

describe('RichText', () => {
  it('renders an app link same-tab and an external source in a new tab', () => {
    render(
      <p>
        <RichText
          locale="en"
          text="Read the <hacken>Hacken report</hacken> and the <contracts>contracts page</contracts>."
        />
      </p>,
    );
    const report = screen.getByRole('link', { name: /Hacken report/ });
    expect(report).toHaveAttribute('href', LEGAL_LINKS.hacken.href);
    expect(report).toHaveAttribute('target', '_blank');
    expect(report).toHaveAttribute('rel', 'noopener noreferrer');
    const contracts = screen.getByRole('link', { name: 'contracts page' });
    expect(contracts).toHaveAttribute('href', '/contracts');
    expect(contracts).not.toHaveAttribute('target');
    expect(document.body.textContent).not.toMatch(/[<>`]/);
  });

  it('sets a literal as code', () => {
    render(
      <p>
        <RichText locale="en" text="Open `app.cosmicsignature.com` only." />
      </p>,
    );
    expect(document.querySelector('code')).toHaveTextContent('app.cosmicsignature.com');
  });
});

describe('LegalLink', () => {
  it('localizes a page on the marketing host', () => {
    render(
      <LegalLink id="notALottery" locale="uk">
        why
      </LegalLink>,
    );
    expect(screen.getByRole('link', { name: 'why' }).getAttribute('href')).toMatch(
      /\/uk\/learn\/not-a-lottery-not-an-investment$/,
    );
  });

  it('opens the support mailbox and serves security.txt from this host', () => {
    render(
      <>
        <LegalLink id="support" locale="en">
          email
        </LegalLink>
        <LegalLink id="securityTxt" locale="en">
          security.txt
        </LegalLink>
      </>,
    );
    expect(screen.getByRole('link', { name: 'email' })).toHaveAttribute(
      'href',
      'mailto:support@cosmicsignature.com',
    );
    expect(screen.getByRole('link', { name: 'security.txt' })).toHaveAttribute(
      'href',
      '/.well-known/security.txt',
    );
  });
});
