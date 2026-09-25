'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

import { participantAddress } from './participantAddress';

/**
 * A way forward for a visitor without a wallet on an account page: every
 * address's allocations are public, so any address can be looked up. A full
 * address opens its participant profile (checksummed); anything else says
 * how to fix it, beside the field.
 */
export function AddressLookup({ className }: { className?: string }) {
  const t = useTranslations('myPages');
  const router = useRouter();
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = participantAddress(value);
    if (address === null) {
      setInvalid(true);
      return;
    }
    router.push(`/user/${address}`);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className={cn('w-full max-w-md border-t border-rule-faint pt-6 text-start', className)}
    >
      <FormField
        label={t('allocations.lookup.label')}
        hint={t('allocations.lookup.hint')}
        error={invalid ? t('allocations.lookup.invalid') : undefined}
      >
        {(control) => (
          <div className="flex gap-2">
            <Input
              {...control}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setInvalid(false);
              }}
              placeholder="0x…"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 font-mono"
            />
            <Button type="submit" variant="outline" className="shrink-0">
              {t('allocations.lookup.submit')}
              <ArrowRight aria-hidden />
            </Button>
          </div>
        )}
      </FormField>
    </form>
  );
}
