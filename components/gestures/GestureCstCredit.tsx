'use client';

import { useTranslations } from 'next-intl';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { UnknownValue } from '@/components/ui/unknown-value';
import { cn } from '@/lib/utils';
import type { GestureInfo } from '@/services/api/types';
import { getGestureCstCredits } from '@/utils/gestureCstCredit';

export interface GestureCstCreditProps {
  gesture: GestureInfo;
  /** A quiet, full-width block within the Last Gesture record. */
  compact?: boolean;
  className?: string;
}

/** The credit's recipient stays visible beside its amount, separately from the gesture cost. */
export function GestureCstCredit({ gesture, compact = false, className }: GestureCstCreditProps) {
  const t = useTranslations('gesture.credit');
  const { cosmicGame } = useContractAddresses();
  const result = getGestureCstCredits(gesture, {
    chainId: activeChain.id,
    protocolAddress: cosmicGame,
  });
  const amountClass = compact ? 'type-label text-foreground' : 'type-figure-sm text-foreground';
  const labelClass = compact
    ? 'type-caption text-muted-foreground'
    : 'type-label text-muted-foreground';

  return (
    <div
      role="group"
      aria-label={t('titleUnknown')}
      data-testid="gesture-cst-credit"
      data-credit-status={result.status}
      className={cn('min-w-0 space-y-4 border-t border-rule-faint pt-3', className)}
    >
      {result.credits.length > 0 ? (
        result.credits.map((credit) => (
          <dl key={credit.role} data-credit-role={credit.role} className="min-w-0">
            <dt className={labelClass}>
              {t(credit.role === 'previous' ? 'titlePrevious' : 'titleCurrent')}
            </dt>
            <dd className="mt-1 min-w-0 space-y-1.5">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                {credit.amount === undefined && credit.amountWei === undefined ? (
                  <UnknownValue label={t('amountUnavailable')} />
                ) : (
                  <Amount
                    data-testid="gesture-cst-credit-amount"
                    value={
                      credit.amountWei === undefined ? credit.amount : BigInt(credit.amountWei)
                    }
                    unit="CST"
                    context="card"
                    className={amountClass}
                  />
                )}
                {credit.recipient ? (
                  <span data-testid="gesture-cst-credit-recipient" className="min-w-0">
                    <span className="sr-only">{t('recipient')} </span>
                    <AddressChip
                      address={credit.recipient}
                      variant="plain"
                      showCopy={!compact}
                      label={false}
                    />
                  </span>
                ) : (
                  <span className="type-caption text-subtle">{t('recipientUnavailable')}</span>
                )}
                {credit.role === 'previous' && credit.sameParticipant ? (
                  <span
                    className="type-caption text-subtle"
                    data-testid="gesture-cst-credit-same-wallet"
                  >
                    {t('sameWallet')}
                  </span>
                ) : null}
              </div>
              {result.status === 'zero' ? (
                <p className="type-caption text-subtle">{t('zero')}</p>
              ) : !compact && credit.role === 'previous' && result.status === 'credited' ? (
                <p className="max-w-[var(--measure-prose)] type-body-sm text-muted-foreground">
                  {t('bodyPrevious')}
                </p>
              ) : null}
            </dd>
          </dl>
        ))
      ) : (
        <dl>
          <dt className={labelClass}>{t('titleUnknown')}</dt>
          <dd className="mt-1 space-y-1.5">
            {result.status === 'first' || result.status === 'zero' ? (
              <>
                <Amount
                  value={0}
                  unit="CST"
                  className={amountClass}
                  data-testid="gesture-cst-credit-amount"
                />
                <p className="type-caption text-muted-foreground">
                  {t(result.status === 'first' ? 'firstGesture' : 'zero')}
                </p>
              </>
            ) : (
              <>
                {result.unattributedAmount === undefined &&
                result.unattributedAmountWei === undefined ? (
                  <UnknownValue label={t('amountUnavailable')} />
                ) : (
                  <Amount
                    value={
                      result.unattributedAmountWei === undefined
                        ? result.unattributedAmount
                        : BigInt(result.unattributedAmountWei)
                    }
                    unit="CST"
                    className={amountClass}
                    data-testid="gesture-cst-credit-amount"
                  />
                )}
                <p className="type-caption text-subtle">{t('recipientUnavailable')}</p>
              </>
            )}
          </dd>
        </dl>
      )}
      {result.status === 'unknown' && result.credits.length > 0 ? (
        <p className="type-caption text-subtle">{t('incomplete')}</p>
      ) : null}
    </div>
  );
}
