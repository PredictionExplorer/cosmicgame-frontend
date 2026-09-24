import { within } from '@testing-library/react';

import { howItWorksContentEn } from '@/content/how-it-works';
import { protocolFacts } from '@/content/protocol-facts';

import { render, screen, checkA11y } from '@/test-utils';

import { CycleTimeline } from '../components/CycleTimeline';

const { gameCycle, payoff } = howItWorksContentEn;

const renderTimeline = () =>
  render(
    <CycleTimeline gameCycle={gameCycle} payoff={payoff} unavailableLabel="Artwork unavailable" />,
  );

describe('CycleTimeline', () => {
  it('captions the six stages in order, each label explaining itself', () => {
    renderTimeline();
    const stages = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(stages).toHaveLength(6);
    gameCycle.phases.forEach((phase, index) => {
      const stage = stages[index]!;
      expect(stage).toHaveTextContent(String(index + 1));
      expect(within(stage).getByRole('heading', { level: 3 })).toHaveTextContent(phase.label);
      expect(within(stage).getByRole('button', { name: phase.label })).toBeInTheDocument();
      expect(stage).toHaveTextContent(phase.description);
    });
  });

  it('keeps the drawing out of the accessibility tree, since the captions carry it', () => {
    renderTimeline();
    const diagram = screen.getByTestId('cycle-diagram');
    const drawings = diagram.querySelectorAll('svg');
    // A compact arrangement for phones and the full clock from tablets up.
    expect(
      [...diagram.querySelectorAll('[data-layout]')].map((node) =>
        node.getAttribute('data-layout'),
      ),
    ).toEqual(['compact', 'wide']);
    drawings.forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'));
    // Marker and pattern ids stay unique across the two drawings.
    const ids = [...diagram.querySelectorAll('[id]')].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names the payment methods in a legend, by ticker', () => {
    renderTimeline();
    const diagram = screen.getByTestId('cycle-diagram');
    expect(diagram).toHaveTextContent(/ETH\s*ETH \+ RWLK\s*CST/);
  });

  it('splits the reserve in proportion to the shares in protocol-facts', () => {
    renderTimeline();
    const width = (id: string) =>
      Number(
        screen
          .getByTestId('cycle-diagram')
          .querySelector(`[data-track="${id}"]`)
          ?.getAttribute('width'),
      ) + 2;
    const ratio = width('signature') / width('chrono');
    expect(ratio).toBeCloseTo(
      protocolFacts.mainEthPercentage / protocolFacts.chronoWarriorEthPercentage,
      1,
    );
    expect(width('nextCycle')).toBeGreaterThan(width('publicGoods'));
  });

  it('closes on a real Signature with its wall label and a link to the record', () => {
    renderTimeline();
    expect(screen.getByText('The Signature of Cycle 1')).toBeInTheDocument();
    expect(screen.getByText('Cosmic Signature #000024')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View this Signature/ })).toHaveAttribute(
      'href',
      '/detail/24',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderTimeline();
    await checkA11y(container);
  });
});
