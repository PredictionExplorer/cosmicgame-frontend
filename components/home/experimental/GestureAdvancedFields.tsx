'use client';

import { Settings2, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { isV3Mechanics, protocolFacts } from '@/content/protocol-facts';

import { formatCstAmount } from '@/utils/cstGesture';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomTextField } from '@/components/styled';
import type { EthGestureInfo } from '@/hooks/useGestureForm';

const MESSAGE_MAX_LENGTH = protocolFacts.gestureMessageMaxLength;
const MESSAGE_COUNTER_WARN_AT = MESSAGE_MAX_LENGTH - 20;

export interface GestureAdvancedFieldsProps {
  gestureType: string;
  contributionType: string;
  setContributionType: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
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
  previewMode?: boolean;
  /** False before the cycle's first gesture: only the ETH method exists then. */
  showAll: boolean;
  /**
   * `stack`: under the form (the accordion, width-capped). `panel`: the
   * monument's side panel, which owns its own width — one column there
   * reads best; the panel scrolls within the card's height if it must.
   */
  layout?: 'stack' | 'panel';
}

/**
 * The Advanced options of a gesture — on-chain message, attached NFT/token,
 * minimum-CST protection and collision buffer. Shared by the inline accordion
 * in GestureForm and by the monument's side panel (GestureAdvancedPanel), so
 * the fields exist exactly once whichever way they are opened.
 */
export function GestureAdvancedFields({
  gestureType,
  contributionType,
  setContributionType,
  message,
  setMessage,
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
  previewMode = false,
  showAll,
  layout = 'stack',
}: GestureAdvancedFieldsProps) {
  const t = useTranslations('home');

  const messageField = (
    <>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('form.advanced.messageLabel')}{' '}
            <span className="normal-case tracking-normal opacity-50">
              {t('form.advanced.messageOptionalHint', {
                maxLength: String(MESSAGE_MAX_LENGTH),
              })}
            </span>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t('form.advanced.messageTooltipAria')}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:border-primary/25 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[260px]">{t('form.advanced.messageTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <textarea
          placeholder={t('form.advanced.messagePlaceholder')}
          value={message}
          maxLength={MESSAGE_MAX_LENGTH}
          rows={3}
          disabled={previewMode}
          className="w-full flex min-h-[72px] rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="mt-1.5 flex justify-end">
          <span
            data-testid="gesture-message-char-count"
            className={cn(
              'text-xs tabular-nums',
              message.length >= MESSAGE_COUNTER_WARN_AT
                ? 'text-amber-300'
                : 'text-muted-foreground/60',
            )}
          >
            {message.length}/{MESSAGE_MAX_LENGTH}
          </span>
        </div>
      </div>
    </>
  );
  const attachIntro = (
    <>
      <p className="text-xs text-muted-foreground">{t('form.advanced.attachIntro')}</p>
    </>
  );
  const minCstBox = (
    <>
      {showAll && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('form.advanced.minCstProtection.title')}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t(
              isV3Mechanics
                ? 'form.advanced.minCstProtection.bodyV3'
                : 'form.advanced.minCstProtection.body',
            )}
          </p>
          <label className="flex items-start gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] p-3 text-sm">
            <Checkbox
              checked={acceptAnyCstReward}
              disabled={previewMode || !setAcceptAnyCstReward}
              onChange={(e) => setAcceptAnyCstReward?.(e.currentTarget.checked)}
              aria-label={t('form.advanced.minCstProtection.acceptAnyAria')}
            />
            <span>
              <span className="block font-medium text-foreground">
                {t('form.advanced.minCstProtection.acceptAnyTitle')}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {t('form.advanced.minCstProtection.acceptAnyBody')}
              </span>
            </span>
          </label>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t('form.advanced.minCstProtection.toleranceLabel')}
              </span>
              <div className="relative w-[4.75rem] shrink-0">
                <CustomTextField
                  type="number"
                  placeholder="1"
                  value={cstRewardTolerancePercent}
                  min={0}
                  max={100}
                  step={0.1}
                  className="h-9 px-2.5 py-2 pr-7 text-sm tabular-nums"
                  disabled={acceptAnyCstReward || previewMode || !setCstRewardTolerancePercent}
                  onChange={(e) => setCstRewardTolerancePercent?.(Number(e.target.value))}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-xs">
                  %
                </span>
              </div>
            </div>
            <span className="text-sm font-mono text-muted-foreground tabular-nums min-w-0">
              {t('form.advanced.minCstProtection.minAmount', {
                amount: formatCstAmount(gestureCstRewardAmountMin),
              })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('form.advanced.minCstProtection.revertNote')}
          </p>
        </div>
      )}
    </>
  );
  const attachFields = (
    <>
      <RadioGroup
        value={contributionType}
        onValueChange={(value) => {
          setRwlkId(-1);
          setContributionType(value);
        }}
        className="flex flex-row flex-wrap gap-x-4 gap-y-2"
      >
        <label className="flex items-center gap-1.5 cursor-pointer">
          <RadioGroupItem value="NFT" />
          <span className="text-sm">{t('form.advanced.attachNft')}</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <RadioGroupItem value="Token" />
          <span className="text-sm">{t('form.advanced.attachToken')}</span>
        </label>
      </RadioGroup>
      {contributionType === 'Token' && (
        <div className="space-y-3">
          <div className="min-w-0">
            <Label className="text-xs text-muted-foreground mb-1 block">
              {t('form.advanced.tokenContractLabel')}
            </Label>
            <Input
              placeholder="0x..."
              value={tokenDonateAddress}
              onChange={(e) => setTokenDonateAddress(e.target.value)}
              disabled={previewMode}
              className="w-full max-w-md font-mono text-sm"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div className="w-full max-w-[11rem]">
            <Label className="text-xs text-muted-foreground mb-1 block">
              {t('form.advanced.tokenAmountLabel')}
            </Label>
            <Input
              placeholder="0.0"
              type="number"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              disabled={previewMode}
              className="font-mono text-sm tabular-nums"
            />
          </div>
        </div>
      )}
      {contributionType === 'NFT' && (
        <div className="space-y-3">
          <div className="min-w-0">
            <Label className="text-xs text-muted-foreground mb-1 block">
              {t('form.advanced.nftContractLabel')}
            </Label>
            <Input
              placeholder="0x..."
              value={nftDonateAddress}
              onChange={(e) => setNftDonateAddress(e.target.value)}
              disabled={previewMode}
              className="w-full max-w-md font-mono text-sm"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div className="w-full max-w-[7.5rem]">
            <Label className="text-xs text-muted-foreground mb-1 block">
              {t('form.advanced.nftIdLabel')}
            </Label>
            <Input
              placeholder={t('form.advanced.nftIdPlaceholder')}
              type="number"
              min={0}
              value={nftId}
              onChange={(e) => setNftId(e.target.value)}
              disabled={previewMode}
              className="font-mono text-sm tabular-nums"
            />
          </div>
        </div>
      )}
    </>
  );
  const collisionBox = (
    <>
      {gestureType !== 'CST' && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('form.advanced.collision.title')}
          </p>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {t('form.advanced.collision.raiseBy')}
              </span>
              <div className="relative w-[4.25rem] shrink-0">
                <CustomTextField
                  type="number"
                  placeholder="0"
                  value={gestureCostPlus}
                  min={0}
                  max={50}
                  className="h-9 px-2.5 py-2 pr-7 text-sm tabular-nums"
                  disabled={previewMode}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value <= 50) setBidPricePlus(value);
                  }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-xs">
                  %
                </span>
              </div>
            </div>
            <span className="text-sm font-mono text-muted-foreground tabular-nums min-w-0">
              {t('form.advanced.collision.approxCost', {
                amount: (
                  (ethGestureInfo?.ETHPrice ?? 0) *
                  (1 + gestureCostPlus / 100) *
                  (gestureType === 'RandomWalk' ? 0.5 : 1)
                ).toFixed(6),
              })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('form.advanced.collision.note', { percent: String(gestureCostPlus) })}
          </p>
        </div>
      )}{' '}
    </>
  );

  return (
    <div
      className={cn('space-y-4', layout === 'panel' ? 'pt-1' : 'pt-2 max-w-xl')}
      data-testid="gesture-advanced-fields"
      data-layout={layout}
    >
      {messageField}
      {attachIntro}
      {minCstBox}
      {attachFields}
      {collisionBox}
    </div>
  );
}

/**
 * The monument's Advanced side panel: at `xl` the centre card takes the chat
 * column's width and this panel fills the new right half at full card height,
 * so opening Advanced never makes the card taller (see CycleMonument
 * `sidePanel`). The accordion trigger in GestureForm stays the toggle.
 */
export function GestureAdvancedPanel(props: Omit<GestureAdvancedFieldsProps, 'layout'>) {
  const t = useTranslations('home');
  return (
    <aside
      data-testid="gesture-advanced-panel"
      aria-label={t('form.advanced.title')}
      className="text-left"
    >
      <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Settings2 className="h-4 w-4" aria-hidden />
        {t('form.advanced.title')}
      </p>
      <GestureAdvancedFields {...props} layout="panel" />
    </aside>
  );
}
