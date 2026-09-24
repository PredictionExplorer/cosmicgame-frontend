import { getHowItWorksContent, howItWorksContentEn } from '@/content/how-it-works';
import { protocolFacts } from '@/content/protocol-facts';

import { render, screen, checkA11y } from '@/test-utils';

import { GestureCosts } from '../components/GestureCosts';

const costs = howItWorksContentEn.costs;

describe('GestureCosts', () => {
  it('names what a gesture costs as label-and-fact rows (D072)', () => {
    render(<GestureCosts costs={costs} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'What a gesture costs' }),
    ).toBeInTheDocument();
    const terms = screen.getAllByRole('term').map((term) => term.textContent);
    expect(terms).toEqual([
      'The spend is not returned',
      'The ETH cost steps up',
      'Gas is paid separately',
    ]);
    expect(
      screen.getByText(new RegExp(`by ${protocolFacts.ethGestureCostStepUpPercent}%`)),
    ).toBeInTheDocument();
  });

  it('closes with a caution and the risk disclosures', () => {
    render(<GestureCosts costs={costs} />);
    expect(screen.getByText(costs.note)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read the risk disclosures' })).toHaveAttribute(
      'href',
      '/risk-disclosures',
    );
  });

  it('renders every locale’s rows', () => {
    const { rerender } = render(<GestureCosts costs={costs} />);
    for (const locale of ['uk', 'ja', 'vi']) {
      const localized = getHowItWorksContent(locale).costs;
      rerender(<GestureCosts costs={localized} />);
      expect(screen.getAllByRole('term')).toHaveLength(3);
      expect(screen.getByRole('link', { name: localized.riskLink.label })).toBeInTheDocument();
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GestureCosts costs={costs} />);
    await checkA11y(container);
  });
});
