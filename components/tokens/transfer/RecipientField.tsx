'use client';

import type { Ref } from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

import type { RecipientError } from './recipient';
import type { RecipientCheck } from './useRecipientFacts';

export interface RecipientFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** The validation error to show (the caller decides when: after blur or submit). */
  error: RecipientError | null;
  /** What the chain says about the typed address, shown while there is no error. */
  check: RecipientCheck;
  /**
   * The `TransferReview` is on screen and says any warning (new, contract,
   * protocol, not checked) with its acknowledgement, so this hint only
   * reports that the check ran instead of repeating the sentence.
   */
  reviewShown?: boolean;
  disabled?: boolean;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * The recipient of an irreversible transfer: a monospace field that refuses
 * a malformed or mistyped (checksum) address, and one line under it with
 * what the chain knows about the address — active, new, a contract or a
 * protocol contract — so a typo is caught before the tokens leave. Once the
 * review is on screen, a warning moves there (said once, next to its
 * acknowledgement) and this line only says the address was checked.
 */
export function RecipientField({
  value,
  onChange,
  onBlur,
  error,
  check,
  reviewShown = false,
  disabled,
  id,
  inputRef,
}: RecipientFieldProps) {
  const t = useTranslations('forms.transfer.recipient');
  const tFormats = useTranslations('formats');
  const network = REQUIRED_CHAIN_NAME;

  let hint = <span>{t('hint')}</span>;
  switch (check.status) {
    case 'checking':
      hint = (
        <span className="inline-flex items-start gap-1.5">
          <Loader2 aria-hidden className="mt-0.5 size-3.5 shrink-0 motion-safe:animate-spin" />
          {t('check.checking', { network })}
        </span>
      );
      break;
    case 'failed':
      if (reviewShown) break;
      hint = (
        <span className="inline-flex items-start gap-1.5">
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {t('check.failed', { network })}
        </span>
      );
      break;
    case 'ready': {
      const warning = check.warning;
      if (warning && reviewShown) {
        hint = <span>{t('check.checked', { network })}</span>;
        break;
      }
      const sentence =
        warning === 'protocol'
          ? t('check.protocol', { name: tFormats(`address.known.${check.known}`) })
          : warning === 'contract'
            ? t('check.contract')
            : warning === 'fresh'
              ? t('check.fresh', { network })
              : t('check.active', { network, count: check.facts.transactionCount });
      hint = warning ? (
        <span className="inline-flex items-start gap-1.5 text-muted-foreground">
          <AlertTriangle aria-hidden className="mt-0.5 size-3.5 shrink-0 text-attention" />
          {sentence}
        </span>
      ) : (
        <span className="inline-flex items-start gap-1.5">
          <CheckCircle2 aria-hidden className="mt-0.5 size-3.5 shrink-0 text-positive" />
          {sentence}
        </span>
      );
      break;
    }
    case 'idle':
      break;
  }

  return (
    <FormField id={id} label={t('label')} hint={hint} error={error ? t(`errors.${error}`) : null}>
      {(control) => (
        <Input
          {...control}
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={t('placeholder')}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          disabled={disabled}
          className="font-mono"
        />
      )}
    </FormField>
  );
}
