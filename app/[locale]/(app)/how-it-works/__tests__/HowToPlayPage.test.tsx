import { howItWorksContentEn } from '@/content/how-it-works';

import { render, screen, checkA11y } from '@/test-utils';

import HowToPlayPage from '../HowToPlayPage';

const renderPage = () =>
  render(<HowToPlayPage content={howItWorksContentEn} unavailableLabel="Artwork unavailable" />);

describe('HowToPlayPage', () => {
  it('opens with one plain H1', () => {
    renderPage();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(/^How Cosmic Signature works$/);
    expect(h1.childNodes).toHaveLength(1);
  });

  it('draws the mechanism once, then what a gesture leads to, how to start, tips and one call to action', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Lifecycle of a Performance Cycle',
      'What a gesture can lead to',
      'Getting started',
      'Tips and strategy',
      'Ready to make your first Gesture?',
    ]);
    expect(screen.getAllByTestId('cycle-diagram')).toHaveLength(1);
    // F231: no overview cards restating the lifecycle, and no second closing panel.
    expect(screen.queryByText('How It Works')).not.toBeInTheDocument();
    expect(screen.queryByText('Have Questions?')).not.toBeInTheDocument();
  });

  it('shows a real Signature as the payoff of the cycle', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Every cycle ends in a Signature' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View this Signature/ })).toHaveAttribute(
      'href',
      '/detail/24',
    );
  });

  it('closes with the gesture form and the FAQ in one section', () => {
    renderPage();
    const cta = screen.getByRole('region', { name: 'Ready to make your first Gesture?' });
    expect(cta).toContainElement(screen.getByRole('link', { name: 'Browse the FAQ' }));
    expect(screen.getByRole('link', { name: 'Browse the FAQ' })).toHaveAttribute('href', '/faq');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderPage();
    await checkA11y(container);
  });
});
