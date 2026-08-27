import { render, screen, within, checkA11y } from '@/test-utils';

import { GesturePriceStrip } from '../GesturePriceStrip';

const data = {
  LastBidderAddr: '0x1111111111111111111111111111111111111111',
} as never;

const cstData = {
  AuctionDuration: 3600,
  CSTPrice: 12.5,
  CSTPriceWei: 12500000000000000000n,
  SecondsElapsed: 120,
  isFree: false,
  source: 'api' as const,
};

describe('GesturePriceStrip', () => {
  it('shows all three live method prices', () => {
    render(
      <GesturePriceStrip
        data={data}
        ethGestureInfo={{ AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 120 }}
        cstGestureData={cstData}
      />,
    );

    expect(screen.getByTestId('gesture-price-eth')).toHaveTextContent('0.01000 ETH');
    expect(screen.getByTestId('gesture-price-randomWalk')).toHaveTextContent('0.00500 ETH');
    expect(screen.getByTestId('gesture-price-cst')).toHaveTextContent('12.5 CST');
  });

  it('shows a free CST cost after its Calibration Window ends', () => {
    render(
      <GesturePriceStrip
        data={data}
        ethGestureInfo={{ AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 120 }}
        cstGestureData={{ ...cstData, CSTPrice: 0, CSTPriceWei: 0n, isFree: true }}
      />,
    );

    expect(screen.getByTestId('gesture-price-cst')).toHaveTextContent('home.status.metrics.free');
  });

  it('clearly marks RandomWalk and CST as unavailable before the first Gesture', () => {
    render(
      <GesturePriceStrip
        data={
          {
            LastBidderAddr: '0x0000000000000000000000000000000000000000',
          } as never
        }
        ethGestureInfo={{ AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 120 }}
        cstGestureData={cstData}
      />,
    );

    expect(screen.getByTestId('gesture-price-eth')).toHaveTextContent('0.01000 ETH');
    expect(screen.getByTestId('gesture-price-randomWalk')).toHaveTextContent(
      'home.observatory.prices.availableAfterFirst',
    );
    expect(screen.getByTestId('gesture-price-cst')).toHaveTextContent(
      'home.observatory.prices.availableAfterFirst',
    );
  });

  it('is read-only and never creates another gesture action', () => {
    render(
      <GesturePriceStrip
        data={data}
        ethGestureInfo={{ AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 120 }}
        cstGestureData={cstData}
      />,
    );

    const strip = screen.getByTestId('gesture-price-strip');
    // Info-tooltip triggers are allowed; method cells themselves are static.
    for (const method of ['eth', 'randomWalk', 'cst']) {
      expect(screen.getByTestId(`gesture-price-${method}`).tagName).toBe('DIV');
    }
    expect(strip.querySelector('[aria-pressed]')).toBeNull();
    expect(within(strip).queryByRole('link')).not.toBeInTheDocument();
  });

  it('retains the pinned bilingual method-group heading key', () => {
    render(<GesturePriceStrip data={data} ethGestureInfo={null} cstGestureData={cstData} />);
    expect(screen.getByText('home.form.methodLabel')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <GesturePriceStrip
        data={data}
        ethGestureInfo={{ AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 120 }}
        cstGestureData={cstData}
      />,
    );
    await checkA11y(container);
  });
});
