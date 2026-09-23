import { render, screen } from '@testing-library/react';

import { Amount } from '../amount';

describe('Amount', () => {
  it('renders <data> with the machine value, tabular figures and a no-break muted unit', () => {
    const { container } = render(<Amount value={32.29391} unit="ETH" />);
    const data = container.querySelector('data');
    expect(data).toHaveAttribute('value', '32.29391');
    expect(data).toHaveClass('tabular-nums', 'whitespace-nowrap');
    expect(data?.textContent).toBe('32.2939\u00a0ETH');
    expect(screen.getByText('ETH')).toHaveClass('text-muted-foreground');
  });

  it('puts the full-precision value on hover only when the display rounds', () => {
    const { container, rerender } = render(<Amount value={0.102113456} unit="ETH" />);
    expect(container.querySelector('data')).toHaveAttribute('title', '0.102113456\u00a0ETH');
    rerender(<Amount value={1000} unit="CST" />);
    expect(container.querySelector('data')).not.toHaveAttribute('title');
  });

  it('follows the precision context and can drop the unit for table columns', () => {
    const { container } = render(
      <Amount value={0.0000001} unit="ETH" context="table" showUnit={false} />,
    );
    expect(container.textContent).toBe('<0.0001');
  });

  it('formats in an explicit locale', () => {
    const { container } = render(<Amount value={8.07351} unit="ETH" locale="vi" />);
    expect(container.textContent).toBe('8,0735\u00a0ETH');
  });

  it('accepts wei', () => {
    const { container } = render(<Amount value={10n ** 18n} unit="ETH" context="hero" />);
    expect(container.querySelector('data')).toHaveAttribute('value', '1');
    expect(container.textContent).toBe('1\u00a0ETH');
  });

  it('renders an em dash without a machine value when the amount is unknown', () => {
    const { container } = render(<Amount value={undefined} unit="ETH" className="text-lg" />);
    expect(container.querySelector('data')).toBeNull();
    expect(screen.getByText('—')).toHaveClass('text-lg');
  });
});
