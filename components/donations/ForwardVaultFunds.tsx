'use client';

import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { SendHorizontal } from 'lucide-react';

import { charityWalletAbi } from '@/contracts/abis';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TxStatus } from '@/components/ui/tx-status';
import { ConnectWalletAction } from '@/components/wallet/ConnectWalletAction';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { useActiveWeb3React } from '@/hooks/web3';

import { VAULT_BALANCE_QUERY_KEY } from './useVaultBalance';

/**
 * Forwards the Public Goods Vault's balance to its beneficiary: the vault's
 * `send()`, which anyone may call and which pays the beneficiary, never the
 * caller. Rendered only while the vault holds ETH, as the one action beside
 * the vault's figures: a sentence on what it does, the button (or a wallet
 * connection first) and the transaction's stage. A confirmed forward reads
 * the vault's balance again, so the action leaves once the ETH has.
 */
export function ForwardVaultFunds({
  vaultAddress,
  note,
  className,
}: {
  vaultAddress: string;
  /** What forwarding does and costs, from the page's own catalog. */
  note: string;
  className?: string;
}) {
  const toastT = useTranslations('toasts');
  const queryClient = useQueryClient();
  const { active, account } = useActiveWeb3React();
  const tx = useTxFlow();
  const stageLabel = useTxStageLabel();

  const forward = () =>
    tx.run({
      write: (ctx) =>
        ctx.writeContract({
          address: vaultAddress as `0x${string}`,
          abi: charityWalletAbi,
          functionName: 'send',
          args: [],
        }),
      successMessage: toastT('contribution.publicGoodsVault.forwarded'),
      failureMessage: toastT('contribution.publicGoodsVault.failed'),
      onConfirmed: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [VAULT_BALANCE_QUERY_KEY] }),
          queryClient.invalidateQueries({ queryKey: ['dashboardInfo'] }),
        ]);
      },
      errorContext: 'forward public goods vault funds',
    });

  return (
    <div
      data-slot="vault-forward"
      className={cn('space-y-3 rounded-surface bg-surface-sunken p-4 sm:p-5', className)}
    >
      <p className="type-body-sm text-muted-foreground">{note}</p>
      {active && account ? (
        <ChainGuard>
          <Button
            type="button"
            onClick={() => void forward()}
            loading={tx.isBusy}
            className="w-full sm:w-auto"
          >
            <SendHorizontal aria-hidden className="size-4" />
            {(tx.isBusy && stageLabel(tx.stage)) || toastT('contribution.publicGoodsVault.forward')}
          </Button>
        </ChainGuard>
      ) : (
        <ConnectWalletAction variant="outline" className="w-full sm:w-auto" />
      )}
      <TxStatus stage={tx.stage} />
    </div>
  );
}
