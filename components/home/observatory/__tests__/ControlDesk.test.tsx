import { createRef } from 'react';
import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import { ControlDesk } from '../ControlDesk';

const makeProps = () => ({
  header: <div data-testid="slot-header">Header</div>,
  clock: <div data-testid="slot-clock">Clock</div>,
  calibration: <div data-testid="slot-calibration">Calibration</div>,
  orientation: <div data-testid="slot-orientation">Orientation</div>,
  latestParticipant: <div data-testid="slot-latest">Latest</div>,
  chronoEndurance: <div data-testid="slot-chrono">Chrono</div>,
  gestureConsole: <div data-testid="slot-gesture">Gesture</div>,
  personal: <div data-testid="slot-personal">Personal</div>,
  allocationLedger: <div data-testid="slot-ledger">Ledger</div>,
});

describe('ControlDesk', () => {
  it('keeps every decision surface, the guide, and supporting information together', () => {
    render(<ControlDesk {...makeProps()} />);

    const desk = screen.getByTestId('control-desk');
    for (const id of [
      'slot-header',
      'slot-clock',
      'slot-calibration',
      'slot-orientation',
      'slot-latest',
      'slot-chrono',
      'slot-gesture',
      'slot-personal',
      'slot-ledger',
    ]) {
      expect(desk).toContainElement(screen.getByTestId(id));
    }
  });

  it('shows the clock, standings, calibration, and action without disclosure', () => {
    render(<ControlDesk {...makeProps()} />);

    expect(screen.getByTestId('slot-clock')).toBeVisible();
    expect(screen.getByTestId('slot-latest')).toBeVisible();
    expect(screen.getByTestId('slot-chrono')).toBeVisible();
    expect(screen.getByTestId('slot-calibration')).toBeVisible();
    expect(screen.getByTestId('slot-gesture')).toBeVisible();
    expect(screen.queryByTestId('standings-disclosure')).not.toBeInTheDocument();
    // jsdom cannot evaluate Tailwind breakpoints; guard the old mobile-only
    // hiding rule separately from the semantic visibility assertions.
    expect(screen.getByTestId('control-desk-gesture')).not.toHaveClass('hidden');
  });

  it('reveals supplementary allocations without changing the decision surfaces', async () => {
    const user = userEvent.setup();
    render(<ControlDesk {...makeProps()} />);

    const allocations = screen.getByTestId('allocations-disclosure');
    const allocationsSummary = screen
      .getByText('home.orientation.allocationsTitle')
      .closest('summary');
    expect(allocations).not.toHaveAttribute('open');
    expect(screen.getByTestId('slot-ledger')).not.toBeVisible();

    expect(allocationsSummary).not.toBeNull();
    await user.click(allocationsSummary!);
    expect(screen.getByTestId('slot-ledger')).toBeVisible();
    await user.click(allocationsSummary!);
    expect(screen.getByTestId('slot-ledger')).not.toBeVisible();
    expect(screen.getByTestId('slot-latest')).toBeVisible();
    expect(screen.getByTestId('slot-chrono')).toBeVisible();
    expect(screen.getByTestId('slot-calibration')).toBeVisible();
    expect(screen.getByTestId('slot-gesture')).toBeVisible();
  });

  it('keeps the allocation fragment on the disclosure that reveals its content', () => {
    render(<ControlDesk {...makeProps()} />);

    expect(screen.getByTestId('allocations-disclosure')).toHaveAttribute(
      'id',
      'allocation-breakdown',
    );
  });

  it('omits optional personal and gesture slots cleanly', () => {
    const props = makeProps();
    render(<ControlDesk {...props} personal={undefined} gestureConsole={undefined} />);

    expect(screen.queryByTestId('control-desk-personal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('control-desk-gesture')).not.toBeInTheDocument();
    expect(screen.getByTestId('slot-ledger')).toBeInTheDocument();
    expect(screen.getByTestId('slot-clock')).toBeVisible();
    expect(screen.getByTestId('slot-calibration')).toBeVisible();
    expect(screen.getByTestId('slot-orientation')).toBeVisible();
  });

  it('keeps calibration before the form in reading order', () => {
    render(<ControlDesk {...makeProps()} />);

    const calibration = screen.getByTestId('slot-calibration');
    const gesture = screen.getByTestId('slot-gesture');
    expect(calibration.compareDocumentPosition(gesture)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('forwards the stage ref for ActionDock visibility tracking', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ControlDesk {...makeProps()} ref={ref} />);
    expect(ref.current).toHaveAttribute('id', 'deck');
    expect(ref.current).toContainElement(screen.getByTestId('slot-gesture'));
    expect(ref.current).toContainElement(screen.getByTestId('slot-latest'));
    expect(ref.current).toContainElement(screen.getByTestId('slot-chrono'));
    expect(ref.current).toContainElement(screen.getByTestId('slot-calibration'));
    expect(ref.current).not.toContainElement(screen.getByTestId('allocations-disclosure'));
  });

  it('has no accessibility violations', async () => {
    const user = userEvent.setup();
    const { container } = render(<ControlDesk {...makeProps()} />);
    await checkA11y(container);
    await user.click(screen.getByText('home.orientation.allocationsTitle'));
    await checkA11y(container);
  });
});
