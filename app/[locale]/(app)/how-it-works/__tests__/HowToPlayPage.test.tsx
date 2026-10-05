import { howItWorksContentEn } from '@/content/how-it-works';
import contractsMessages from '@/messages/en/contracts.json';

import { ALLOCATION_TRACK_COPY_KEYS, ALLOCATION_TRACK_IDS } from '@/config/allocationTracks';

import { render, screen, checkA11y } from '@/test-utils';

import HowToPlayPage from '../HowToPlayPage';

const segments: Record<string, { label: string }> = contractsMessages.funds.segments;
const TRACK_LABELS_EN = Object.fromEntries(
  ALLOCATION_TRACK_IDS.map((id) => [id, segments[ALLOCATION_TRACK_COPY_KEYS[id]]!.label]),
) as Record<(typeof ALLOCATION_TRACK_IDS)[number], string>;

const renderPage = () =>
  render(
    <HowToPlayPage
      content={howItWorksContentEn}
      trackLabels={TRACK_LABELS_EN}
      locale="en"
      unavailableLabel="Artwork unavailable"
    />,
  );

describe('HowToPlayPage', () => {
  it('opens with one plain H1', () => {
    renderPage();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(/^How Cosmic Signature works$/);
    // One string: no markup but the span that holds the brand on one line (V425).
    expect([...h1.querySelectorAll('*')].map((node) => node.textContent)).toEqual([
      'Cosmic Signature',
    ]);
  });

  it('draws the mechanism once, then what a gesture leads to and costs, how to start, what to know and one call to action', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Lifecycle of a Performance Cycle',
      'What a gesture can lead to',
      'What a gesture costs',
      'Getting started',
      'Good to know',
      'Ready to make your first gesture?',
    ]);
    expect(screen.getAllByTestId('cycle-diagram')).toHaveLength(1);
    // F231: no overview cards restating the lifecycle, and no second closing panel.
    expect(screen.queryByText('How It Works')).not.toBeInTheDocument();
    expect(screen.queryByText('Have Questions?')).not.toBeInTheDocument();
  });

  it('explains itself in the open: no heading hides its rule in a popover (D073)', () => {
    renderPage();
    // The only buttons are real actions; there are none on this static page.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    for (const heading of screen.getAllByRole('heading', { level: 3 })) {
      expect(heading.querySelector('[role="button"]')).toBeNull();
    }
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

  it('says what a gesture costs right after what it can lead to, with the risk disclosures (D072)', () => {
    renderPage();
    const costs = screen.getByRole('region', { name: 'What a gesture costs' });
    for (const item of howItWorksContentEn.costs.items) {
      expect(costs).toHaveTextContent(item.title);
      expect(costs).toHaveTextContent(item.body);
    }
    expect(screen.getByRole('link', { name: /Read the risk disclosures/ })).toHaveAttribute(
      'href',
      '/risk-disclosures',
    );
  });

  it('closes with the gesture form and the FAQ in one section', () => {
    renderPage();
    const cta = screen.getByRole('region', { name: 'Ready to make your first gesture?' });
    expect(cta).toContainElement(screen.getByRole('link', { name: 'Browse the FAQ' }));
    expect(screen.getByRole('link', { name: 'Browse the FAQ' })).toHaveAttribute('href', '/faq');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderPage();
    await checkA11y(container);
  });
});
