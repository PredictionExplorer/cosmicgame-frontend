import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { ContractEvidence } from '@/components/legal/ContractEvidence';
import { AddressChip } from '@/components/ui/address-chip';

/**
 * The Public Goods Vault's address, drawn the same way on every Public Goods
 * tab: the vault's name, its whole checksummed address to copy (wrapping on a
 * phone, never shortened, so it can be checked against a wallet's by eye), and
 * where to check it (the explorer, and Sourcify for the verified contract). It
 * sits left under the section's description, on the text's edge. `children`
 * adds facts to the same list (the contribution form's network).
 */
export function VaultAddressRow({
  address,
  className,
  children,
}: {
  address: string;
  className?: string;
  children?: ReactNode;
}) {
  const tFormats = useTranslations('formats');
  return (
    <dl
      data-slot="vault-address"
      className={cn('flex flex-col gap-4 border-y border-rule-faint py-4', className)}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <dt className="type-label text-subtle">{tFormats('address.known.publicGoods')}</dt>
        <dd className="flex min-w-0 flex-col items-start gap-2">
          <AddressChip
            address={address}
            variant="plain"
            label={false}
            href={false}
            display="full"
            className="type-hash whitespace-normal text-foreground [overflow-wrap:anywhere]"
          />
          <ContractEvidence address={address} />
        </dd>
      </div>
      {children}
    </dl>
  );
}
