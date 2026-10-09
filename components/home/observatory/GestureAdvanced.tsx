'use client';

import { useId, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import {
  MAX_COLLISION_BUFFER_PERCENT,
  clampCollisionBufferPercent,
  ethGestureSendAmount,
  formatEthQuote,
} from '@/utils/gestureQuote';

import type { GesturePanelFormState } from './GesturePanel';

interface FieldProps {
  label: string;
  hint?: string;
  /** Renders the control with the generated id and description wired in. */
  children: (field: { id: string; describedBy: string | undefined }) => ReactNode;
  className?: string;
}

/**
 * A labelled form field: the visible label is the control's name (`htmlFor`)
 * and the hint its description, so a screen reader announces "Contract
 * address, 0x…" rather than the placeholder alone.
 */
function Field({ label, hint, children, className }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="type-label block text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children({ id, describedBy: hint ? hintId : undefined })}</div>
      {hint && (
        <p id={hintId} className="type-caption mt-1 text-subtle">
          {hint}
        </p>
      )}
    </div>
  );
}

/** A percent field: the unit sits inside the field, after the number. */
function PercentInput({
  id,
  describedBy,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  testId,
}: {
  id: string;
  describedBy?: string;
  value: number;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <div className="relative w-28">
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-describedby={describedBy}
        data-testid={testId}
        onChange={(event) => onChange(event.target.value)}
        className="pe-8 tabular-nums"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 end-3 flex items-center type-caption text-subtle"
      >
        %
      </span>
    </div>
  );
}

function Group({
  title,
  titleId,
  children,
}: {
  title: string;
  titleId?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-rule-faint pt-4">
      <h3 id={titleId} className="type-label text-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

export interface GestureAdvancedProps {
  form: GesturePanelFormState;
  /** Live ETH price, for the collision line; null while unknown. */
  ethPrice: number | null;
  /** The method is ETH-based (the collision buffer does not apply to CST). */
  ethMethod: boolean;
  /** The cycle has no gesture yet: the contract ignores the CST floor, so its group hides. */
  firstGesture?: boolean;
}

/**
 * The optional transaction settings, in three groups separated by hairlines:
 * an asset to attach (nothing by default), the collision buffer for ETH
 * gestures, and the Participation CST floor — two easy choices, accept any
 * amount (0) or guard the shown amount minus a tolerance. The guard is
 * preselected exactly when the connected wallet is the cycle's latest
 * gesturer, because under V3 the imprint goes to the outbid previous
 * participant: only the latest gesturer's own accrual is at stake. Every
 * field has a visible label linked to its control.
 */
export function GestureAdvanced({
  form,
  ethPrice,
  ethMethod,
  firstGesture = false,
}: GestureAdvancedProps) {
  const t = useTranslations('home.form.advanced');
  const locale = useLocale();
  const {
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
    cstRewardGuardChoice = 'auto',
    setCstRewardGuardChoice,
    cstRewardGuardActive = false,
    connectedIsLatestGesturer = false,
    cstRewardTolerancePercent = 1,
    setCstRewardTolerancePercent,
  } = form;
  const attachLabelId = useId();
  const cstFloorLabelId = useId();

  return (
    <div data-testid="gesture-advanced-fields" className="space-y-4">
      <p className="type-caption text-subtle">{t('attachIntro')}</p>

      <Group title={t('attachLabel')} titleId={attachLabelId}>
        <RadioGroup
          name={attachLabelId}
          value={contributionType}
          aria-labelledby={attachLabelId}
          // An attachment rides along with any method: a Random Walk NFT
          // chosen above stays chosen (bidWithEthAndDonateNft/Token take both).
          onValueChange={setContributionType}
          className="flex flex-row flex-wrap gap-x-5 gap-y-2"
        >
          {(
            [
              ['', t('attachNone')],
              ['NFT', t('attachNft')],
              ['Token', t('attachToken')],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value || 'none'}
              className="flex min-h-11 cursor-pointer items-center gap-2 sm:min-h-8"
            >
              <RadioGroupItem value={value} />
              <span className="type-body-sm text-foreground">{label}</span>
            </label>
          ))}
        </RadioGroup>
        {contributionType === 'Token' && (
          <div className="grid gap-3 @min-[34rem]/gesture:grid-cols-[minmax(0,1fr)_11rem]">
            <Field label={t('tokenContractLabel')}>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  placeholder="0x…"
                  value={tokenDonateAddress}
                  onChange={(event) => setTokenDonateAddress(event.target.value)}
                  className="font-mono"
                  spellCheck={false}
                  autoComplete="off"
                />
              )}
            </Field>
            <Field label={t('tokenAmountLabel')}>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  type="number"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={tokenAmount}
                  onChange={(event) => setTokenAmount(event.target.value)}
                  className="tabular-nums"
                />
              )}
            </Field>
          </div>
        )}
        {contributionType === 'NFT' && (
          <div className="grid gap-3 @min-[34rem]/gesture:grid-cols-[minmax(0,1fr)_9rem]">
            <Field label={t('nftContractLabel')}>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  placeholder="0x…"
                  value={nftDonateAddress}
                  onChange={(event) => setNftDonateAddress(event.target.value)}
                  className="font-mono"
                  spellCheck={false}
                  autoComplete="off"
                />
              )}
            </Field>
            <Field label={t('nftIdLabel')}>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={nftId}
                  onChange={(event) => setNftId(event.target.value)}
                  className="tabular-nums"
                />
              )}
            </Field>
          </div>
        )}
      </Group>

      {ethMethod && (
        <Group title={t('collision.title')}>
          <Field
            label={t('collision.raiseBy')}
            hint={
              ethPrice != null
                ? t('collision.approxCost', {
                    amount: formatEthQuote(
                      ethGestureSendAmount(ethPrice, gestureType, gestureCostPlus),
                      locale,
                    ),
                  })
                : undefined
            }
          >
            {({ id, describedBy }) => (
              <PercentInput
                id={id}
                describedBy={describedBy}
                testId="collision-buffer-input"
                value={gestureCostPlus}
                min={0}
                max={MAX_COLLISION_BUFFER_PERCENT}
                step={1}
                onChange={(value) => setBidPricePlus(clampCollisionBufferPercent(value))}
              />
            )}
          </Field>
          <p className="type-caption text-subtle">
            {t('collision.note', { percent: String(gestureCostPlus) })}
          </p>
        </Group>
      )}

      {/* The Participation CST floor: accept any amount (0) or guard the
          shown amount minus a tolerance. Hidden on the cycle's first gesture,
          where the contract ignores the value. */}
      {!firstGesture && setCstRewardGuardChoice && (
        <Group title={t('cstFloor.title')} titleId={cstFloorLabelId}>
          <RadioGroup
            name={cstFloorLabelId}
            value={cstRewardGuardActive ? 'guarded' : 'any'}
            aria-labelledby={cstFloorLabelId}
            onValueChange={(value) =>
              setCstRewardGuardChoice(value === 'guarded' ? 'guarded' : 'any')
            }
            className="space-y-2"
          >
            {(
              [
                ['any', t('cstFloor.any')],
                ['guarded', t('cstFloor.guarded')],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex min-h-11 cursor-pointer items-center gap-2 sm:min-h-8"
              >
                <RadioGroupItem value={value} data-testid={`cst-floor-${value}`} />
                <span className="type-body-sm text-foreground">{label}</span>
              </label>
            ))}
          </RadioGroup>
          {cstRewardGuardActive && setCstRewardTolerancePercent && (
            <Field label={t('cstFloor.toleranceLabel')} hint={t('cstFloor.toleranceHint')}>
              {({ id, describedBy }) => (
                <PercentInput
                  id={id}
                  describedBy={describedBy}
                  testId="cst-floor-tolerance-input"
                  value={cstRewardTolerancePercent}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => {
                    const parsed = Number(value);
                    if (Number.isFinite(parsed)) setCstRewardTolerancePercent(parsed);
                  }}
                />
              )}
            </Field>
          )}
          <p className="type-caption text-subtle">
            {cstRewardGuardActive && connectedIsLatestGesturer && cstRewardGuardChoice === 'auto'
              ? t('cstFloor.autoNote')
              : t('cstFloor.note')}
          </p>
        </Group>
      )}
    </div>
  );
}
