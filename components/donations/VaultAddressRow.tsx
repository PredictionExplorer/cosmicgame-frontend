import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { ContractEvidence } from '@/components/legal/ContractEvidence';
import { AddressChip } from '@/components/ui/address-chip';

/**
 * The Public Goods Vault's address as one labelled row, drawn the same way on
 * every Public Goods tab: the vault's name, its address to copy, and where to
 * check it (the explorer, and Sourcify for the verified contract). It sits
 * left under the section's description, on the text's edge.
 */
export function VaultAddressRow({ address, className }: { address: string; className?: string }) {
  const tFormats = useTranslations('formats');
  return (
    <dl
      data-slot="vault-address"
      className={cn(
        'flex flex-col gap-1.5 border-y border-rule-faint py-4 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6',
        className,
      )}
    >
      <dt className="type-label text-subtle">{tFormats('address.known.publicGoods')}</dt>
      <dd className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
        <AddressChip
          address={address}
          variant="plain"
          label={false}
          href={false}
          display="responsive"
          className="type-hash text-foreground"
        />
        <ContractEvidence address={address} />
      </dd>
    </dl>
  );
}
