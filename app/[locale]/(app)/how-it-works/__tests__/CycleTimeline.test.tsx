import { within } from '@testing-library/react';

import { howItWorksContentEn } from '@/content/how-it-works';
import { protocolFacts } from '@/content/protocol-facts';
import contractsMessages from '@/messages/en/contracts.json';

import { ALLOCATION_TRACK_COPY_KEYS, ALLOCATION_TRACK_IDS } from '@/config/allocationTracks';

import { render, screen, checkA11y } from '@/test-utils';

import { CycleTimeline } from '../components/CycleTimeline';

/** The track names the page reads from contracts.funds.segments. */
const segments: Record<string, { label: string }> = contractsMessages.funds.segments;
const TRACK_LABELS_EN = Object.fromEntries(
  ALLOCATION_TRACK_IDS.map((id) => [id, segments[ALLOCATION_TRACK_COPY_KEYS[id]]!.label]),
) as Record<(typeof ALLOCATION_TRACK_IDS)[number], string>;

const { gameCycle, payoff } = howItWorksContentEn;

const renderTimeline = () =>
  render(
    <CycleTimeline
      gameCycle={gameCycle}
      payoff={payoff}
      trackLabels={TRACK_LABELS_EN}
      locale="en"
      unavailableLabel="Artwork unavailable"
    />,
  );

describe('CycleTimeline', () => {
  it('captions the six stages in order, each rule in the open', () => {
    const { container } = renderTimeline();
    const stages = within(container.querySelector('ol')!).getAllByRole('listitem');
    expect(stages).toHaveLength(6);
    gameCycle.phases.forEach((phase, index) => {
      const stage = stages[index]!;
      expect(stage).toHaveTextContent(String(index + 1));
      expect(within(stage).getByRole('heading', { level: 3 })).toHaveTextContent(phase.label);
      expect(stage).toHaveTextContent(phase.description);
      // D073: a stage heading is a heading, not a popover trigger.
      expect(within(stage).queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('keeps the drawing out of the accessibility tree, since the captions carry it', () => {
    renderTimeline();
    const diagram = screen.getByTestId('cycle-diagram');
    const drawings = diagram.querySelectorAll('[data-layout] svg');
    // A compact arrangement for phones and the full clock from tablets up.
    expect(
      [...diagram.querySelectorAll('[data-layout]')].map((node) =>
        node.getAttribute('data-layout'),
      ),
    ).toEqual(['compact', 'wide']);
    drawings.forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'));
    // Marker and pattern ids stay unique across the two drawings and the key.
    const ids = [...diagram.querySelectorAll('[id]')].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names the payment methods in the key, by ticker', () => {
    renderTimeline();
    const diagram = screen.getByTestId('cycle-diagram');
    expect(diagram).toHaveTextContent(/ETH\s*ETH \+ RWLK\s*CST/);
  });

  it('labels the hatched band and every allocation segment with its name and share (D083)', () => {
    renderTimeline();
    const key = screen.getByTestId('cycle-diagram').querySelector('figcaption')!;
    expect(key).toHaveTextContent(gameCycle.legend.exclusiveWindow);
    expect(key).toHaveTextContent(
      `${protocolFacts.finalGestureExclusivityHours}-hour window: only the Final Gesture participant can finalize`,
    );
    const track = (id: string) => key.querySelector(`[data-legend-track="${id}"]`);
    expect(track('signature')).toHaveTextContent(
      `Signature Allocation${protocolFacts.mainEthPercentage}%`,
    );
    expect(track('chrono')).toHaveTextContent(
      `Chrono-Warrior${protocolFacts.chronoWarriorEthPercentage}%`,
    );
    expect(track('publicGoods')).toHaveTextContent(
      `Public Goods${protocolFacts.publicGoodsPercentage}%`,
    );
    expect(track('nextCycle')).toHaveTextContent(
      `Next cycle${protocolFacts.compoundingReservePercentage}%`,
    );
  });

  it('numbers each stage on the object its caption is about (V241)', () => {
    renderTimeline();
    for (const drawing of screen
      .getByTestId('cycle-diagram')
      .querySelectorAll<HTMLElement>('[data-layout]')) {
      const svg = drawing.querySelector('svg')!;
      const viewWidth = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
      const at = (n: number) =>
        (parseFloat(
          [...drawing.querySelectorAll<HTMLElement>('span[style]')].find(
            (mark) => mark.textContent === String(n),
          )!.style.left,
        ) /
          100) *
        viewWidth;
      const bar = (id: string) => {
        const rect = drawing.querySelector(`[data-track="${id}"]`)!;
        const x = Number(rect.getAttribute('x'));
        return { start: x - 1, end: x + Number(rect.getAttribute('width')) + 1 };
      };
      // 4, the finalization that divides the reserve: the start of the allocation bar.
      expect(at(4)).toBeCloseTo(bar('signature').start, 0);
      // 5, the Stellar Selections: over the Stellar Selection segment only.
      expect(at(5)).toBeGreaterThanOrEqual(bar('stellar').start);
      expect(at(5)).toBeLessThanOrEqual(bar('stellar').end);
    }
  });

  it('names the hatched band’s row like the other rows of the key, its swatch inline', () => {
    renderTimeline();
    const key = screen.getByTestId('cycle-diagram').querySelector('figcaption')!;
    const label = within(key).getByText(gameCycle.legend.finalization);
    const row = key.querySelector('[data-legend="exclusive-window"]')!;
    expect(label.nextElementSibling).toBe(row);
    expect(row.querySelector('svg')).not.toBeNull();
  });

  it('sets the stages’ teaching copy at body size', () => {
    const { container } = renderTimeline();
    for (const description of container.querySelectorAll('ol li p')) {
      expect(description).toHaveClass('type-body-md');
    }
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
    expect(screen.getByText('The Signature of Cycle #1')).toBeInTheDocument();
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
