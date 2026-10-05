import { checkA11y, render, screen } from '@/test-utils';

import { SelectionShare } from '../SelectionShare';

const share = { myGestures: 293, totalGestures: 1_142, share: 293 / 1_142 };

describe('SelectionShare', () => {
  it('names its section by its own heading, with an id unique on the page', () => {
    render(
      <>
        <SelectionShare share={share} cycle={2} ethSelections={3} nftSelections={5} />
        <SelectionShare share={share} cycle={3} ethSelections={null} nftSelections={null} />
      </>,
    );
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(2);
    expect(headings[0]!.id).not.toBe(headings[1]!.id);
    for (const heading of headings) {
      expect(heading.closest('section')).toHaveAttribute('aria-labelledby', heading.id);
    }
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <SelectionShare share={share} cycle={2} ethSelections={3} nftSelections={5} />,
    );
    await checkA11y(container);
  });
});
