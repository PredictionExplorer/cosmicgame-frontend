'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getAddress, isAddress } from 'viem';

import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

/** A typed or pasted address in its checksummed form, or null when it is not one. */
export function parseProfileAddress(value: string): string | null {
  const trimmed = value.trim();
  return isAddress(trimmed, { strict: false }) ? getAddress(trimmed) : null;
}

/**
 * "View any address": profiles are public, so a visitor without a wallet (or
 * one looking up someone else) can open any participant's page from here.
 * The address is checked before leaving; a malformed one says how to fix it
 * under the field, and the field keeps what was typed.
 */
export function ViewAddressForm({ className }: { className?: string }) {
  const t = useTranslations('myPages');
  const router = useRouter();
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = parseProfileAddress(value);
    if (!address) {
      setInvalid(true);
      return;
    }
    router.push(`/user/${address}`);
  };

  return (
    <form noValidate onSubmit={submit} className={cn('w-full text-start', className)}>
      <FormField
        label={t('statistics.viewAddress.label')}
        hint={t('statistics.viewAddress.hint')}
        error={invalid ? t('statistics.viewAddress.invalid') : undefined}
      >
        {(control) => (
          <div className="flex gap-2">
            <Input
              {...control}
              name="address"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                if (invalid) setInvalid(false);
              }}
              placeholder={t('statistics.viewAddress.placeholder')}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              translate="no"
              className="min-w-0 flex-1 font-mono"
            />
            <Button type="submit" variant="outline" className="shrink-0">
              {t('statistics.viewAddress.submit')}
              <ArrowRight aria-hidden />
            </Button>
          </div>
        )}
      </FormField>
    </form>
  );
}
