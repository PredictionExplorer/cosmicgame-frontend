import { useId, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

/** What `FormField` hands its control, so the label, hint and error are wired to it. */
export interface FormFieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

export interface FormFieldProps {
  /** The visible label, in sentence case. It is the control's accessible name. */
  label: ReactNode;
  /** A quiet suffix after the label, such as "(optional)". */
  labelSuffix?: ReactNode;
  /** Content at the end of the label row: the available balance, a Max button. */
  labelAside?: ReactNode;
  /** One caption line under the control: the unit, the format, what happens next. */
  hint?: ReactNode;
  /**
   * What is wrong, as a sentence that says how to fix it. It replaces the
   * hint, marks the control `aria-invalid` and is read with it.
   */
  error?: ReactNode;
  /** A fixed id for the control; one is generated otherwise. */
  id?: string;
  className?: string;
  /** Renders the control with the wiring props spread onto it. */
  children: (control: FormFieldControlProps) => ReactNode;
}

/**
 * One labelled form control: a sentence-case `type-label` label linked by
 * `htmlFor`, the control, and one caption line under it — the hint, or the
 * error in the critical tone with an icon and a word (colour never carries
 * it alone). The caption is the control's description, so a screen reader
 * hears the hint or the error with the field.
 *
 *   <FormField label={t('amount')} hint={t('amountHint')} error={amountError}>
 *     {(control) => <Input {...control} inputMode="decimal" />}
 *   </FormField>
 */
export function FormField({
  label,
  labelSuffix,
  labelAside,
  hint,
  error,
  id: fixedId,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const id = fixedId ?? generatedId;
  const captionId = `${id}-caption`;
  const hasError = error != null && error !== false && error !== '';
  const caption = hasError ? error : hint;

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label htmlFor={id} className="type-label text-muted-foreground">
          {label}
          {labelSuffix ? (
            <span className="ms-1.5 font-normal text-subtle">{labelSuffix}</span>
          ) : null}
        </label>
        {labelAside}
      </div>
      {children({
        id,
        'aria-describedby': caption ? captionId : undefined,
        'aria-invalid': hasError ? true : undefined,
      })}
      {caption ? (
        <p
          id={captionId}
          className={cn(
            'type-caption',
            hasError ? 'flex items-start gap-1.5 text-critical' : 'text-subtle',
          )}
        >
          {hasError ? <AlertCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" /> : null}
          <span className="min-w-0">{caption}</span>
        </p>
      ) : null}
    </div>
  );
}
