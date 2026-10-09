import { howItWorksContentEn } from '@/content/how-it-works';

import { render, screen, checkA11y } from '@/test-utils';

import { CallToAction } from '../components/CallToAction';

const callToAction = howItWorksContentEn.callToAction;

describe('CallToAction', () => {
  it('renders the heading', () => {
    render(<CallToAction callToAction={callToAction} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ready to make your first gesture?' }),
    ).toBeInTheDocument();
  });

  it('renders the body with a typographic apostrophe', () => {
    render(<CallToAction callToAction={callToAction} />);
    expect(screen.getByText(callToAction.body)).toBeInTheDocument();
    // Regression guard: the copy once rendered a literal "’" from JSX text.
    expect(screen.getByText(/shaping the cycle’s Signature\./)).toBeInTheDocument();
    expect(screen.queryByText(/\\u2019/)).not.toBeInTheDocument();
  });

  it('offers the gesture form and the FAQ', () => {
    render(<CallToAction callToAction={callToAction} />);
    expect(screen.getByRole('link', { name: 'Make a gesture' })).toHaveAttribute(
      'href',
      '/#make-gesture',
    );
    expect(screen.getByRole('link', { name: 'Browse the FAQ' })).toHaveAttribute('href', '/faq');
  });

  it('opens the community channels in a new tab, Discord through its public invite', () => {
    render(<CallToAction callToAction={callToAction} />);
    const discord = screen.getByRole('link', { name: /Discord/ });
    expect(discord).toHaveAttribute('href', 'https://discord.gg/bGnPn96Qwt');
    expect(discord).toHaveAttribute('target', '_blank');
    expect(discord).toHaveAttribute('rel', 'noopener noreferrer');
    const x = screen.getByRole('link', { name: /Twitter/ });
    expect(x).toHaveAttribute('href', expect.stringContaining('x.com'));
    expect(x).toHaveAttribute('target', '_blank');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CallToAction callToAction={callToAction} />);
    await checkA11y(container);
  });
});
