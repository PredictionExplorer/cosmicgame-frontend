'use client';

import type { Ref } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { formatAmount, formatCount, formatNumber, type AmountUnit } from '@/utils/format';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

import type { AmountInputError } from './amount';

export interface AmountFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** The validation error to show (the caller decides when: after blur or submit). */
  error: AmountInputError | null;
  unit: AmountUnit;
  /**
   * What can be sent, in base units: shown beside the label with a Max
   * button. `undefined` shows nothing (ETH, where gas makes Max a trap);
   * `null` is a balance that is still loading or could not be read.
   */
  available?: bigint | null;
  /** The balance read failed: say so instead of showing a skeleton forever. */
  availableUnknown?: boolean;
  /** Fills in the whole balance. */
  onMax?: () => void;
  decimals?: number;
  /** One caption line when there is no error (the unit's network, the limits). */
  hint?: string;
  disabled?: boolean;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * An amount to send: a decimal field with the unit set inside its end edge,
 * the available balance and a Max button on the label row, and one sentence
 * that says how to fix a wrong entry ("Use at most 18 decimal places").
 */
export function AmountField({
  value,
  onChange,
  onBlur,
  error,
  unit,
  available,
  availableUnknown = false,
  onMax,
  decimals = 18,
  hint,
  disabled,
  id,
  inputRef,
}: AmountFieldProps) {
  const t = useTranslations('forms.transfer.amount');
  const locale = useLocale();
  const availableText =
    available == null ? null : formatAmount(available, { unit, locale, decimals });

  const errorText = (() => {
    switch (error) {
      case null:
        return null;
      case 'format':
        return t('errors.format', { example: formatNumber(0.5, locale) });
      case 'grouping':
        // "type 1000, not 1,000" in the reader's own thousands mark (vi "1.000").
        return t('errors.grouping', {
          plain: formatNumber(1000, locale, { useGrouping: false }),
          grouped: formatCount(1000, locale),
        });
      case 'precision':
        return t('errors.precision', { decimals });
      case 'exceedsBalance':
        return t('errors.exceedsBalance', { amount: availableText ?? '' });
      default:
        return t(`errors.${error}`);
    }
  })();

  // The balance arrives within a moment of the wallet connecting; until then
  // the label row stays empty rather than claiming a figure.
  let labelAside = null;
  if (available !== undefined && (availableText !== null || availableUnknown)) {
    labelAside = (
      <span className="inline-flex items-center gap-2 type-caption text-subtle">
        {availableUnknown || availableText === null ? (
          t('availableUnknown')
        ) : (
          <span className="tabular-nums">{t('available', { amount: availableText })}</span>
        )}
        {onMax && available !== null && available > 0n ? (
          <button
            type="button"
            onClick={onMax}
            disabled={disabled}
            aria-label={t('maxAria', { amount: availableText ?? '' })}
            data-touch-target="extended"
            className={cn(
              'rounded-edge px-1.5 font-semibold text-primary underline-offset-4 transition-colors duration-fast hover:underline disabled:opacity-50',
              TOUCH_TARGET_EXTENDED_CLASS,
            )}
          >
            {t('max')}
          </button>
        ) : null}
      </span>
    );
  }

  return (
    <FormField
      id={id}
      label={
        <>
          {t('label')}
          {/* The unit is drawn inside the field; say it with the label too. */}
          <span className="sr-only"> ({unit})</span>
        </>
      }
      labelAside={labelAside}
      hint={hint}
      error={errorText}
    >
      {(control) => (
        <div className="relative">
          <Input
            {...control}
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            placeholder={formatNumber(0, locale)}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            className="pe-14 tabular-nums"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 end-3 flex items-center type-label text-subtle"
          >
            {unit}
          </span>
        </div>
      )}
    </FormField>
  );
}
