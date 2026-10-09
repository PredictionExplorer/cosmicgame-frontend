'use client';

import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

import { cosmicTokenAbi } from '@/contracts/abis';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useNotify } from '@/hooks/useNotify';

import { CstSendForm } from './transfer/CstSendForm';

interface CstTransferFormProps {
  /** The connected wallet the CST leaves from. */
  source: Address;
  className?: string;
}

/**
 * Sends CST from the connected wallet with the token's `transfer`: the shared
 * transfer form (recipient check, amount capped by the balance, review, one
 * commit button) wired to the CST contract.
 */
export function CstTransferForm({ source, className }: CstTransferFormProps) {
  const t = useTranslations('myPages');
  const tToast = useTranslations('toasts');
  const { cosmicToken } = useContractAddresses();
  const { notify } = useNotify();

  return (
    <CstSendForm
      className={className}
      source={source}
      prepare={async () => {
        if (cosmicToken) return true;
        notify('error', tToast('transfer.cst.tokenUnavailable'));
        return false;
      }}
      write={(ctx, { recipient, amountWei }) =>
        ctx.writeContract({
          address: cosmicToken as Address,
          abi: cosmicTokenAbi,
          functionName: 'transfer',
          args: [recipient, amountWei],
        })
      }
      submitLabel={(amount) => t('transferCst.form.sendAmount', { amount })}
      idleLabel={t('transferCst.form.send')}
      successMessage={tToast('transfer.cst.confirmed')}
      failureMessage={tToast('transfer.cst.failed')}
      errorContext="cst-transfer"
    />
  );
}
