import { checkA11y, render, screen, within } from '@/test-utils';

import { AllocationSplitBar } from '../allocation-split';

describe('AllocationSplitBar', () => {
  it('draws each track in proportion and names every share for screen readers', () => {
    render(
      <AllocationSplitBar
        label="Cycle 1 split"
        unavailableLabel="Unavailable"
        segments={[
          { id: 'signature', label: 'Signature Allocation', percent: 60 },
          { id: 'chrono', label: 'Chrono-Warrior', percent: 40 },
        ]}
      />,
    );
    const bar = screen.getByRole('img', { name: /Cycle 1 split/ });
    expect(bar).toHaveAccessibleName('Cycle 1 split: Signature Allocation 60%, Chrono-Warrior 40%');
    const drawn = bar.querySelectorAll('[data-track]');
    expect(drawn).toHaveLength(2);
    expect((drawn[0] as HTMLElement).style.flexGrow).toBe('60');
    expect(drawn[0]).toHaveClass('bg-track-signature');
  });

  it('keeps the legend a valid description list: each group holds only a dt and a dd', () => {
    const { container } = render(
      <AllocationSplitBar
        label="Split"
        unavailableLabel="Unavailable"
        segments={[
          { id: 'signature', label: 'Signature Allocation', percent: 60 },
          { id: 'chrono', label: 'Chrono-Warrior', percent: 40 },
        ]}
      />,
    );
    const groups = container.querySelectorAll('dl > div');
    expect(groups).toHaveLength(2);
    for (const group of groups) {
      expect([...group.children].map((child) => child.tagName)).toEqual(['DT', 'DD']);
    }
  });

  it('lists each track with its ETH and share when the split is of a real cycle', () => {
    const { container } = render(
      <AllocationSplitBar
        label="Split"
        unavailableLabel="Unavailable"
        segments={[
          { id: 'signature', label: 'Signature Allocation', percent: 50, amount: 11.0616 },
          { id: 'publicGoods', label: 'Public Goods', percent: null, amount: null },
        ]}
      />,
    );
    const signature = container.querySelector('div[data-track="signature"]') as HTMLElement;
    expect(signature).toHaveTextContent('11.0616');
    expect(signature).toHaveTextContent('50%');
    const unknown = container.querySelector('div[data-track="publicGoods"]') as HTMLElement;
    expect(within(unknown).getAllByText('Unavailable')).toHaveLength(2);
    // An unknown share draws no segment rather than a guessed one.
    expect(screen.getByRole('img').querySelectorAll('[data-track]')).toHaveLength(1);
  });

  it('marks an approximate share and explains a defined label', async () => {
    const { container } = render(
      <AllocationSplitBar
        label="Split"
        unavailableLabel="Unavailable"
        segments={[
          {
            id: 'nextCycle',
            label: 'Next cycle',
            definition: 'Rolls into the next cycle.',
            percent: 50,
            approximate: true,
          },
        ]}
      />,
    );
    expect(container.querySelector('div[data-track="nextCycle"]')).toHaveTextContent('~50%');
    expect(screen.getByRole('button', { name: 'Next cycle' })).toBeInTheDocument();
    await checkA11y(container);
  });
});
