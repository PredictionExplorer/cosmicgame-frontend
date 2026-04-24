import '@testing-library/jest-dom';

import { AnchorLifecycle } from '@/components/anchoring/AnchorLifecycle';

import { checkA11y, render, screen } from '@/test-utils';

describe('AnchorLifecycle', () => {
  it('renders the four-step lifecycle as an ordered list', () => {
    render(<AnchorLifecycle current="anchor" />);
    const list = screen.getByRole('list', { name: /anchor lifecycle/i });
    expect(list).toBeInTheDocument();
    expect(list.querySelectorAll('[role="listitem"], li').length).toBeGreaterThanOrEqual(4);
  });

  it('renders every stage label', () => {
    render(<AnchorLifecycle current="anchor" />);
    for (const label of ['Anchor', 'Active', 'Retrievable', 'Retrieved']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('marks the current stage with aria-current', () => {
    render(<AnchorLifecycle current="active" />);
    const active = screen.getByText('Active').closest('li');
    expect(active).toHaveAttribute('aria-current', 'step');
  });

  it('renders optional timestamp labels per stage', () => {
    render(
      <AnchorLifecycle
        current="active"
        timestamps={{ anchor: '2026-02-01', active: '2026-02-05' }}
      />,
    );
    expect(screen.getByText('2026-02-01')).toBeInTheDocument();
    expect(screen.getByText('2026-02-05')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchorLifecycle current="retrievable" />);
    await checkA11y(container);
  });
});
