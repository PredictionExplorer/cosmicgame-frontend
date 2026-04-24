import '@testing-library/jest-dom';

import { AttributePill, AttributePillGroup } from '@/components/nft/AttributePills';

import { checkA11y, render, screen } from '@/test-utils';

describe('AttributePill', () => {
  it('renders the value text', () => {
    render(<AttributePill value="Rare" data-testid="pill" />);
    expect(screen.getByTestId('pill')).toHaveTextContent('Rare');
  });

  it('renders an optional label before the value with a separator', () => {
    render(<AttributePill label="Cycle" value="42" data-testid="pill" />);
    const pill = screen.getByTestId('pill');
    expect(pill).toHaveTextContent('Cycle');
    expect(pill).toHaveTextContent('42');
    // The "·" separator is decorative — must be aria-hidden so SR users
    // hear "Cycle 42" without the dot interruption.
    expect(pill.querySelector('[aria-hidden]')).not.toBeNull();
  });

  it('renders an optional icon slot as aria-hidden', () => {
    render(
      <AttributePill
        value="Rare"
        icon={<svg data-testid="ic" aria-hidden focusable="false" />}
        data-testid="pill"
      />,
    );
    expect(screen.getByTestId('ic')).toBeInTheDocument();
  });

  it.each([
    ['neutral', 'border-white/[0.08]'],
    ['aurora', 'border-[rgb(var(--aurora-cyan-rgb)/0.25)]'],
    ['nebula', 'border-[rgb(var(--nebula-violet-rgb)/0.25)]'],
    ['solar', 'border-[rgb(var(--solar-gold-rgb)/0.25)]'],
    ['impact', 'border-[rgb(var(--impact-green-rgb)/0.25)]'],
    ['rose', 'border-[rgb(var(--chrono-rose-rgb)/0.25)]'],
  ])('applies tone=%s border', (tone, expected) => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <AttributePill tone={tone as any} value="x" data-testid="pill" />,
    );
    expect(screen.getByTestId('pill')).toHaveClass(expected);
  });

  it('applies size variants', () => {
    const { container, rerender } = render(<AttributePill size="sm" value="x" />);
    expect(container.firstElementChild).toHaveClass('px-2');
    rerender(<AttributePill size="lg" value="x" />);
    expect(container.firstElementChild).toHaveClass('px-3');
  });

  it('applies interactive cursor styling', () => {
    render(<AttributePill interactive value="x" data-testid="pill" />);
    expect(screen.getByTestId('pill')).toHaveClass('cursor-pointer');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AttributePill label="Cycle" value="42" />);
    await checkA11y(container);
  });
});

describe('AttributePillGroup', () => {
  it('renders children with default row + md gap', () => {
    render(
      <AttributePillGroup data-testid="grp">
        <AttributePill value="A" />
        <AttributePill value="B" />
      </AttributePillGroup>,
    );
    const grp = screen.getByTestId('grp');
    expect(grp).toHaveClass('flex', 'flex-wrap', 'gap-2');
  });

  it('switches direction to column when configured', () => {
    render(
      <AttributePillGroup direction="column" data-testid="grp">
        <AttributePill value="A" />
      </AttributePillGroup>,
    );
    expect(screen.getByTestId('grp')).toHaveClass('flex-col');
  });

  it.each([
    ['sm', 'gap-1.5'],
    ['md', 'gap-2'],
    ['lg', 'gap-3'],
  ])('applies gap=%s', (gap, expected) => {
    render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <AttributePillGroup gap={gap as any} data-testid="grp">
        <AttributePill value="A" />
      </AttributePillGroup>,
    );
    expect(screen.getByTestId('grp')).toHaveClass(expected);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AttributePillGroup>
        <AttributePill value="A" />
        <AttributePill value="B" />
        <AttributePill value="C" />
      </AttributePillGroup>,
    );
    await checkA11y(container);
  });
});
