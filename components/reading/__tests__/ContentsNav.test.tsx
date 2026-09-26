import { render, screen, within } from '@/test-utils';

import { ReadingContents } from '../ContentsNav';
import { ReadingRail } from '../ContentsRail';
import type { ContentsEntry } from '../contents';

const mockPosition = { activeId: 'costs-cst' as string | null, progress: 0.4, pastAnchor: true };
jest.mock('../useReadingPosition', () => ({
  useReadingPosition: () => mockPosition,
}));

const entries: ContentsEntry[] = [
  { id: 'intro', label: 'Introduction', number: '1' },
  {
    id: 'costs',
    label: 'Gesture Costs',
    number: '2',
    children: [
      { id: 'costs-eth', label: 'ETH', number: '2.1' },
      { id: 'costs-cst', label: 'CST', number: '2.2' },
    ],
  },
  { id: 'refs', label: 'References' },
];

const copy = {
  railLabel: 'On this page',
  openLabel: 'Contents',
  backToTopLabel: 'Back to top',
};

describe('ReadingContents', () => {
  it('keeps the rail to the sections, marking the one whose subsection is read', () => {
    render(
      <ReadingContents
        entries={entries}
        copy={copy}
        articleId="article"
        topId="title"
        anchorId="contents"
      />,
    );
    const rail = screen.getByTestId('contents-rail');
    // Its visible label names the landmark.
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBe(rail);
    // Regression: the active section's subsections opened in place, and the
    // rail grew and shrank as the reader scrolled.
    expect(within(rail).queryByRole('link', { name: /CST/ })).toBeNull();
    expect(within(rail).getByRole('link', { name: /Gesture Costs/ })).toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  it('gives the floating Contents button one width whatever section it names', () => {
    render(
      <ReadingContents
        entries={entries}
        copy={copy}
        articleId="article"
        topId="title"
        anchorId="contents"
      />,
    );
    expect(screen.getByTestId('contents-sheet-trigger')).toHaveClass('w-[min(22rem,100%)]');
  });
});

describe('ReadingRail', () => {
  const legal: ContentsEntry[] = [
    { id: 'acceptance', label: 'Acceptance of terms', number: '1.' },
    { id: 'eligibility', label: 'Eligibility', number: '2.' },
  ];

  it('is the reading pages’ one rail, alone, for a page with its own phone contents', () => {
    render(
      <ReadingRail
        entries={legal}
        copy={{ railLabel: 'On this page', backToTopLabel: 'Back to top' }}
        articleId="document-body"
        topId="document-title"
      />,
    );
    const rail = screen.getByTestId('contents-rail');
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBe(rail);
    expect(within(rail).getByRole('link', { name: /Acceptance of terms/ })).toHaveAttribute(
      'href',
      '#acceptance',
    );
    // The title, not #main: that target belongs to the site's one skip link.
    expect(within(rail).getByRole('link', { name: 'Back to top' })).toHaveAttribute(
      'href',
      '#document-title',
    );
    // No floating sheet: the page's phones read its own contents.
    expect(screen.queryByTestId('contents-sheet-trigger')).toBeNull();
  });

  it('fades the list out where it continues, never cutting its last entry in half', () => {
    // Regression: the white paper's rail ended mid-line on "Appendix A:
    // Verified…" at 900px, with nothing to say the list went on.
    const sizes = { scrollHeight: 900, clientHeight: 600 };
    const restore = (['scrollHeight', 'clientHeight'] as const).map((key) => {
      const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, key);
      Object.defineProperty(HTMLElement.prototype, key, {
        configurable: true,
        get: () => sizes[key],
      });
      return () => {
        if (original) Object.defineProperty(HTMLElement.prototype, key, original);
      };
    });
    try {
      render(
        <ReadingRail
          entries={legal}
          copy={{ railLabel: 'On this page', backToTopLabel: 'Back to top' }}
          articleId="document-body"
          topId="document-title"
        />,
      );
      const scroller = screen.getByTestId('reading-progress').parentElement!;
      expect(scroller).toHaveAttribute('data-overflow-bottom');
      expect(scroller).not.toHaveAttribute('data-overflow-top');
      expect(scroller.style.maskImage).toContain('calc(100% - 2.5rem)');
    } finally {
      restore.forEach((undo) => undo());
    }
  });
});
