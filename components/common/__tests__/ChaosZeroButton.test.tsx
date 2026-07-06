import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';

import { render, screen, checkA11y } from '@/test-utils';

import { ChaosZeroButton } from '../ChaosZeroButton';

describe('ChaosZeroButton', () => {
  it('links to Chaos Zero with safe external attributes', () => {
    render(<ChaosZeroButton />);

    const link = screen.getByRole('link', { name: 'Make predictions on Chaos Zero' });
    expect(link).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    const url = new URL(link.getAttribute('href')!);
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('chaoszero.com');
  });

  it('names the prediction market in the default label', () => {
    render(<ChaosZeroButton />);

    expect(screen.getByRole('link', { name: 'Make predictions on Chaos Zero' })).toHaveTextContent(
      'Make Predictions on Chaos Zero',
    );
  });

  it('supports compact visual copy while keeping the full accessible name', () => {
    render(<ChaosZeroButton variant="compact" />);

    const link = screen.getByRole('link', { name: 'Make predictions on Chaos Zero' });
    expect(link).toHaveTextContent('Chaos Zero');
  });

  it('renders a lightweight menu variant for dropdown use', () => {
    render(<ChaosZeroButton variant="menu" />);

    const link = screen.getByRole('link', { name: 'Make predictions on Chaos Zero' });
    expect(link).toHaveTextContent('Chaos Zero Predictions');
    expect(link).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('allows overriding the visible label without losing the link target', () => {
    render(<ChaosZeroButton variant="card" label="Predict this cycle" />);

    const link = screen.getByRole('link', { name: 'Make predictions on Chaos Zero' });
    expect(link).toHaveTextContent('Predict this cycle');
    expect(link).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ChaosZeroButton />);
    await checkA11y(container);
  });
});
