import { render, screen, within } from '@/test-utils';

import { ReadingContents } from '../ContentsNav';
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
