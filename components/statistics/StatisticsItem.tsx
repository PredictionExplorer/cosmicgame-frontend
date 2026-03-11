import type { ReactNode } from 'react';

/** Props for a single statistics label/value row. */
export interface StatisticsItemProps {
  title: string;
  value: ReactNode;
}

/** Displays a single statistics metric as a label/value row. */
export const StatisticsItem = ({ title, value }: StatisticsItemProps) => (
  <div className="flex items-baseline gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
    <p className="text-sm text-muted-foreground w-[200px] md:w-[380px] shrink-0">{title}</p>
    <p className="flex-1 break-all text-sm font-medium">{value}</p>
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
