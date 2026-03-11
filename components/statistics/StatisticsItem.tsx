import type { ReactNode } from 'react';

/** Props for a single statistics label/value row. */
export interface StatisticsItemProps {
  title: string;
  value: ReactNode;
}

/** Displays a single statistics metric as a label/value row. */
export const StatisticsItem = ({ title, value }: StatisticsItemProps) => (
  <div className="my-2 flex flex-wrap">
    <p className="mr-4 w-[200px] font-medium text-primary md:w-[400px]">{title}</p>
    <p className="flex-1 break-all">{value}</p>
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
  return result !== '' ? <p>{result}</p> : null;
};
