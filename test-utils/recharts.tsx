/**
 * A Recharts stand-in for jsdom, which never measures a container, so the
 * real charts draw nothing there. Each chart renders a marked box carrying
 * its point count; each axis prints its tick labels through its own
 * `tickFormatter`; a line, area or scatter draws its `dot` renderer for every
 * datum; `Tooltip` renders its `content` for the first datum, so
 * the charts' own tooltip components are still exercised.
 *
 *     jest.mock('recharts', () => require('@/test-utils/recharts').rechartsStub());
 */
import React from 'react';

type Props = Record<string, unknown> & { children?: React.ReactNode };

const state: { data: unknown[] } = { data: [] };

/** The data the last chart rendered. */
export function lastChartData<T = unknown>(): T[] {
  return state.data as T[];
}

function chart(testId: string) {
  return function Chart({ data, children }: Props) {
    state.data = (data as unknown[]) ?? [];
    return (
      <div data-testid={testId} data-point-count={state.data.length}>
        {children}
      </div>
    );
  };
}

function axis(testId: string) {
  return function Axis({ ticks, tickFormatter }: Props) {
    const values = (ticks as number[] | undefined) ?? [];
    const format = tickFormatter as ((value: number) => string) | undefined;
    return (
      <div data-testid={testId}>
        {values.map((value) => (
          <span key={value}>{format ? format(value) : String(value)}</span>
        ))}
      </div>
    );
  };
}

const Nothing = () => null;

/** A series draws its own dot renderer for every datum, so custom dots are testable. */
function series(kind: string) {
  return function Series({ dataKey, dot }: Props) {
    const draw = typeof dot === 'function' ? (dot as (props: object) => React.ReactNode) : null;
    return (
      <svg data-testid={`${kind}-${String(dataKey)}`}>
        {draw
          ? state.data.map((payload, index) => draw({ cx: index, cy: index, index, payload }))
          : null}
      </svg>
    );
  };
}

export function rechartsStub() {
  return {
    ResponsiveContainer: ({ children }: Props) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: chart('bar-chart'),
    LineChart: chart('line-chart'),
    AreaChart: chart('area-chart'),
    ComposedChart: chart('composed-chart'),
    ScatterChart: chart('scatter-chart'),
    XAxis: axis('x-axis'),
    YAxis: axis('y-axis'),
    Bar: Nothing,
    Line: series('line'),
    Area: series('area'),
    Scatter: series('scatter'),
    CartesianGrid: Nothing,
    ReferenceLine: Nothing,
    ReferenceArea: Nothing,
    Legend: Nothing,
    Cell: Nothing,
    Tooltip: ({ content }: Props) =>
      React.isValidElement(content) && state.data.length > 0
        ? React.cloneElement(content as React.ReactElement<Props>, {
            active: true,
            payload: [{ payload: state.data[0] }],
          })
        : null,
  };
}
