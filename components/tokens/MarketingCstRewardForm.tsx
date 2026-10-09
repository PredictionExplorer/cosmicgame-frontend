'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { getAddress, isAddress, type Address } from 'viem';

import { marketingWalletAbi } from '@/contracts/abis';

import { useNotify } from '@/hooks/useNotify';
import { Link } from '@/i18n/navigation';
import { sameAddress } from '@/utils/format';
import { CstSendForm } from '@/components/tokens/transfer/CstSendForm';
import { useCstBalance } from '@/components/tokens/transfer/useCstBalance';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';

interface MarketingCstRewardFormProps {
  marketingWalletAddress: string;
  ownerAddress: string | null | undefined;
  treasurerAddress: string | null | undefined;
  historyHref?: string;
}

function normalizeAddress(value: string | null | undefined): Address | null {
  const trimmed = value?.trim() ?? '';
  return isAddress(trimmed) ? getAddress(trimmed) : null;
}

/**
 * Sends CST from the Outreach Reserve (`payReward`), for its treasurer: the
 * shared CST send form (recipient checked on-chain, the amount read in the
 * reader's number style and capped by the reserve's live balance, a review,
 * one commit button through the transaction flow) beside the reserve's
 * balance and roles. The send stops before the wallet opens unless the
 * signing wallet is the treasurer; the contract checks again.
 */
export function MarketingCstRewardForm({
  marketingWalletAddress,
  ownerAddress,
  treasurerAddress,
  historyHref,
}: MarketingCstRewardFormProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('toasts');
  const { notify } = useNotify();

  const reserve = normalizeAddress(marketingWalletAddress);
  const treasurer = normalizeAddress(treasurerAddress);
  const owner = normalizeAddress(ownerAddress);
  // The same read (and cache entry) as the send form's balance cap.
  const balance = useCstBalance(reserve);
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

  const addressValue = (address: Address | null) =>
    address ? (
      <AddressChip address={address} variant="plain" href={false} label={false} />
    ) : (
      unknown
    );

  const facts = [
    { id: 'reserve', label: t('outreachTransfer.form.reserve'), value: addressValue(reserve) },
    {
      id: 'balance',
      label: t('outreachTransfer.form.balance'),
      value:
        balance.data !== undefined ? (
          <Amount value={balance.data} unit="CST" />
        ) : balance.isError ? (
          unknown
        ) : (
          <Skeleton className="h-4 w-24" />
        ),
    },
    { id: 'treasurer', label: t('outreachTransfer.treasurer'), value: addressValue(treasurer) },
    { id: 'owner', label: t('outreachTransfer.owner'), value: addressValue(owner) },
  ];

  return (
    <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
      <section aria-labelledby="outreach-send-heading" className="max-w-xl">
        <SectionHeader
          size="panel"
          headingId="outreach-send-heading"
          title={t('outreachTransfer.form.title')}
          description={t('outreachTransfer.form.description')}
        />
        <CstSendForm
          source={reserve}
          disabled={!reserve || !treasurer}
          // The page shows this form to the treasurer only (the contract checks
          // again); a wallet switched meanwhile is told why nothing opened.
          prepare={async (ctx) => {
            if (sameAddress(ctx.account, treasurer)) return true;
            notify('error', tToast('transfer.marketingCst.treasurerRequired'));
            return false;
          }}
          write={(ctx, { recipient, amountWei }) =>
            ctx.writeContract({
              address: reserve as Address,
              abi: marketingWalletAbi,
              functionName: 'payReward',
              args: [recipient, amountWei],
            })
          }
          submitLabel={(amount) => t('outreachTransfer.form.sendAmount', { amount })}
          idleLabel={t('outreachTransfer.form.submit')}
          successMessage={t('outreachTransfer.form.confirmed')}
          failureMessage={t('outreachTransfer.form.failed')}
          errorContext="MarketingWallet payReward"
        />
      </section>

      <section
        aria-labelledby="outreach-reserve-heading"
        className="lg:border-s lg:border-rule-faint lg:ps-10"
      >
        <SectionHeader
          size="panel"
          as="h2"
          headingId="outreach-reserve-heading"
          title={t('outreachTransfer.form.reserveHeading')}
        />
        <dl className="border-t border-rule-faint">
          {facts.map((fact) => (
            <div
              key={fact.id}
              data-fact={fact.id}
              className="flex min-h-12 items-center justify-between gap-4 border-b border-rule-faint py-2.5"
            >
              <dt className="type-body-sm text-muted-foreground">{fact.label}</dt>
              <dd className="min-w-0 text-end type-figure-sm text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
        {balance.isError ? (
          <p className="mt-3 type-caption text-critical">
            {t('outreachTransfer.form.balanceError')}
          </p>
        ) : null}
        {historyHref ? (
          <Link
            href={historyHref}
            className="link-quiet mt-5 inline-flex min-h-6 items-center gap-1.5 type-body-sm text-muted-foreground hover:text-foreground"
          >
            {t('outreachTransfer.form.history')}
            <ArrowRight aria-hidden className="size-3.5 text-subtle" />
          </Link>
        ) : null}
      </section>
    </div>
  );
}
