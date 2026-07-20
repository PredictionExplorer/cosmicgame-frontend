import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

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
      {tooltip && <InfoTooltip content={tooltip} label={title} />}
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
  const t = useTranslations('formats');
  const locale = useLocale();
  const separator = locale === 'zh' ? '' : ' ';
  let result = '';
  if (days) result += `${days}${t('durationCompact.days')}${separator}`;
  if (hours || result) result += `${hours}${t('durationCompact.hours')}${separator}`;
  if (minutes || result) result += `${minutes}${t('durationCompact.minutes')}${separator}`;
  if (seconds || result) result += `${seconds}${t('durationCompact.seconds')}`;
  if (result !== '') {
    result =
      locale === 'zh'
        ? `${t('durationCompact.left')}${result}`
        : `${result} ${t('durationCompact.left')}`;
  }
  return result !== '' ? <p className="text-primary font-medium">{result}</p> : null;
};
