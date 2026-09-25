import { useNearViewport } from '@/hooks/useNearViewport';

import { render, screen } from '@/test-utils';

import { ChartPlot } from '../ChartPlot';

jest.mock('recharts', () => require('@/test-utils/recharts').rechartsStub());

const mockUseNearViewport = useNearViewport as jest.MockedFunction<typeof useNearViewport>;
jest.mock('@/hooks/useNearViewport', () => ({ useNearViewport: jest.fn() }));

function Plot() {
  return <svg data-testid="plot" />;
}

describe('ChartPlot', () => {
  it('holds the plot’s height and draws nothing until the plot nears the screen', () => {
    mockUseNearViewport.mockReturnValue([false, () => undefined]);
    const { container } = render(
      <ChartPlot height={280}>
        <Plot />
      </ChartPlot>,
    );
    expect(screen.queryByTestId('plot')).toBeNull();
    expect((container.firstElementChild as HTMLElement).style.height).toBe('280px');
  });

  it('draws the plot once it is near', () => {
    mockUseNearViewport.mockReturnValue([true, () => undefined]);
    render(
      <ChartPlot height={280}>
        <Plot />
      </ChartPlot>,
    );
    expect(screen.getByTestId('plot')).toBeInTheDocument();
  });
});
