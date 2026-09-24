'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getAddress, isAddress, type Address } from 'viem';

import { marketingWalletAbi } from '@/contracts/abis';

import { Link } from '@/i18n/navigation';
import { useNotify } from '@/hooks/useNotify';
import { sameAddress } from '@/utils/format';
import { AddressChip } from '@/components/ui/address-chip';
import { UnknownValue } from '@/components/ui/unknown-value';

import { CstSendForm } from './transfer/CstSendForm';

interface MarketingCstRewardFormProps {
  marketingWalletAddress: string | null | undefined;
  ownerAddress: string | null | undefined;
  treasurerAddress: string | null | undefined;
  historyHref?: string;
}

function toAddress(value: string | null | undefined): Address | null {
  const trimmed = value?.trim() ?? '';
  return isAddress(trimmed, { strict: false }) ? getAddress(trimmed) : null;
}

/**
 * The treasurer's form for an Outreach Reserve allocation: CST sent from the
 * reserve with its `payReward`, on the shared transfer form (recipient check,
 * amount capped by the reserve's balance, review, one commit button). The
 * reserve and its two roles are listed above it, so the signer can see which
 * wallet must confirm.
 */
export function MarketingCstRewardForm({
  marketingWalletAddress,
  ownerAddress,
  treasurerAddress,
  historyHref,
}: MarketingCstRewardFormProps) {
  const t = useTranslations('toasts');
  const tMarketing = useTranslations('marketing');
  const tCommon = useTranslations('common');
  const { notify } = useNotify();
  const reserve = toAddress(marketingWalletAddress);
  const treasurer = toAddress(treasurerAddress);
  const owner = toAddress(ownerAddress);

  const roles = [
    { key: 'reserve', label: tMarketing('transferForm.reserveLabel'), address: reserve },
    { key: 'treasurer', label: tMarketing('transferForm.treasurerLabel'), address: treasurer },
    { key: 'owner', label: tMarketing('transferForm.ownerLabel'), address: owner },
  ];

  return (
    <section
      aria-labelledby="outreach-transfer-title"
      className="rounded-surface bg-surface p-5 sm:p-8"
    >
      <h2 id="outreach-transfer-title" className="type-heading-3 text-foreground">
        {tMarketing('transferForm.title')}
      </h2>
      <p className="mt-1 type-body-sm text-muted-foreground">
        {tMarketing('transferForm.description')}
      </p>

      <dl className="mt-6 divide-y divide-rule-faint border-y border-rule-faint">
        {roles.map((role) => (
          <div key={role.key} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="type-label text-subtle">{role.label}</dt>
            <dd className="min-w-0">
              {role.address ? (
                <AddressChip address={role.address} label={false} />
              ) : (
                <UnknownValue label={tCommon('status.unavailable')} />
              )}
            </dd>
          </div>
        ))}
      </dl>

      <CstSendForm
        className="mt-8"
        source={reserve}
        prepare={async (ctx) => {
          if (!reserve) {
            notify('error', t('transfer.marketingCst.reserveUnavailable'));
            return false;
          }
          if (!treasurer || !sameAddress(ctx.account, treasurer)) {
            notify('error', t('transfer.marketingCst.treasurerRequired'));
            return false;
          }
          return true;
        }}
        write={(ctx, { recipient, amountWei }) =>
          ctx.writeContract({
            address: reserve as Address,
            abi: marketingWalletAbi,
            functionName: 'payReward',
            args: [recipient, amountWei],
          })
        }
        submitLabel={(amount) => t('transfer.marketingCst.payAmount', { amount })}
        idleLabel={t('transfer.marketingCst.pay')}
        successMessage={t('transfer.marketingCst.confirmed')}
        failureMessage={t('transfer.marketingCst.failed')}
        errorContext="outreach-reserve-pay-reward"
        invalidateKeys={[['marketingRewards'], ['marketingRewardsByUser']]}
        footer={
          historyHref ? (
            <Link
              href={historyHref}
              className="link-quiet inline-flex min-h-6 items-center gap-1.5 self-start type-body-sm text-foreground"
            >
              {tMarketing('transferForm.historyLink')}
              <ArrowRight aria-hidden className="size-3.5 text-subtle" />
            </Link>
          ) : null
        }
      />
    </section>
  );
}
