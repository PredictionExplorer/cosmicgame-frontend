import { LegalContentsRail, currentSectionId } from '@/components/legal/LegalContentsRail';

import { render, screen } from '@/test-utils';

const sections = (tops: number[]) => tops.map((top, index) => ({ id: `s${index + 1}`, top }));

describe('currentSectionId', () => {
  it('is nothing before the first heading reaches the reading line', () => {
    expect(currentSectionId(sections([600, 1400]), 900, false)).toBeNull();
  });

  it('is the last section whose heading has passed a third of the viewport', () => {
    expect(currentSectionId(sections([-800, 120, 700]), 900, false)).toBe('s2');
    expect(currentSectionId(sections([-800, -100, 299]), 900, false)).toBe('s3');
  });

  it('is the last section at the bottom of the page, however short it is', () => {
    expect(currentSectionId(sections([-800, -100, 850]), 900, true)).toBe('s3');
  });

  it('is nothing without sections', () => {
    expect(currentSectionId([], 900, true)).toBeNull();
  });
});

describe('LegalContentsRail', () => {
  it('lists the sections as in-page links with a way back to the top', () => {
    render(
      <LegalContentsRail
        items={[
          { id: 'one', label: 'One' },
          { id: 'two', label: 'Two' },
        ]}
        title="On this page"
        backToTop="Back to top"
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'On this page' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'One' })).toHaveAttribute('href', '#one');
    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('href', '#two');
    expect(screen.getByRole('link', { name: 'Back to top' })).toHaveAttribute('href', '#main');
  });
});
