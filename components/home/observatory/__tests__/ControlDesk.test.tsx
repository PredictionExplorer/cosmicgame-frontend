import { createRef } from 'react';

import { render, screen, checkA11y } from '@/test-utils';

import { ControlDesk } from '../ControlDesk';

const makeProps = () => ({
  header: <div data-testid="slot-header">Header</div>,
  clock: <div data-testid="slot-clock">Clock</div>,
  latestParticipant: <div data-testid="slot-latest">Latest</div>,
  chronoEndurance: <div data-testid="slot-chrono">Chrono</div>,
  gestureConsole: <div data-testid="slot-gesture">Gesture</div>,
  mobilePrices: <div data-testid="slot-prices">Prices</div>,
  personal: <div data-testid="slot-personal">Personal</div>,
  allocationLedger: <div data-testid="slot-ledger">Ledger</div>,
});

describe('ControlDesk', () => {
  it('keeps every critical surface inside one continuous outer surface', () => {
    render(<ControlDesk {...makeProps()} />);

    const desk = screen.getByTestId('control-desk');
    for (const id of [
      'slot-header',
      'slot-clock',
      'slot-latest',
      'slot-chrono',
      'slot-gesture',
      'slot-prices',
      'slot-personal',
      'slot-ledger',
    ]) {
      expect(desk).toContainElement(screen.getByTestId(id));
    }
  });

  it('uses a gapless 12-column desktop grid with full-width Chrono intelligence', () => {
    render(<ControlDesk {...makeProps()} />);

    expect(screen.getByTestId('control-desk-grid')).toHaveClass(
      'grid',
      'lg:grid-cols-12',
      'items-stretch',
    );
    expect(screen.getByTestId('control-desk-gesture')).toHaveClass(
      'hidden',
      'lg:block',
      'xl:col-span-4',
    );
    expect(screen.getByTestId('control-desk-chrono')).toHaveClass(
      'xl:col-span-12',
      'xl:row-start-2',
    );
  });

  it('orders mobile information before the hidden inline gesture console', () => {
    render(<ControlDesk {...makeProps()} />);

    const clock = screen.getByTestId('control-desk-clock');
    const prices = screen.getByTestId('control-desk-mobile-prices');
    const latest = screen.getByTestId('control-desk-latest');
    const chrono = screen.getByTestId('control-desk-chrono');
    const gesture = screen.getByTestId('control-desk-gesture');

    expect(clock).toHaveClass('order-1');
    expect(prices).toHaveClass('order-2', 'lg:hidden');
    expect(latest).toHaveClass('order-3');
    expect(chrono).toHaveClass('order-4');
    expect(gesture).toHaveClass('order-5', 'hidden');
  });

  it('omits optional personal and gesture slots cleanly', () => {
    const props = makeProps();
    render(<ControlDesk {...props} personal={undefined} gestureConsole={undefined} />);

    expect(screen.queryByTestId('control-desk-personal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('control-desk-gesture')).not.toBeInTheDocument();
    expect(screen.getByTestId('slot-ledger')).toBeInTheDocument();
  });

  it('forwards the stage ref for ActionDock visibility tracking', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ControlDesk {...makeProps()} ref={ref} />);
    expect(ref.current).toHaveAttribute('id', 'deck');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ControlDesk {...makeProps()} />);
    await checkA11y(container);
  });
});
