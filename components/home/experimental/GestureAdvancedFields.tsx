'use client';

import { useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  MAX_COLLISION_BUFFER_PERCENT,
  clampCollisionBufferPercent,
  ethGestureSendAmount,
  formatEthQuote,
} from '@/utils/gestureQuote';
import { formatAmount } from '@/utils/format';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import type { EthGestureInfo } from '@/hooks/useGestureForm';
import { cn } from '@/lib/utils';

export interface GestureAdvancedFieldsProps {
  gestureType: string;
  contributionType: string;
  setContributionType: (value: string) => void;
  nftDonateAddress: string;
  setNftDonateAddress: (value: string) => void;
  nftId: string;
  setNftId: (value: string) => void;
  tokenDonateAddress: string;
  setTokenDonateAddress: (value: string) => void;
  tokenAmount: string;
  setTokenAmount: (value: string) => void;
  setRwlkId: (value: number) => void;
  gestureCostPlus: number;
  setBidPricePlus: (value: number) => void;
  ethGestureInfo: EthGestureInfo | null;
  gestureCstRewardAmountMin?: number | null;
  cstRewardTolerancePercent?: number;
  setCstRewardTolerancePercent?: (value: number) => void;
  acceptAnyCstReward?: boolean;
  setAcceptAnyCstReward?: (value: boolean) => void;
  /** False before the cycle's first gesture: only the ETH method exists then. */
  showAll: boolean;
  className?: string;
}

/** A number field with its unit inside the end of the field. */
function SuffixedNumberInput({
  id,
  suffix,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { suffix: string }) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <Input id={id} type="number" inputMode="decimal" className="pe-8 tabular-nums" {...props} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 end-3 flex items-center type-caption text-subtle"
      >
        {suffix}
      </span>
    </div>
  );
}

/**
 * The Advanced options of a gesture: an attached NFT or token, the minimum
 * CST reward protection and the collision buffer. Groups are separated by
 * hairlines inside the disclosure, never by nested boxes. The message is not
 * here: it is part of the console itself.
 */
export function GestureAdvancedFields({
  gestureType,
  contributionType,
  setContributionType,
  nftDonateAddress,
  setNftDonateAddress,
  nftId,
  setNftId,
  tokenDonateAddress,
  setTokenDonateAddress,
  tokenAmount,
  setTokenAmount,
  setRwlkId,
  gestureCostPlus,
  setBidPricePlus,
  ethGestureInfo,
  gestureCstRewardAmountMin = null,
  cstRewardTolerancePercent = 1,
  setCstRewardTolerancePercent,
  acceptAnyCstReward = false,
  setAcceptAnyCstReward,
  showAll,
  className,
}: GestureAdvancedFieldsProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const baseId = useId();
  const ethPrice = ethGestureInfo?.ETHPrice;
  const hasEthQuote = ethPrice != null && Number.isFinite(ethPrice) && ethPrice >= 0;

  const ids = {
    attach: `${baseId}-attach`,
    contract: `${baseId}-contract`,
    amount: `${baseId}-amount`,
    acceptAny: `${baseId}-accept-any`,
    tolerance: `${baseId}-tolerance`,
    collision: `${baseId}-collision`,
  };

  const groupTitle = 'type-label text-foreground';
  const groupNote = 'type-caption text-muted-foreground';

  return (
    <div
      className={cn('divide-y divide-rule-faint', className)}
      data-testid="gesture-advanced-fields"
    >
      <fieldset className="space-y-3 pb-5">
        <legend id={ids.attach} className={cn(groupTitle, 'mb-1')}>
          {t('form.advanced.attachIntro')}
        </legend>
        <RadioGroup
          value={contributionType}
          onValueChange={(value) => {
            setRwlkId(-1);
            setContributionType(value);
          }}
          aria-labelledby={ids.attach}
          className="flex flex-row flex-wrap gap-x-5 gap-y-2"
        >
          <label className="flex min-h-11 cursor-pointer items-center gap-2 type-body-sm sm:min-h-9">
            <RadioGroupItem value="NFT" />
            {t('form.advanced.attachNft')}
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 type-body-sm sm:min-h-9">
            <RadioGroupItem value="Token" />
            {t('form.advanced.attachToken')}
          </label>
        </RadioGroup>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
          <div className="min-w-0">
            <Label htmlFor={ids.contract} className="mb-1.5 block type-caption text-subtle">
              {contributionType === 'Token'
                ? t('form.advanced.tokenContractLabel')
                : t('form.advanced.nftContractLabel')}
            </Label>
            <Input
              id={ids.contract}
              placeholder="0x…"
              value={contributionType === 'Token' ? tokenDonateAddress : nftDonateAddress}
              onChange={(e) =>
                contributionType === 'Token'
                  ? setTokenDonateAddress(e.target.value)
                  : setNftDonateAddress(e.target.value)
              }
              className="font-mono"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div className="min-w-0">
            <Label htmlFor={ids.amount} className="mb-1.5 block type-caption text-subtle">
              {contributionType === 'Token'
                ? t('form.advanced.tokenAmountLabel')
                : t('form.advanced.nftIdLabel')}
            </Label>
            <Input
              id={ids.amount}
              type="number"
              inputMode={contributionType === 'Token' ? 'decimal' : 'numeric'}
              min={0}
              placeholder={
                contributionType === 'Token' ? '0.0' : t('form.advanced.nftIdPlaceholder')
              }
              value={contributionType === 'Token' ? tokenAmount : nftId}
              onChange={(e) =>
                contributionType === 'Token'
                  ? setTokenAmount(e.target.value)
                  : setNftId(e.target.value)
              }
              className="tabular-nums"
            />
          </div>
        </div>
      </fieldset>

      {showAll ? (
        <fieldset className="space-y-3 py-5" data-testid="min-cst-protection">
          <legend className={groupTitle}>{t('form.advanced.minCstProtection.title')}</legend>
          <p className={groupNote}>{t('form.advanced.minCstProtection.body')}</p>
          <div className="flex items-start gap-3">
            <Checkbox
              id={ids.acceptAny}
              checked={acceptAnyCstReward}
              disabled={!setAcceptAnyCstReward}
              onChange={(e) => setAcceptAnyCstReward?.(e.currentTarget.checked)}
              className="mt-0.5"
            />
            <Label htmlFor={ids.acceptAny} className="min-w-0 cursor-pointer">
              <span className="block type-body-sm font-medium text-foreground">
                {t('form.advanced.minCstProtection.acceptAnyTitle')}
              </span>
              <span className={cn('mt-0.5 block', groupNote)}>
                {t('form.advanced.minCstProtection.acceptAnyBody')}
              </span>
            </Label>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Label htmlFor={ids.tolerance} className="type-body-sm text-muted-foreground">
              {t('form.advanced.minCstProtection.toleranceLabel')}
            </Label>
            <SuffixedNumberInput
              id={ids.tolerance}
              suffix="%"
              value={cstRewardTolerancePercent}
              min={0}
              max={100}
              step={0.1}
              disabled={acceptAnyCstReward || !setCstRewardTolerancePercent}
              onChange={(e) => setCstRewardTolerancePercent?.(Number(e.target.value))}
              className="w-24"
            />
            <span className="type-figure-sm text-muted-foreground">
              {t('form.advanced.minCstProtection.minAmount', {
                amount: formatAmount(gestureCstRewardAmountMin, {
                  unit: 'CST',
                  locale,
                  withUnit: false,
                }),
              })}
            </span>
          </div>
          <p className={groupNote}>{t('form.advanced.minCstProtection.revertNote')}</p>
        </fieldset>
      ) : null}

      {gestureType !== 'CST' ? (
        <fieldset className="space-y-3 pt-5" data-testid="collision-buffer">
          <legend className={groupTitle}>{t('form.advanced.collision.title')}</legend>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Label htmlFor={ids.collision} className="type-body-sm text-muted-foreground">
              {t('form.advanced.collision.raiseBy')}
            </Label>
            <SuffixedNumberInput
              id={ids.collision}
              suffix="%"
              value={gestureCostPlus}
              min={0}
              max={MAX_COLLISION_BUFFER_PERCENT}
              onChange={(e) => setBidPricePlus(clampCollisionBufferPercent(e.target.value))}
              className="w-24"
            />
            <div className="type-figure-sm text-muted-foreground">
              {hasEthQuote ? (
                t('form.advanced.collision.approxCost', {
                  amount: formatEthQuote(
                    ethGestureSendAmount(ethPrice, gestureType, gestureCostPlus),
                    locale,
                  ),
                })
              ) : (
                <Skeleton className="h-3.5 w-20" />
              )}
            </div>
          </div>
          <p className={groupNote}>
            {t('form.advanced.collision.note', { percent: String(gestureCostPlus) })}
          </p>
        </fieldset>
      ) : null}
    </div>
  );
}
