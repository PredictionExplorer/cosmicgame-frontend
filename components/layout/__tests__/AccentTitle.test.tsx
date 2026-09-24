import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getHowItWorksContent } from '@/content/how-it-works';

import { AccentTitle } from '@/components/layout/AccentTitle';
import { routing } from '@/i18n/routing';

import { render } from '@/test-utils';

/** Han, hiragana, katakana and the full-width marks around them. */
const CJK = '\\u3000-\\u30ff\\u3400-\\u9fff\\uff00-\\uffef';
const SPACE_BESIDE_CJK = new RegExp(`\\s(?=[${CJK}])|(?<=[${CJK}])\\s`);

const faqTitle = (locale: string): string =>
  (
    JSON.parse(readFileSync(join(process.cwd(), 'messages', locale, 'faq.json'), 'utf8')) as {
      hero: { title: string };
    }
  ).hero.title;

const renderedText = (text: string): string => {
  const { container, unmount } = render(<h1>{<AccentTitle text={text} />}</h1>);
  const value = container.textContent ?? '';
  unmount();
  return value;
};

describe('AccentTitle', () => {
  it('renders the marked words in the accent and keeps the rest verbatim', () => {
    const { container } = render(
      <h1>
        <AccentTitle text="How Cosmic Signature <accent>Works</accent>" />
      </h1>,
    );
    expect(container.querySelector('.text-primary')).toHaveTextContent('Works');
    expect(container.textContent).toBe('How Cosmic Signature Works');
  });

  it('renders a title without markup as plain text', () => {
    expect(renderedText('Statistics')).toBe('Statistics');
  });
});

describe('split page titles (F152)', () => {
  it('mark exactly one accent in every locale', () => {
    for (const locale of routing.locales) {
      expect(getHowItWorksContent(locale).hero.heading.match(/<accent>/g)).toHaveLength(1);
      // The FAQ H1 is one plain string: its raw HTML reads "Cosmic Signature FAQ".
      expect(faqTitle(locale)).not.toMatch(/<\/?accent>/);
    }
  });

  it('never put a space beside Japanese text in the Japanese H1s', () => {
    // Regression: the halves were joined with a literal JSX space, giving
    // "Cosmic Signatureの 仕組み" and "Cosmic Signature よくある質問".
    const howItWorks = renderedText(getHowItWorksContent('ja').hero.heading);
    const faq = faqTitle('ja').replace(/<\/?accent>/g, '');
    expect(howItWorks).toBe('Cosmic Signatureの仕組み');
    expect(howItWorks).not.toMatch(SPACE_BESIDE_CJK);
    expect(faq).toBe('Cosmic Signatureよくある質問');
    expect(faq).not.toMatch(SPACE_BESIDE_CJK);
  });
});
