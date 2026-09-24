'use client';

import { ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useOutreachRoleHolders } from '@/components/admin/useOperatorRoles';
import { MarketingCstRewardForm } from '@/components/tokens/MarketingCstRewardForm';
import { AddressChip } from '@/components/ui/address-chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonDetailRows } from '@/components/ui/skeleton';
import { WalletRequiredState } from '@/components/wallet/WalletRequiredState';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useActiveWeb3React } from '@/hooks/web3';
import { sameAddress } from '@/utils/address';

/**
 * The outreach transfer tool, below the operator header. It asks for a
 * wallet, reads the Outreach Reserve's roles, and shows the send form only
 * to the reserve's treasurer; anyone else is told whose wallet it needs.
 */
export default function CstOutreachTransferPage() {
  const t = useTranslations('admin');
  const { account, active } = useActiveWeb3React();
  const { marketing } = useContractAddresses();
  const roles = useOutreachRoleHolders();

  if (!active || !account) {
    return (
      <WalletRequiredState
        title={t('outreachTransfer.walletRequiredTitle')}
        description={t('outreachTransfer.walletRequiredDescription')}
      />
    );
  }

  if (!marketing) {
    return (
      <EmptyState
        variant="page"
        headingLevel={2}
        icon={<ShieldAlert />}
        title={t('outreachTransfer.walletUnavailableTitle')}
        description={t('outreachTransfer.walletUnavailableDescription')}
      />
    );
  }

  if (!roles.data) {
    return roles.isError ? (
      <ErrorState
        variant="page"
        headingLevel={2}
        title={t('outreachTransfer.rolesErrorTitle')}
        message={t('outreachTransfer.rolesErrorDescription')}
        onRetry={() => void roles.refetch()}
      />
    ) : (
      <SkeletonDetailRows rows={4} className="max-w-xl" />
    );
  }

  if (!sameAddress(account, roles.data.treasurer)) {
    return (
      <EmptyState
        variant="page"
        headingLevel={2}
        icon={<ShieldAlert />}
        title={t('outreachTransfer.restrictedTitle')}
        description={t('outreachTransfer.restrictedDescription')}
        action={
          <dl className="grid grid-cols-[auto_auto] items-center justify-center gap-x-4 gap-y-2 type-body-sm">
            <dt className="text-end text-muted-foreground">{t('outreachTransfer.treasurer')}</dt>
            <dd className="text-start">
              <AddressChip
                address={roles.data.treasurer}
                variant="plain"
                href={false}
                label={false}
              />
            </dd>
            <dt className="text-end text-muted-foreground">{t('outreachTransfer.owner')}</dt>
            <dd className="text-start">
              <AddressChip address={roles.data.owner} variant="plain" href={false} label={false} />
            </dd>
          </dl>
        }
      />
    );
  }

  return (
    <MarketingCstRewardForm
      marketingWalletAddress={marketing}
      ownerAddress={roles.data.owner}
      treasurerAddress={roles.data.treasurer}
      historyHref={`/cosmic-token-transfer/${marketing}`}
    />
  );
}
