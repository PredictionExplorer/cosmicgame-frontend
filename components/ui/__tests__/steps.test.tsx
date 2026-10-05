import { checkA11y, render, screen, within } from '@/test-utils';

import { Steps } from '../steps';

const items = [
  { id: 'a', title: 'Seed', body: <p>An on-chain seed.</p> },
  { id: 'b', title: 'Simulation', body: <p>Three bodies.</p> },
];

describe('Steps', () => {
  it('numbers an explanatory list in the label face, never mono or a display figure', () => {
    const { container } = render(<Steps items={items} />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    const indexes = container.querySelectorAll('[data-slot="step-index"]');
    expect(Array.from(indexes, (node) => node.textContent)).toEqual(['01', '02']);
    for (const index of indexes) {
      expect(index).toHaveAttribute('aria-hidden', 'true');
      expect(index).toHaveClass('type-label', 'tabular-nums', 'text-subtle');
      expect(index.className).not.toMatch(/font-mono|type-figure/);
    }
    expect(screen.getByRole('heading', { level: 3, name: 'Seed' })).toHaveClass('type-heading-3');
  });

  it('frames a list that stands alone with hairlines at both ends', () => {
    render(<Steps items={items} framed />);
    expect(screen.getByRole('list')).toHaveClass('border-y', 'border-rule-faint');
  });

  it('sets peers beside a sequence in the same rows, a glyph in place of the number', () => {
    const { container } = render(
      <Steps
        ordered={false}
        framed
        items={items.map((item) => ({ ...item, marker: <svg data-testid={`glyph-${item.id}`} /> }))}
      />,
    );
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
    expect(list).toHaveClass('border-y', 'border-rule-faint');
    const indexes = container.querySelectorAll('[data-slot="step-index"]');
    expect(Array.from(indexes, (node) => node.textContent)).toEqual(['', '']);
    expect(within(indexes[0] as HTMLElement).getByTestId('glyph-a')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Simulation' })).toHaveClass(
      'type-heading-3',
    );
  });

  it('draws a sequence in time as circled steps on a rail, each named for screen readers', () => {
    render(<Steps items={items} layout="timeline" stepLabel={(n) => `Step ${n}`} />);
    const [first] = screen.getAllByRole('listitem');
    expect(within(first!).getByText('Step 1')).toHaveClass('sr-only');
    expect(first!.querySelector('[data-slot="step-index"]')).toHaveTextContent('1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Steps items={items} stepLabel={(n) => `Stage ${n}`} />);
    await checkA11y(container);
  });
});
