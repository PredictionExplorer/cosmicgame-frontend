import type { ReactNode } from 'react';

import { InfoTooltip } from '@/components/ui/info-tooltip';

/** Props for a single statistics label/value row. */
export interface StatisticsItemProps {
  title: string;
  value: ReactNode;
  tooltip?: string;
}

/** Displays a single statistics metric as a stacked label/value block. */
export const StatisticsItem = ({ title, value, tooltip }: StatisticsItemProps) => (
  <div className="rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
    <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
      <span>{title}</span>
      {tooltip && <InfoTooltip content={tooltip} />}
    </p>
    <p className="text-sm font-semibold">{value}</p>
  </div>
);

/** Renders a countdown timer showing days, hours, minutes, seconds remaining. */
export const CountdownRenderer = ({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) => {
  let result = '';
  if (days) result += `${days}d `;
  if (hours || result) result += `${hours}h `;
  if (minutes || result) result += `${minutes}m `;
  if (seconds || result) result += `${seconds}s`;
  if (result !== '') result += ' left';
  return result !== '' ? <p className="text-primary font-medium">{result}</p> : null;
};
