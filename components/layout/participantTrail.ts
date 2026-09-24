import { useTranslations } from 'next-intl';
import { isAddress } from 'viem';

import type { BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { formatAddress } from '@/utils/format';

/**
 * The breadcrumb parents of a participant's record pages, for `PageHeader`
 * with `section="insights"`: Participants (the participation statistics),
 * then the participant's profile when `address` is given.
 *
 *   /user/0xA169…            Home › Insights › Participants
 *   /user/stellar-…/0xA169…  Home › Insights › Participants › 0xA169…63B6
 */
export function useParticipantTrail(address?: string | null): BreadcrumbItem[] {
  const t = useTranslations('common');
  const trail: BreadcrumbItem[] = [
    { label: t('pageHeader.crumbs.participants'), href: '/statistics/participation' },
  ];
  if (address && isAddress(address, { strict: false })) {
    trail.push({ label: formatAddress(address), href: `/user/${address}` });
  }
  return trail;
}
