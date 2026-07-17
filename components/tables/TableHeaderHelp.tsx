import { useTranslations } from 'next-intl';

import { TableResponsiveHeaderLabel } from '@/components/styled';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface TableHeaderHelpProps {
  desktop: string;
  mobile?: string;
  tooltip: string;
}

export function TableHeaderHelp({ desktop, mobile = desktop, tooltip }: TableHeaderHelpProps) {
  const t = useTranslations('tables');

  return (
    <span className="inline-flex items-center gap-1.5">
      <TableResponsiveHeaderLabel desktop={desktop} mobile={mobile} />
      <InfoTooltip
        content={tooltip}
        ariaLabel={t('tableHeaderHelp.explainColumn', { column: desktop })}
        iconClassName="h-3 w-3"
      />
    </span>
  );
}
