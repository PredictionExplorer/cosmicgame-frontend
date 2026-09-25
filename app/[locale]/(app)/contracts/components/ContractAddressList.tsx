import { useLocale, useTranslations } from 'next-intl';

import {
  ContractEvidence,
  formatSourcifyChecked,
  SourcifyCheckedNote,
  type ContractEvidenceLabels,
} from '@/components/legal/ContractEvidence';
import { GeckoTerminalPoolButton } from '@/components/common/GeckoTerminalPoolButton';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';
import { UniswapTradeButton } from '@/components/common/UniswapTradeButton';
import { AddressChip } from '@/components/ui/address-chip';
import { SectionHeader } from '@/components/ui/section-header';
import type { ContractAddresses } from '@/services/api/types';

import {
  CONTRACT_CATEGORIES,
  CONTRACT_ENTRY_IDS,
  buildContracts,
  type ContractEntry,
  type ContractEntryCopy,
} from '../contractAddressData';

/**
 * The one list of Cosmic Signature contract addresses, grouped by role and
 * rendered with the page (no client fetch, no second copy elsewhere). Each
 * row carries the full address with a copy button, the Arbiscan and Sourcify
 * evidence, and the token's market links where they apply; what a Sourcify
 * link vouches for is said once, under the heading. From `xl` a row reads
 * across three columns (name, address, evidence) instead of leaving the
 * right half empty.
 */
export function ContractAddressList({
  apiAddresses,
}: {
  /** The dashboard's `ContractAddrs`, or null when the read failed. */
  apiAddresses: ContractAddresses | null | undefined;
}) {
  const t = useTranslations('contracts');
  const locale = useLocale();
  const copy = Object.fromEntries(
    CONTRACT_ENTRY_IDS.map((id) => [
      id,
      { name: t(`entries.${id}.name`), description: t(`entries.${id}.description`) },
    ]),
  ) as ContractEntryCopy;
  const contracts = buildContracts(apiAddresses, copy);
  const evidence: ContractEvidenceLabels = {
    explorer: t('addresses.explorer'),
    sourcify: t('addresses.sourcify'),
  };

  return (
    <section aria-labelledby="contract-addresses-heading">
      <SectionHeader
        headingId="contract-addresses-heading"
        title={t('addresses.title')}
        description={t('addresses.description')}
      />
      <SourcifyCheckedNote
        text={t('addresses.verified', { date: formatSourcifyChecked(locale) })}
        className="-mt-3 max-w-2xl sm:-mt-5"
      />
      <div className="mt-6 space-y-10">
        {CONTRACT_CATEGORIES.map((category) => {
          const items = contracts.filter((contract) => contract.category === category);
          if (items.length === 0) return null;
          const headingId = `contracts-${category}-heading`;
          return (
            <section key={category} aria-labelledby={headingId}>
              <h3 id={headingId} className="type-eyebrow text-subtle">
                {t(`categories.${category}`)}
              </h3>
              <ul className="mt-3 divide-y divide-rule-faint border-y border-rule-faint">
                {items.map((contract) => (
                  <ContractAddressRow key={contract.id} contract={contract} evidence={evidence} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function ContractAddressRow({
  contract,
  evidence,
}: {
  contract: ContractEntry;
  evidence: ContractEvidenceLabels;
}) {
  const market =
    contract.id === 'cst' ? (
      <>
        <UniswapTradeButton variant="card" />
        <GeckoTerminalPoolButton />
      </>
    ) : contract.id === 'nft' ? (
      <NftMarketplaceButton />
    ) : null;

  return (
    <li
      data-contract={contract.id}
      className="grid gap-x-10 gap-y-2 py-5 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_auto_17rem] xl:items-center"
    >
      <div className="min-w-0 lg:row-span-2 xl:row-span-1">
        <p className="type-title text-foreground">{contract.name}</p>
        <p className="mt-1 type-body-sm text-muted-foreground">{contract.description}</p>
      </div>
      {/* The whole address at every width (it wraps on phones), for a character-by-character check. */}
      <AddressChip
        address={contract.address}
        variant="plain"
        display="full"
        label={false}
        href={false}
        className="type-hash self-start whitespace-normal text-foreground xl:self-center"
      />
      {/* The evidence closes the row at xl, in a fixed column, so every address starts on one line. */}
      <div className="flex min-w-0 flex-col items-start gap-2 xl:items-end">
        <ContractEvidence address={contract.address} labels={evidence} />
        {market ? <div className="flex flex-wrap gap-2 xl:justify-end">{market}</div> : null}
      </div>
    </li>
  );
}
