import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { render } from '@/test-utils';

import { GRID_PROPS } from '../theme';

/**
 * recharts measures a tick label by writing it into a hidden span and
 * reading the span's box, which forces a layout of the whole page. The grid
 * must not do that for the vertical lines it never draws.
 */
describe('the charts’ grid', () => {
  const data = Array.from({ length: 365 }, (_, day) => ({ day: day * 86_400, gestures: day % 7 }));

  function measurements(grid: Record<string, unknown>): number {
    const measure = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
    render(
      <BarChart width={800} height={300} data={data}>
        <CartesianGrid {...grid} />
        <XAxis dataKey="day" type="number" domain={[0, 364 * 86_400]} />
        <YAxis ticks={[0, 3, 6]} />
        <Bar dataKey="gestures" isAnimationActive={false} />
      </BarChart>,
    );
    const count = measure.mock.contexts.filter(
      (element) => (element as HTMLElement).id === 'recharts_measurement_span',
    ).length;
    measure.mockRestore();
    return count;
  }

  it('measures no label for the vertical lines it hides', () => {
    const hidden = measurements({ stroke: GRID_PROPS.stroke, vertical: false });
    const shared = measurements(GRID_PROPS);
    // Without the empty generator the grid lays out every x tick for lines it never draws.
    expect(shared).toBeLessThan(hidden);
  });

  it('keeps the horizontal hairlines only', () => {
    expect(GRID_PROPS.vertical).toBe(false);
    expect(GRID_PROPS.verticalCoordinatesGenerator()).toEqual([]);
  });
});
