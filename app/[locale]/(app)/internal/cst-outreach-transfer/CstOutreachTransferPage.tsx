'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, SendHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePublicClient } from 'wagmi';

import { marketingWalletAbi } from '@/contracts/abis';
import { shortenHex } from '@/utils';

import { activeChain } from '@/config/chains';
import { reportError } from '@/utils/errors';
import { PageHeader } from '@/components/layout/PageHeader';
import { MarketingCstRewardForm } from '@/components/tokens/MarketingCstRewardForm';
import { EmptyState } from '@/components/ui/empty-state';
import { PageShell } from '@/components/ui/page-shell';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useActiveWeb3React } from '@/hooks/web3';

export default function CstOutreachTransferPage() {
  const t = useTranslations('admin');
  const roleReadError = t('outreachTransfer.roleReadError');
  const { account, active } = useActiveWeb3React();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const contractAddrs = useContractAddresses();
  const marketingWallet = contractAddrs.marketing;
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [treasurerAddress, setTreasurerAddress] = useState<string | null>(null);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !marketingWallet) {
      setOwnerAddress(null);
      setTreasurerAddress(null);
      return;
    }

    let cancelled = false;
    const loadRoles = async () => {
      setRolesLoading(true);
      setRolesError(null);

      try {
        const [owner, treasurer] = await Promise.all([
          publicClient.readContract({
            address: marketingWallet as `0x${string}`,
            abi: marketingWalletAbi,
            functionName: 'owner',
          }),
          publicClient.readContract({
            address: marketingWallet as `0x${string}`,
            abi: marketingWalletAbi,
            functionName: 'treasurerAddress',
          }),
        ]);

        if (!cancelled) {
          setOwnerAddress(String(owner));
          setTreasurerAddress(String(treasurer));
        }
      } catch (err) {
        reportError(err, 'MarketingWallet role read');
        if (!cancelled) {
          setOwnerAddress(null);
          setTreasurerAddress(null);
          setRolesError(roleReadError);
        }
      } finally {
        if (!cancelled) setRolesLoading(false);
      }
    };

    void loadRoles();

    return () => {
      cancelled = true;
    };
  }, [marketingWallet, publicClient, roleReadError]);

  const isTreasurer = useMemo(() => {
    return (
      Boolean(account && treasurerAddress) &&
      account!.toLowerCase() === treasurerAddress!.toLowerCase()
    );
  }, [account, treasurerAddress]);

  return (
    <PageShell variant="data" backdrop="signature">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title={t('outreachTransfer.title')}
          subtitle={t('outreachTransfer.subtitle')}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {!active || !account ? (
          <EmptyState
            icon={<SendHorizontal className="h-8 w-8 text-muted-foreground/50" />}
            title={t('outreachTransfer.walletRequiredTitle')}
            description={t('outreachTransfer.walletRequiredDescription')}
          />
        ) : !marketingWallet ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8 text-muted-foreground/50" />}
            title={t('outreachTransfer.walletUnavailableTitle')}
            description={t('outreachTransfer.walletUnavailableDescription')}
          />
        ) : rolesLoading ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8 text-muted-foreground/50" />}
            title={t('outreachTransfer.rolesLoadingTitle')}
            description={t('outreachTransfer.rolesLoadingDescription')}
          />
        ) : rolesError ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8 text-muted-foreground/50" />}
            title={t('outreachTransfer.rolesErrorTitle')}
            description={rolesError}
          />
        ) : !isTreasurer ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8 text-muted-foreground/50" />}
            title={t('outreachTransfer.restrictedTitle')}
            description={t('outreachTransfer.restrictedDescription', {
              treasurer: shortenHex(treasurerAddress ?? '', 6),
              owner: shortenHex(ownerAddress ?? '', 6),
            })}
          />
        ) : (
          <MarketingCstRewardForm
            marketingWalletAddress={marketingWallet}
            ownerAddress={ownerAddress}
            treasurerAddress={treasurerAddress}
            historyHref={`/cosmic-token-transfer/${marketingWallet}`}
          />
        )}
      </div>
    </PageShell>
  );
}
