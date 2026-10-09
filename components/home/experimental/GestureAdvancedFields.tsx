'use client';

import { useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  MAX_COLLISION_BUFFER_PERCENT,
  clampCollisionBufferPercent,
  ethGestureSendAmount,
  formatEthQuote,
} from '@/utils/gestureQuote';
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
  gestureCostPlus: number;
  setBidPricePlus: (value: number) => void;
  ethGestureInfo: EthGestureInfo | null;
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
 * The Advanced options of a gesture: an attached NFT or token and the
 * collision buffer. Groups are separated by hairlines inside the disclosure,
 * never by nested boxes. The message is not here: it is part of the console
 * itself. (No minimum-CST protection: under V3 the Participation CST goes to
 * the outbid previous participant, so the guarded limit is always zero.)
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
  gestureCostPlus,
  setBidPricePlus,
  ethGestureInfo,
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
          // Picking what to attach never clears the Random Walk NFT the
          // method uses: an attachment rides with any method (V061).
          onValueChange={setContributionType}
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
