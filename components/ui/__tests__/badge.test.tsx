import '@testing-library/jest-dom';
import { Lock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { render, screen, checkA11y } from '@/test-utils';

describe('Badge', () => {
  it('renders a neutral tag by default', () => {
    render(<Badge>Eligible for Anchoring</Badge>);
    const badge = screen.getByText('Eligible for Anchoring');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveAttribute('data-tone', 'neutral');
    expect(badge).toHaveClass('rounded-edge', 'border-rule');
  });

  it.each(['neutral', 'accent', 'positive', 'attention', 'critical', 'live'] as const)(
    'renders the %s tone',
    (tone) => {
      render(<Badge tone={tone}>{tone}</Badge>);
      expect(screen.getByText(tone)).toHaveAttribute('data-tone', tone);
    },
  );

  it('never renders below the 12px caption floor', () => {
    render(
      <>
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
      </>,
    );
    expect(screen.getByText('Small')).toHaveClass('type-caption');
    expect(screen.getByText('Medium')).toHaveClass('type-label');
  });

  it('sets an overline status in the eyebrow face, whose own rule uncases CJK', () => {
    render(
      <Badge size="sm" overline>
        Live
      </Badge>,
    );
    const badge = screen.getByText('Live');
    expect(badge).toHaveClass('type-eyebrow');
    // One type utility per badge, and no per-language rules of its own.
    expect(badge).not.toHaveClass('type-caption');
    expect(badge.className).not.toMatch(/:lang\(/);
  });

  it('draws a dot that breathes only while live', () => {
    const { container } = render(
      <>
        <Badge tone="positive" dot>
          Growing
        </Badge>
        <Badge tone="live" dot shape="pill">
          Live
        </Badge>
      </>,
    );
    const dots = container.querySelectorAll('[data-slot="badge-dot"]');
    expect(dots).toHaveLength(2);
    expect(dots[0]).toHaveAttribute('aria-hidden');
    expect(dots[0]?.className).not.toMatch(/animate-live-dot/);
    expect(dots[1]?.className).toMatch(/animate-live-dot/);
    expect(screen.getByText('Live')).toHaveClass('rounded-pill');
  });

  it('sets token numbers in mono that never break', () => {
    render(<Badge mono>#000025</Badge>);
    expect(screen.getByText('#000025')).toHaveClass('font-mono', 'whitespace-nowrap');
  });

  it('hides a leading icon from assistive technology', () => {
    render(<Badge icon={<Lock data-testid="lock" />}>Locked</Badge>);
    expect(screen.getByTestId('lock').parentElement).toHaveAttribute('aria-hidden');
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge className="extra-class">Styled</Badge>);
    expect(screen.getByText('Styled')).toHaveClass('extra-class');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <p>
        Status{' '}
        <Badge tone="live" dot>
          Live
        </Badge>
      </p>,
    );
    await checkA11y(container);
  });
});
