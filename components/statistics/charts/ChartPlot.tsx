'use client';

import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

import { useNearViewport } from '@/hooks/useNearViewport';

/**
 * A chart's plot, laid out only once it nears the screen. Recharts measures
 * every axis label in a hidden span, one forced layout of the whole page per
 * label, so a page of charts drawn at load was one long task on a phone.
 * Until then the plot holds its height, so nothing below it moves when it
 * arrives; the chart's readout, controls and table render at once.
 */
export function ChartPlot({ height, children }: { height: number; children: ReactElement }) {
  const [near, ref] = useNearViewport<HTMLDivElement>();
  return (
    <div ref={ref} style={{ height }}>
      {near ? (
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
