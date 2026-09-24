import { useTranslations } from 'next-intl';

import { ContractEvidence } from '@/components/legal/ContractEvidence';
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
 * evidence, and the token's market links where they apply.
 */
export function ContractAddressList({
  apiAddresses,
  explorerUrl,
}: {
  /** The dashboard's `ContractAddrs`, or null when the read failed. */
  apiAddresses: ContractAddresses | null | undefined;
  explorerUrl: string;
}) {
  const t = useTranslations('contracts');
  const copy = Object.fromEntries(
    CONTRACT_ENTRY_IDS.map((id) => [
      id,
      { name: t(`entries.${id}.name`), description: t(`entries.${id}.description`) },
    ]),
  ) as ContractEntryCopy;
  const contracts = buildContracts(apiAddresses, copy);
  const evidence = {
    explorer: t('addresses.explorer'),
    sourcify: t('addresses.sourcify'),
    exactMatch: t('addresses.exactMatch'),
  };

  return (
    <section aria-labelledby="contract-addresses-heading">
      <SectionHeader
        headingId="contract-addresses-heading"
        title={t('addresses.title')}
        description={t('addresses.description')}
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
                  <ContractAddressRow
                    key={contract.id}
                    contract={contract}
                    explorerUrl={explorerUrl}
                    evidence={evidence}
                  />
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
  explorerUrl,
  evidence,
}: {
  contract: ContractEntry;
  explorerUrl: string;
  evidence: { explorer: string; sourcify: string; exactMatch: string };
}) {
  const market =
    contract.id === 'cst' ? (
      <>
        <UniswapTradeButton variant="card" />
        <GeckoTerminalPoolButton />
      </>
    ) : contract.id === 'nft' ? (
      <NftMarketplaceButton variant="card" />
    ) : null;

  return (
    <li
      data-contract={contract.id}
      className="grid gap-x-10 gap-y-3 py-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]"
    >
      <div className="min-w-0">
        <p className="type-title text-foreground">{contract.name}</p>
        <p className="mt-1 type-body-sm text-muted-foreground">{contract.description}</p>
      </div>
      <div className="flex min-w-0 flex-col items-start gap-2">
        <AddressChip
          address={contract.address}
          variant="plain"
          display="responsive"
          label={false}
          href={false}
          className="type-hash text-foreground"
        />
        <ContractEvidence address={contract.address} explorerUrl={explorerUrl} labels={evidence} />
        {market ? <div className="mt-1 flex flex-wrap gap-2">{market}</div> : null}
      </div>
    </li>
  );
}
